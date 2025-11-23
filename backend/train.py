# backend/train.py
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

BASE = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE, "data", "heart.csv")   # update if your file name differs
MODEL_DIR = os.path.join(BASE, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "model.joblib")

os.makedirs(MODEL_DIR, exist_ok=True)

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"Data not found at {DATA_PATH}. Place your CSV there.")

print("Loading data from:", DATA_PATH)
df = pd.read_csv(DATA_PATH)

# adjust target column name if different
TARGET_COL = "target"
if TARGET_COL not in df.columns:
    raise RuntimeError(f"Expected target column '{TARGET_COL}' in CSV. Found: {list(df.columns)}")

FEATURE_COLUMNS = [c for c in df.columns if c != TARGET_COL]
X = df[FEATURE_COLUMNS]
y = df[TARGET_COL]

X_train, X_val, y_train, y_val = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", RandomForestClassifier(n_estimators=200, random_state=42))
])

print("Training model...")
pipe.fit(X_train, y_train)

print("Validating...")
pred = pipe.predict(X_val)
print("Accuracy:", accuracy_score(y_val, pred))
print(classification_report(y_val, pred))

print("Saving model bundle...")
joblib.dump({"model": pipe, "features": FEATURE_COLUMNS}, MODEL_PATH)
print("Saved model to", MODEL_PATH)
