const fs = require('fs');
const code = fs.readFileSync('Source/Client/carneup-frontend/src/views/SalesView.jsx','utf8');
const lines = code.split(/\r?\n/);
let stack=[];
for(let i=0;i<lines.length;i++){
  const l = lines[i];
  for(let j=0;j<l.length;j++){
    const ch=l[j];
    if(ch==='{') stack.push({line:i+1,col:j+1,context:lines[i].trim()});
    if(ch==='}') stack.pop();
  }
}
console.log('unmatched openings:', stack.length);
stack.slice(-10).forEach(s=>console.log('line',s.line,'col',s.col,':',s.context));
