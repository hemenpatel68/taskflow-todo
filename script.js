class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    this.theme = localStorage.getItem('theme') || 'light';
    this.setupEventListeners();
    this.render();
    this.applyTheme();
  }

  setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

    // Task form
    document.getElementById('addTaskBtn').addEventListener('click', () => this.openModal());
    document.getElementById('cancelTaskBtn').addEventListener('click', () => this.closeModal());
    document.getElementById('taskForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Search and filter
    document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e));
    document.getElementById('filterSelect').addEventListener('change', (e) => this.handleFilter(e));
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  applyTheme() {
    document.body.classList.toggle('dark', this.theme === 'dark');
    const themeIcon = document.querySelector('.theme-toggle-icon');
    themeIcon.textContent = this.theme === 'dark' ? '☀️' : '🌙';
  }

  openModal(task = null) {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const modalTitle = document.getElementById('modalTitle');

    modalTitle.textContent = task ? 'Edit Task' : 'Add New Task';
    form.reset();

    if (task) {
      form.dataset.taskId = task.id;
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskDescription').value = task.description;
      document.getElementById('taskPriority').value = task.priority;
      document.getElementById('taskDueDate').value = task.dueDate || '';
    } else {
      delete form.dataset.taskId;
    }

    modal.classList.add('open');
  }

  closeModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.remove('open');
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const taskData = {
      title: document.getElementById('taskTitle').value,
      description: document.getElementById('taskDescription').value,
      priority: document.getElementById('taskPriority').value,
      dueDate: document.getElementById('taskDueDate').value || null,
      completed: false
    };

    if (form.dataset.taskId) {
      this.updateTask(form.dataset.taskId, taskData);
    } else {
      this.addTask(taskData);
    }

    this.closeModal();
  }

  addTask(taskData) {
    const task = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...taskData
    };

    this.tasks.unshift(task);
    this.saveTasks();
    this.render();
  }

  updateTask(taskId, taskData) {
    const index = this.tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      this.tasks[index] = {
        ...this.tasks[index],
        ...taskData,
        updatedAt: new Date().toISOString()
      };
      this.saveTasks();
      this.render();
    }
  }

  toggleTaskComplete(taskId) {
    const task = this.tasks.find(task => task.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.render();
    }
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveTasks();
    this.render();
  }

  handleSearch(e) {
    this.render();
  }

  handleFilter(e) {
    this.render();
  }

  getFilteredTasks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filter = document.getElementById('filterSelect').value;

    return this.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                          task.description.toLowerCase().includes(searchTerm);
      const matchesFilter = filter === 'all' ||
                          (filter === 'active' && !task.completed) ||
                          (filter === 'completed' && task.completed);
      return matchesSearch && matchesFilter;
    });
  }

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString();
  }

  createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.innerHTML = `
      <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
           role="checkbox" 
           aria-checked="${task.completed}"></div>
      <div class="task-content">
        <div class="task-header">
          <h3 class="task-title">${task.title}</h3>
          <div class="task-actions">
            <button class="btn btn-secondary delete-task" aria-label="Delete task">🗑️</button>
          </div>
        </div>
        ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
        <div class="task-meta">
          <span class="task-tag priority-${task.priority}">${task.priority}</span>
          ${task.dueDate ? `<span class="task-tag">${this.formatDate(task.dueDate)}</span>` : ''}
        </div>
      </div>
    `;

    // Event listeners
    taskElement.querySelector('.task-checkbox').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleTaskComplete(task.id);
    });

    taskElement.querySelector('.delete-task').addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteTask(task.id);
    });

    taskElement.addEventListener('click', () => this.openModal(task));

    return taskElement;
  }

  render() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    const filteredTasks = this.getFilteredTasks();
    
    if (filteredTasks.length === 0) {
      taskList.innerHTML = `
        <div class="empty-state">
          <p>No tasks found</p>
        </div>
      `;
      return;
    }

    filteredTasks.forEach(task => {
      taskList.appendChild(this.createTaskElement(task));
    });
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
}

// Initialize the app
const taskManager = new TaskManager();