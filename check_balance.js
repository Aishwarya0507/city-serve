import fs from 'fs';

const content = fs.readFileSync('client/src/app/components/customer/BookingStatus.tsx', 'utf8');

function count(char) {
  let c = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === char) c++;
  }
  return c;
}

console.log('{ count:', count('{'), ', } count:', count('}'));
console.log('( count:', count('('), ', ) count:', count(')'));
console.log('[ count:', count('['), ', ] count:', count(']'));
console.log('< count:', count('<'), ', > count:', count('>'));

// Find unclosed pairs by scanning
let braceStack = [];
let parenStack = [];
let bracketStack = [];

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  if (char === '{') braceStack.push(i);
  if (char === '}') braceStack.pop();
  if (char === '(') parenStack.push(i);
  if (char === ')') parenStack.pop();
  if (char === '[') bracketStack.push(i);
  if (char === ']') bracketStack.pop();
}

console.log('Unclosed { at positions:', braceStack);
console.log('Unclosed ( at positions:', parenStack);
console.log('Unclosed [ at positions:', bracketStack);
