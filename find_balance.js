const fs = require('fs');
const code = fs.readFileSync('Source/Client/carneup-frontend/src/views/SalesView.jsx','utf8');
const lines = code.split(/\r?\n/);
let diff = 0;
for(let i=0;i<lines.length;i++){
  const l = lines[i];
  for(const ch of l){ if(ch==='{') diff++; if(ch==='}') diff--; }
  if(i>=860 && i<=960) console.log((i+1).toString().padStart(4)+" diff:"+diff+"  "+lines[i]);
}
console.log('final diff', diff);
