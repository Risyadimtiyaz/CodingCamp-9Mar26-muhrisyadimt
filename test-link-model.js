// Node.js test for Link model and QuickLinksManager
// This test verifies the core logic without DOM dependencies

// Mock localStorage for Node.js environment
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

// Mock console for cleaner output
const originalConsole = { ...console };
console.warn = () => {}; // Suppress warnings during tests

// Load the app.js file
const fs = require('fs');
const appCode = fs.readFileSync('js/app.js', 'utf8');

// Extract only the classes we need (Link and related utilities)
// We'll use eval to execute the code in this context
eval(appCode);

// Test results tracking
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('=== Link Model and QuickLinksManager Tests ===\n');

// Test 1: Link creation with valid data
test('Link creation with valid data', () => {
  const link = new Link('https://example.com', 'Example Site');
  assert(link.url === 'https://example.com', 'URL should be set correctly');
  assert(link.displayName === 'Example Site', 'Display name should be set correctly');
  assert(link.id, 'ID should be generated');
  assert(link.createdAt, 'createdAt timestamp should be set');
});

// Test 2: Link ID generation is unique
test('Link ID generation is unique', () => {
  const link1 = new Link('https://site1.com', 'Site 1');
  const link2 = new Link('https://site2.com', 'Site 2');
  assert(link1.id !== link2.id, 'IDs should be unique');
  assert(link1.id.startsWith('link-'), 'ID should have correct prefix');
});

// Test 3: Link validation - valid URL
test('Link validation - valid URL (Requirement 9.1)', () => {
  const link = new Link('https://google.com', 'Google');
  assert(link.validate(), 'Valid link should pass validation');
});

// Test 4: Link validation - empty URL (Requirement 9.3)
test('Link validation - empty URL rejected (Requirement 9.3)', () => {
  const link = new Link('', 'Empty URL');
  assert(!link.validate(), 'Empty URL should fail validation');
});

// Test 5: Link validation - empty display name (Requirement 9.3)
test('Link validation - empty display name rejected (Requirement 9.3)', () => {
  const link = new Link('https://test.com', '');
  assert(!link.validate(), 'Empty display name should fail validation');
});

// Test 6: Link validation - whitespace-only URL (Requirement 9.3)
test('Link validation - whitespace-only URL rejected (Requirement 9.3)', () => {
  const link = new Link('   ', 'Whitespace URL');
  assert(!link.validate(), 'Whitespace-only URL should fail validation');
});

// Test 7: Link validation - whitespace-only display name (Requirement 9.3)
test('Link validation - whitespace-only display name rejected (Requirement 9.3)', () => {
  const link = new Link('https://test.com', '   ');
  assert(!link.validate(), 'Whitespace-only display name should fail validation');
});

// Test 8: Link validation - invalid URL format
test('Link validation - invalid URL format rejected', () => {
  const link = new Link('not-a-url', 'Invalid');
  assert(!link.validate(), 'Invalid URL format should fail validation');
});

// Test 9: Link isValidUrl method
test('Link isValidUrl method works correctly', () => {
  const link = new Link('https://test.com', 'Test');
  assert(link.isValidUrl('https://example.com'), 'Should validate correct URL');
  assert(link.isValidUrl('http://example.com'), 'Should validate HTTP URL');
  assert(!link.isValidUrl('invalid'), 'Should reject invalid URL');
  assert(!link.isValidUrl(''), 'Should reject empty string');
});

// Test 10: Link trims whitespace
test('Link trims whitespace from inputs', () => {
  const link = new Link('  https://example.com  ', '  Example  ');
  assert(link.url === 'https://example.com', 'URL should be trimmed');
  assert(link.displayName === 'Example', 'Display name should be trimmed');
});

// Test 11: QuickLinksManager - add valid link (Requirements 9.1, 9.2)
test('QuickLinksManager - add valid link (Requirements 9.1, 9.2)', () => {
  localStorage.clear();
  const manager = new QuickLinksManager(null);
  manager.links = [];
  
  const linkId = manager.addLink('https://github.com', 'GitHub');
  assert(linkId !== null, 'Should return link ID');
  assert(manager.links.length === 1, 'Should have one link');
  assert(manager.links[0].url === 'https://github.com', 'URL should match');
  assert(manager.links[0].displayName === 'GitHub', 'Display name should match');
});

// Test 12: QuickLinksManager - reject empty URL (Requirement 9.3)
test('QuickLinksManager - reject empty URL (Requirement 9.3)', () => {
  const manager = new QuickLinksManager(null);
  manager.links = [];
  
  const linkId = manager.addLink('', 'Empty URL');
  assert(linkId === null, 'Should return null for invalid link');
  assert(manager.links.length === 0, 'Should not add invalid link');
});

// Test 13: QuickLinksManager - reject empty display name (Requirement 9.3)
test('QuickLinksManager - reject empty display name (Requirement 9.3)', () => {
  const manager = new QuickLinksManager(null);
  manager.links = [];
  
  const linkId = manager.addLink('https://test.com', '');
  assert(linkId === null, 'Should return null for invalid link');
  assert(manager.links.length === 0, 'Should not add invalid link');
});

