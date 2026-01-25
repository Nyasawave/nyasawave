#!/usr/bin/env node

/**
 * DIAGNOSTICS - Check for build issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 NYASAWAVE DIAGNOSTIC CHECK\n');

// Check all created files exist
const filesToCheck = [
    'app/context/RoleContext.tsx',
    'app/hooks/useRole.ts',
    'app/components/RoleAwareHeader.tsx',
    'app/components/RoleContextSwitcher.tsx',
    'app/components/navigation/AdminNav.tsx',
    'app/components/navigation/ArtistNav.tsx',
    'app/components/navigation/ListenerNav.tsx',
    'app/components/navigation/EntrepreneurNav.tsx',
    'app/components/navigation/MarketerNav.tsx',
    'app/utils/identityProtection.ts',
    'app/api/auth/switch-role/route.ts',
];

console.log('✓ Checking files...\n');

let allExist = true;
filesToCheck.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log(`✅ ${file} (${stats.size} bytes)`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allExist = false;
    }
});

console.log('\n' + (allExist ? '✅ All files exist!' : '❌ Some files are missing!'));

// Check if layout.tsx was updated
console.log('\n✓ Checking layout.tsx...');
const layoutPath = path.join(__dirname, 'app', 'layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

if (layoutContent.includes('RoleAwareHeader')) {
    console.log('✅ Layout has RoleAwareHeader import');
} else {
    console.log('❌ Layout missing RoleAwareHeader import');
}

if (layoutContent.includes('RoleProvider')) {
    console.log('✅ Layout has RoleProvider wrapper');
} else {
    console.log('❌ Layout missing RoleProvider wrapper');
}

console.log('\n' + '='.repeat(50));
console.log('✅ DIAGNOSTIC COMPLETE');
console.log('='.repeat(50));
