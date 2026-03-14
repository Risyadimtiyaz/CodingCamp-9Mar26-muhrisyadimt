/**
 * Task Persistence Test - Node.js Version
 * Tests the persistence functionality of TaskManager
 */

// Mock localStorage for Node.js environment
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = value;
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}

global.localStorage = new LocalStorageMock();

// Load the app.js code (we'll extract the relevant classes)
const fs = require('fs');
const appCode = fs.readFileSync('js/app.js', 'utf8');

// Extract and evaluate the necessary classes
eval(appCode.split('// ============================================================================')[0] + 
     appCode.split('// ============================================================================')[1] +
     appCode.split('// ============================================================================')[2] +
     appCode.split('// ============================================================================')[3] +
     appCode.split('// ============================================================================')[4]);

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, message) {
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.log(`✗ FAIL: ${testName} - ${message}`);
    testsFailed++;
  }
}

console.log('='.repeat(60));
console.log('Task Persistence Tests');
console.log('='.repeat(60));
console.log();

// Mock DOM elements
const mockContainer = {
  getElementById: () => null
};

// Test 1: Automatic saving on task creation
console.log('Test 1: Automatic saving on task creation');
localStorage.clear();
const tm1 = new TaskManager(mockContainer);
tm1.tasks = [];
const taskId1 = tm1.addTask('Test Task 1');
const savedData1 = JSON.parse(localStorage.getItem('productivity-dashboard-tasks'));
assert(
  savedData1 && savedData1.length === 1 && savedData1[0].text === 'Test Task 1',
  'Test 1',
  'Task should be saved to Local Storage after creation'
);
console.log();

// Test 2: Automatic saving on task edit
console.log('Test 2: Automatic saving on task edit');
tm1.editTask(taskId1, 'Updated Task 1');
const savedData2 = JSON.parse(localStorage.getItem('productivity-dashboard-tasks'));
assert(
  savedData2 && savedData2[0].text === 'Updated Task 1',
  'Test 2',
  'Task edit should be saved to Local Storage'
);
console.log();

// Test 3: Automatic saving on task toggle
console.log('Test 3: Automatic saving on task toggle');
tm1.toggleTaskComplete(taskId1);
const savedData3 = JSON.parse(localStorage.getItem('productivity-dashboard-tasks'));
assert(
  savedData3 && savedData3[0].completed === true,
  'Test 3',
  'Task completion toggle should be saved to Local Storage'
);
console.log();

// Test 4: Automatic saving on task deletion
console.log('Test 4: Automatic saving on task deletion');
tm1.deleteTask(taskId1);
const savedData4 = JSON.parse(localStorage.getItem('productivity-dashboard-tasks'));
assert(
  savedData4 && savedData4.length === 0,
  'Test 4',
  'Task deletion should be saved to Local Storage'
);
console.log();

// Test 5: Task loading on initialization
console.log('Test 5: Task loading on initialization');
localStorage.clear();
const tm2 = new TaskManager(mockContainer);
tm2.tasks = [];
tm2.addTask('Task A');
tm2.addTask('Task B');
tm2.addTask('Task C');

// Create new instance to test loading
const tm3 = new TaskManager(mockContainer);
tm3.loadTasks();

assert(
  tm3.tasks.length === 3 &&
  tm3.tasks[0].text === 'Task A' &&
  tm3.tasks[1].text === 'Task B' &&
  tm3.tasks[2].text === 'Task C',
  'Test 5',
  'Tasks should be loaded from Local Storage on initialization'
);
console.log();

// Test 6: Empty task list handling
console.log('Test 6: Empty task list handling');
localStorage.clear();
const tm4 = new TaskManager(mockContainer);
tm4.loadTasks();

assert(
  tm4.tasks.length === 0,
  'Test 6',
  'Empty task list should be handled correctly'
);
console.log();

// Test 7: Task order preservation
console.log('Test 7: Task order preservation');
localStorage.clear();
const tm5 = new TaskManager(mockContainer);
tm5.tasks = [];
tm5.addTask('First');
tm5.addTask('Second');
tm5.addTask('Third');

