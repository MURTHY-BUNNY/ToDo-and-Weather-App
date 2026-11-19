
// ============================================
// 1. SELECT HTML ELEMENTS
// ============================================

const KEY = "taskflow.tasks.v1";

const form = document.querySelector("#taskForm");
const input = document.querySelector("#taskInput");
const list = document.querySelector("#taskList");
const empty = document.querySelector("#empty");
const submit = document.querySelector("#submitBtn");


// ============================================
// 2. APPLICATION STATE
// ============================================

let tasks = [];
let filter = "all";
let editing = null;


// ============================================
// 3. LOAD TASKS FROM LOCAL STORAGE
// ============================================

try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "[]");

    tasks = Array.isArray(saved) ? saved : [];

} catch {
    tasks = [];
}


// ============================================
// 4. DISPLAY TODAY'S DATE
// ============================================

document.querySelector("#today").textContent =
    new Intl.DateTimeFormat("en", {
        weekday: "short",
        month: "short",
        day: "numeric"
    }).format(new Date());


// ============================================
// 5. SAVE TASKS TO LOCAL STORAGE
// ============================================

function save() {
    localStorage.setItem(KEY, JSON.stringify(tasks));
}


// ============================================
// 6. RENDER TASKS ON THE PAGE
// ============================================

function render() {

    // Clear the existing task list
    list.replaceChildren();

    // Apply the selected filter
    const shown = tasks.filter(t =>
        filter === "all" ||
        (filter === "pending" && !t.done) ||
        (filter === "completed" && t.done)
    );

    // Display each task
    shown.forEach(t => {

        const li = document.createElement("li");

        li.className = "task" + (t.done ? " done" : "");

        // Create checkbox
        const check = document.createElement("input");

        check.type = "checkbox";
        check.checked = t.done;
        check.setAttribute("aria-label", "Toggle task completion");

        // Toggle task completion
        check.addEventListener("change", () => {

            t.done = check.checked;

            save();
            render();

        });

        // Create task text
        const text = document.createElement("span");

        text.textContent = t.text;

        // Create Edit button
        const edit = document.createElement("button");

        edit.className = "action";
        edit.type = "button";
        edit.textContent = "Edit";

        edit.addEventListener("click", () => {

            editing = t.id;

            input.value = t.text;

            submit.textContent = "Save task";

            input.focus();

        });

        // Create Delete button
        const del = document.createElement("button");

        del.className = "action";
        del.type = "button";
        del.textContent = "Delete";

        del.addEventListener("click", () => {

            tasks = tasks.filter(x => x.id !== t.id);

            if (editing === t.id) {
                resetEdit();
            }

            save();
            render();

        });

        // Add elements to the task item
        li.append(check, text, edit, del);

        // Add task item to the list
        list.append(li);

    });


    // ========================================
    // 7. UPDATE TASK COUNTS
    // ========================================

    empty.hidden = shown.length > 0;

    const done = tasks.filter(t => t.done).length;

    document.querySelector("#count").textContent =
        `${shown.length} ${shown.length === 1 ? "task" : "tasks"}`;

    document.querySelector("#progress").textContent =
        `${done} completed of ${tasks.length}`;

    document.querySelector("#clearBtn").disabled = !done;

}


// ============================================
// 8. RESET EDIT MODE
// ============================================

function resetEdit() {

    editing = null;

    form.reset();

    submit.textContent = "Add task";

}


// ============================================
// 9. ADD OR UPDATE TASK
// ============================================

form.addEventListener("submit", e => {

    e.preventDefault();

    const text = input.value.trim();

    // Prevent empty tasks
    if (!text) return;

    // Update an existing task
    if (editing) {

        tasks = tasks.map(t =>
            t.id === editing
                ? { ...t, text }
                : t
        );

        resetEdit();

    }

    // Add a new task
    else {

        tasks.unshift({
            id: crypto.randomUUID(),
            text,
            done: false
        });

    }

    save();

    render();

    input.focus();

});


// ============================================
// 10. FILTER TASKS
// ============================================

document.querySelectorAll(".filter").forEach(b => {

    b.addEventListener("click", () => {

        filter = b.dataset.filter;

        // Update active filter button
        document.querySelectorAll(".filter").forEach(x => {

            x.classList.toggle("active", x === b);

        });

        render();

    });

});


// ============================================
// 11. CLEAR COMPLETED TASKS
// ============================================

document.querySelector("#clearBtn").addEventListener("click", () => {

    tasks = tasks.filter(t => !t.done);

    save();

    render();

});


// ============================================
// 12. INITIAL RENDER
// ============================================

render();
