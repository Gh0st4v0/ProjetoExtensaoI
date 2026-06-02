const fs=require('fs'); const parser=require('./Source/Client/carneup-frontend/node_modules/@babel/parser');
const lines=fs.readFileSync('Source/Client/carneup-frontend/src/views/SalesView.jsx','utf8').split(/\r?\n/);
const start=918-1,end=944; const chunk=lines.slice(start,end).join('\n');
console.log('--- CHUNK START ---\n'+chunk+'\n--- CHUNK END ---');
try{ parser.parseExpression(chunk,{plugins:['jsx','classProperties','optionalChaining','nullishCoalescingOperator']}); console.log('EXPR_OK'); }
catch(e){ console.error(e.stack); process.exit(1);}