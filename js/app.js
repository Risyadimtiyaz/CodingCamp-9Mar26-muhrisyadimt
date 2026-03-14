// Productivity Dashboard - Core Application

// ============================================================================
// Core Utility Classes
// ============================================================================

/**
 * LocalStorageService - Centralized data persistence layer
 * Handles all Local Storage operations with error handling
 */
class LocalStorageService {
  /**
   * Save data to Local Storage
   * @param {string} key - Storage key
   * @param {*} data - Data to store (will be JSON serialized)
   * @returns {boolean} - Success status
   */
  static save(key, data) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`LocalStorage save error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Load data from Local Storage
   * @param {string} key - Storage key
   * @returns {*} - Parsed data or null if not found/error
   */
  static load(key) {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized === null) {
        return null;
      }
      return JSON.parse(serialized);
    } catch (error) {
      console.error(`LocalStorage load error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Remove data from Local Storage
   * @param {string} key - Storage key
   * @returns {boolean} - Success status
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`LocalStorage remove error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all data from Local Storage
   * @returns {boolean} - Success status
   */
  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('LocalStorage clear error:', error);
      return false;
    }
  }
}

/**
 * TimeUtils - Date and time formatting utilities
 * Provides consistent time/date formatting across the application
 */
class TimeUtils {
  /**
   * Get current time
   * @returns {Date} - Current date/time
   */
  static getCurrentTime() {
    return new Date();
  }

  /**
   * Format time in 12-hour format with AM/PM
   * @param {Date} date - Date object to format
   * @returns {string} - Formatted time string (e.g., "3:45 PM")
   */
  static formatTime12Hour(date) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Format date with weekday, month, and day
   * @param {Date} date - Date object to format
   * @returns {string} - Formatted date string (e.g., "Monday, January 15")
   */
  static formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get time-based greeting
   * @param {Date} date - Date object to evaluate
   * @returns {string} - Greeting message based on time of day
   */
  static getTimeBasedGreeting(date) {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  }
}

// ============================================================================
// Storage Keys Constants
// ============================================================================

const STORAGE_KEYS = {
  TASKS: 'productivity-dashboard-tasks',
  LINKS: 'productivity-dashboard-links',
  CUSTOM_NAME: 'productivity-dashboard-custom-name'
};

// ============================================================================
// Greeting Widget Component
// ============================================================================

/**
 * GreetingWidget - Displays current time, date, and time-based greeting with custom name personalization
 * Updates automatically every minute and supports custom name input and persistence
 */
class GreetingWidget {
  /**
   * Create a GreetingWidget instance
   * @param {HTMLElement} containerElement - The container element for the widget
   */
  constructor(containerElement) {
    this.container = containerElement;
    this.timeDisplay = null;
    this.dateDisplay = null;
    this.greetingDisplay = null;
    this.updateInterval = null;
    
    // Custom name elements
    this.nameDisplay = null;
    this.customNameSpan = null;
    this.editNameBtn = null;
    this.nameInputContainer = null;
    this.customNameInput = null;
    this.saveNameBtn = null;
    this.cancelNameBtn = null;
    this.addNameBtn = null;
    
    // Custom name state
    this.customName = null;
    this.isEditingName = false;
  }

  /**
   * Initialize the widget and start automatic updates
   */
  init() {
    // Get DOM elements
    this.timeDisplay = document.getElementById('time-display');
    this.dateDisplay = document.getElementById('date-display');
    this.greetingDisplay = document.getElementById('greeting-message');
    
    // Get custom name elements
    this.nameDisplay = document.getElementById('name-display');
    this.customNameSpan = document.getElementById('custom-name');
    this.editNameBtn = document.getElementById('edit-name-btn');
    this.nameInputContainer = document.getElementById('name-input-container');
    this.customNameInput = document.getElementById('custom-name-input');
    this.saveNameBtn = document.getElementById('save-name-btn');
    this.cancelNameBtn = document.getElementById('cancel-name-btn');
    this.addNameBtn = document.getElementById('add-name-btn');

    // Set up custom name event listeners
    this.setupNameEventListeners();
    
    // Load saved custom name
    this.loadCustomName();
    
    // Initial update
    this.updateTime();
    this.updateNameDisplay();

    // Set up automatic updates every minute (60000ms)
    this.updateInterval = setInterval(() => {
      this.updateTime();
    }, 60000);
  }

  /**
   * Set up event listeners for custom name functionality
   */
  setupNameEventListeners() {
    // Add name button
    if (this.addNameBtn) {
      this.addNameBtn.addEventListener('click', () => {
        this.showNameInput();
      });
    }

    // Edit name button
    if (this.editNameBtn) {
      this.editNameBtn.addEventListener('click', () => {
        this.showNameInput();
      });
    }

    // Save name button
    if (this.saveNameBtn) {
      this.saveNameBtn.addEventListener('click', () => {
        this.saveCustomName();
      });
    }

    // Cancel name button
    if (this.cancelNameBtn) {
      this.cancelNameBtn.addEventListener('click', () => {
        this.cancelNameEdit();
      });
    }

    // Enter key to save, Escape key to cancel
    if (this.customNameInput) {
      this.customNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.saveCustomName();
        }
      });

      this.customNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.cancelNameEdit();
        }
      });
    }
  }

  /**
   * Load custom name from local storage
   */
  loadCustomName() {
    this.customName = LocalStorageService.load(STORAGE_KEYS.CUSTOM_NAME);
  }

  /**
   * Save custom name to local storage
   */
  saveCustomNameToStorage() {
    LocalStorageService.save(STORAGE_KEYS.CUSTOM_NAME, this.customName);
  }

  /**
   * Show the name input interface
   */
  showNameInput() {
    if (this.isEditingName) {
      return; // Already editing
    }

    this.isEditingName = true;

    // Hide other elements
    if (this.nameDisplay) {
      this.nameDisplay.style.display = 'none';
    }
    if (this.addNameBtn) {
      this.addNameBtn.style.display = 'none';
    }

    // Show input container
    if (this.nameInputContainer) {
      this.nameInputContainer.style.display = 'flex';
    }

    // Set current name in input
    if (this.customNameInput) {
      this.customNameInput.value = this.customName || '';
      this.customNameInput.focus();
      this.customNameInput.select();
    }
  }

  /**
   * Save the custom name
   */
  saveCustomName() {
    if (!this.customNameInput) {
      return;
    }

    const newName = this.customNameInput.value.trim();
    
    // Validate input
    if (!newName) {
      alert('Please enter a name');
      this.customNameInput.focus();
      return;
    }

    if (newName.length > 50) {
      alert('Name must be 50 characters or less');
      this.customNameInput.focus();
      return;
    }

    // Sanitize input (basic HTML escaping)
    const sanitizedName = this.sanitizeInput(newName);

    // Update custom name
    this.customName = sanitizedName;
    this.saveCustomNameToStorage();

    // Exit edit mode
    this.exitNameEditMode();

    // Update displays
    this.updateNameDisplay();
    this.updateTime(); // Update greeting with new name
  }

  /**
   * Cancel name editing
   */
  cancelNameEdit() {
    this.exitNameEditMode();
  }

  /**
   * Exit name edit mode and restore display
   */
  exitNameEditMode() {
    this.isEditingName = false;

    // Hide input container
    if (this.nameInputContainer) {
      this.nameInputContainer.style.display = 'none';
    }

    // Show appropriate display
    this.updateNameDisplay();
  }

  /**
   * Update the name display based on current state
   */
  updateNameDisplay() {
    if (this.customName) {
      // Show name display with edit button
      if (this.nameDisplay) {
        this.nameDisplay.style.display = 'flex';
      }
      if (this.customNameSpan) {
        this.customNameSpan.textContent = this.customName;
      }
      if (this.addNameBtn) {
        this.addNameBtn.style.display = 'none';
      }
    } else {
      // Show add name button
      if (this.nameDisplay) {
        this.nameDisplay.style.display = 'none';
      }
      if (this.addNameBtn) {
        this.addNameBtn.style.display = 'inline-flex';
      }
    }
  }

  /**
   * Sanitize user input to prevent XSS
   * @param {string} input - User input to sanitize
   * @returns {string} - Sanitized input
   */
  sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Update the time, date, and greeting displays
   */
  updateTime() {
    const now = TimeUtils.getCurrentTime();
    
    // Update time display
    if (this.timeDisplay) {
      this.timeDisplay.textContent = this.formatTime(now);
    }
    
    // Update date display
    if (this.dateDisplay) {
      this.dateDisplay.textContent = this.formatDate(now);
    }
    
    // Update greeting message with custom name
    if (this.greetingDisplay) {
      this.greetingDisplay.textContent = this.getPersonalizedGreeting(now);
    }
  }

  /**
   * Get personalized greeting message with custom name
   * @param {Date} date - Date object to evaluate
   * @returns {string} - Personalized greeting message
   */
  getPersonalizedGreeting(date) {
    const baseGreeting = this.getTimeBasedGreeting(date);
    
    if (this.customName) {
      return `${baseGreeting}, ${this.customName}!`;
    } else {
      return baseGreeting;
    }
  }

  /**
   * Format time in 12-hour format with AM/PM
   * @param {Date} date - Date object to format
   * @returns {string} - Formatted time string
   */
  formatTime(date) {
    return TimeUtils.formatTime12Hour(date);
  }

  /**
   * Format date with day of week, month, and day
   * @param {Date} date - Date object to format
   * @returns {string} - Formatted date string
   */
  formatDate(date) {
    return TimeUtils.formatDate(date);
  }

  /**
   * Get time-based greeting message
   * @param {Date} date - Date object to evaluate
   * @returns {string} - Greeting message
   */
  getTimeBasedGreeting(date) {
    return TimeUtils.getTimeBasedGreeting(date);
  }

  /**
   * Clean up resources (stop interval)
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// ============================================================================
// Focus Timer Component
// ============================================================================

/**
 * FocusTimer - 25-minute countdown timer for focused work sessions
 * Provides start, stop, reset controls and completion notification
 */
class FocusTimer {
  /**
   * Create a FocusTimer instance
   * @param {HTMLElement} containerElement - The container element for the timer
   */
  constructor(containerElement) {
    this.container = containerElement;
    this.defaultDuration = 1500; // 25 minutes in seconds
    this.duration = 1500; // Current duration in seconds
    this.remainingTime = 1500;
    this.isRunning = false;
    this.intervalId = null;

    // DOM elements
    this.displayElement = null;
    this.startButton = null;
    this.stopButton = null;
    this.resetButton = null;
    this.statusElement = null;
    this.durationInput = null;
    this.durationError = null;
  }

  /**
   * Initialize the timer and set up event listeners
   */
  init() {
    // Get DOM elements
    this.displayElement = document.getElementById('timer-display');
    this.startButton = document.getElementById('timer-start');
    this.stopButton = document.getElementById('timer-stop');
    this.resetButton = document.getElementById('timer-reset');
    this.statusElement = document.getElementById('timer-status');
    this.durationInput = document.getElementById('timer-duration-input');
    this.durationError = document.getElementById('timer-duration-error');

    // Load saved duration from storage
    this.loadCustomDuration();

    // Set up event listeners
    if (this.startButton) {
      this.startButton.addEventListener('click', () => this.start());
    }
    if (this.stopButton) {
      this.stopButton.addEventListener('click', () => this.stop());
    }
    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => this.reset());
    }
    if (this.durationInput) {
      this.durationInput.addEventListener('input', () => this.onDurationChange());
      this.durationInput.addEventListener('blur', () => this.validateAndSaveDuration());
    }

    // Initial display update
    this.updateDisplay();
  }

  /**
   * Load custom duration from local storage
   */
  loadCustomDuration() {
    try {
      const savedDuration = LocalStorageService.load('timer-duration');
      if (savedDuration && typeof savedDuration === 'number' && savedDuration >= 1 && savedDuration <= 120) {
        this.setDuration(savedDuration);
      } else {
        // Use default duration (25 minutes)
        this.setDuration(25);
      }
    } catch (error) {
      console.warn('Failed to load timer duration from storage:', error);
      this.setDuration(25);
    }
  }

  /**
   * Save custom duration to local storage
   */
  saveCustomDuration(minutes) {
    try {
      LocalStorageService.save('timer-duration', minutes);
    } catch (error) {
      console.error('Failed to save timer duration to storage:', error);
    }
  }

  /**
   * Set timer duration in minutes
   * @param {number} minutes - Duration in minutes (1-120)
   */
  setDuration(minutes) {
    this.duration = minutes * 60; // Convert to seconds
    this.remainingTime = this.duration;

    // Update input field
    if (this.durationInput) {
      this.durationInput.value = minutes;
    }

    // Update display
    this.updateDisplay();
  }

  /**
   * Handle duration input change
   */
  onDurationChange() {
    // Clear any existing error message
    this.clearDurationError();
  }

  /**
   * Validate and save duration when input loses focus
   */
  validateAndSaveDuration() {
    const inputValue = this.durationInput.value.trim();

    // Clear any existing error
    this.clearDurationError();

    // Validate input
    if (!inputValue) {
      this.showDurationError('Duration is required');
      this.setDuration(25); // Reset to default
      return;
    }

    const minutes = parseInt(inputValue, 10);

    // Check if it's a valid number
    if (isNaN(minutes)) {
      this.showDurationError('Please enter a valid number');
      this.setDuration(25); // Reset to default
      return;
    }

    // Check range (1-120 minutes)
    if (minutes < 1 || minutes > 120) {
      this.showDurationError('Duration must be between 1 and 120 minutes');
      this.setDuration(25); // Reset to default
      return;
    }

    // Valid duration - apply it
    this.setDuration(minutes);
    this.saveCustomDuration(minutes);

    // Reset timer if not running
    if (!this.isRunning) {
      this.reset();
    }
  }

  /**
   * Show duration validation error
   * @param {string} message - Error message to display
   */
  showDurationError(message) {
    if (this.durationError) {
      this.durationError.textContent = message;
      this.durationError.style.display = 'block';
      this.durationError.style.color = '#e74c3c';
    }
  }

  /**
   * Clear duration validation error
   */
  clearDurationError() {
    if (this.durationError) {
      this.durationError.textContent = '';
      this.durationError.style.display = 'none';
    }
  }

  /**
   * Start the timer countdown
   */
  start() {
    if (this.isRunning) {
      return; // Already running
    }

    // Validate duration before starting
    this.validateAndSaveDuration();

    // Check if validation passed
    if (this.durationError && this.durationError.textContent) {
      return; // Don't start if there's an error
    }

    this.isRunning = true;

    // Clear any existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Start countdown - update every second
    this.intervalId = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.updateDisplay();
      } else {
        // Timer completed
        this.onTimerComplete();
      }
    }, 1000);

    // Update status
    if (this.statusElement) {
      this.statusElement.textContent = 'Timer running...';
      this.statusElement.style.color = '#3498db';
    }
  }

  /**
   * Stop/pause the timer
   */
  stop() {
    if (!this.isRunning) {
      return; // Not running
    }

    this.isRunning = false;

    // Clear the interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Update status
    if (this.statusElement) {
      this.statusElement.textContent = 'Timer paused';
      this.statusElement.style.color = '#95a5a6';
    }
  }

  /**
   * Reset the timer to current duration
   */
  reset() {
    // Stop the timer if running
    if (this.isRunning) {
      this.stop();
    }

    // Reset to current duration
    this.remainingTime = this.duration;
    this.updateDisplay();

    // Clear status
    if (this.statusElement) {
      this.statusElement.textContent = '';
    }
  }

  /**
   * Update the timer display with current remaining time
   */
  updateDisplay() {
    if (!this.displayElement) {
      return;
    }

    // Convert seconds to MM:SS format
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;

    // Format with leading zeros
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    this.displayElement.textContent = formattedTime;
  }

  /**
   * Handle timer completion
   */
  onTimerComplete() {
    // Stop the timer
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Update display to show 00:00
    this.remainingTime = 0;
    this.updateDisplay();

    // Show completion notification
    if (this.statusElement) {
      this.statusElement.textContent = '✓ Focus session complete!';
      this.statusElement.style.color = '#27ae60';
    }
  }

  /**
   * Clean up resources (stop interval)
   */
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }
}


// ============================================================================
// Task Model
// ============================================================================

/**
 * Task - Represents a single task with validation and state methods
 */
class Task {
  /**
   * Create a Task instance
   * @param {string} text - The task text content
   * @param {string} id - Optional unique identifier (generated if not provided)
   */
  constructor(text, id = null) {
    this.id = id || this.generateId();
    this.text = text.trim();
    this.completed = false;
    this.createdAt = new Date().toISOString();
  }

  /**
   * Generate a unique ID for the task
   * @returns {string} - Unique identifier
   */
  generateId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate the task has non-empty text
   * @returns {boolean} - True if task text is valid
   */
  validate() {
    return this.text && this.text.trim().length > 0;
  }

  /**
   * Toggle the completion status
   */
  toggle() {
    this.completed = !this.completed;
  }

  /**
   * Update the task text with validation
   * @param {string} newText - New text content
   * @returns {boolean} - True if update was successful
   */
  updateText(newText) {
    if (newText && newText.trim().length > 0) {
      this.text = newText.trim();
      return true;
    }
    return false;
  }
}

// ============================================================================
// Task Manager Component
// ============================================================================

/**
 * TaskManager - Manages CRUD operations for tasks with Local Storage persistence
 */
class TaskManager {
  /**
   * Create a TaskManager instance
   * @param {HTMLElement} containerElement - The container element for the task list
   */
  constructor(containerElement) {
    this.container = containerElement;
    this.tasks = [];
    this.nextId = 1;
    
    // DOM elements
    this.taskInput = null;
    this.addButton = null;
    this.taskList = null;
  }

  /**
   * Initialize the task manager and load saved tasks
   */
  init() {
    // Get DOM elements
    this.taskInput = document.getElementById('task-input');
    this.addButton = document.getElementById('add-task-btn');
    this.taskList = document.getElementById('task-list');

    // Set up event listeners
    if (this.addButton) {
      this.addButton.addEventListener('click', () => {
        if (this.taskInput && this.taskInput.value) {
          this.addTask(this.taskInput.value);
          this.taskInput.value = '';
        }
      });
    }

    // Allow Enter key to add task
    if (this.taskInput) {
      this.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && this.taskInput.value) {
          this.addTask(this.taskInput.value);
          this.taskInput.value = '';
        }
      });
    }

    // Load saved tasks
    this.loadTasks();
  }

  /**
   * Load tasks from Local Storage
   */
  loadTasks() {
    const savedTasks = LocalStorageService.load(STORAGE_KEYS.TASKS);
    
    if (savedTasks && Array.isArray(savedTasks)) {
      // Restore tasks from saved data
      this.tasks = savedTasks.map(taskData => {
        const task = new Task(taskData.text, taskData.id);
        task.completed = taskData.completed;
        task.createdAt = taskData.createdAt;
        return task;
      });
      
      // Update nextId to be higher than any existing ID
      if (this.tasks.length > 0) {
        const maxId = Math.max(...this.tasks.map(t => {
          const match = t.id.match(/task-(\d+)-/);
          return match ? parseInt(match[1]) : 0;
        }));
        this.nextId = maxId + 1;
      }
    } else {
      this.tasks = [];
    }
    
    // Render the loaded tasks
    this.renderTasks();
  }

  /**
   * Save tasks to Local Storage
   */
  saveTasks() {
    const taskData = this.tasks.map(task => ({
      id: task.id,
      text: task.text,
      completed: task.completed,
      createdAt: task.createdAt
    }));
    
    LocalStorageService.save(STORAGE_KEYS.TASKS, taskData);
  }

  /**
   * Add a new task
   * @param {string} text - Task text content
   * @returns {string|null} - Task ID if successful, null if validation fails
   */
  addTask(text) {
    // Trim whitespace from input text (Requirement 4.4)
    const trimmedText = text.trim();

    // Create new task with trimmed text
    const task = new Task(trimmedText);

    // Validate task
    if (!task.validate()) {
      console.warn('Cannot add task with empty text');
      this.showErrorMessage('Task text cannot be empty');
      return null;
    }

    // Check for duplicate tasks (Requirements 4.1, 4.3)
    const isDuplicate = this.tasks.some(existingTask => 
      existingTask.text.toLowerCase() === trimmedText.toLowerCase()
    );

    if (isDuplicate) {
      // Display error message and prevent creation (Requirement 4.2)
      console.warn('Cannot add duplicate task');
      this.showErrorMessage('A task with this text already exists');
      return null;
    }

    // Add to tasks array (Requirement 4.5)
    this.tasks.push(task);

    // Save to Local Storage
    this.saveTasks();

    // Re-render tasks
    this.renderTasks();

    return task.id;
  }


  /**
   * Edit an existing task
   * @param {string} id - Task ID
   * @param {string} newText - New task text
   * @returns {boolean} - True if successful
   */
  editTask(id, newText) {
    const task = this.tasks.find(t => t.id === id);
    
    if (!task) {
      console.warn(`Task with id ${id} not found`);
      return false;
    }
    
    // Update task text with validation
    const success = task.updateText(newText);
    
    if (success) {
      // Save to Local Storage
      this.saveTasks();
      
      // Re-render tasks
      this.renderTasks();
    }
    
    return success;
  }

  /**
   * Toggle task completion status
   * @param {string} id - Task ID
   * @returns {boolean} - True if successful
   */
  toggleTaskComplete(id) {
    const task = this.tasks.find(t => t.id === id);
    
    if (!task) {
      console.warn(`Task with id ${id} not found`);
      return false;
    }
    
    // Toggle completion status
    task.toggle();
    
    // Save to Local Storage
    this.saveTasks();
    
    // Re-render tasks
    this.renderTasks();
    
    return true;
  }

  /**
   * Delete a task
   * @param {string} id - Task ID
   * @returns {boolean} - True if successful
   */
  deleteTask(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    
    if (index === -1) {
      console.warn(`Task with id ${id} not found`);
      return false;
    }
    
    // Remove task from array
    this.tasks.splice(index, 1);
    
    // Save to Local Storage
    this.saveTasks();
    
    // Re-render tasks
    this.renderTasks();
    
    return true;
  }

  /**
   * Render all tasks to the DOM
   * Optimized for performance with large task lists (up to 100 tasks)
   */
  renderTasks() {
    if (!this.taskList) {
      return;
    }
    
    // Use DocumentFragment for efficient batch DOM insertion
    const fragment = document.createDocumentFragment();
    
    // Render each task into the fragment
    this.tasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      fragment.appendChild(taskElement);
    });
    
    // Show empty state if no tasks
    if (this.tasks.length === 0) {
      const emptyMessage = document.createElement('li');
      emptyMessage.className = 'task-empty';
      emptyMessage.textContent = 'No tasks yet. Add one above!';
      fragment.appendChild(emptyMessage);
    }
    
    // Single DOM update - clear and append fragment
    this.taskList.innerHTML = '';
    this.taskList.appendChild(fragment);
  }

  /**
   * Create a DOM element for a task
   * @param {Task} task - Task object
   * @returns {HTMLElement} - Task list item element
   */
  createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.taskId = task.id;
    li.setAttribute('role', 'listitem');
    if (task.completed) {
      li.classList.add('completed');
    }

    // Checkbox for completion toggle
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark task "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`);
    checkbox.addEventListener('change', () => {
      this.toggleTaskComplete(task.id);
    });

    // Task text (view mode)
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    textSpan.setAttribute('aria-label', `Task: ${task.text}`);

    // Enable double-click to edit
    textSpan.addEventListener('dblclick', () => {
      this.enterEditMode(li, task);
    });

    // Task actions container
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';
    actionsDiv.setAttribute('role', 'group');
    actionsDiv.setAttribute('aria-label', 'Task actions');

    // Edit button
    const editButton = document.createElement('button');
    editButton.className = 'btn btn-edit';
    editButton.textContent = 'Edit';
    editButton.setAttribute('aria-label', `Edit task "${task.text}"`);
    editButton.addEventListener('click', () => {
      this.enterEditMode(li, task);
    });

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger';
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete task "${task.text}"`);
    deleteButton.addEventListener('click', () => {
      if (confirm('Delete this task?')) {
        this.deleteTask(task.id);
      }
    });

    // Assemble task element
    actionsDiv.appendChild(editButton);
    actionsDiv.appendChild(deleteButton);

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(actionsDiv);

    return li;
  }

  /**
   * Enter edit mode for a task
   * @param {HTMLElement} taskElement - The task list item element
   * @param {Task} task - The task object
   */
  enterEditMode(taskElement, task) {
    // Prevent multiple edit modes
    if (taskElement.classList.contains('editing')) {
      return;
    }
    
    // Store original text for cancellation
    taskElement.dataset.originalText = task.text;
    
    // Add editing class
    taskElement.classList.add('editing');
    
    // Find the text span
    const textSpan = taskElement.querySelector('.task-text');
    const actionsDiv = taskElement.querySelector('.task-actions');
    
    if (!textSpan || !actionsDiv) {
      return;
    }
    
    // Create edit input
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'task-edit-input';
    editInput.value = task.text;
    editInput.maxLength = 200;
    
    // Replace text span with input
    textSpan.style.display = 'none';
    textSpan.parentNode.insertBefore(editInput, textSpan.nextSibling);
    
    // Focus the input and select text
    editInput.focus();
    editInput.select();
    
    // Create save and cancel buttons
    const saveButton = document.createElement('button');
    saveButton.className = 'btn btn-primary btn-save';
    saveButton.textContent = 'Save';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary btn-cancel';
    cancelButton.textContent = 'Cancel';
    
    // Hide original action buttons
    actionsDiv.style.display = 'none';
    
    // Create edit actions container
    const editActionsDiv = document.createElement('div');
    editActionsDiv.className = 'task-edit-actions';
    editActionsDiv.appendChild(saveButton);
    editActionsDiv.appendChild(cancelButton);
    
    // Insert edit actions after the hidden actions div
    actionsDiv.parentNode.insertBefore(editActionsDiv, actionsDiv.nextSibling);
    
    // Save button handler
    saveButton.addEventListener('click', () => {
      this.saveEdit(taskElement, task, editInput.value);
    });
    
    // Cancel button handler
    cancelButton.addEventListener('click', () => {
      this.cancelEdit(taskElement);
    });
    
    // Enter key to save
    editInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveEdit(taskElement, task, editInput.value);
      }
    });
    
    // Escape key to cancel
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.cancelEdit(taskElement);
      }
    });
  }

  /**
   * Save the edited task text
   * @param {HTMLElement} taskElement - The task list item element
   * @param {Task} task - The task object
   * @param {string} newText - The new text value
   */
  saveEdit(taskElement, task, newText) {
    // Validate new text
    if (!newText || !newText.trim()) {
      // Show error feedback (could be enhanced with visual feedback)
      alert('Task text cannot be empty');
      return;
    }
    
    // Update the task
    const success = this.editTask(task.id, newText);
    
    if (success) {
      // Exit edit mode (renderTasks will be called by editTask)
      // No need to manually exit since renderTasks recreates all elements
    }
  }

  /**
   * Cancel editing and restore original text
   * @param {HTMLElement} taskElement - The task list item element
   */
  cancelEdit(taskElement) {
    // Get original text
    const originalText = taskElement.dataset.originalText;
    
    // Remove editing class
    taskElement.classList.remove('editing');
    
    // Find elements
    const textSpan = taskElement.querySelector('.task-text');
    const editInput = taskElement.querySelector('.task-edit-input');
    const actionsDiv = taskElement.querySelector('.task-actions');
    const editActionsDiv = taskElement.querySelector('.task-edit-actions');
    
    // Restore text span
    if (textSpan) {
      textSpan.style.display = '';
      textSpan.textContent = originalText;
    }
    
    // Remove edit input
    if (editInput) {
      editInput.remove();
    }
    
    // Show original actions
    if (actionsDiv) {
      actionsDiv.style.display = '';
    }
    
    // Remove edit actions
    if (editActionsDiv) {
      editActionsDiv.remove();
    }
    
    // Clean up dataset
    delete taskElement.dataset.originalText;
  }


  /**
   * Generate a unique task ID
   * @returns {string} - Unique identifier
   */
  generateTaskId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get a task by ID (utility method for testing)
   * @param {string} id - Task ID
   * @returns {Task|null} - Task object or null if not found
   */
  getTask(id) {
    return this.tasks.find(t => t.id === id) || null;
  }

  /**
   * Display error message to user
   * @param {string} message - Error message to display
   */
  showErrorMessage(message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'task-error-message';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'polite');

    // Style the error message
    errorDiv.style.cssText = `
      background-color: #fee;
      border: 1px solid #fcc;
      color: #c33;
      padding: 8px 12px;
      margin: 8px 0;
      border-radius: 4px;
      font-size: 14px;
    `;

    // Find the task input container
    const taskInput = document.getElementById('task-input');
    if (taskInput && taskInput.parentNode) {
      // Insert error message after the input
      taskInput.parentNode.insertBefore(errorDiv, taskInput.nextSibling);

      // Auto-remove error message after 3 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 3000);
    } else {
      // Fallback to alert if DOM structure is unexpected
      alert(message);
    }
  }
}

// ============================================================================
// Link Model
// ============================================================================

/**
 * Link - Represents a website shortcut with URL validation
 */
class Link {
  /**
   * Create a Link instance
   * @param {string} url - The URL of the website
   * @param {string} displayName - The display name for the link
   * @param {string} id - Optional unique identifier (generated if not provided)
   */
  constructor(url, displayName, id = null) {
    this.id = id || this.generateId();
    this.url = url.trim();
    this.displayName = displayName.trim();
    this.createdAt = new Date().toISOString();
  }

  /**
   * Generate a unique ID for the link
   * @returns {string} - Unique identifier
   */
  generateId() {
    return `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate the link has non-empty URL and display name, and valid URL format
   * @returns {boolean} - True if link is valid
   */
  validate() {
    return this.url && this.url.trim().length > 0 && 
           this.displayName && this.displayName.trim().length > 0 &&
           this.isValidUrl(this.url);
  }

  /**
   * Check if a string is a valid URL
   * @param {string} string - String to validate as URL
   * @returns {boolean} - True if valid URL format
   */
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}

