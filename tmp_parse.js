const fs = require('fs');
const parser = require('./Source/Client/carneup-frontend/node_modules/@babel/parser');
const code = fs.readFileSync('Source/Client/carneup-frontend/src/views/SalesView.jsx','utf8');
const lines = code.split(/\r?\n/);
const upto = 940;
let counts = {'{':0,'}':0,'(':0,')':0,'[':0,']':0};
for(let i=0;i<upto && i<lines.length;i++){
  const l = lines[i];
  for(const ch of l){ if(counts.hasOwnProperty(ch)) counts[ch]++; }
}
console.log('counts up to line '+upto, counts);
for(let i=920;i<=945 && i<=lines.length;i++){
  console.log(i+': '+lines[i-1]);
}
