const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/indigo-/g, 'emerald-');
code = code.replace(/blue-/g, 'teal-');
code = code.replace(/bg-slate-950/g, 'bg-[#111314]');
code = code.replace(/bg-slate-900\/50/g, 'bg-[#1a1c1d]/50'); // subtle background
code = code.replace(/bg-slate-900\/80/g, 'bg-[#1a1c1d]/80'); 

fs.writeFileSync('src/App.tsx', code);
