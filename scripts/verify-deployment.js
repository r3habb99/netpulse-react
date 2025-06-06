#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script verifies that the project is properly configured for GitHub Pages deployment.
 * Run with: node scripts/verify-deployment.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying GitHub Pages deployment configuration...\n');

let hasErrors = false;
let hasWarnings = false;

function logError(message) {
  console.log(`❌ ERROR: ${message}`);
  hasErrors = true;
}

function logWarning(message) {
  console.log(`⚠️  WARNING: ${message}`);
  hasWarnings = true;
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

// Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.homepage) {
    logSuccess(`Homepage configured: ${packageJson.homepage}`);
    
    // Validate homepage URL format
    if (packageJson.homepage.includes('github.io')) {
      logSuccess('Homepage URL appears to be a valid GitHub Pages URL');
    } else {
      logWarning('Homepage URL does not appear to be a GitHub Pages URL');
    }
  } else {
    logError('Missing "homepage" field in package.json');
    logInfo('Add: "homepage": "https://USERNAME.github.io/REPOSITORY_NAME"');
  }
  
  // Check build script
  if (packageJson.scripts && packageJson.scripts.build) {
    logSuccess('Build script found in package.json');
  } else {
    logError('Missing build script in package.json');
  }
  
  // Check if using react-scripts
  if (packageJson.dependencies && packageJson.dependencies['react-scripts']) {
    logSuccess('Using react-scripts (Create React App)');
  } else {
    logWarning('Not using react-scripts - ensure build process is compatible');
  }
  
} catch (error) {
  logError('Could not read or parse package.json');
}

// Check GitHub Actions workflow
const workflowPath = '.github/workflows/deploy.yml';
if (fs.existsSync(workflowPath)) {
  logSuccess('GitHub Actions workflow file exists');
  
  try {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    // Check for required workflow components
    if (workflowContent.includes('actions/checkout@v4')) {
      logSuccess('Using latest checkout action');
    } else if (workflowContent.includes('actions/checkout@')) {
      logWarning('Consider updating to checkout@v4');
    } else {
      logError('Missing checkout action in workflow');
    }
    
    if (workflowContent.includes('actions/setup-node@v4')) {
      logSuccess('Using latest Node.js setup action');
    } else {
      logWarning('Consider updating to setup-node@v4');
    }
    
    if (workflowContent.includes('actions/deploy-pages@v4')) {
      logSuccess('Using latest Pages deployment action');
    } else {
      logWarning('Consider updating to deploy-pages@v4');
    }
    
    if (workflowContent.includes('npm ci')) {
      logSuccess('Using npm ci for dependency installation');
    } else if (workflowContent.includes('npm install')) {
      logWarning('Consider using "npm ci" instead of "npm install" for CI');
    }
    
  } catch (error) {
    logError('Could not read GitHub Actions workflow file');
  }
} else {
  logError('GitHub Actions workflow file not found');
  logInfo('Expected location: .github/workflows/deploy.yml');
}

// Check public/index.html
const indexPath = 'public/index.html';
if (fs.existsSync(indexPath)) {
  logSuccess('public/index.html exists');
  
  try {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    if (indexContent.includes('%PUBLIC_URL%')) {
      logSuccess('Using %PUBLIC_URL% for asset paths');
    } else {
      logWarning('Consider using %PUBLIC_URL% for asset paths in index.html');
    }
    
  } catch (error) {
    logError('Could not read public/index.html');
  }
} else {
  logError('public/index.html not found');
}

// Check manifest.json
const manifestPath = 'public/manifest.json';
if (fs.existsSync(manifestPath)) {
  logSuccess('PWA manifest.json exists');
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    if (manifest.start_url === './' || manifest.start_url === './') {
      logSuccess('Manifest start_url configured for subdirectory deployment');
    } else if (manifest.start_url === '/') {
      logWarning('Manifest start_url is absolute - consider using "./" for GitHub Pages');
    }
    
    if (manifest.scope === './' || manifest.scope === './') {
      logSuccess('Manifest scope configured for subdirectory deployment');
    } else if (manifest.scope === '/') {
      logWarning('Manifest scope is absolute - consider using "./" for GitHub Pages');
    }
    
  } catch (error) {
    logError('Could not read or parse manifest.json');
  }
} else {
  logInfo('No PWA manifest.json found (optional)');
}

// Check for build directory (should not be committed)
if (fs.existsSync('build')) {
  logWarning('Build directory exists - ensure it\'s in .gitignore');
} else {
  logSuccess('No build directory found (good - should be generated by CI)');
}

// Check .gitignore
if (fs.existsSync('.gitignore')) {
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  
  if (gitignoreContent.includes('build') || gitignoreContent.includes('/build')) {
    logSuccess('Build directory is ignored in .gitignore');
  } else {
    logWarning('Consider adding "build" to .gitignore');
  }
  
  if (gitignoreContent.includes('node_modules')) {
    logSuccess('node_modules is ignored in .gitignore');
  } else {
    logError('node_modules should be in .gitignore');
  }
} else {
  logWarning('.gitignore file not found');
}

// Check test files
const testFilesDir = 'public/test-files';
if (fs.existsSync(testFilesDir)) {
  logSuccess('Test files directory exists');
  
  const testFiles = fs.readdirSync(testFilesDir);
  const expectedFiles = ['1kb.bin', '10kb.bin', '100kb.bin'];
  
  expectedFiles.forEach(file => {
    if (testFiles.includes(file)) {
      logSuccess(`Test file ${file} exists`);
    } else {
      logWarning(`Test file ${file} not found`);
    }
  });
} else {
  logWarning('Test files directory not found (may affect speed testing)');
}

// Summary
console.log('\n📋 Verification Summary:');
console.log('========================');

if (hasErrors) {
  console.log('❌ Configuration has errors that need to be fixed before deployment');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Configuration is mostly ready, but has some warnings to consider');
  console.log('✅ You can proceed with deployment, but consider addressing the warnings');
} else {
  console.log('✅ Configuration looks good! Ready for GitHub Pages deployment');
}

console.log('\n🚀 Next steps:');
console.log('1. Commit and push your changes to the main branch');
console.log('2. Go to your GitHub repository Settings → Pages');
console.log('3. Set Source to "GitHub Actions"');
console.log('4. Push to main branch to trigger deployment');
console.log('5. Check the Actions tab for deployment progress');

if (hasErrors || hasWarnings) {
  console.log('\n📖 For detailed setup instructions, see DEPLOYMENT.md');
}
