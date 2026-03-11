# GlucoTrack AI Training Workflow

This document outlines the architecture and workflow for training the LSTM (Long Short-Term Memory) Artificial Intelligence model used in the GlucoTrack application to predict future glucose levels.

## Tech Stack
- **Python**: Core algorithmic engine driving all ML scripts.
- **Keras / TensorFlow**: Deep learning frameworks framing the basis of the sequential LSTM model.
- **scikit-learn**: Used for `MinMaxScaler` data normalization to prep integer target labels (glucose mg/dL levels) into a scale optimal for neural networks.
- **Node.js (Express)**: Manages secure API routes and triggers Python subprocess actions using `child_process.spawn`.
- **MongoDB**: Used inherently as the ground-state data source.

## 1. Initial Model Training (`train_lstm.py`)
This process trains a completely new model for a specific user.

**Trigger:**
- User clicks "Train AI Model" on the Frontend (Trends page).
- Triggers route `POST /api/readings/train-model` on the Node.js server.

**Workflow:**
1. **Data Fetching:** The Python script connects directly to MongoDB (db: `diabetic-app`) and pulls the user's historical glucose readings, sorted sequentially by time. It requires a hard minimum of **10 readings**.
2. **Preprocessing:** Readings are reshaped and normalized using `MinMaxScaler` between `[0, 1]`.
3. **Sequencing:** Data is broken down into supervised "sliding windows" defined by a `time_step` of 5. For every 5 chronological readings, the 6th reading becomes the target label (`Y`).
4. **Network Compilation:** A standard sequential LSTM architecture is compiled using `mean_squared_error` for loss calculation and an `adam` optimizer. 
    - Layer 1: LSTM (50 units, return sequences)
    - Layer 2: LSTM (50 units)
    - Layer 3: Dense output (1 unit)
5. **Fitting:** The model is trained on the sequenced local data across 50 epochs.
6. **Persistence:** The trained model `.h5` file and the corresponding dataset scaler `.npy` file are saved physically inside `backend/ml/models/` under the user's unique MongoDB `ObjectId`.

## 2. Incremental Fine-Tuning (`update_lstm.py`)
This process updates an already-existing model gracefully as the user records new data. It avoids the computationally expensive process of retraining the entire model from scratch every time.

**Trigger:**
- User saves a new glucose reading on the Dashboard modal.
- Node.js server saves it to the DB and triggers `update_lstm.py` passively in the background.

**Workflow:**
1. **Validation:** The script checks if a trained `.h5` model already exists. If not, development logic redirects control back to full `train_lstm.py`.
2. **Recent Data Fetch:** The Python script queries the last **20 most recent readings**.
3. **Scaler Loading:** Crucially, it loads the original `scaler_{user_id}.npy` rather than creating a new scaler. Attempting to fit a new scaler on a small dataset would distort feature expectations.
4. **Sequencing:** Similar sequence chunking algorithm to the initial training. Requires a minimum of 6 recent readings to perform an update sequence.
5. **Epoch Retrain:** The active model is loaded into memory, and `.fit()` is called using the new sequence batch for a tiny count of **5 epochs**. This gently corrects model assumptions across the most recent historical windows.
6. **Overwrite:** The updated model `.h5` replaces the old file natively.

## 3. Glucose Prediction (`predict_lstm.py`)
This script uses the trained state of the LSTM memory arrays to predict standard integer values representing an upcoming inference.

**Trigger:**
- User clicks "Predict Next" quick action tile on the Dashboard.
- Triggers route `GET /api/readings/predict-next`

**Workflow:**
1. The script verifies that both the model and the data scaler exist for the calling user.
2. It fetches the exact **last 5** glucose levels strictly ordered by record date. 
3. The old scalar transforms the `[5]` readings down to the optimized `[0, 1]` threshold expected by the network weighting.
4. The array is submitted individually via `model.predict()`, utilizing the short-term memory logic embedded inside the model's memory cells trained on the user's unique glycemic trending style.
5. The raw decimal output is passed backwards through `scaler.inverse_transform()` to regenerate a standard human-readable mg/dL value.
6. Result returns structured JSON output.
