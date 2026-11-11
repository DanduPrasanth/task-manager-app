
const API = "http://127.0.0.1:8000/tasks";

let currentFilter = "all";

async function loadTasks() {
    const response = await fetch(API);
    const tasks = await response.json();

    const list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks.filter(task => {
        if (currentFilter === "completed") return task.completed;
        if (currentFilter === "pending") return !task.completed;
        return true;
    }).forEach(task => {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.onchange = () => toggleTask(task);

        const span = document.createElement("span");
        span.textContent = task.title;
        if (task.completed) span.className = "completed";

        const edit = document.createElement("button");
        edit.textContent = "Edit";
        edit.onclick = () => editTask(task);

        const del = document.createElement("button");
        del.textContent = "Delete";
        del.onclick = () => deleteTask(task.id);

        li.append(checkbox, span, edit, del);
        list.appendChild(li);
    });
}

async function addTask() {
    const input = document.getElementById("taskInput");
    const title = input.value.trim();

    if (!title) {
        alert("Please enter a task");
        return;
    }

    await fetch(API, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title: title})
    });

    input.value = "";
    loadTasks();
}

async function toggleTask(task) {
    await fetch(`${API}/${task.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            title: task.title,
            completed: !task.completed
        })
    });
    loadTasks();
}

async function editTask(task) {
    const title = prompt("Edit task:", task.title);

    if (title === null || !title.trim()) return;

    await fetch(`${API}/${task.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            title: title.trim(),
            completed: task.completed
        })
    });

    loadTasks();
}

async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;

    await fetch(`${API}/${id}`, {method: "DELETE"});
    loadTasks();
}

function filterTasks(filter) {
    currentFilter = filter;
    loadTasks();
}

loadTasks();
