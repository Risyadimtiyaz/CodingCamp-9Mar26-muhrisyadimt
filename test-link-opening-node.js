// Test suite for Link Opening Functionality (Task 6.3)
// Requirements: 10.1, 10.2, 10.3

const fs = require('fs');
const { JSDOM } = require('jsdom');

// Read the app.js file
const appCode = fs.readFileSync('js/app.js', 'utf8');

// Create a DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="links-list"></div></body></html>', {
  url: 'http://localhost',
  runScripts: 'outside-only'
});

const { window } = dom;
const { document } = window;

// Make window and document global
global.window = window;
global.document = document;
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

// Execute the app code
eval(appCode);

// Test utilities
const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
    console.error(`✗ ${name}`);
    console.error(`  Error: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('='.repeat(80));
console.log('Link Opening Functionality Test - Task 6.3');
console.log('='.repeat(80));
console.log('\nTesting Requirements:');
console.log('  10.1: When a user clicks a Link, open the associated URL in a new browser tab');
console.log('  10.2: Display all saved Links as clickable buttons');
console.log('  10.3: When the Dashboard loads, retrieve all saved Links from Local Storage');
console.log('');

// Clear localStorage before tests
localStorage.clear();

// ========================================================================
// Requirement 10.3: Load Links from Local Storage on Dashboard Load
// ========================================================================

console.log('\n--- Requirement 10.3: Load Links from Local Storage ---\n');

test('Requirement 10.3: QuickLinksManager loads links from Local Storage on init', () => {
  localStorage.clear();
  
  // Pre-populate Local Storage with test links
  const testLinks = [
    { id: 'link-1', url: 'https://github.com', displayName: 'GitHub', createdAt: new Date().toISOString() },
    { id: 'link-2', url: 'https://google.com', displayName: 'Google', createdAt: new Date().toISOString() }
  ];
  LocalStorageService.save('productivity-dashboard-links', testLinks);

  // Create manager and initialize
  const container = document.createElement('div');
  container.innerHTML = '<div id="links-list"></div>';
  const manager = new QuickLinksManager(container);
  manager.linksList = container.querySelector('#links-list');
  manager.loadLinks();

  assert(manager.links.length === 2, 'Should load 2 links from Local Storage');
  assert(manager.links[0].url === 'https://github.com', 'First link URL should match');
  assert(manager.links[1].displayName === 'Google', 'Second link display name should match');
});

test('Requirement 10.3: QuickLinksManager handles empty Local Storage', () => {
  localStorage.clear();
  
  const container = document.createElement('div');
  container.innerHTML = '<div id="links-list"></div>';
  const manager = new QuickLinksManager(container);
  manager.linksList = container.querySelector('#links-list');
  manager.loadLinks();

  assert(manager.links.length === 0, 'Should have empty links array when Local Storage is empty');
});

test('Requirement 10.3: Links are automatically loaded and rendered on init', () => {
  localStorage.clear();
  const testLinks = [
    { id: 'link-1', url: 'https://example.com', displayName: 'Example', createdAt: new Date().toISOString() }
  ];
  LocalStorageService.save('productivity-dashboard-links', testLinks);

  const container = document.createElement('div');
  container.innerHTML = '<div id="links-list"></div>';
  const manager = new QuickLinksManager(container);
  manager.linksList = container.querySelector('#links-list');
  manager.loadLinks();

  // Check that renderLinks was called (links are in DOM)
  const linkElements = container.querySelectorAll('.link-item');
  assert(linkElements.length === 1, 'Should render 1 link element in DOM');
});

// ========================================================================
// Requirement 10.2: Display Links as Clickable Buttons
// ========================================================================

console.log('\n--- Requirement 10.2: Display Links as Clickable Buttons ---\n');

test('Requirement 10.2: Links are displayed as clickable buttons', () => {
  localStorage.clear();
  const container = document.createElement('div');
  container.innerHTML = '<div id="links-list"></div>';
  const manager = new QuickLinksManager(container);
  manager.linksList = container.querySelector('#links-list');
  
  manager.addLink('https://github.com', 'GitHub');
  
  const linkButton = container.querySelector('.btn-link');
  assert(linkButton !== null, 'Link button should exist in DOM');
  assert(linkButton.tagName === 'BUTTON', 'Link should be a button element');
  assert(linkButton.textContent === 'GitHub', 'Button should display the link name');
});

test('Requirement 10.2: Multiple links are all displayed as buttons', () => {
  localStorage.clear();
  const container = document.createElement('div');
  container.innerHTML = '<div id="links-list"></div>';
  const manager = new QuickLinksManager(container);
  manager.linksList = container.querySelector('#links-list');
  
  manager.addLink('https://github.com', 'GitHub');
  manager.addLink('https://google.com', 'Google');
  manager.addLink('https://stackoverflow.com', 'Stack Overflow');
  
  const linkButtons = container.querySelectorAll('.btn-link');
  assert(linkButtons.length === 3, 'Should display 3 link buttons');
  assert(linkButtons[0].textContent === 'GitHub', 'First button should show GitHub');
  assert(linkButtons[1].textContent === 'Google', 'Second button should show Google');
  assert(linkButtons[2].textContent === 'Stack Overflow', 'Third button should show Stack Overflow');
});

test('Requirement 10.2: Link buttons have proper attributes', () => {
  localStorage.clear();
  const container = document.createElement('div');
  container.innerHTML = '<div id="links-list"></div>';
  const manager = new QuickLinksManager(container);
  manager.linksList = container.querySelector('#links-list');
  
  manager.addLink('https://example.com', 'Example Site');
  
  const linkButton = container.querySelector('.btn-link');
  assert(linkButton.title === 'https://example.com', 'Button should have URL as title attribute');
  assert(linkButton.className.includes('btn'), 'Button should have btn class');
});

test('Requirement 10.2: renderLinks displays all saved links', () => {
  localStorage.clear();
  const container = document.createElement('div');
  container.innerHTML = '<div id="links-list"></div>';
  const manager = new QuickLinksManager(container);
  manager.linksList = container.querySelector('#links-list');
  
  // Add multiple links
  manager.addLink('https://site1.com', 'Site 1');
  manager.addLink('https://site2.com', 'Site 2');
  
  const linkItems = container.querySelectorAll('.link-item');
  assert(linkItems.length === 2, 'Should render all saved links');
});

// ========================================================================
// Requirement 10.1: Open Links in New Browser Tab
// ========================================================================

console.log('\n--- Requirement 10.1: Open Links in New Browser Tab ---\n');

test('Requirement 10.1: openLink method uses window.open with correct parameters', () => {
  localStorage.clear();
  const container = document.createElement('div');
  const manager = new QuickLinksManager(container);
  
  // Mock window.open to verify it's called correctly
  let openCalled = false;
  let openUrl = null;
  let openTarget = null;
  let openFeatures = null;
  
  const originalOpen = window.open;
  window.open = (url, target, features) => {
    openCalled = true;
    openUrl = url;
    openTarget = target;
    openFeatures = features;
    return null;
  };
  
  manager.openLink('https://example.com');
  
  // Restore original window.open
  window.open = originalOpen;
  
  assert(openCalled === true, 'window.open should be called');
  assert(openUrl === 'https://example.com', 'Should open the correct URL');
  assert(openTarget === '_blank', 'Should open in new tab (_blank)');
  assert(openFeatures === 'noopener,noreferrer', 'Should use security attributes');
});

test('Requirement 10.1: Link button click triggers openLink', () => {
  localStorage.clear();
  const container = document.createElement('div');
  container.innerHTML = '<div id="links-list"></div>';
  const manager = new QuickLinksManager(container);
  manager.linksList = container.querySelector('#links-list');
  
  manager.addLink('https://github.com', 'GitHub');
  
  const linkButton = container.querySelector('.btn-link');
  
  // Mock window.open
  let openCalled = false;
  let openUrl = null;
  const originalOpen = window.open;
  window.open = (url, target, features) => {
    openCalled = true;
    openUrl = url;
    return null;
  };
  
  // Simulate click
  linkButton.click();
  
  // Restore original window.open
  window.open = originalOpen;
  
  assert(openCalled === true, 'Clicking link button should trigger window.open');
  assert(openUrl === 'https://github.com', 'Should open the correct URL');
});

test('Requirement 10.1: createLinkElement attaches click handler', () => {
  localStorage.clear();
  const container = document.createElement('div');
  const manager = new QuickLinksManager(container);
  
  const link = new Link('https://example.com', 'Example');
  const linkElement = manager.createLinkElement(link);
  
  const linkButton = linkElement.querySelector('.btn-link');
  assert(linkButton !== null, 'Link element should contain a button');
  
  // Mock window.open
  let openCalled = false;
  const originalOpen = window.open;
  window.open = () => {
    openCalled = true;
    return null;
  };
  
  linkButton.click();
  
  window.open = originalOpen;
  
  assert(openCalled === true, 'Click handler should be attached to button');
});

test('Requirement 10.1: Each link opens its own URL', () => {
  localStorage.clear();
  const container = document.createElement('div');
  container.innerHTML = '<div id="links-list"></div>';
  const manager = new QuickLinksManager(container);
  manager.linksList = container.querySelector('#links-list');
  
  manager.addLink('https://github.com', 'GitHub');
  manager.addLink('https://google.com', 'Google');
  
  const linkButtons = container.querySelectorAll('.btn-link');
  
  // Test first link
  let openUrl = null;
  const originalOpen = window.open;
  window.open = (url) => {
    openUrl = url;
    return null;
  };
  
  linkButtons[0].click();
  assert(openUrl === 'https://github.com', 'First link should open GitHub');
  
  linkButtons[1].click();
  assert(openUrl === 'https://google.com', 'Second link should open Google');
  
  window.open = originalOpen;
});

// ========================================================================
// Integration Test: Full Workflow
// ========================================================================

console.log('\n--- Integration Test ---\n');

test('Integration: Full link workflow (add, save, load, display, click)', () => {
  localStorage.clear();
  
  // Step 1: Add links
  const container1 = document.createElement('div');
  container1.innerHTML = '<div id="links-list"></div>';
  const manager1 = new QuickLinksManager(container1);
  manager1.linksList = container1.querySelector('#links-list');
  
  manager1.addLink('https://example.com', 'Example');
  
  // Step 2: Verify saved to Local Storage
  const savedLinks = LocalStorageService.load('productivity-dashboard-links');
  assert(savedLinks.length === 1, 'Link should be saved to Local Storage');
  
  // Step 3: Load in new manager instance (simulating page reload)
  const container2 = document.createElement('div');
  container2.innerHTML = '<div id="links-list"></div>';
  const manager2 = new QuickLinksManager(container2);
  manager2.linksList = container2.querySelector('#links-list');
  manager2.loadLinks();
  
  assert(manager2.links.length === 1, 'Links should be loaded from Local Storage');
  
  // Step 4: Verify displayed as clickable button
  const linkButton = container2.querySelector('.btn-link');
  assert(linkButton !== null, 'Link should be displayed as button');
  assert(linkButton.textContent === 'Example', 'Button should show correct name');
  
  // Step 5: Verify click opens link
  let openCalled = false;
  const originalOpen = window.open;
  window.open = () => {
    openCalled = true;
    return null;
  };
  
  linkButton.click();
  window.open = originalOpen;
  
  assert(openCalled === true, 'Clicking button should open link');
});

// Display summary
console.log('\n' + '='.repeat(80));
console.log('Test Summary');
console.log('='.repeat(80));

const passCount = results.filter(r => r.passed).length;
const failCount = results.filter(r => !r.passed).length;

console.log(`Total:  ${results.length} tests`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n✓ Task 6.3 - All requirements validated successfully!');
  console.log('\nRequirements Validated:');
  console.log('  ✓ 10.1: Links open in new browser tabs when clicked');
  console.log('  ✓ 10.2: Links are displayed as clickable buttons');
  console.log('  ✓ 10.3: Links are loaded from Local Storage on dashboard load');
  process.exit(0);
} else {
  console.error('\n✗ Task 6.3 - Some tests failed');
  process.exit(1);
}
