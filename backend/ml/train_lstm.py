import sys
import os
import json
import logging
from pymongo import MongoClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

from bson.objectid import ObjectId

def get_db():
    client = MongoClient("mongodb://localhost:27017/") # Adjust URI to app config
    db = client["diabetic-app"] # Assuming standard db name
    return db

def train_model(user_id):
    try:
        logging.info(f"Starting LSTM model training for user: {user_id}")
        
        # 1. Fetch data from MongoDB
        db = get_db()
        readings = list(db.readings.find({"user": ObjectId(user_id)}).sort("recordedAt", 1))
        
        if len(readings) < 10:
            logging.warning("Not enough data to train LSTM. Need at least 10 readings.")
            print(json.dumps({"status": "error", "message": "Not enough readings to train (minimum 10 required)"}))
            sys.exit(1)
            
        import pandas as pd
        import numpy as np
        from sklearn.preprocessing import MinMaxScaler
        from keras.models import Sequential
        from keras.layers import LSTM, Dense
        
        # 2. Prepare Data
        df = pd.DataFrame(readings)
        dataset = df['glucoseLevel'].values.reshape(-1, 1)
        
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(dataset)
        
        # Time steps for prediction window
        time_step = 5
        X, Y = [], []
        for i in range(len(scaled_data) - time_step - 1):
            a = scaled_data[i:(i + time_step), 0]
            X.append(a)
            Y.append(scaled_data[i + time_step, 0])
            
        X, Y = np.array(X), np.array(Y)
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))
        
        # 3. Build LSTM Model
        model = Sequential()
        model.add(LSTM(50, return_sequences=True, input_shape=(time_step, 1)))
        model.add(LSTM(50))
        model.add(Dense(1))
        model.compile(loss='mean_squared_error', optimizer='adam')
        
        # 4. Train
        logging.info("Training epochs...")
        model.fit(X, Y, epochs=50, batch_size=1, verbose=0)
        
        # 5. Save model and scaler for this user
        model_dir = os.path.join(os.path.dirname(__file__), "models")
        os.makedirs(model_dir, exist_ok=True)
        
        model_path = os.path.join(model_dir, f"lstm_{user_id}.h5")
        scaler_path = os.path.join(model_dir, f"scaler_{user_id}.npy")
        
        model.save(model_path)
        
        import pickle
        with open(scaler_path, 'wb') as f:
            pickle.dump(scaler, f)
            
        logging.info(f"Model saved successfully to {model_path}")
        print(json.dumps({"status": "success", "message": "Model trained and saved."}))
        
    except Exception as e:
        logging.error(f"Error during training: {e}")
        print(json.dumps({"status": "error", "message": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python train_lstm.py <user_id>")
        sys.exit(1)
        
    user_id = sys.argv[1]
    train_model(user_id)
