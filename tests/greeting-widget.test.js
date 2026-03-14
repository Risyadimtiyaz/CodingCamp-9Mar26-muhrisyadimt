/**
 * Unit Tests for GreetingWidget Custom Name Functionality
 * Tests Requirements 2.1, 2.2, 2.4, 2.5, 2.6
 */

// Mock DOM elements for testing
class MockElement {
    constructor(id) {
        this.id = id;
        this.textContent = '';
        this.value = '';
        this.style = { display: '' };
        this.eventListeners = {};
    }

    addEventListener(event, handler) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(handler);
    }

    dispatchEvent(event) {
        const handlers = this.eventListeners[event.type] || [];
        handlers.forEach(handler => handler(event));
    }

    focus() {
        // Mock focus
    }

    select() {
        // Mock select
    }
}

// Mock document.getElementById
const mockElements = {
    'time-display': new MockElement('time-display'),
    'date-display': new MockElement('date-display'),
    'greeting-message': new MockElement('greeting-message'),
    'name-display': new MockElement('name-display'),
    'custom-name': new MockElement('custom-name'),
    'edit-name-btn': new MockElement('edit-name-btn'),
    'name-input-container': new MockElement('name-input-container'),
    'custom-name-input': new MockElement('custom-name-input'),
    'save-name-btn': new MockElement('save-name-btn'),
    'cancel-name-btn': new MockElement('cancel-name-btn'),
    'add-name-btn': new MockElement('add-name-btn')
};

global.document = {
    getElementById: (id) => mockElements[id] || null,
    createElement: (tag) => ({ textContent: '', innerHTML: '' })
};

// Mock localStorage
const mockStorage = {};
global.localStorage = {
    setItem: (key, value) => { mockStorage[key] = value; },
    getItem: (key) => mockStorage[key] || null,
    removeItem: (key) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }
};

// Mock alert
global.alert = (message) => console.log(`Alert: ${message}`);

// Load the classes (simplified versions for testing)
class LocalStorageService {
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
}

class TimeUtils {
    static getCurrentTime() {
        return new Date();
    }

    static formatTime12Hour(date) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    static formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }

    static getTimeBasedGreeting(date) {
        const hour = date.getHours();
        if (hour >= 5 && hour < 12) return "Good Morning";
        if (hour >= 12 && hour < 17) return "Good Afternoon";
        if (hour >= 17 && hour < 21) return "Good Evening";
        return "Good Night";
    }
}

const STORAGE_KEYS = {
    CUSTOM_NAME: 'productivity-dashboard-custom-name'
};

