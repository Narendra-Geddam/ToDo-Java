const API_URL = '/api/tasks';
const THEME_KEY = 'narendra-theme';

const taskForm = document.getElementById('taskForm');
const titleInput = document.getElementById('title');
const statusInput = document.getElementById('status');
const priorityInput = document.getElementById('priority');
const taskList = document.getElementById('taskList');
const formMessage = document.getElementById('formMessage');
const refreshBtn = document.getElementById('refreshBtn');
const themeToggle = document.getElementById('themeToggle');
const taskTemplate = document.getElementById('taskTemplate');

function getInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') {
        return saved;
    }
    return 'dark';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    themeToggle.textContent = theme === 'dark' ? 'Switch to Light' : 'Switch to Dark';
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

async function listTasks() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error('Could not load tasks');
    }
    return response.json();
}

async function createTask(payload) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw await extractMessage(response, 'Could not create task');
    }
}

async function updateTask(id, payload) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw await extractMessage(response, 'Could not update task');
    }
}

async function deleteTask(id) {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
        throw await extractMessage(response, 'Could not delete task');
    }
}

async function extractMessage(response, fallback) {
    try {
        const data = await response.json();
        if (typeof data.message === 'string') {
            return new Error(data.message);
        }
        if (typeof data.title === 'string') {
            return new Error(data.title);
        }
        const firstValue = Object.values(data)[0];
        if (typeof firstValue === 'string') {
            return new Error(firstValue);
        }
    } catch (_) {
        // Ignore parser failures and return fallback message.
    }
    return new Error(fallback);
}

function renderEmptyState() {
    taskList.innerHTML = '<div class="empty-state">No tasks yet. Add your first monitoring task.</div>';
}

function buildTaskCard(task) {
    const node = taskTemplate.content.firstElementChild.cloneNode(true);
    const title = node.querySelector('.task-title');
    const status = node.querySelector('.task-status');
    const priority = node.querySelector('.task-priority');
    const saveBtn = node.querySelector('.save-btn');
    const deleteBtn = node.querySelector('.delete-btn');

    title.value = task.title;
    status.value = task.status;
    priority.value = task.priority;

    saveBtn.addEventListener('click', async () => {
        formMessage.textContent = '';
        try {
            await updateTask(task.id, {
                title: title.value,
                status: status.value,
                priority: priority.value
            });
            formMessage.textContent = 'Task updated.';
            await refreshTasks();
        } catch (error) {
            formMessage.textContent = error.message;
        }
    });

    deleteBtn.addEventListener('click', async () => {
        formMessage.textContent = '';
        try {
            await deleteTask(task.id);
            formMessage.textContent = 'Task deleted.';
            await refreshTasks();
        } catch (error) {
            formMessage.textContent = error.message;
        }
    });

    return node;
}

async function refreshTasks() {
    try {
        const tasks = await listTasks();
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            renderEmptyState();
            return;
        }

        tasks.forEach((task) => {
            taskList.appendChild(buildTaskCard(task));
        });
    } catch (error) {
        taskList.innerHTML = '<div class="empty-state">Failed to load tasks.</div>';
        formMessage.textContent = error.message;
    }
}

taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    formMessage.textContent = '';

    try {
        await createTask({
            title: titleInput.value,
            status: statusInput.value,
            priority: priorityInput.value
        });

        titleInput.value = '';
        statusInput.value = 'TODO';
        priorityInput.value = 'MEDIUM';
        formMessage.textContent = 'Task added.';
        await refreshTasks();
    } catch (error) {
        formMessage.textContent = error.message;
    }
});

refreshBtn.addEventListener('click', refreshTasks);

applyTheme(getInitialTheme());
refreshTasks();