// ============================================================================
// Quick Links Manager Component
// ============================================================================

/**
 * QuickLinksManager - Manages CRUD operations for quick links with Local Storage persistence
 */
class QuickLinksManager {
  /**
   * Create a QuickLinksManager instance
   * @param {HTMLElement} containerElement - The container element for the quick links
   */
  constructor(containerElement) {
    this.container = containerElement;
    this.links = [];
    this.nextId = 1;
    
    // DOM elements
    this.urlInput = null;
    this.nameInput = null;
    this.addButton = null;
    this.linksList = null;
  }

  /**
   * Initialize the quick links manager and load saved links
   */
  init() {
    // Get DOM elements
    this.urlInput = document.getElementById('link-url-input');
    this.nameInput = document.getElementById('link-name-input');
    this.addButton = document.getElementById('add-link-btn');
    this.linksList = document.getElementById('links-list');

    // Set up event listeners
    if (this.addButton) {
      this.addButton.addEventListener('click', () => {
        if (this.urlInput && this.nameInput && this.urlInput.value && this.nameInput.value) {
          this.addLink(this.urlInput.value, this.nameInput.value);
          this.urlInput.value = '';
          this.nameInput.value = '';
        }
      });
    }

    // Allow Enter key to add link
    if (this.nameInput) {
      this.nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && this.urlInput && this.urlInput.value && this.nameInput.value) {
          this.addLink(this.urlInput.value, this.nameInput.value);
          this.urlInput.value = '';
          this.nameInput.value = '';
        }
      });
    }

    // Load saved links
    this.loadLinks();
  }

  /**
   * Load links from Local Storage
   */
  loadLinks() {
    const savedLinks = LocalStorageService.load(STORAGE_KEYS.LINKS);
    
    if (savedLinks && Array.isArray(savedLinks)) {
      // Restore links from saved data
      this.links = savedLinks.map(linkData => {
        const link = new Link(linkData.url, linkData.displayName, linkData.id);
        link.createdAt = linkData.createdAt;
        return link;
      });
      
      // Update nextId to be higher than any existing ID
      if (this.links.length > 0) {
        const maxId = Math.max(...this.links.map(l => {
          const match = l.id.match(/link-(\d+)-/);
          return match ? parseInt(match[1]) : 0;
        }));
        this.nextId = maxId + 1;
      }
    } else {
      this.links = [];
    }
    
    // Render the loaded links
    this.renderLinks();
  }

  /**
   * Save links to Local Storage
   */
  saveLinks() {
    const linkData = this.links.map(link => ({
      id: link.id,
      url: link.url,
      displayName: link.displayName,
      createdAt: link.createdAt
    }));
    
    LocalStorageService.save(STORAGE_KEYS.LINKS, linkData);
  }

  /**
   * Add a new link
   * @param {string} url - Link URL
   * @param {string} displayName - Link display name
   * @returns {string|null} - Link ID if successful, null if validation fails
   */
  addLink(url, displayName) {
    // Create new link
    const link = new Link(url, displayName);
    
    // Validate link
    if (!link.validate()) {
      console.warn('Cannot add link with empty URL, empty display name, or invalid URL format');
      return null;
    }
    
    // Add to links array
    this.links.push(link);
    
    // Save to Local Storage
    this.saveLinks();
    
    // Re-render links
    this.renderLinks();
    
    return link.id;
  }

  /**
   * Delete a link
   * @param {string} id - Link ID
   * @returns {boolean} - True if successful
   */
  deleteLink(id) {
    const index = this.links.findIndex(l => l.id === id);
    
    if (index === -1) {
      console.warn(`Link with id ${id} not found`);
      return false;
    }
    
    // Remove link from array
    this.links.splice(index, 1);
    
    // Save to Local Storage
    this.saveLinks();
    
    // Re-render links
    this.renderLinks();
    
    return true;
  }

  /**
   * Open a link in a new browser tab
   * @param {string} url - URL to open
   */
  openLink(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Render all links to the DOM
   * Optimized for performance with up to 20 links
   */
  renderLinks() {
    if (!this.linksList) {
      return;
    }
    
    // Use DocumentFragment for efficient batch DOM insertion
    const fragment = document.createDocumentFragment();
    
    // Render each link into the fragment
    this.links.forEach(link => {
      const linkElement = this.createLinkElement(link);
      fragment.appendChild(linkElement);
    });
    
    // Show empty state if no links
    if (this.links.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'links-empty';
      emptyMessage.textContent = 'No quick links yet. Add one above!';
      fragment.appendChild(emptyMessage);
    }
    
    // Single DOM update - clear and append fragment
    this.linksList.innerHTML = '';
    this.linksList.appendChild(fragment);
  }

  /**
   * Create a DOM element for a link
   * @param {Link} link - Link object
   * @returns {HTMLElement} - Link element
   */
  createLinkElement(link) {
    const linkContainer = document.createElement('div');
    linkContainer.className = 'link-item';
    linkContainer.dataset.linkId = link.id;
    linkContainer.setAttribute('role', 'listitem');

    // Link button (clickable to open URL)
    const linkButton = document.createElement('button');
    linkButton.className = 'btn btn-link';
    linkButton.textContent = link.displayName;
    linkButton.title = link.url;
    linkButton.setAttribute('aria-label', `Open ${link.displayName} in new tab`);
    linkButton.addEventListener('click', () => {
      this.openLink(link.url);
    });

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-small';
    deleteButton.textContent = '×';
    deleteButton.title = 'Delete link';
    deleteButton.setAttribute('aria-label', `Delete link ${link.displayName}`);
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering link open
      if (confirm(`Delete link "${link.displayName}"?`)) {
        this.deleteLink(link.id);
      }
    });

    // Assemble link element
    linkContainer.appendChild(linkButton);
    linkContainer.appendChild(deleteButton);

    return linkContainer;
  }

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid URL format
   */
  validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Generate a unique link ID
   * @returns {string} - Unique identifier
   */
  generateLinkId() {
    return `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get a link by ID (utility method for testing)
   * @param {string} id - Link ID
   * @returns {Link|null} - Link object or null if not found
   */
  getLink(id) {
    return this.links.find(l => l.id === id) || null;
  }
}

// ============================================================================
// Application Initialization
// ============================================================================

/**
 * Main Application Controller
 * Initializes all components on page load with error handling
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Productivity Dashboard initializing...');
    
    // Initialize Greeting Widget
    const greetingContainer = document.getElementById('greeting-widget');
    if (greetingContainer) {
      const greetingWidget = new GreetingWidget(greetingContainer);
      greetingWidget.init();
      console.log('Greeting Widget initialized');
    } else {
      console.warn('Greeting Widget container not found');
    }
    
    // Initialize Focus Timer
    const timerContainer = document.getElementById('timer-widget');
    if (timerContainer) {
      const focusTimer = new FocusTimer(timerContainer);
      focusTimer.init();
      console.log('Focus Timer initialized');
    } else {
      console.warn('Focus Timer container not found');
    }
    
    // Initialize Task Manager
    const taskContainer = document.getElementById('task-widget');
    if (taskContainer) {
      const taskManager = new TaskManager(taskContainer);
      taskManager.init();
      console.log('Task Manager initialized');
    } else {
      console.warn('Task Manager container not found');
    }
    
    // Initialize Quick Links Manager
    const linksContainer = document.getElementById('links-widget');
    if (linksContainer) {
      const quickLinksManager = new QuickLinksManager(linksContainer);
      quickLinksManager.init();
      console.log('Quick Links Manager initialized');
    } else {
      console.warn('Quick Links Manager container not found');
    }
    
    console.log('Productivity Dashboard initialized successfully');
    
  } catch (error) {
    // Application-level error handling
    console.error('Application initialization error:', error);
    
    // Display user-friendly error message
    const errorContainer = document.createElement('div');
    errorContainer.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: #e74c3c; color: white; padding: 15px 25px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 9999; font-family: Arial, sans-serif;';
    errorContainer.textContent = 'Failed to initialize the dashboard. Please refresh the page.';
    document.body.appendChild(errorContainer);
    
    // Auto-remove error message after 5 seconds
    setTimeout(() => {
      if (errorContainer.parentNode) {
        errorContainer.parentNode.removeChild(errorContainer);
      }
    }, 5000);
  }
});
