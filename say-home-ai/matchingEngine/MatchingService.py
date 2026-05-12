import os
import joblib
import numpy as np
from DbHelper import DbHelper

MODEL_PATH = os.path.join(os.path.dirname(__file__), "matching_model.pkl")
_model = joblib.load(MODEL_PATH)

FEATURES = [
    'budget_ok', 'secteur_ok', 'type_ok', 'surface_ok', 'rooms_ok',
    'urgency_level', 'financing_status',
    'price_diff_pct', 'surface_diff', 'rooms_diff'
]

class MatchingService:
    def __init__(self):
        pass

    def match(self, query, type, secteur, minPrice, maxPrice, minSurface=None, minRooms=None):
        conn = DbHelper.get_db()
        cursor = conn.cursor(dictionary=True)

        sql = "SELECT * FROM properties WHERE 1=1"
        params = []

        if query:
            sql += " AND (LOWER(title) LIKE LOWER(%s) OR LOWER(description) LIKE LOWER(%s))"
            params.extend([f"%{query}%", f"%{query}%"])
        if type:
            sql += " AND LOWER(type) = LOWER(%s)"
            params.append(type)
        if secteur:
            sql += " AND LOWER(secteur) = LOWER(%s)"
            params.append(secteur)
        if minPrice:
            sql += " AND price >= %s"
            params.append(minPrice)
        if maxPrice:
            sql += " AND price <= %s"
            params.append(maxPrice)

        cursor.execute(sql, params)
        properties = cursor.fetchall()
        cursor.close()
        conn.close()

        budget_min = float(minPrice) * 0.65 if minPrice else 0.0
        budget_max = float(maxPrice) if maxPrice else float("inf")
        desired_secteur = secteur.lower() if secteur else None
        desired_type = type.lower() if type else None
        desired_surface = float(minSurface) if minSurface else None
        desired_rooms = float(minRooms) if minRooms else None

        results = []
        for p in properties:
            price = float(p["price"]) if p.get("price") else 0.0
            surface = float(p.get("surface") or 0)
            rooms = float(p.get("rooms") or 0)

            budget_ok = int(budget_min <= price <= budget_max)
            secteur_ok = int(desired_secteur == p.get("secteur", "").lower()) if desired_secteur else 1
            type_ok = int(desired_type == p.get("type", "").lower()) if desired_type else 1
            surface_ok = int(surface >= desired_surface) if desired_surface else 1
            rooms_ok = int(rooms >= desired_rooms) if desired_rooms else 1

            price_diff_pct = round((price - budget_max) / budget_max, 4) if budget_max not in (0, float("inf")) else 0.0
            surface_diff = int(surface - desired_surface) if desired_surface else 0
            rooms_diff = int(rooms - desired_rooms) if desired_rooms else 0

            features = np.array([[
                budget_ok, secteur_ok, type_ok, surface_ok, rooms_ok,
                3.0,  # urgency_level neutre
                1.0,  # financing_status (on suppose financé)
                price_diff_pct, surface_diff, rooms_diff
            ]])

            proba = _model.predict_proba(features)[0][1]
            score = round(proba * 100, 1)

            results.append({
                "property": {
                    "id": p["id"],
                    "title": p["title"],
                    "description": p["description"],
                    "type": p["type"],
                    "secteur": p.get("secteur"),
                    "price": p["price"],
                    "surface": p.get("surface"),
                    "rooms": p.get("rooms"),
                    "agent_id": p.get("agent_id"),
                },
                "score": score
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results
