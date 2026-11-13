from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from pathlib import Path

app = Flask(__name__)
CORS(app)
DB = Path(__file__).with_name("campus_items.db")

def connect():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    with connect() as con:
        con.execute("""
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                kind TEXT NOT NULL CHECK(kind IN ('Lost','Found')),
                description TEXT NOT NULL,
                location TEXT NOT NULL,
                contact TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Open'
            )
        """)

@app.get("/api/items")
def get_items():
    q = request.args.get("q", "").strip()
    kind = request.args.get("kind", "").strip()
    sql = "SELECT * FROM items WHERE status = 'Open'"
    params = []
    if kind in ("Lost", "Found"):
        sql += " AND kind = ?"
        params.append(kind)
    if q:
        sql += " AND (title LIKE ? OR description LIKE ? OR location LIKE ?)"
        params.extend([f"%{q}%"] * 3)
    sql += " ORDER BY id DESC"
    with connect() as con:
        rows = con.execute(sql, params).fetchall()
    return jsonify([dict(row) for row in rows])

@app.post("/api/items")
def create_item():
    data = request.get_json(silent=True) or {}
    required = ["title", "kind", "description", "location", "contact"]
    if any(not str(data.get(k, "")).strip() for k in required):
        return jsonify({"error": "Please fill in all fields."}), 400
    if data["kind"] not in ("Lost", "Found"):
        return jsonify({"error": "Kind must be Lost or Found."}), 400
    with connect() as con:
        cur = con.execute(
            "INSERT INTO items(title,kind,description,location,contact) VALUES(?,?,?,?,?)",
            tuple(str(data[k]).strip() for k in required)
        )
        item_id = cur.lastrowid
    return jsonify({"message": "Report submitted.", "id": item_id}), 201

@app.patch("/api/items/<int:item_id>/resolve")
def resolve_item(item_id):
    with connect() as con:
        cur = con.execute("UPDATE items SET status='Resolved' WHERE id=?", (item_id,))
    if cur.rowcount == 0:
        return jsonify({"error": "Report not found."}), 404
    return jsonify({"message": "Report marked as resolved."})

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