// Create new instance to test order preservation
const tm6 = new TaskManager(mockContainer);
tm6.loadTasks();

assert(
  tm6.tasks.length === 3 &&
  tm6.tasks[0].text === 'First' &&
  tm6.tasks[1].text === 'Second' &&
  tm6.tasks[2].text === 'Third',
  'Test 7',
  'Task order should be preserved across sessions'
);
console.log();

// Test 8: Multiple operations persistence
console.log('Test 8: Multiple operations persistence');
localStorage.clear();
const tm7 = new TaskManager(mockContainer);
tm7.tasks = [];

const id1 = tm7.addTask('Task 1');
const id2 = tm7.addTask('Task 2');
const id3 = tm7.addTask('Task 3');

tm7.toggleTaskComplete(id2);
tm7.editTask(id1, 'Modified Task 1');
tm7.deleteTask(id3);

// Verify in storage
const finalData = JSON.parse(localStorage.getItem('productivity-dashboard-tasks'));
assert(
  finalData && finalData.length === 2 &&
  finalData[0].text === 'Modified Task 1' &&
  finalData[1].text === 'Task 2' &&
  finalData[1].completed === true,
  'Test 8',
  'All operations should be persisted correctly'
);
console.log();

// Test 9: Requirement 8.1 - Load tasks on startup
console.log('Test 9: Requirement 8.1 - Load tasks on startup');
localStorage.clear();
const tm8 = new TaskManager(mockContainer);
tm8.tasks = [];
tm8.addTask('Startup Task 1');
tm8.addTask('Startup Task 2');

// Simulate application restart
const tm9 = new TaskManager(mockContainer);
tm9.loadTasks();

assert(
  tm9.tasks.length === 2,
  'Test 9 (Req 8.1)',
  'Task list should retrieve all saved tasks from Local Storage'
);
console.log();

// Test 10: Requirement 8.2 - Display loaded tasks
console.log('Test 10: Requirement 8.2 - Display loaded tasks');
// This is verified by the loadTasks() method calling renderTasks()
const tm10 = new TaskManager(mockContainer);
tm10.loadTasks();
assert(
  tm10.tasks.length === 2 &&
  tm10.tasks[0].text === 'Startup Task 1' &&
  tm10.tasks[1].text === 'Startup Task 2',
  'Test 10 (Req 8.2)',
  'Retrieved tasks should be available for display'
);
console.log();

// Test 11: Requirement 8.3 - Handle empty Local Storage
console.log('Test 11: Requirement 8.3 - Handle empty Local Storage');
localStorage.clear();
const tm11 = new TaskManager(mockContainer);
tm11.loadTasks();

assert(
  tm11.tasks.length === 0 && Array.isArray(tm11.tasks),
  'Test 11 (Req 8.3)',
  'Empty Local Storage should result in empty task list'
);
console.log();

// Test 12: Requirement 8.4 - Maintain task order
console.log('Test 12: Requirement 8.4 - Maintain task order');
localStorage.clear();
const tm12 = new TaskManager(mockContainer);
tm12.tasks = [];

// Add tasks in specific order
const order = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
order.forEach(text => tm12.addTask(text));

// Load in new instance
const tm13 = new TaskManager(mockContainer);
tm13.loadTasks();

const orderPreserved = tm13.tasks.every((task, index) => task.text === order[index]);
assert(
  orderPreserved && tm13.tasks.length === order.length,
  'Test 12 (Req 8.4)',
  'Task order should be maintained across browser sessions'
);
console.log();

// Summary
console.log('='.repeat(60));
console.log('Test Summary');
console.log('='.repeat(60));
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);
console.log();

if (testsFailed === 0) {
  console.log('✓ All tests passed! Task persistence is working correctly.');
  process.exit(0);
} else {
  console.log('✗ Some tests failed. Please review the implementation.');
  process.exit(1);
}
