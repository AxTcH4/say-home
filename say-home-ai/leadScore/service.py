import joblib
import pandas as pd
import os
import logging

logger = logging.getLogger(__name__)

_model = None

def _load_model():
    global _model
    if _model is None:
        model_path = os.path.join(os.path.dirname(__file__), "models", "lead_score_model.pkl")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Lead score model not found at {model_path}")
        try:
            _model = joblib.load(model_path)
            logger.info("Lead score model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load lead score model: {e}")
            raise RuntimeError("Unable to load prediction model") from e
    return _model

def predict_prospect(data):
    try:
        model = _load_model()
        df = pd.DataFrame([data])
        prediction = model.predict(df)[0]
        probabilities = model.predict_proba(df)[0]
        classes = model.classes_
        score_dict = dict(zip(classes, probabilities))
        score = score_dict.get("chaud", 0)

        return {
            "classe": prediction,
            "score": round(float(score), 2)
        }
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise