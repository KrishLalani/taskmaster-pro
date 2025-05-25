// Task Management Functions
class TaskManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStats();
    }

    bindEvents() {
        const form = document.getElementById('task-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTask();
            });
        }
    }

    async addTask() {
        const input = document.getElementById('task-input');
        const priority = document.getElementById('priority-select');
        
        if (!input.value.trim()) return;

        try {
            const response = await fetch('/api/add_task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: input.value.trim(),
                    priority: priority.value
                })
            });

            const result = await response.json();
            
            if (result.success) {
                input.value = '';
                this.refreshTaskList();
                this.showNotification('Task added successfully!', 'success');
            }
        } catch (error) {
            this.showNotification('Error adding task', 'error');
        }
    }

    async refreshTaskList() {
        try {
            const response = await fetch('/api/tasks');
            const tasks = await response.json();
            this.renderTasks(tasks);
            this.updateStats();
        } catch (error) {
            console.error('Error refreshing tasks:', error);
        }
    }

    renderTasks(tasks) {
        const taskList = document.getElementById('task-list');
        
        if (tasks.length === 0) {
            taskList.innerHTML = `
                <div class="p-12 text-center">
                    <i class="fas fa-clipboard-list text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">No tasks yet. Add your first task above!</p>
                </div>
            `;
            return;
        }

        taskList.innerHTML = tasks.map(task => `
            <div class="task-item p-6 hover:bg-gray-50 transition-colors duration-200" data-task-id="${task.id}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <input 
                            type="checkbox" 
                            class="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                            ${task.completed ? 'checked' : ''}
                            onchange="taskManager.toggleTask(${task.id})"
                        >
                        <div class="flex-1">
                            <p class="text-gray-800 ${task.completed ? 'line-through text-gray-500' : ''}">
                                ${task.content}
                            </p>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="priority-badge px-2 py-1 text-xs rounded-full
                                    ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-green-100 text-green-800'}">
                                    ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                </span>
                                ${task.created_at ? `<span class="text-xs text-gray-500">${new Date(task.created_at).toLocaleString()}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <button 
                        onclick="taskManager.deleteTask(${task.id})"
                        class="text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async toggleTask(taskId) {
        window.location.href = `/toggle_task/${taskId}`;
    }

    async deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            window.location.href = `/delete_task/${taskId}`;
        }
    }

    updateStats() {
        // This will be implemented based on current tasks
        const totalTasks = document.querySelectorAll('.task-item').length;
        const completedTasks = document.querySelectorAll('.task-item input[type="checkbox"]:checked').length;
        const pendingTasks = totalTasks - completedTasks;

        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('completed-tasks').textContent = completedTasks;
        document.getElementById('pending-tasks').textContent = pendingTasks;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});