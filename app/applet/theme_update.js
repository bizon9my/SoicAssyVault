const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Colors replacement
// Indigo -> Emerald
code = code.replace(/indigo/g, 'emerald');

// Blue -> Teal
code = code.replace(/blue-/g, 'teal-');

// Specific logo backgrounds
code = code.replace(/bg-slate-950/g, 'bg-[#111314]');
code = code.replace(/bg-slate-900\/50/g, 'bg-[#111314]/80');
code = code.replace(/bg-slate-900\/80/g, 'bg-[#111314]/90');

fs.writeFileSync('src/App.tsx', code);
