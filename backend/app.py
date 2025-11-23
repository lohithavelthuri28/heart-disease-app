# backend/app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import os
import numpy as np
from typing import Dict, List

BASE = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE, "models", "model.joblib")

app = FastAPI(title="Heart Disease App")

# allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    features: Dict[str, float]

class PredictResponse(BaseModel):
    prediction: int
    probability: List[float]

model_bundle = None

@app.on_event("startup")
def load_model():
    global model_bundle
    if not os.path.exists(MODEL_PATH):
        # do not crash; allow health endpoints even if model missing
        model_bundle = None
        print(f"Model not found at {MODEL_PATH}. Train first.")
        return
    model_bundle = joblib.load(MODEL_PATH)
    if not ("model" in model_bundle and "features" in model_bundle):
        raise RuntimeError("Model bundle format invalid. Expected keys: 'model' and 'features'")

@app.get("/")
def read_root():
    return {"message":"Heart Disease API root"}

@app.get("/health")
def health():
    ok = model_bundle is not None
    return {"status":"healthy", "model_loaded": ok}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    global model_bundle
    if model_bundle is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run training (train.py) first.")
    pipe = model_bundle["model"]
    feature_order = model_bundle["features"]
    fdict = req.features

    # Validate keys
    missing = [f for f in feature_order if f not in fdict]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing features: {missing}")

    row = [float(fdict[name]) for name in feature_order]
    X = np.array(row).reshape(1, -1)
    pred = int(pipe.predict(X)[0])
    prob = pipe.predict_proba(X)[0].tolist() if hasattr(pipe, "predict_proba") else [None, None]
    return {"prediction": pred, "probability": prob}
