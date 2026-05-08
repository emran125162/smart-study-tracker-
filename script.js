// Smart Study Tracker Pro - Enhanced JavaScript
class StudyTrackerPro {
    constructor() {
        this.tasks = [];
        this.subjects = [];
        this.totalTime = 0;
        this.sessionTime = 0;
        this.isRunning = false;
        this.dailyGoal = 5 * 3600;
        this.timerInterval = null;
        this.currentFilter = 'all';
        this.timerMode = 'standard';
        this.pomodoroTime = 25 * 60;
        this.isPomodoroFocus = true;
        this.pomodoroSessions = 0;
        this.sessionHistory = [];
        this.lastStudyDate = null;
        this.studyStreak = 0;
        
        this.initializeElements();
        this.loadFromStorage();
        this.attachEventListeners();
        this.loadTheme();
        this.updateUI();
    }

    initializeElements() {
        // Dashboard
        this.totalHoursEl = document.getElementById('totalHours');
        this.streakCountEl = document.getElementById('streakCount');
        this.tasksCompletedEl = document.getElementById('tasksCompleted');
        this.progressPercentEl = document.getElementById('progressPercent');
        this.progressFill = document.getElementById('progressFill');
        this.progressTime = document.getElementById('progressTime');
        this.motivationalMsg = document.getElementById('motivationalMsg');
        this.todayTasksList = document.getElementById('todayTasksList');

        // Tasks
        this.subjectSelect = document.getElementById('subjectSelect');
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.estimateInput = document.getElementById('estimateInput');
        this.notesInput = document.getElementById('notesInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.tasksList = document.getElementById('tasksList');

        // Timer
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.pomStartBtn = document.getElementById('pomStartBtn');
        this.pomStopBtn = document.getElementById('pomStopBtn');
        this.pomResetBtn = document.getElementById('pomResetBtn');
        this.pomodoroDisplay = document.getElementById('pomodoroDisplay');
        this.pomodoroStatus = document.getElementById('pomodoroStatus');
        this.pomSessionCount = document.getElementById('pomSessionCount');
        this.dailyTime = document.getElementById('dailyTime');
        this.remainingTime = document.getElementById('remainingTime');
        this.goalDisplay = document.getElementById('goalDisplay');

        // Analytics
        this.weekTotal = document.getElementById('weekTotal');
        this.avgDaily = document.getElementById('avgDaily');
        this.bestDay = document.getElementById('bestDay');
        this.totalTasksCount = document.getElementById('totalTasksCount');
        this.subjectBreakdown = document.getElementById('subjectBreakdown');

        // Settings
        this.dailyGoalInput = document.getElementById('dailyGoalInput');
        this.subjectInput = document.getElementById('subjectInput');
        this.addSubjectBtn = document.getElementById('addSubjectBtn');
        this.subjectsList = document.getElementById('subjectsList');

        // Theme
        this.themeToggle = document.getElementById('themeToggle');
    }

    attachEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.nav-btn').dataset.view;
                this.switchView(view);
            });
        });

        // Tasks
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Timer
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.stopBtn.addEventListener('click', () => this.stopTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.pomStartBtn.addEventListener('click', () => this.startPomodoro());
        this.pomStopBtn.addEventListener('click', () => this.pausePomodoro());
        this.pomResetBtn.addEventListener('click', () => this.resetPomodoro());

        // Subjects
        this.addSubjectBtn.addEventListener('click', () => this.addSubject());
        this.subjectInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addSubject();
        });

        // Theme
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    loadFromStorage() {
        const savedTasks = localStorage.getItem('studyTasks');
        const savedSubjects = localStorage.getItem('studySubjects');
        const savedTime = localStorage.getItem('totalStudyTime');
        const savedGoal = localStorage.getItem('dailyGoal');
        const savedHistory = localStorage.getItem('sessionHistory');
        const savedStreak = localStorage.getItem('studyStreak');
        const savedLastDate = localStorage.getItem('lastStudyDate');

        if (savedTasks) this.tasks = JSON.parse(savedTasks);
        if (savedSubjects) this.subjects = JSON.parse(savedSubjects);
        if (savedTime) this.totalTime = parseInt(savedTime);
        if (savedGoal) this.dailyGoal = parseInt(savedGoal);
        if (savedHistory) this.sessionHistory = JSON.parse(savedHistory);
        if (savedStreak) this.studyStreak = parseInt(savedStreak);
        if (savedLastDate) this.lastStudyDate = savedLastDate;

        this.calculateStreak();
    }

    saveToStorage() {
        localStorage.setItem('studyTasks', JSON.stringify(this.tasks));
        localStorage.setItem('studySubjects', JSON.stringify(this.subjects));
        localStorage.setItem('totalStudyTime', this.totalTime.toString());
        localStorage.setItem('dailyGoal', this.dailyGoal.toString());
        localStorage.setItem('sessionHistory', JSON.stringify(this.sessionHistory));
        localStorage.setItem('studyStreak', this.studyStreak.toString());
        localStorage.setItem('lastStudyDate', this.lastStudyDate);
    }

    calculateStreak() {
        const today = new Date().toLocaleDateString();
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

        if (this.lastStudyDate === today) {
            return;
        }

        if (this.lastStudyDate === yesterday && this.totalTime > 0) {
            this.studyStreak++;
        } else if (this.lastStudyDate !== yesterday) {
            this.studyStreak = this.totalTime > 0 ? 1 : 0;
        }

        this.lastStudyDate = today;
    }

    switchView(viewName) {
        document.querySelectorAll('.view').forEach(section => section.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

        document.getElementById(viewName).classList.add('active');
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        if (viewName === 'analytics') {
            this.updateAnalytics();
        }
    }

    addTask() {
        const text = this.taskInput.value.trim();
        const subjectId = this.subjectSelect.value;
        const priority = this.prioritySelect.value;
        const estimate = this.estimateInput.value || 0;
        const notes = this.notesInput.value.trim();

        if (!text || !subjectId) {
            alert('Please select a subject and enter a task');
            return;
        }

        const task = {
            id: Date.now(),
            text,
            subjectId,
            priority,
            estimate: parseInt(estimate),
            notes,
            completed: false,
            createdAt: new Date().toLocaleDateString()
        };

        this.tasks.unshift(task);
        this.taskInput.value = '';
        this.notesInput.value = '';
        this.estimateInput.value = '';
        this.prioritySelect.value = 'medium';
        this.saveToStorage();
        this.updateUI();
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage();
            this.updateUI();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveToStorage();
        this.updateUI();
    }

    filterTasks(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        this.updateTasksList();
    }

    addSubject() {
        const name = this.subjectInput.value.trim();
        if (!name) {
            alert('Please enter a subject name');
            return;
        }

        const colors = ['color-1', 'color-2', 'color-3', 'color-4'];
        const subject = {
            id: Date.now(),
            name,
            color: colors[this.subjects.length % colors.length]
        };

        this.subjects.push(subject);
        this.subjectInput.value = '';
        this.saveToStorage();
        this.updateUI();
    }

    deleteSubject(subjectId) {
        if (this.tasks.some(t => t.subjectId === subjectId)) {
            alert('Delete all tasks for this subject first');
            return;
        }

        this.subjects = this.subjects.filter(s => s.id !== subjectId);
        this.saveToStorage();
        this.updateUI();
    }

    startTimer() {
        this.isRunning = true;
        this.startBtn.style.display = 'none';
        this.stopBtn.style.display = 'flex';

        this.timerInterval = setInterval(() => {
            this.sessionTime++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.startBtn.style.display = 'flex';
        this.stopBtn.style.display = 'none';

        this.totalTime += this.sessionTime;
        this.sessionHistory.push({
            duration: this.sessionTime,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        });
        this.calculateStreak();
        this.sessionTime = 0;
        this.saveToStorage();
        this.updateUI();
    }

    resetTimer() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.sessionTime = 0;
        this.startBtn.style.display = 'flex';
        this.stopBtn.style.display = 'none';
        this.updateTimerDisplay();
    }

    setTimerMode(mode) {
        this.timerMode = mode;
        document.querySelectorAll('.timer-mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        document.querySelectorAll('.timer-card').forEach(card => card.classList.remove('active'));
        if (mode === 'standard') {
            document.getElementById('standardTimer').classList.add('active');
        } else {
            document.getElementById('pomodoroTimer').classList.add('active');
            this.updatePomodoroDisplay();
        }
    }

    startPomodoro() {
        this.isRunning = true;
        this.pomStartBtn.style.display = 'none';
        this.pomStopBtn.style.display = 'flex';

        this.timerInterval = setInterval(() => {
            this.pomodoroTime--;
            this.updatePomodoroDisplay();

            if (this.pomodoroTime <= 0) {
                this.completePomodoroRound();
            }
        }, 1000);
    }

    pausePomodoro() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.pomStartBtn.style.display = 'flex';
        this.pomStopBtn.style.display = 'none';
    }

    resetPomodoro() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.pomodoroTime = 25 * 60;
        this.isPomodoroFocus = true;
        this.pomStartBtn.style.display = 'flex';
        this.pomStopBtn.style.display = 'none';
        this.updatePomodoroDisplay();
    }

    completePomodoroRound() {
        clearInterval(this.timerInterval);
        this.pomStartBtn.style.display = 'flex';
        this.pomStopBtn.style.display = 'none';

        if (this.isPomodoroFocus) {
            this.totalTime += 25 * 60;
            this.sessionHistory.push({
                duration: 25 * 60,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            });
            this.pomodoroSessions++;
            this.isPomodoroFocus = false;
            this.pomodoroTime = 5 * 60;
            alert('Focus time complete! Take a 5-minute break.');
        } else {
            this.isPomodoroFocus = true;
            this.pomodoroTime = 25 * 60;
            alert('Break time over! Ready for another focus session?');
        }

        this.calculateStreak();
        this.saveToStorage();
        this.updatePomodoroDisplay();
    }

    updatePomodoroDisplay() {
        const mins = Math.floor(this.pomodoroTime / 60);
        const secs = this.pomodoroTime % 60;
        this.pomodoroDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        this.pomodoroStatus.textContent = this.isPomodoroFocus ? 'Focus Time' : 'Break Time';
        this.pomSessionCount.textContent = this.pomodoroSessions;
    }

    updateDailyGoal() {
        const newGoal = parseInt(this.dailyGoalInput.value) * 3600;
        if (newGoal > 0) {
            this.dailyGoal = newGoal;
            this.saveToStorage();
            alert('Daily goal updated!');
            this.updateUI();
        }
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    formatTimeDetailed(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    getSubjectName(subjectId) {
        const subject = this.subjects.find(s => s.id === subjectId);
        return subject ? subject.name : 'Unknown';
    }

    getSubjectColor(subjectId) {
        const subject = this.subjects.find(s => s.id === subjectId);
        if (!subject) return '#888780';

        const colors = {
            'color-1': '#1D9E75',
            'color-2': '#185FA5',
            'color-3': '#BA7517',
            'color-4': '#D4537E'
        };

        return colors[subject.color] || '#888780';
    }

    getMotivationalMessage() {
        const percent = Math.round((this.totalTime / this.dailyGoal) * 100);

        if (percent >= 100) return "🎉 You've reached your goal! Amazing work!";
        if (percent >= 80) return "📚 You're almost there! Keep it up!";
        if (percent >= 50) return "💪 Great progress! Halfway there!";
        if (percent >= 20) return "🚀 Off to a great start!";
        return "✨ Every minute counts. Start studying!";
    }

    toggleTheme() {
        const html = document.documentElement;
        html.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', html.classList.contains('dark-mode'));
        this.updateThemeIcon();
    }

    loadTheme() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.documentElement.classList.add('dark-mode');
        }
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const isDark = document.documentElement.classList.contains('dark-mode');
        this.themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    exportData() {
        const data = {
            tasks: this.tasks,
            subjects: this.subjects,
            totalTime: this.totalTime,
            sessionHistory: this.sessionHistory,
            exportDate: new Date().toLocaleString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `study-tracker-${Date.now()}.json`;
        link.click();
    }

    clearAllData() {
        if (confirm('Are you sure? This will delete all your data permanently.')) {
            if (confirm('This action cannot be undone. Are you absolutely sure?')) {
                localStorage.clear();
                location.reload();
            }
        }
    }

    updateAnalytics() {
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));

        let weekTime = 0;
        const dayTimes = {};

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            dayTimes[date.toLocaleDateString()] = 0;
        }

        this.sessionHistory.forEach(session => {
            if (new Date(session.date) >= weekStart) {
                weekTime += session.duration;
                if (dayTimes.hasOwnProperty(session.date)) {
                    dayTimes[session.date] += session.duration;
                }
            }
        });

        const avgDaily = Math.round(weekTime / 7);
        const bestDayTime = Math.max(...Object.values(dayTimes));
        const bestDayName = bestDayTime > 0 ? Object.keys(dayTimes).find(k => dayTimes[k] === bestDayTime) : '-';

        this.weekTotal.textContent = this.formatTime(weekTime);
        this.avgDaily.textContent = this.formatTime(avgDaily);
        this.bestDay.textContent = bestDayName === '-' ? '-' : new Date(bestDayName).toLocaleDateString('en-US', { weekday: 'short' });
        this.totalTasksCount.textContent = this.tasks.length;

        this.updateSubjectBreakdown();
    }

    updateSubjectBreakdown() {
        let breakdown = {};

        this.tasks.forEach(task => {
            if (!breakdown[task.subjectId]) {
                breakdown[task.subjectId] = 0;
            }
        });

        if (Object.keys(breakdown).length === 0) {
            this.subjectBreakdown.innerHTML = '<p class="empty-state">No data yet</p>';
            return;
        }

        this.subjectBreakdown.innerHTML = Object.keys(breakdown).map(subjectId => `
            <div class="breakdown-item">
                <span class="breakdown-name">${this.getSubjectName(subjectId)}</span>
                <span class="breakdown-time">${this.tasks.filter(t => t.subjectId == subjectId).length} tasks</span>
            </div>
        `).join('');
    }

    updateUI() {
        this.updateDashboard();
        this.updateSubjectSelect();
        this.updateTasksList();
        this.updateTodayTasks();
        this.updateSubjectsGrid();
        this.updateTimerDisplay();
        this.dailyGoalInput.value = this.dailyGoal / 3600;
        this.goalDisplay.textContent = `${this.dailyGoal / 3600}h`;
    }

    updateDashboard() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        const progressPercent = Math.round((this.totalTime / this.dailyGoal) * 100);

        this.totalHoursEl.textContent = `${Math.floor(this.totalTime / 3600)}h`;
        this.streakCountEl.textContent = `🔥 ${this.studyStreak}`;
        this.tasksCompletedEl.textContent = `${completedCount}/${this.tasks.length}`;
        this.progressPercentEl.textContent = `${Math.min(progressPercent, 100)}%`;

        const fillPercent = Math.min(progressPercent, 100);
        this.progressFill.style.width = `${fillPercent}%`;

        const hours = Math.floor(this.totalTime / 3600);
        const minutes = Math.floor((this.totalTime % 3600) / 60);
        this.progressTime.textContent = `${hours}h ${minutes}m / ${this.dailyGoal / 3600}h`;

        this.motivationalMsg.textContent = this.getMotivationalMessage();
    }

    updateSubjectSelect() {
        this.subjectSelect.innerHTML = '<option value="">Select a subject</option>';
        this.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            this.subjectSelect.appendChild(option);
        });
    }

    updateTasksList() {
        let filteredTasks = this.tasks;

        if (this.currentFilter === 'pending') {
            filteredTasks = this.tasks.filter(t => !t.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = this.tasks.filter(t => t.completed);
        } else if (this.currentFilter === 'high') {
            filteredTasks = this.tasks.filter(t => t.priority === 'high');
        }

        if (filteredTasks.length === 0) {
            this.tasksList.innerHTML = '<p class="empty-state">No tasks found</p>';
            return;
        }

        this.tasksList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="app.toggleTask(${task.id})">
                <div class="task-content">
                    <div class="task-text">${task.text}</div>
                    <div class="task-meta">
                        <span class="task-badge" style="background-color: ${this.getSubjectColor(task.subjectId)}">${this.getSubjectName(task.subjectId)}</span>
                        <span class="priority-badge priority-${task.priority}">${task.priority.toUpperCase()}</span>
                        ${task.estimate ? `<span style="font-size: 0.75rem;">~${task.estimate}m</span>` : ''}
                        ${task.notes ? `<span style="font-size: 0.75rem; color: var(--primary-color);" title="${task.notes}">📝</span>` : ''}
                    </div>
                </div>
                <button class="task-delete" onclick="app.deleteTask(${task.id})">✕</button>
            </div>
        `).join('');
    }

    updateTodayTasks() {
        const today = new Date().toLocaleDateString();
        const todayTasks = this.tasks.filter(t => t.createdAt === today)
            .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });

        if (todayTasks.length === 0) {
            this.todayTasksList.innerHTML = '<p class="empty-state">No tasks for today yet!</p>';
            return;
        }

        this.todayTasksList.innerHTML = todayTasks.slice(0, 5).map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="app.toggleTask(${task.id})">
                <div class="task-content">
                    <div class="task-text">${task.text}</div>
                    <div class="task-meta">
                        <span class="priority-badge priority-${task.priority}">${task.priority.toUpperCase()}</span>
                    </div>
                </div>
                <span class="task-badge" style="background-color: ${this.getSubjectColor(task.subjectId)}">${this.getSubjectName(task.subjectId)}</span>
            </div>
        `).join('');
    }

    updateSubjectsGrid() {
        if (this.subjects.length === 0) {
            this.subjectsList.innerHTML = '<p class="empty-state">No subjects yet. Create your first!</p>';
            return;
        }

        this.subjectsList.innerHTML = this.subjects.map(subject => `
            <div class="subject-card ${subject.color}">
                ${subject.name}
                <button class="subject-delete" onclick="app.deleteSubject(${subject.id})">✕</button>
            </div>
        `).join('');
    }

    updateTimerDisplay() {
        this.timerDisplay.textContent = this.formatTimeDetailed(this.sessionTime);

        const hours = Math.floor(this.totalTime / 3600);
        const minutes = Math.floor((this.totalTime % 3600) / 60);
        this.dailyTime.textContent = `${hours}h ${minutes}m`;

        const remaining = Math.max(0, this.dailyGoal - this.totalTime);
        const remHours = Math.floor(remaining / 3600);
        const remMinutes = Math.floor((remaining % 3600) / 60);
        this.remainingTime.textContent = `${remHours}h ${remMinutes}m`;
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new StudyTrackerPro();
});