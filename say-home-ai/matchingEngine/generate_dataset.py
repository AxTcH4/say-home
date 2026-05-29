"""
generate_dataset.py
-------------------
Génère un dataset synthétique de paires Prospect <-> Bien immobilier
adapté exactement au schéma MySQL de say-home (marché Marrakech).

Lancer : python generate_dataset.py
"""

import pandas as pd
import numpy as np

np.random.seed(42)

TYPES      = ['villa', 'appartement', 'riad']
SECTEURS   = ['gueliz', 'hivernage', 'medina']
TYPE_PROBS = [0.20, 0.60, 0.20]

CONFIG = {
    'villa':       {'surface': (150, 450), 'rooms': (4, 9), 'price': (2_000_000, 8_000_000)},
    'appartement': {'surface': (50,  180), 'rooms': (1, 5), 'price': (  400_000, 2_500_000)},
    'riad':        {'surface': (120, 350), 'rooms': (3, 8), 'price': (  900_000, 5_000_000)},
}

# ── 1. Biens ──────────────────────────────────────────────────────────────────
types_list = np.random.choice(TYPES, 200, p=TYPE_PROBS)
biens = []
for t in types_list:
    cfg = CONFIG[t]
    biens.append({
        'type':    t,
        'secteur': np.random.choice(SECTEURS, p=[0.40, 0.35, 0.25]),
        'surface': int(np.random.randint(*cfg['surface'])),
        'rooms':   int(np.random.randint(cfg['rooms'][0], cfg['rooms'][1] + 1)),
        'price':   float(round(np.random.uniform(*cfg['price']), -3)),
    })
df_biens = pd.DataFrame(biens)

# ── 2. Prospects ──────────────────────────────────────────────────────────────
budgets = np.random.choice(
    [600_000, 1_000_000, 1_500_000, 2_500_000, 4_000_000, 7_000_000],
    200, p=[0.20, 0.25, 0.25, 0.15, 0.10, 0.05]
)
df_prospects = pd.DataFrame({
    'budget_max':       budgets.astype(float),
    'budget_min':       (budgets * 0.65).astype(float),
    'desired_secteur':  np.random.choice(SECTEURS, 200, p=[0.40, 0.35, 0.25]),
    'desired_type':     np.random.choice(TYPES, 200, p=TYPE_PROBS),
    'min_surface':      np.random.randint(40, 200, 200).astype(float),
    'min_rooms':        np.random.randint(1, 7, 200).astype(float),
    'urgency_level':    np.random.randint(1, 6, 200).astype(float),
    'financing_status': np.random.choice([0, 1], 200, p=[0.35, 0.65]).astype(float),
})

# ── 3. Paires + score pondéré (cahier de charge §4.1) ────────────────────────
#    budget=30pts, secteur=25pts, type=20pts, surface=15pts, rooms=10pts
pairs = []
for _, p in df_prospects.iterrows():
    for _, b in df_biens.iterrows():

        budget_ok     = int(p['budget_min'] <= b['price'] <= p['budget_max'])
        budget_score  = 30 if budget_ok else (15 if b['price'] <= p['budget_max'] * 1.20 else 0)

        secteur_ok    = int(p['desired_secteur'] == b['secteur'])
        secteur_score = 25 if secteur_ok else 0

        type_ok    = int(p['desired_type'] == b['type'])
        type_score = 20 if type_ok else 0

        surface_ok    = int(b['surface'] >= p['min_surface'])
        surface_score = 15 if surface_ok else (8 if b['surface'] >= p['min_surface'] * 0.85 else 0)

        rooms_ok    = int(b['rooms'] >= p['min_rooms'])
        rooms_score = 10 if rooms_ok else 0

        score_total = budget_score + secteur_score + type_score + surface_score + rooms_score
        label       = 1 if (score_total >= 60 and budget_ok) else 0

        pairs.append({
            'budget_ok':        budget_ok,
            'secteur_ok':       secteur_ok,
            'type_ok':          type_ok,
            'surface_ok':       surface_ok,
            'rooms_ok':         rooms_ok,
            'urgency_level':    p['urgency_level'],
            'financing_status': p['financing_status'],
            'price_diff_pct':   round((b['price'] - p['budget_max']) / p['budget_max'], 4),
            'surface_diff':     int(b['surface'] - p['min_surface']),
            'rooms_diff':       int(b['rooms'] - p['min_rooms']),
            'budget_score':     budget_score,
            'secteur_score':    secteur_score,
            'type_score':       type_score,
            'surface_score':    surface_score,
            'rooms_score':      rooms_score,
            'score_total':      score_total,
            'label':            label,
        })

df_final = pd.DataFrame(pairs)
df_final.to_csv('matching_dataset.csv', index=False)

print(f"✅ Dataset généré : {len(df_final):,} paires")
print(f"   Bons matchs  (1) : {df_final['label'].sum():,} ({df_final['label'].mean()*100:.1f}%)")
print(f"   Mauvais matchs(0): {(df_final['label']==0).sum():,}")
print("📁 Sauvegardé : matching_dataset.csv")
