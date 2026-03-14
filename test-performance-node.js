/**
 * Performance Test for Productivity Dashboard
 * Tests Requirements 12.3 and 12.4
 * 
 * This test simulates DOM operations to verify performance with:
 * - 100 tasks (Requirement 12.3)
 * - 20 links (Requirement 12.4)
 * - Response time under 100ms (Requirement 12.2)
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Read the app.js file
const appJs = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');

// Create a DOM environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
    <div id="task-widget">
        <input type="text" id="task-input">
        <button id="add-task-btn">Add</button>
        <div id="task-list"></div>
    </div>
    <div id="links-widget">
        <input type="url" id="link-url-input">
        <input type="text" id="link-name-input">
        <button id="add-link-btn">Add</button>
        <div id="links-list"></div>
    </div>
</body>
</html>
`, {
    url: 'http://localhost',
    runScripts: 'outside-only'
});

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    removeItem(key) {
        delete this.data[key];
    },
    clear() {
        this.data = {};
    }
};

// Execute the app.js code
eval(appJs);

console.log('=== Performance Tests for Productivity Dashboard ===\n');

// Test 1: Task rendering with 100 tasks
console.log('Test 1: Task Rendering Performance (Requirement 12.3)');
console.log('Testing with 100 tasks...');

const taskContainer = document.getElementById('task-widget');
const taskManager = new TaskManager(taskContainer);
taskManager.init();

// Add 100 tasks
const startAdd = Date.now();
for (let i = 1; i <= 100; i++) {
    taskManager.addTask(`Task ${i}: Sample task description for performance testing`);
}
const endAdd = Date.now();
const addTime = endAdd - startAdd;

console.log(`  Time to add 100 tasks: ${addTime}ms`);
console.log(`  Average per task: ${(addTime / 100).toFixed(2)}ms`);

// Measure render time
const startRender = Date.now();
taskManager.renderTasks();
const endRender = Date.now();
const renderTime = endRender - startRender;

console.log(`  Time to render 100 tasks: ${renderTime}ms`);

if (renderTime < 100) {
    console.log(`  ✓ PASS: Render time ${renderTime}ms < 100ms (Requirement 12.2)`);
} else {
    console.log(`  ✗ FAIL: Render time ${renderTime}ms >= 100ms`);
}

// Verify DOM elements
const taskElements = document.querySelectorAll('#task-list .task-item');
console.log(`  Tasks in DOM: ${taskElements.length}`);

if (taskElements.length === 100) {
    console.log(`  ✓ PASS: All 100 tasks rendered correctly`);
} else {
    console.log(`  ✗ FAIL: Expected 100 tasks, found ${taskElements.length}`);
}

console.log('');

// Test 2: Link rendering with 20 links
console.log('Test 2: Link Rendering Performance (Requirement 12.4)');
console.log('Testing with 20 links...');

const linksContainer = document.getElementById('links-widget');
const quickLinksManager = new QuickLinksManager(linksContainer);
quickLinksManager.init();

// Add 20 links
const startAddLinks = Date.now();
for (let i = 1; i <= 20; i++) {
    quickLinksManager.addLink(`https://example${i}.com`, `Example Link ${i}`);
}
const endAddLinks = Date.now();
const addLinksTime = endAddLinks - startAddLinks;

console.log(`  Time to add 20 links: ${addLinksTime}ms`);
console.log(`  Average per link: ${(addLinksTime / 20).toFixed(2)}ms`);

// Measure render time
const startRenderLinks = Date.now();
quickLinksManager.renderLinks();
const endRenderLinks = Date.now();
const renderLinksTime = endRenderLinks - startRenderLinks;

console.log(`  Time to render 20 links: ${renderLinksTime}ms`);

if (renderLinksTime < 100) {
    console.log(`  ✓ PASS: Render time ${renderLinksTime}ms < 100ms (Requirement 12.2)`);
} else {
    console.log(`  ✗ FAIL: Render time ${renderLinksTime}ms >= 100ms`);
}

// Verify DOM elements
const linkElements = document.querySelectorAll('#links-list .link-item');
console.log(`  Links in DOM: ${linkElements.length}`);

if (linkElements.length === 20) {
    console.log(`  ✓ PASS: All 20 links rendered correctly`);
} else {
    console.log(`  ✗ FAIL: Expected 20 links, found ${linkElements.length}`);
}

console.log('');

// Test 3: Task interaction performance
console.log('Test 3: Task Interaction Performance (Requirement 12.2)');

const taskId = taskManager.tasks[50].id;
const startToggle = Date.now();
taskManager.toggleTaskComplete(taskId);
const endToggle = Date.now();
const toggleTime = endToggle - startToggle;

console.log(`  Task toggle time: ${toggleTime}ms`);

if (toggleTime < 100) {
    console.log(`  ✓ PASS: Toggle response ${toggleTime}ms < 100ms`);
} else {
    console.log(`  ✗ FAIL: Toggle response ${toggleTime}ms >= 100ms`);
}

console.log('');
console.log('=== Performance Tests Complete ===');
