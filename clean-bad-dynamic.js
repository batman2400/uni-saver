const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        let fullPath = path.resolve(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            if (fullPath.endsWith('.ts')) results.push(fullPath);
        }
    });
    return results;
}

const files = walk('C:/Users/mohan/OneDrive/Desktop/Work/Unisaver/src/app/api');
let cleanedCount = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let initial = content;
    // Removes the duplicate ' const dynamic = 'force-dynamic';' but leaves 'export const dynamic...' alone
    content = content.replace(/^ const dynamic = 'force-dynamic';\r?\n?/gm, '');
    if (initial !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Cleaned ' + file);
        cleanedCount++;
    }
});
console.log('Total files cleaned: ' + cleanedCount);
