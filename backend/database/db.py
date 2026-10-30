import sqlite3
import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "reclens.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Projects table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size_bytes INTEGER NOT NULL,
        pages_analyzed INTEGER DEFAULT 0,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        is_demo INTEGER DEFAULT 0,
        readiness_json TEXT,
        data_json TEXT
    );
    """)
    
    # Human Reviews table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS human_reviews (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        severity TEXT NOT NULL,
        category TEXT NOT NULL,
        source_page INTEGER,
        details TEXT,
        evidence TEXT,
        status TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY(project_id) REFERENCES projects(id)
    );
    """)
    
    conn.commit()
    conn.close()

class ProjectRepository:
    def __init__(self):
        init_db()

    def create_project(self, project_dict: Dict[str, Any], initial_data: Dict[str, Any] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        data_str = json.dumps(initial_data or {})
        readiness_str = json.dumps(project_dict.get("readiness", {})) if project_dict.get("readiness") else None
        
        cursor.execute("""
            INSERT OR REPLACE INTO projects (
                id, name, filename, file_type, file_size_bytes, 
                pages_analyzed, status, created_at, is_demo, readiness_json, data_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            project_dict["id"],
            project_dict["name"],
            project_dict.get("filename", ""),
            project_dict.get("file_type", "pdf"),
            project_dict.get("file_size_bytes", 0),
            project_dict.get("pages_analyzed", 0),
            project_dict.get("status", "uploaded"),
            project_dict.get("created_at", datetime.utcnow().isoformat()),
            1 if project_dict.get("is_demo", False) else 0,
            readiness_str,
            data_str
        ))
        conn.commit()
        conn.close()
        return self.get_project(project_dict["id"])

    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        
        proj = dict(row)
        proj["is_demo"] = bool(proj["is_demo"])
        proj["readiness"] = json.loads(proj["readiness_json"]) if proj["readiness_json"] else None
        proj["data"] = json.loads(proj["data_json"]) if proj["data_json"] else {}
        return proj

    def list_projects(self) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, filename, file_type, file_size_bytes, pages_analyzed, status, created_at, is_demo, readiness_json FROM projects ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        
        results = []
        for row in rows:
            p = dict(row)
            p["is_demo"] = bool(p["is_demo"])
            p["readiness"] = json.loads(p["readiness_json"]) if p["readiness_json"] else None
            results.append(p)
        return results

    def update_project_status(self, project_id: str, status: str, pages_analyzed: Optional[int] = None):
        conn = get_db_connection()
        cursor = conn.cursor()
        if pages_analyzed is not None:
            cursor.execute("UPDATE projects SET status = ?, pages_analyzed = ? WHERE id = ?", (status, pages_analyzed, project_id))
        else:
            cursor.execute("UPDATE projects SET status = ? WHERE id = ?", (status, project_id))
        conn.commit()
        conn.close()

    def update_project_data(self, project_id: str, data: Dict[str, Any], readiness: Optional[Dict[str, Any]] = None):
        conn = get_db_connection()
        cursor = conn.cursor()
        data_str = json.dumps(data)
        if readiness is not None:
            readiness_str = json.dumps(readiness)
            cursor.execute("UPDATE projects SET data_json = ?, readiness_json = ? WHERE id = ?", (data_str, readiness_str, project_id))
        else:
            cursor.execute("UPDATE projects SET data_json = ? WHERE id = ?", (data_str, project_id))
        conn.commit()
        conn.close()

    def update_human_review_status(self, project_id: str, review_id: str, status: str, notes: str = ""):
        conn = get_db_connection()
        cursor = conn.cursor()
        # Also update in project data_json
        proj = self.get_project(project_id)
        if proj and "data" in proj:
            data = proj["data"]
            reviews = data.get("human_reviews", [])
            for r in reviews:
                if r["id"] == review_id:
                    r["status"] = status
                    if notes:
                        r["notes"] = notes
            self.update_project_data(project_id, data, proj.get("readiness"))
        conn.close()

