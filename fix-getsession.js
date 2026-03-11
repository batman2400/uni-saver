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
let c = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('getSession(') && !content.includes('import { getSession }')) {
        content = content.replace(/(import .*;\r?\n)/, "$1import { getSession } from '@/lib/auth';\n");
        fs.writeFileSync(file, content, 'utf8');
        c++;
        console.log('Fixed ' + file);
    }
});
console.log('Total fixed: ' + c);
