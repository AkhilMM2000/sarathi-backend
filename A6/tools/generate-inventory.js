const fs = require('fs');
const path = require('path');

function walk(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) res = res.concat(walk(fp));
    else res.push(fp);
  });
  return res;
}

const files = walk('src');
let out = '================================================================================\n';
out += 'SARATHI BACKEND SOURCE INVENTORY (BASELINE COMMIT: c8766f4)\n';
out += 'Total Tracked Source Files: ' + files.length + '\n';
out += '================================================================================\n\n';

let totalBytes = 0;
let totalLines = 0;

files.forEach((f, idx) => {
  const stat = fs.statSync(f);
  const lines = fs.readFileSync(f, 'utf-8').split('\n').length;
  totalBytes += stat.size;
  totalLines += lines;
  const num = (idx + 1).toString().padStart(3, '0');
  out += num + '. ' + f.replace(/\\/g, '/') + ' (' + stat.size + ' bytes, ' + lines + ' lines)\n';
});

out += '\n================================================================================\n';
out += 'Summary: ' + files.length + ' source files, ' + totalLines + ' total lines, ' + totalBytes + ' bytes\n';
out += '================================================================================\n';

const targetFile = 'A6/Part1/evidence/source-inventory.txt';
fs.mkdirSync(path.dirname(targetFile), { recursive: true });
fs.writeFileSync(targetFile, out);
console.log('Successfully generated ' + targetFile);
