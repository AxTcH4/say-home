import joblib
import pandas as pd

model = joblib.load(
    "leadScore/models/lead_score_model.pkl"
)

def predict_prospect(data):

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