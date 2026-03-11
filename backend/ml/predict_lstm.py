import sys
import os
import json
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def predict_next(user_id):
    try:
        logging.info(f"Starting LSTM model prediction for user: {user_id}")
        
        # 1. Check if model exists
        model_dir = os.path.join(os.path.dirname(__file__), "models")
        model_path = os.path.join(model_dir, f"lstm_{user_id}.h5")
        scaler_path = os.path.join(model_dir, f"scaler_{user_id}.npy")
        
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            print(json.dumps({"status": "error", "message": "Model not trained yet."}))
            sys.exit(1)
            
        from pymongo import MongoClient
        import pandas as pd
        import numpy as np
        from keras.models import load_model
        import pickle
        from bson.objectid import ObjectId
        
        # 2. Fetch last 5 readings
        client = MongoClient("mongodb://localhost:27017/") # Adjust URI to app config
        db = client["diabetic-app"] # Assuming standard db name
        readings = list(db.readings.find({"user": ObjectId(user_id)}).sort("recordedAt", -1).limit(5))
        
        if len(readings) < 5:
            print(json.dumps({"status": "error", "message": "Not enough readings for prediction (minimum 5 required)."}))
            sys.exit(1)
            
        readings.reverse() # Time series order
        
        # 3. Load Model and Scaler
        model = load_model(model_path)
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
            
        # 4. Prepare Data
        df = pd.DataFrame(readings)
        dataset = df['glucoseLevel'].values.reshape(-1, 1)
        
        # Transform using scaler
        scaled_data = scaler.transform(dataset)
        
        # Reshape for LSTM
        X = np.reshape(scaled_data, (1, 5, 1))
        
        # 5. Predict
        predicted_scaled = model.predict(X, verbose=0)
        
        # Inverse transform
        predicted = scaler.inverse_transform(predicted_scaled)
        
        result = predicted[0][0]
        
        logging.info(f"Prediction successful: {result}")
        print(json.dumps({
            "status": "success", 
            "prediction": float(result),
            "message": "Prediction successful"
        }))
        
    except Exception as e:
        logging.error(f"Error during prediction: {e}")
        print(json.dumps({"status": "error", "message": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "Usage: python predict_lstm.py <user_id>"}))
        sys.exit(1)
        
    user_id = sys.argv[1]
    predict_next(user_id)
