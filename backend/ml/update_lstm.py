import sys
import os
import json
import logging
from pymongo import MongoClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

from bson.objectid import ObjectId

def get_db():
    mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(mongo_uri)
    db = client["diabetic-app"] # Note: Atlas URI usually includes the DB name, but pymongo handles it
    return db

def update_model(user_id):
    try:
        logging.info(f"Starting LSTM model incremental update for user: {user_id}")
        
        # 1. Check if model exists
        model_dir = os.path.join(os.path.dirname(__file__), "models")
        model_path = os.path.join(model_dir, f"lstm_{user_id}.h5")
        scaler_path = os.path.join(model_dir, f"scaler_{user_id}.npy")
        
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            logging.warning("Model or scaler not found. Running full training instead.")
            # Alternatively, we could trigger train_lstm.py here
            import subprocess
            subprocess.run(["python", os.path.join(os.path.dirname(__file__), "train_lstm.py"), user_id])
            sys.exit(0)
            
        # 2. Fetch recent data from MongoDB
        db = get_db()
        # Fetch the last 20 readings to do a small incremental learning epoch
        readings = list(db.readings.find({"user": ObjectId(user_id)}).sort("recordedAt", -1).limit(20))
        readings.reverse() # Sort ascending for time series
        
        if len(readings) < 6: # Need at least time_step + 1 for one sample
            logging.info("Not enough new data for incremental training. Need at least 6 readings.")
            sys.exit(0)
            
        import pandas as pd
        import numpy as np
        from keras.models import load_model
        import pickle
        
        # 3. Load Model and Scaler
        model = load_model(model_path)
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
            
        # 4. Prepare Data
        df = pd.DataFrame(readings)
        dataset = df['glucoseLevel'].values.reshape(-1, 1)
        
        # IMPORTANT: We use the existing scaler, do NOT fit_transform again
        scaled_data = scaler.transform(dataset)
        
        time_step = 5
        X, Y = [], []
        for i in range(len(scaled_data) - time_step - 1):
            a = scaled_data[i:(i + time_step), 0]
            X.append(a)
            Y.append(scaled_data[i + time_step, 0])
            
        X, Y = np.array(X), np.array(Y)
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))
        
        # 5. Incremental Train (fine-tuning)
        logging.info("Running incremental training epoch...")
        # Train on the new recent batch. 
        # Using a small number of epochs to preserve old knowledge while adapting.
        model.fit(X, Y, epochs=5, batch_size=1, verbose=0)
        
        # 6. Save updated model
        model.save(model_path)
        
        logging.info(f"Model incrementally updated and saved to {model_path}")
        print(json.dumps({"status": "success", "message": "Model incrementally updated."}))
        
    except Exception as e:
        logging.error(f"Error during incremental training: {e}")
        print(json.dumps({"status": "error", "message": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python update_lstm.py <user_id>")
        sys.exit(1)
        
    user_id = sys.argv[1]
    update_model(user_id)
