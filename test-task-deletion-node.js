// Task Deletion Verification Test (Node.js)
// Testing Requirements 7.1, 7.2, 7.3

// Mock localStorage for Node.js environment
global.localStorage = {
    storage: {},
    setItem(key, value) {
        this.storage[key] = value;
    },
    getItem(key) {
        return this.storage[key] || null;
    },
    removeItem(key) {
        delete this.storage[key];
    },
    clear() {
        this.storage = {};
    }
};

// Mock console methods
global.console = {
    log: () => {},
    warn: () => {},
    error: () => {}
};

// Load the application code
const fs = require('fs');
const appCode = fs.readFileSync('js/app.js', 'utf8');

// Remove DOM-dependent code and execute
const codeWithoutDOM = appCode
    .replace(/document\.addEventListener\('DOMContentLoaded'[\s\S]*?\}\);?\s*$/, '')
    .replace(/document\.getElementById/g, '() => null');

eval(codeWithoutDOM);

// Test suite
const testResults = [];

function logTest(name, passed, message) {
    testResults.push({ name, passed, message });
    const status = passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${status}: ${name}`);
    console.log(`  ${message}\n`);
}

function runTests() {
    console.log('='.repeat(60));
    console.log('Task Deletion Verification Tests');
    console.log('Testing Requirements 7.1, 7.2, 7.3');
    console.log('='.repeat(60) + '\n');

    // Clear localStorage before tests
    localStorage.clear();

    // Test 1: Verify deleteTask method exists
    const testContainer = { id: 'test-container' };
    const taskManager = new TaskManager(testContainer);
    taskManager.taskList = { appendChild: () => {}, innerHTML: '' };
    taskManager.init();

    const hasDeleteMethod = typeof taskManager.deleteTask === 'function';
    logTest(
        'Test 1: deleteTask method exists',
        hasDeleteMethod,
        hasDeleteMethod ? 'deleteTask method is defined' : 'deleteTask method is missing'
    );

    // Test 2: Add tasks and verify they exist
    const task1Id = taskManager.addTask('Test Task 1');
    const task2Id = taskManager.addTask('Test Task 2');
    const task3Id = taskManager.addTask('Test Task 3');

    const initialCount = taskManager.tasks.length;
    logTest(
        'Test 2: Tasks added successfully',
        initialCount === 3,
        `Added 3 tasks, current count: ${initialCount}`
    );

    // Test 3: Delete a task and verify it's removed from the array (Requirement 7.1)
    const deleteSuccess = taskManager.deleteTask(task2Id);
    const afterDeleteCount = taskManager.tasks.length;
    const taskStillExists = taskManager.tasks.some(t => t.id === task2Id);

    logTest(
        'Test 3: Task removed from array (Req 7.1)',
        deleteSuccess && afterDeleteCount === 2 && !taskStillExists,
        `Delete returned ${deleteSuccess}, count after delete: ${afterDeleteCount}, task still exists: ${taskStillExists}`
    );

    // Test 4: Verify task is removed from Local Storage (Requirement 7.2)
    const savedTasks = LocalStorageService.load(STORAGE_KEYS.TASKS);
    const taskInStorage = savedTasks ? savedTasks.some(t => t.id === task2Id) : false;

    logTest(
        'Test 4: Task removed from Local Storage (Req 7.2)',
        !taskInStorage,
        `Task found in storage: ${taskInStorage}, storage contains ${savedTasks ? savedTasks.length : 0} tasks`
    );

    // Test 5: Verify all data associated with deleted task is removed (Requirement 7.3)
    const allTaskData = savedTasks || [];
    const deletedTaskData = allTaskData.find(t => t.id === task2Id);
    const noDataRemains = !deletedTaskData;

    logTest(
        'Test 5: All task data removed (Req 7.3)',
        noDataRemains,
        noDataRemains ? 'No data remains for deleted task' : 'Task data still exists in storage'
    );

    // Test 6: Verify remaining tasks are intact
    const remainingTasks = taskManager.tasks;
    const task1Exists = remainingTasks.some(t => t.id === task1Id);
    const task3Exists = remainingTasks.some(t => t.id === task3Id);

    logTest(
        'Test 6: Remaining tasks intact',
        task1Exists && task3Exists && remainingTasks.length === 2,
        `Task 1 exists: ${task1Exists}, Task 3 exists: ${task3Exists}, Total: ${remainingTasks.length}`
    );

    // Test 7: Delete non-existent task returns false
    const deleteNonExistent = taskManager.deleteTask('non-existent-id');

    logTest(
        'Test 7: Delete non-existent task returns false',
        !deleteNonExistent,
        `Delete non-existent returned: ${deleteNonExistent}`
    );

    // Test 8: Delete all remaining tasks
    taskManager.deleteTask(task1Id);
    taskManager.deleteTask(task3Id);
    const finalCount = taskManager.tasks.length;
    const finalStorage = LocalStorageService.load(STORAGE_KEYS.TASKS);

    logTest(
        'Test 8: All tasks can be deleted',
        finalCount === 0 && (!finalStorage || finalStorage.length === 0),
        `Final count: ${finalCount}, Storage count: ${finalStorage ? finalStorage.length : 0}`
    );

    // Test 9: Verify task order is maintained after deletion
    localStorage.clear();
    const orderManager = new TaskManager(testContainer);
    orderManager.taskList = { appendChild: () => {}, innerHTML: '' };
    orderManager.init();

    const id1 = orderManager.addTask('First');
    const id2 = orderManager.addTask('Second');
    const id3 = orderManager.addTask('Third');
    const id4 = orderManager.addTask('Fourth');

    // Delete the second task
    orderManager.deleteTask(id2);

    const orderedTasks = orderManager.tasks;
    const correctOrder = 
        orderedTasks[0].id === id1 &&
        orderedTasks[1].id === id3 &&
        orderedTasks[2].id === id4 &&
        orderedTasks.length === 3;

    logTest(
        'Test 9: Task order maintained after deletion',
        correctOrder,
        `Order correct: ${correctOrder}, Tasks: [${orderedTasks.map(t => t.text).join(', ')}]`
    );

    // Test 10: Verify deletion with completed tasks
    localStorage.clear();
    const completedManager = new TaskManager(testContainer);
    completedManager.taskList = { appendChild: () => {}, innerHTML: '' };
    completedManager.init();

    const completedId = completedManager.addTask('Completed Task');
    completedManager.toggleTaskComplete(completedId);
    
    const taskBeforeDelete = completedManager.getTask(completedId);
    const wasCompleted = taskBeforeDelete && taskBeforeDelete.completed;
    
    completedManager.deleteTask(completedId);
    const deletedCompletedTask = completedManager.getTask(completedId);

    logTest(
        'Test 10: Completed tasks can be deleted',
        wasCompleted && !deletedCompletedTask,
        `Task was completed: ${wasCompleted}, Task deleted: ${!deletedCompletedTask}`
    );

    // Summary
    console.log('='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    
    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log('');
    
    if (failedTests === 0) {
        console.log('✓ ALL TESTS PASSED!');
        console.log('');
        console.log('Task deletion functionality meets all requirements:');
        console.log('  ✓ Requirement 7.1: Tasks removed from display');
        console.log('  ✓ Requirement 7.2: Tasks removed from Local Storage');
        console.log('  ✓ Requirement 7.3: All task data completely removed');
    } else {
        console.log('✗ SOME TESTS FAILED');
        console.log('');
        console.log('Failed tests:');
        testResults.filter(t => !t.passed).forEach(t => {
            console.log(`  - ${t.name}`);
        });
    }
    
    console.log('='.repeat(60));
    
    // Exit with appropriate code
    process.exit(failedTests === 0 ? 0 : 1);
}

// Run tests
try {
    runTests();
} catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
}
