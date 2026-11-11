
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

def get_db():
    return sqlite3.connect("tasks.db")

with get_db() as conn:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            completed BOOLEAN DEFAULT 0
        )
    """)

class Task(BaseModel):
    title: str
    completed: bool = False

@app.get("/tasks")
def get_tasks():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, title, completed FROM tasks"
        ).fetchall()
    return [
        {"id": r[0], "title": r[1], "completed": bool(r[2])}
        for r in rows
    ]

@app.post("/tasks")
def add_task(task: Task):
    if not task.title.strip():
        raise HTTPException(400, "Task title is required")
    with get_db() as conn:
        cursor = conn.execute(
            "INSERT INTO tasks (title, completed) VALUES (?, ?)",
            (task.title.strip(), task.completed)
        )
        return {"id": cursor.lastrowid, "message": "Task added"}

@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: Task):
    with get_db() as conn:
        cursor = conn.execute(
            "UPDATE tasks SET title=?, completed=? WHERE id=?",
            (task.title.strip(), task.completed, task_id)
        )
        if cursor.rowcount == 0:
            raise HTTPException(404, "Task not found")
    return {"message": "Task updated"}

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    with get_db() as conn:
        cursor = conn.execute(
            "DELETE FROM tasks WHERE id=?", (task_id,)
        )
        if cursor.rowcount == 0:
            raise HTTPException(404, "Task not found")
    return {"message": "Task deleted"}
