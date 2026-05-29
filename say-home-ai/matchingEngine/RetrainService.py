import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from DbHelper import DbHelper

MODEL_PATH = os.path.join(os.path.dirname(__file__), "matching_model.pkl")
MIN_ROWS = 10


class RetrainService:
    def retrain(self):
        conn = DbHelper.get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                mi.interacted,
                mi.search_min_price,
                mi.search_max_price,
                mi.search_min_surface,
                mi.search_min_rooms,
                p.price,
                p.surface,
                p.rooms
            FROM matching_interactions mi
            JOIN properties p ON mi.property_id = p.id
        """)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        if len(rows) < MIN_ROWS:
            return {
                "status": "not_enough_data",
                "rows": len(rows),
                "needed": MIN_ROWS,
            }

        X, y = [], []
        for row in rows:
            price = float(row["price"] or 0)
            surface = float(row["surface"] or 0)
            rooms = float(row["rooms"] or 0)

            budget_min = float(row["search_min_price"] or 0)
            raw_max = row["search_max_price"]
            budget_max = float(raw_max) * 1.10 if raw_max else float("inf")
            desired_surface = float(row["search_min_surface"]) if row["search_min_surface"] else None
            desired_rooms = float(row["search_min_rooms"]) if row["search_min_rooms"] else None

            budget_ok = int(budget_min <= price <= budget_max)
            surface_ok = int(surface >= desired_surface) if desired_surface else 1
            rooms_ok = int(rooms >= desired_rooms) if desired_rooms else 1

            ref_max = float(raw_max) if raw_max else price
            price_diff_pct = round((price - ref_max) / ref_max, 4) if ref_max > 0 else 0.0
            surface_diff = int(surface - desired_surface) if desired_surface else 0
            rooms_diff = int(rooms - desired_rooms) if desired_rooms else 0

            # type_ok and secteur_ok are always 1 (hard-filtered before interactions are saved)
            X.append([
                budget_ok, 1, 1, surface_ok, rooms_ok,
                3.0, 1.0,
                price_diff_pct, surface_diff, rooms_diff,
            ])
            y.append(int(row["interacted"]))

        X = np.array(X)
        y = np.array(y)

        model = RandomForestClassifier(
            n_estimators=100,
            class_weight="balanced",
            random_state=42,
        )
        model.fit(X, y)
        joblib.dump(model, MODEL_PATH)

        return {
            "status": "ok",
            "rows_used": len(rows),
            "positive_labels": int(y.sum()),
            "negative_labels": int((y == 0).sum()),
        }
