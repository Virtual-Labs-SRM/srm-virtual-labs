const fs = require('fs');
const content = fs.readFileSync('C:/Users/laksh/Desktop/Project Ideas/SRM Virtual Lab/srm-virtual-lab-v2-main/src/labs/nlp/PlagiarismDetectorLab.tsx', 'utf8');

let stack = [];
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let j = 0; j < line.length; j++) {
        let char = line[j];
        if (char === '{') stack.push({ char, line: i + 1, col: j + 1 });
        else if (char === '}') {
            if (stack.length === 0) {
                console.log(`Extra closing brace at Line ${i + 1}, Col ${j + 1}`);
            } else {
                stack.pop();
            }
        }
    }
}

if (stack.length > 0) {
    console.log('Unclosed braces:');
    stack.forEach(s => console.log(`Unclosed ${s.char} starting at Line ${s.line}, Col ${s.col}`));
} else {
    console.log('Braces are balanced.');
}
