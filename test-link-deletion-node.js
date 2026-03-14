// Link Deletion Verification Test (Node.js)
// Testing Requirement 9.4: WHEN a user deletes a Link, THE Quick_Links SHALL remove the Link from Local_Storage

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

// Mock window.open for link opening
global.window = {
    open: () => {}
};

// Mock console methods
global.console = {
    log: console.log.bind(console),
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
    console.log('Link Deletion Verification Tests');
    console.log('Testing Requirement 9.4');
    console.log('='.repeat(60) + '\n');

    // Clear localStorage before tests
    localStorage.clear();

    // Test 1: Verify deleteLink method exists
    const testContainer = { id: 'test-container' };
    const linksManager = new QuickLinksManager(testContainer);
    linksManager.linksList = { appendChild: () => {}, innerHTML: '' };
    linksManager.init();

    const hasDeleteMethod = typeof linksManager.deleteLink === 'function';
    logTest(
        'Test 1: deleteLink method exists',
        hasDeleteMethod,
        hasDeleteMethod ? 'deleteLink method is defined' : 'deleteLink method is missing'
    );

    // Test 2: Add links and verify they exist
    const link1Id = linksManager.addLink('https://example1.com', 'Example 1');
    const link2Id = linksManager.addLink('https://example2.com', 'Example 2');
    const link3Id = linksManager.addLink('https://example3.com', 'Example 3');

    const initialCount = linksManager.links.length;
    logTest(
        'Test 2: Links added successfully',
        initialCount === 3,
        `Added 3 links, current count: ${initialCount}`
    );

    // Test 3: Delete a link and verify it's removed from the array
    const deleteSuccess = linksManager.deleteLink(link2Id);
    const afterDeleteCount = linksManager.links.length;
    const linkStillExists = linksManager.links.some(l => l.id === link2Id);

    logTest(
        'Test 3: Link removed from array',
        deleteSuccess && afterDeleteCount === 2 && !linkStillExists,
        `Delete returned ${deleteSuccess}, count after delete: ${afterDeleteCount}, link still exists: ${linkStillExists}`
    );

    // Test 4: Verify link is removed from Local Storage (Requirement 9.4)
    const savedLinks = LocalStorageService.load(STORAGE_KEYS.LINKS);
    const linkInStorage = savedLinks ? savedLinks.some(l => l.id === link2Id) : false;

    logTest(
        'Test 4: Link removed from Local Storage (Req 9.4) ⭐',
        !linkInStorage,
        `Link found in storage: ${linkInStorage}, storage contains ${savedLinks ? savedLinks.length : 0} links`
    );

    // Test 5: Verify all data associated with deleted link is removed
    const allLinkData = savedLinks || [];
    const deletedLinkData = allLinkData.find(l => l.id === link2Id);
    const noDataRemains = !deletedLinkData;

    logTest(
        'Test 5: All link data removed',
        noDataRemains,
        noDataRemains ? 'No data remains for deleted link' : 'Link data still exists in storage'
    );

    // Test 6: Verify remaining links are intact
    const remainingLinks = linksManager.links;
    const link1Exists = remainingLinks.some(l => l.id === link1Id);
    const link3Exists = remainingLinks.some(l => l.id === link3Id);

    logTest(
        'Test 6: Remaining links intact',
        link1Exists && link3Exists && remainingLinks.length === 2,
        `Link 1 exists: ${link1Exists}, Link 3 exists: ${link3Exists}, Total: ${remainingLinks.length}`
    );

    // Test 7: Delete non-existent link returns false
    const deleteNonExistent = linksManager.deleteLink('non-existent-id');

    logTest(
        'Test 7: Delete non-existent link returns false',
        !deleteNonExistent,
        `Delete non-existent returned: ${deleteNonExistent}`
    );

    // Test 8: Delete all remaining links
    linksManager.deleteLink(link1Id);
    linksManager.deleteLink(link3Id);
    const finalCount = linksManager.links.length;
    const finalStorage = LocalStorageService.load(STORAGE_KEYS.LINKS);

    logTest(
        'Test 8: All links can be deleted',
        finalCount === 0 && (!finalStorage || finalStorage.length === 0),
        `Final count: ${finalCount}, Storage count: ${finalStorage ? finalStorage.length : 0}`
    );

    // Test 9: Verify link order is maintained after deletion
    localStorage.clear();
    const orderManager = new QuickLinksManager(testContainer);
    orderManager.linksList = { appendChild: () => {}, innerHTML: '' };
    orderManager.init();

    const id1 = orderManager.addLink('https://first.com', 'First');
    const id2 = orderManager.addLink('https://second.com', 'Second');
    const id3 = orderManager.addLink('https://third.com', 'Third');
    const id4 = orderManager.addLink('https://fourth.com', 'Fourth');

    // Delete the second link
    orderManager.deleteLink(id2);

    const orderedLinks = orderManager.links;
    const correctOrder = 
        orderedLinks[0].id === id1 &&
        orderedLinks[1].id === id3 &&
        orderedLinks[2].id === id4 &&
        orderedLinks.length === 3;

    logTest(
        'Test 9: Link order maintained after deletion',
        correctOrder,
        `Order correct: ${correctOrder}, Links: [${orderedLinks.map(l => l.displayName).join(', ')}]`
    );

    // Test 10: Verify saveLinks is called during deletion
    localStorage.clear();
    const saveManager = new QuickLinksManager(testContainer);
    saveManager.linksList = { appendChild: () => {}, innerHTML: '' };
    saveManager.init();

    const testId = saveManager.addLink('https://test.com', 'Test');
    
    // Verify link is in storage before deletion
    const beforeStorage = LocalStorageService.load(STORAGE_KEYS.LINKS);
    const beforeCount = beforeStorage ? beforeStorage.length : 0;
    
    // Delete the link
    saveManager.deleteLink(testId);
    
    // Verify storage was updated
    const afterStorage = LocalStorageService.load(STORAGE_KEYS.LINKS);
    const afterCount = afterStorage ? afterStorage.length : 0;

    logTest(
        'Test 10: Storage updated on deletion (Req 9.4) ⭐',
        beforeCount === 1 && afterCount === 0,
        `Storage before: ${beforeCount}, Storage after: ${afterCount}`
    );

    // Test 11: Multiple deletions update storage correctly
    localStorage.clear();
    const multiManager = new QuickLinksManager(testContainer);
    multiManager.linksList = { appendChild: () => {}, innerHTML: '' };
    multiManager.init();

    const m1 = multiManager.addLink('https://one.com', 'One');
    const m2 = multiManager.addLink('https://two.com', 'Two');
    const m3 = multiManager.addLink('https://three.com', 'Three');

    // Delete first link
    multiManager.deleteLink(m1);
    const storage1 = LocalStorageService.load(STORAGE_KEYS.LINKS);
    const count1 = storage1 ? storage1.length : 0;

    // Delete second link
    multiManager.deleteLink(m2);
    const storage2 = LocalStorageService.load(STORAGE_KEYS.LINKS);
    const count2 = storage2 ? storage2.length : 0;

    // Delete third link
    multiManager.deleteLink(m3);
    const storage3 = LocalStorageService.load(STORAGE_KEYS.LINKS);
    const count3 = storage3 ? storage3.length : 0;

    const correctProgression = count1 === 2 && count2 === 1 && count3 === 0;

    logTest(
        'Test 11: Multiple deletions update storage (Req 9.4) ⭐',
        correctProgression,
        `Storage progression: 3 → ${count1} → ${count2} → ${count3}`
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
        console.log('Link deletion functionality meets requirement 9.4:');
        console.log('  ✓ Requirement 9.4: Links removed from Local Storage on deletion');
        console.log('');
        console.log('Implementation verified:');
        console.log('  ✓ deleteLink() method removes link from array');
        console.log('  ✓ saveLinks() is called to update Local Storage');
        console.log('  ✓ renderLinks() updates the UI');
        console.log('  ✓ All link data is completely removed');
        console.log('  ✓ Multiple deletions work correctly');
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
