import os
import joblib
import numpy as np
from DbHelper import DbHelper

MODEL_PATH = os.path.join(os.path.dirname(__file__), "matching_model.pkl")
_model = joblib.load(MODEL_PATH)

MIN_SCORE = 0.15  # drop results below 15% probability

class MatchingService:
    def __init__(self):
        pass

    def match(self, query=None, type=None, secteur=None,
              minPrice=None, maxPrice=None, minSurface=None, minRooms=None):

        conn = DbHelper.get_db()
        cursor = conn.cursor(dictionary=True)

        # Hard filters: type and secteur must match exactly when provided
        sql = "SELECT * FROM properties WHERE 1=1"
        params = []
        if type:
            sql += " AND LOWER(type) = LOWER(%s)"
            params.append(type.strip())
        if secteur:
            sql += " AND LOWER(secteur) = LOWER(%s)"
            params.append(secteur.strip())
        if query:
            sql += " AND (LOWER(title) LIKE LOWER(%s) OR LOWER(description) LIKE LOWER(%s))"
            params.extend([f"%{query}%", f"%{query}%"])

        cursor.execute(sql, params)
        properties = cursor.fetchall()

        # Text query matched nothing — keep type/secteur hard filters but drop the text constraint
        if not properties and query:
            fallback_sql = "SELECT * FROM properties WHERE 1=1"
            fallback_params = []
            if type:
                fallback_sql += " AND LOWER(type) = LOWER(%s)"
                fallback_params.append(type.strip())
            if secteur:
                fallback_sql += " AND LOWER(secteur) = LOWER(%s)"
                fallback_params.append(secteur.strip())
            cursor.execute(fallback_sql, fallback_params)
            properties = cursor.fetchall()

        cursor.close()
        conn.close()

        # 10 % over-budget tolerance so near-misses still score
        budget_min = float(minPrice) if minPrice else 0.0
        budget_max = float(maxPrice) * 1.10 if maxPrice else float("inf")
        desired_surface = float(minSurface) if minSurface else None
        desired_rooms = float(minRooms) if minRooms else None

        results = []
        for p in properties:
            price = float(p["price"]) if p.get("price") else 0.0
            surface = float(p.get("surface") or 0)
            rooms = float(p.get("rooms") or 0)

            budget_ok = int(budget_min <= price <= budget_max)
            # type and secteur are already hard-filtered in SQL — always 1 here
            secteur_ok = 1
            type_ok = 1
            surface_ok = int(surface >= desired_surface) if desired_surface else 1
            rooms_ok = int(rooms >= desired_rooms) if desired_rooms else 1

            ref_max = float(maxPrice) if maxPrice else price
            price_diff_pct = round((price - ref_max) / ref_max, 4) if ref_max > 0 else 0.0
            surface_diff = int(surface - desired_surface) if desired_surface else 0
            rooms_diff = int(rooms - desired_rooms) if desired_rooms else 0

            features = np.array([[
                budget_ok, secteur_ok, type_ok, surface_ok, rooms_ok,
                3.0,   # urgency_level — neutral
                1.0,   # financing_status — assume financed
                price_diff_pct, surface_diff, rooms_diff
            ]])

            proba = _model.predict_proba(features)[0][1]  # 0-1

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
                "score": round(proba, 4),  # 0-1 float
            })

        exact = [r for r in results if r["score"] >= MIN_SCORE]
        exact.sort(key=lambda x: x["score"], reverse=True)

        if exact:
            return exact

        # No exact match — return top 3 closest as similar suggestions
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:3]