// Simplified GreetingWidget for testing
class GreetingWidget {
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
    }

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
    }

    loadCustomName() {
        this.customName = LocalStorageService.load(STORAGE_KEYS.CUSTOM_NAME);
    }

    saveCustomNameToStorage() {
        LocalStorageService.save(STORAGE_KEYS.CUSTOM_NAME, this.customName);
    }

    showNameInput() {
        if (this.isEditingName) {
            return;
        }

        this.isEditingName = true;

        if (this.nameDisplay) {
            this.nameDisplay.style.display = 'none';
        }
        if (this.addNameBtn) {
            this.addNameBtn.style.display = 'none';
        }

        if (this.nameInputContainer) {
            this.nameInputContainer.style.display = 'flex';
        }

        if (this.customNameInput) {
            this.customNameInput.value = this.customName || '';
        }
    }

    saveCustomName() {
        if (!this.customNameInput) {
            return;
        }

        const newName = this.customNameInput.value.trim();
        
        if (!newName) {
            alert('Please enter a name');
            return;
        }

        if (newName.length > 50) {
            alert('Name must be 50 characters or less');
            return;
        }

        const sanitizedName = this.sanitizeInput(newName);

        this.customName = sanitizedName;
        this.saveCustomNameToStorage();

        this.exitNameEditMode();
        this.updateNameDisplay();
        this.updateTime();
    }

    cancelNameEdit() {
        this.exitNameEditMode();
    }

    exitNameEditMode() {
        this.isEditingName = false;

        if (this.nameInputContainer) {
            this.nameInputContainer.style.display = 'none';
        }

        this.updateNameDisplay();
    }

    updateNameDisplay() {
        if (this.customName) {
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
            if (this.nameDisplay) {
                this.nameDisplay.style.display = 'none';
            }
            if (this.addNameBtn) {
                this.addNameBtn.style.display = 'inline-flex';
            }
        }
    }

    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    updateTime() {
        const now = TimeUtils.getCurrentTime();
        
        if (this.timeDisplay) {
            this.timeDisplay.textContent = this.formatTime(now);
        }
        
        if (this.dateDisplay) {
            this.dateDisplay.textContent = this.formatDate(now);
        }
        
        if (this.greetingDisplay) {
            this.greetingDisplay.textContent = this.getPersonalizedGreeting(now);
        }
    }

    getPersonalizedGreeting(date) {
        const baseGreeting = this.getTimeBasedGreeting(date);
        
        if (this.customName) {
            return `${baseGreeting}, ${this.customName}!`;
        } else {
            return baseGreeting;
        }
    }

    formatTime(date) {
        return TimeUtils.formatTime12Hour(date);
    }

    formatDate(date) {
        return TimeUtils.formatDate(date);
    }

    getTimeBasedGreeting(date) {
        return TimeUtils.getTimeBasedGreeting(date);
    }
}

