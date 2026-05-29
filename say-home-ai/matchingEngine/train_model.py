"""
train_model.py
--------------
Entraîne un Random Forest sur matching_dataset.csv,
évalue ses performances et exporte le modèle en matching_model.pkl.

Lancer : python train_model.py
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (accuracy_score, f1_score,
                             classification_report, confusion_matrix)
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

# ── 1. Charger le dataset ─────────────────────────────────────────────────────
df = pd.read_csv('matching_dataset.csv')
print(f"✅ Dataset chargé : {len(df):,} paires")
print(f"   Bons matchs : {df['label'].sum():,} ({df['label'].mean()*100:.1f}%)\n")

FEATURES = [
    'budget_ok', 'secteur_ok', 'type_ok', 'surface_ok', 'rooms_ok',
    'urgency_level', 'financing_status',
    'price_diff_pct', 'surface_diff', 'rooms_diff'
]

X = df[FEATURES]
y = df['label']

# ── 2. Split 80% train / 20% test ────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Train : {len(X_train):,} paires | Test : {len(X_test):,} paires\n")

# ── 3. Entraîner le Random Forest ────────────────────────────────────────────
# class_weight='balanced' : compense le déséquilibre 8%/92%
rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    class_weight='balanced',
    random_state=42
)
rf.fit(X_train, y_train)
print("✅ Modèle entraîné\n")

# ── 4. Évaluation ─────────────────────────────────────────────────────────────
y_pred = rf.predict(X_test)

print("=== RÉSULTATS ===")
print(f"Accuracy : {accuracy_score(y_test, y_pred)*100:.2f}%")
print(f"F1-Score : {f1_score(y_test, y_pred)*100:.2f}%\n")
print(classification_report(y_test, y_pred,
                             target_names=['Mauvais match', 'Bon match']))

# ── 5. Matrice de confusion ───────────────────────────────────────────────────
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(5, 4))
sns.heatmap(cm, annot=True, fmt='d', cmap='Greens',
            xticklabels=['Mauvais match', 'Bon match'],
            yticklabels=['Mauvais match', 'Bon match'])
plt.title('Matrice de Confusion — Matching Immobilier')
plt.ylabel('Réel')
plt.xlabel('Prédit')
plt.tight_layout()
plt.savefig('confusion_matrix.png', dpi=150)
print("✅ Matrice de confusion → confusion_matrix.png")

# ── 6. Importance des features ────────────────────────────────────────────────
importance_df = pd.DataFrame({
    'critere':    FEATURES,
    'importance': rf.feature_importances_
}).sort_values('importance', ascending=True)

plt.figure(figsize=(8, 5))
plt.barh(importance_df['critere'], importance_df['importance'], color='#2d6a4f')
plt.title('Importance des critères de matching (Random Forest)')
plt.xlabel('Importance relative')
plt.tight_layout()
plt.savefig('feature_importance.png', dpi=150)
print("✅ Feature importance    → feature_importance.png")

# ── 7. Export du modèle ───────────────────────────────────────────────────────
joblib.dump(rf, 'matching_model.pkl')
print("✅ Modèle exporté       → matching_model.pkl")
print("\n🚀 Prêt à être chargé par MatchingService.py !")
