const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        let fullPath = path.resolve(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (fullPath.endsWith('route.ts')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk('C:/Users/mohan/OneDrive/Desktop/Work/Unisaver/src/app/api');
let c = 0;
files.forEach(file => {
    if (file.includes('auth')) return;
    let content = fs.readFileSync(file, 'utf8');
    let dirty = false;

    // Check missing prisma import
    if (content.includes('prisma.') && !content.includes('import prisma')) {
        content = content.replace(/(import .*;\r?\n)/, "$1import prisma from '@/lib/prisma';\n");
        dirty = true;
    }

    // Check missing dynamic export
    if (!content.includes("export const dynamic = 'force-dynamic';")) {
        // Find last import
        const lines = content.split('\n');
        let lastImport = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) lastImport = i;
        }
        if (lastImport !== -1) {
            lines.splice(lastImport + 1, 0, "\nexport const dynamic = 'force-dynamic';");
            content = lines.join('\n');
            dirty = true;
        }
    }

    if (dirty) {
        fs.writeFileSync(file, content, 'utf8');
        c++;
        console.log('Fixed ' + file);
    }
});
console.log('Total fixed: ' + c);
