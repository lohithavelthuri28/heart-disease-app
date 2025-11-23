import React, { useState } from "react";
import { predict } from "./api";

// Default feature list matching the model you trained earlier
// IMPORTANT: keys must match the model's feature names exactly
const DEFAULT_FEATURES = [
  "age",
  "sex",
  "chest pain type",
  "resting bp s",
  "cholesterol",
  "fasting blood sugar",
  "resting ecg",
  "max heart rate",
  "exercise angina",
  "oldpeak",
  "ST slope",
];

export default function PredictionForm({ features = DEFAULT_FEATURES }) {
  // initialize state for each feature
  const initialState = features.reduce((acc, name) => {
    acc[name] = "";
    return acc;
  }, {});

  const [formValues, setFormValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { prediction, label, confidence }

  const handleChange = (key) => (e) => {
    setFormValues((s) => ({ ...s, [key]: e.target.value }));
    setErrors((s) => ({ ...s, [key]: null }));
    setApiError(null);
  };

  // Basic client-side validation: required + numeric where appropriate
  function validate() {
    const newErrors = {};
    for (const k of features) {
      const v = formValues[k];
      if (v === "" || v === null || typeof v === "undefined") {
        newErrors[k] = "Required";
        continue;
      }
      // try to parse as number — model expects numeric features
      if (isNaN(Number(v))) {
        newErrors[k] = "Must be a number";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);
    setResult(null);

    if (!validate()) return;

    // build features object with numeric values
    const numericFeatures = {};
    for (const k of features) numericFeatures[k] = Number(formValues[k]);

    setLoading(true);
    try {
      const res = await predict(numericFeatures);

      // If backend returns label/confidence, prefer that, otherwise map locally
      const label = res.label ?? (res.prediction === 1 ? "Heart disease" : "No heart disease");
      const confidence =
        typeof res.confidence === "number"
          ? res.confidence
          : Array.isArray(res.probability)
          ? res.probability[1]
          : null;

      setResult({ prediction: res.prediction, label, confidence });
    } catch (err) {
      // err.message may contain the server response text
      setApiError(err.message || String(err));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormValues(initialState);
    setErrors({});
    setApiError(null);
    setResult(null);
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-3">Heart Disease Prediction</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {features.map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{key}</label>
            <input
              value={formValues[key]}
              onChange={handleChange(key)}
              className={`w-full p-2 border rounded ${errors[key] ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={`Enter ${key}`}
            />
            {errors[key] && <div className="text-red-600 text-sm mt-1">{errors[key]}</div>}
          </div>
        ))}

        {apiError && <div className="text-red-700">API error: {apiError}</div>}

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Predicting..." : "Predict"}
          </button>

          <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-medium mb-2">Result</h3>
          <p>
            <strong>Prediction:</strong> {result.label}
          </p>
          {result.confidence !== null && (
            <p>
              <strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%
            </p>
          )}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-600">
        <p>Note: feature names must match the backend model exactly (spaces & case).</p>
        <p>If you want me to auto-fetch the feature list from the backend and render inputs dynamically, say so and I'll update this component.</p>
      </div>
    </div>
  );
}