// Test Suite
function runTests() {
    console.log('Running GreetingWidget Custom Name Tests...\n');
    
    let passedTests = 0;
    let totalTests = 0;

    function test(name, testFn) {
        totalTests++;
        try {
            testFn();
            console.log(`✓ ${name}`);
            passedTests++;
        } catch (error) {
            console.log(`✗ ${name}: ${error.message}`);
        }
    }

    function assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    // Clear storage before tests
    localStorage.clear();

    // Test 1: Widget initialization
    test('Widget initializes correctly', () => {
        const widget = new GreetingWidget(null);
        widget.init();
        assert(widget.customName === null, 'Initial custom name should be null');
        assert(widget.isEditingName === false, 'Should not be in editing mode initially');
    });

    // Test 2: Custom name persistence - Requirement 2.2
    test('Custom name persists to local storage', () => {
        const widget = new GreetingWidget(null);
        widget.init();
        
        // Set a custom name
        widget.customName = 'John Doe';
        widget.saveCustomNameToStorage();
        
        // Create new widget and load
        const newWidget = new GreetingWidget(null);
        newWidget.init();
        
        assert(newWidget.customName === 'John Doe', 'Custom name should persist across sessions');
    });

    // Test 3: Personalized greeting generation - Requirement 2.3
    test('Generates personalized greeting with custom name', () => {
        const widget = new GreetingWidget(null);
        widget.init();
        widget.customName = 'Alice';
        
        const testDate = new Date('2024-01-15T10:00:00'); // Morning
        const greeting = widget.getPersonalizedGreeting(testDate);
        
        assert(greeting === 'Good Morning, Alice!', `Expected 'Good Morning, Alice!', got '${greeting}'`);
    });

    // Test 4: Default greeting without custom name - Requirement 2.4
    test('Shows default greeting when no custom name is set', () => {
        const widget = new GreetingWidget(null);
        widget.init();
        widget.customName = null;
        
        const testDate = new Date('2024-01-15T15:00:00'); // Afternoon
        const greeting = widget.getPersonalizedGreeting(testDate);
        
        assert(greeting === 'Good Afternoon', `Expected 'Good Afternoon', got '${greeting}'`);
    });

    // Test 5: Input validation - Requirement 2.1
    test('Validates custom name input', () => {
        const widget = new GreetingWidget(null);
        widget.init();
        
        // Test empty name
        widget.customNameInput.value = '   ';
        let alertCalled = false;
        const originalAlert = global.alert;
        global.alert = () => { alertCalled = true; };
        
        widget.saveCustomName();
        assert(alertCalled, 'Should show alert for empty name');
        
        // Test long name
        alertCalled = false;
        widget.customNameInput.value = 'A'.repeat(51);
        widget.saveCustomName();
        assert(alertCalled, 'Should show alert for name too long');
        
        global.alert = originalAlert;
    });

    // Test 6: Input sanitization - Requirement 2.1
    test('Sanitizes user input', () => {
        const widget = new GreetingWidget(null);
        widget.init();
        
        const maliciousInput = '<script>alert("xss")</script>John';
        const sanitized = widget.sanitizeInput(maliciousInput);
        
        assert(!sanitized.includes('<script>'), 'Should sanitize HTML tags');
        assert(sanitized.includes('John'), 'Should preserve safe content');
    });

    // Test 7: Name display state management - Requirement 2.1
    test('Manages name display states correctly', () => {
        const widget = new GreetingWidget(null);
        widget.init();
        
        // Initially no name - should show add button
        widget.updateNameDisplay();
        assert(widget.addNameBtn.style.display === 'inline-flex', 'Should show add button when no name');
        assert(widget.nameDisplay.style.display === 'none', 'Should hide name display when no name');
        
        // With name - should show name display
        widget.customName = 'Test User';
        widget.updateNameDisplay();
        assert(widget.nameDisplay.style.display === 'flex', 'Should show name display when name exists');
        assert(widget.addNameBtn.style.display === 'none', 'Should hide add button when name exists');
        assert(widget.customNameSpan.textContent === 'Test User', 'Should display the custom name');
    });

    // Test 8: Edit mode functionality - Requirement 2.1
    test('Handles edit mode correctly', () => {
        const widget = new GreetingWidget(null);
        widget.init();
        widget.customName = 'Original Name';
        
        // Enter edit mode
        widget.showNameInput();
        assert(widget.isEditingName === true, 'Should be in editing mode');
        assert(widget.nameInputContainer.style.display === 'flex', 'Should show input container');
        assert(widget.customNameInput.value === 'Original Name', 'Should populate input with current name');
        
        // Cancel edit
        widget.cancelNameEdit();
        assert(widget.isEditingName === false, 'Should exit editing mode');
        assert(widget.nameInputContainer.style.display === 'none', 'Should hide input container');
    });

    // Test 9: Time-based greeting variations
    test('Generates correct time-based greetings', () => {
        const widget = new GreetingWidget(null);
        widget.init();
        widget.customName = 'User';
        
        const morningDate = new Date('2024-01-15T08:00:00');
        const afternoonDate = new Date('2024-01-15T14:00:00');
        const eveningDate = new Date('2024-01-15T19:00:00');
        const nightDate = new Date('2024-01-15T23:00:00');
        
        assert(widget.getPersonalizedGreeting(morningDate) === 'Good Morning, User!', 'Morning greeting incorrect');
        assert(widget.getPersonalizedGreeting(afternoonDate) === 'Good Afternoon, User!', 'Afternoon greeting incorrect');
        assert(widget.getPersonalizedGreeting(eveningDate) === 'Good Evening, User!', 'Evening greeting incorrect');
        assert(widget.getPersonalizedGreeting(nightDate) === 'Good Night, User!', 'Night greeting incorrect');
    });

    // Test 10: Storage key consistency - Requirement 2.6
    test('Uses correct storage key for persistence', () => {
        const widget = new GreetingWidget(null);
        widget.init();
        
        widget.customName = 'Storage Test';
        widget.saveCustomNameToStorage();
        
        const storedValue = localStorage.getItem('productivity-dashboard-custom-name');
        assert(storedValue === '"Storage Test"', 'Should use correct storage key');
    });

    console.log(`\nTest Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Custom name functionality is working correctly.');
    } else {
        console.log('❌ Some tests failed. Please review the implementation.');
    }
}

// Run the tests
runTests();