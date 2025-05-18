// Get DOM elements
const taskForm = document.getElementById('task-form');
const taskIdInput = document.getElementById('task-id');
const taskTitleInput = document.getElementById('task-title');
const taskPriorityInput = document.getElementById('task-priority');
const taskDeadlineInput = document.getElementById('task-deadline');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const filterStatusSelect = document.getElementById('filter-status');
const filterPrioritySelect = document.getElementById('filter-priority');
const sortBySelect = document.getElementById('sort-by');
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

// Array to store tasks
let tasks = [];

// Local Storage Key
const LOCAL_STORAGE_KEY = 'todoTasks';
const THEME_STORAGE_KEY = 'todoTheme';

// Function to load tasks from Local Storage
const loadTasks = () => {
    const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    } else {
        tasks = [];
    }
    renderTasks(); // Render tasks after loading
};

// Function to save tasks to Local Storage
const saveTasks = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
};

// Function to render tasks to the DOM
const renderTasks = () => {
    taskList.innerHTML = ''; // Clear current list

    // Apply filters
    let filteredTasks = [...tasks];

    const statusFilter = filterStatusSelect.value;
    if (statusFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => {
            if (statusFilter === 'overdue') {
                const deadline = new Date(task.deadline);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return !task.completed && deadline < today;
            }
            return task.completed === (statusFilter === 'completed');
        });
    }

    const priorityFilter = filterPrioritySelect.value;
    if (priorityFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }

    const sortBy = sortBySelect.value;
    filteredTasks.sort((a, b) => {
        if (sortBy === 'deadline') {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        } else if (sortBy === 'priority') {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        } else {
            return a.id - b.id;
        }
    });

    if (filteredTasks.length === 0 && (statusFilter !== 'all' || priorityFilter !== 'all')) {
        const noTasksMessage = document.createElement('li');
        noTasksMessage.textContent = 'No tasks match the current filters.';
        noTasksMessage.style.textAlign = 'center';
        noTasksMessage.style.fontStyle = 'italic';
        noTasksMessage.style.color = '#777';
        noTasksMessage.style.border = 'none';
        noTasksMessage.style.backgroundColor = 'transparent';
        taskList.appendChild(noTasksMessage);
        return;
    }

    filteredTasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.classList.add('task-item', task.priority);
        if (task.completed) {
            listItem.classList.add('completed');
        }

        const deadlineDate = new Date(task.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isOverdue = !task.completed && deadlineDate < today;

        if (isOverdue) {
            listItem.classList.add('overdue');
        }

        let countdownText = '';
        if (!task.completed && !isOverdue) {
            const timeDiff = deadlineDate.getTime() - today.getTime();
            const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            if (diffDays === 0) {
                countdownText = 'Due Today';
            } else if (diffDays === 1) {
                countdownText = 'Due in 1 day';
            } else if (diffDays > 1) {
                countdownText = `Due in ${diffDays} days`;
            }
        } else if (isOverdue) {
            countdownText = 'Overdue';
        }

        listItem.innerHTML = `
            <input type="checkbox" class="complete-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}" />
            <div class="task-details">
                <h3>${task.title}</h3>
                <p>Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
                <p>Deadline: ${task.deadline}</p>
                ${countdownText ? `<p>${countdownText}</p>` : ''}
            </div>
            <div class="task-actions">
                <button class="edit-btn" data-id="${task.id}">Edit</button>
                <button class="delete-btn" data-id="${task.id}">Delete</button>
            </div>
        `;

        taskList.appendChild(listItem);
    });
};

// Function to handle adding or editing a task
const handleAddTask = (event) => {
    event.preventDefault();

    const id = taskIdInput.value;
    const title = taskTitleInput.value.trim();
    const priority = taskPriorityInput.value;
    const deadline = taskDeadlineInput.value;

    if (!title || !deadline) {
        alert('Please enter task title and deadline.');
        return;
    }

    // Check for duplicate task title when adding new task
    if (!id && tasks.some(task => task.title.toLowerCase() === title.toLowerCase())) {
        alert('A task with this title already exists. Please choose a different title.');
        return;
    }

    if (id) {
        tasks = tasks.map(task =>
            task.id === parseInt(id) ? { ...task, title, priority, deadline } : task
        );
        addTaskBtn.textContent = 'Add Task';
        taskIdInput.value = '';
    } else {
        const newId = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
        const newTask = {
            id: newId,
            title,
            priority,
            deadline,
            completed: false
        };
        tasks.push(newTask);
    }

    saveTasks();
    renderTasks();
    taskForm.reset();
};

// Function to handle marking task as complete
const toggleComplete = (event) => {
    if (event.target.classList.contains('complete-checkbox')) {
        const taskId = parseInt(event.target.dataset.id);
        const isCompleted = event.target.checked;

        tasks = tasks.map(task =>
            task.id === taskId ? { ...task, completed: isCompleted } : task
        );

        saveTasks();
        renderTasks();
    }
};

// Function to handle deleting a task
const deleteTask = (event) => {
    if (event.target.classList.contains('delete-btn')) {
        const taskId = parseInt(event.target.dataset.id);
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }
};

// Function to handle editing a task
const editTask = (event) => {
    if (event.target.classList.contains('edit-btn')) {
        const taskId = parseInt(event.target.dataset.id);
        const taskToEdit = tasks.find(task => task.id === taskId);

        if (taskToEdit) {
            taskIdInput.value = taskToEdit.id;
            taskTitleInput.value = taskToEdit.title;
            taskPriorityInput.value = taskToEdit.priority;
            taskDeadlineInput.value = taskToEdit.deadline;

            addTaskBtn.textContent = 'Update Task';
        }
    }
};

// Function to handle theme toggle
const toggleTheme = () => {
    body.classList.toggle('dark-mode');
    const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    updateThemeIcon(currentTheme);
};

// Function to update the theme toggle button icon
const updateThemeIcon = (theme) => {
    if (theme === 'dark') {
        themeToggleBtn.textContent = '🌙';
    } else {
        themeToggleBtn.textContent = '🌞';
    }
};

// Function to load theme from Local Storage
const loadTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        updateThemeIcon('dark');
    } else {
        body.classList.remove('dark-mode');
        updateThemeIcon('light');
    }
};

// Event Listeners
taskForm.addEventListener('submit', handleAddTask);
taskList.addEventListener('change', toggleComplete);
taskList.addEventListener('click', deleteTask);
taskList.addEventListener('click', editTask);
filterStatusSelect.addEventListener('change', renderTasks);
filterPrioritySelect.addEventListener('change', renderTasks);
sortBySelect.addEventListener('change', renderTasks);
themeToggleBtn.addEventListener('click', toggleTheme);

// Initial load
loadTheme();
loadTasks();

// Logout button functionality
const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'auth.html';
});

// Redirect to auth.html if not logged in
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
    window.location.href = 'auth.html';
}