// Test 14: QuickLinksManager - reject invalid URL format
test('QuickLinksManager - reject invalid URL format', () => {
  const manager = new QuickLinksManager(null);
  manager.links = [];
  
  const linkId = manager.addLink('not-a-url', 'Invalid');
  assert(linkId === null, 'Should return null for invalid URL');
  assert(manager.links.length === 0, 'Should not add invalid link');
});

// Test 15: QuickLinksManager - Local Storage persistence (Requirement 9.2)
test('QuickLinksManager - Local Storage persistence (Requirement 9.2)', () => {
  localStorage.clear();
  
  const manager1 = new QuickLinksManager(null);
  manager1.links = [];
  manager1.addLink('https://example.com', 'Example');
  
  // Create new manager and load
  const manager2 = new QuickLinksManager(null);
  manager2.loadLinks();
  
  assert(manager2.links.length === 1, 'Should load one link');
  assert(manager2.links[0].url === 'https://example.com', 'URL should persist');
  assert(manager2.links[0].displayName === 'Example', 'Display name should persist');
});

// Test 16: QuickLinksManager - delete link
test('QuickLinksManager - delete link', () => {
  localStorage.clear();
  
  const manager = new QuickLinksManager(null);
  manager.links = [];
  
  const linkId = manager.addLink('https://test.com', 'Test');
  const deleted = manager.deleteLink(linkId);
  
  assert(deleted === true, 'Should return true on successful delete');
  assert(manager.links.length === 0, 'Should have no links after delete');
});

// Test 17: QuickLinksManager - delete non-existent link
test('QuickLinksManager - delete non-existent link returns false', () => {
  const manager = new QuickLinksManager(null);
  manager.links = [];
  
  const deleted = manager.deleteLink('non-existent-id');
  assert(deleted === false, 'Should return false for non-existent link');
});

// Test 18: QuickLinksManager - validateUrl method
test('QuickLinksManager - validateUrl method', () => {
  const manager = new QuickLinksManager(null);
  
  assert(manager.validateUrl('https://example.com'), 'Should validate HTTPS URL');
  assert(manager.validateUrl('http://example.com'), 'Should validate HTTP URL');
  assert(!manager.validateUrl('invalid'), 'Should reject invalid URL');
  assert(!manager.validateUrl(''), 'Should reject empty string');
});

// Test 19: QuickLinksManager - generateLinkId method
test('QuickLinksManager - generateLinkId method', () => {
  const manager = new QuickLinksManager(null);
  
  const id1 = manager.generateLinkId();
  const id2 = manager.generateLinkId();
  
  assert(id1.startsWith('link-'), 'ID should have correct prefix');
  assert(id1 !== id2, 'Generated IDs should be unique');
});

// Test 20: QuickLinksManager - getLink method
test('QuickLinksManager - getLink method', () => {
  const manager = new QuickLinksManager(null);
  manager.links = [];
  
  const linkId = manager.addLink('https://test.com', 'Test');
  const link = manager.getLink(linkId);
  
  assert(link !== null, 'Should find the link');
  assert(link.id === linkId, 'Should return correct link');
  
  const notFound = manager.getLink('non-existent');
  assert(notFound === null, 'Should return null for non-existent link');
});

// Test 21: QuickLinksManager - multiple links with unique IDs
test('QuickLinksManager - multiple links with unique IDs', () => {
  localStorage.clear();
  
  const manager = new QuickLinksManager(null);
  manager.links = [];
  
  const id1 = manager.addLink('https://site1.com', 'Site 1');
  const id2 = manager.addLink('https://site2.com', 'Site 2');
  const id3 = manager.addLink('https://site3.com', 'Site 3');
  
  assert(manager.links.length === 3, 'Should have three links');
  assert(id1 !== id2 && id2 !== id3 && id1 !== id3, 'All IDs should be unique');
});

// Test 22: QuickLinksManager - saveLinks method
test('QuickLinksManager - saveLinks method', () => {
  localStorage.clear();
  
  const manager = new QuickLinksManager(null);
  manager.links = [];
  manager.addLink('https://test.com', 'Test');
  
  const saved = localStorage.getItem('productivity-dashboard-links');
  assert(saved !== null, 'Should save to localStorage');
  
  const parsed = JSON.parse(saved);
  assert(Array.isArray(parsed), 'Should save as array');
  assert(parsed.length === 1, 'Should save one link');
});

// Test 23: QuickLinksManager - loadLinks with empty storage
test('QuickLinksManager - loadLinks with empty storage', () => {
  localStorage.clear();
  
  const manager = new QuickLinksManager(null);
  manager.loadLinks();
  
  assert(manager.links.length === 0, 'Should have empty array when no data');
});

// Test 24: Link with custom ID
test('Link with custom ID', () => {
  const customId = 'custom-link-id';
  const link = new Link('https://test.com', 'Test', customId);
  
  assert(link.id === customId, 'Should use provided ID');
});

console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
}
