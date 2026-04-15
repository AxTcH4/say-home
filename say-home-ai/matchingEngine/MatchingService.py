from fastapi import Depends, FastAPI
from DbHelper import DbHelper
import random

class MatchingService:
    def __init__(self):
        pass
    def match (self, query, type, secteur, minPrice, maxPrice):
        conn = DbHelper.get_db()
        cursor = conn.cursor(dictionary=True)

        print (query, type, secteur, minPrice, maxPrice)

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

        print (sql, params)

        cursor.execute(sql, params)
        properties = cursor.fetchall()
        cursor.close()
        conn.close()

        results = [
            {
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
                "score": round(random.uniform(70, 99), 1)
            }
            for p in properties
        ]
        print (results)
        return results