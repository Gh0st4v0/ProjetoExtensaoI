const fs=require('fs');const code=fs.readFileSync('Source/Client/carneup-frontend/src/views/SalesView.jsx','utf8');const lines=code.split(/\r?\n/);
for(let i=920;i<=945 && i<=lines.length;i++){
  const l=lines[i-1];
  const codes = Array.from(l).map(c=>c.charCodeAt(0));
  console.log((i).toString().padStart(4)+':', l);
  console.log('     codes:', codes.join(','));
}
