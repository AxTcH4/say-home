import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Charger dataset V2
df = pd.read_csv(
    "leadScore/dataset/sayhome_prospects_v2_900.csv"
)

print("Dataset V2 chargé ✅")

# Features / Target
X = df.drop("classe", axis=1)

y = df["classe"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Modèle
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

# Train
model.fit(X_train, y_train)

print("Modèle entraîné ✅")

# Accuracy
predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print(f"Accuracy : {round(accuracy * 100, 2)}%")

# Save
joblib.dump(
    model,
    "leadScore/models/lead_score_model.pkl"
)

print("Modèle sauvegardé ✅")