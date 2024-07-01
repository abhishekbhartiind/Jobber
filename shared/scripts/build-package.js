const { copyFileSync } = require('node:fs');

copyFileSync('package.json', 'build/package.json');