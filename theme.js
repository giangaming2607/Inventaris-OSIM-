const fs = require('fs');
const path = require('path');
function rep(p) {
  if(!fs.existsSync(p)) return;
  for (const f of fs.readdirSync(p)) {
    const fp = path.join(p, f);
    if (fs.statSync(fp).isDirectory()) rep(fp);
    else if (fp.endsWith('.tsx') || fp.endsWith('.ts')) {
      let c = fs.readFileSync(fp, 'utf8');
      c = c.replace(/text-slate-800/g, 'text-white')
           .replace(/text-slate-900/g, 'text-white')
           .replace(/text-slate-700/g, 'text-neutral-300')
           .replace(/text-slate-600/g, 'text-neutral-400')
           .replace(/text-slate-500/g, 'text-neutral-500')
           .replace(/text-slate-400/g, 'text-neutral-600')
           .replace(/text-slate-300/g, 'text-neutral-600')
           .replace(/bg-white/g, 'bg-neutral-900')
           .replace(/bg-slate-50/g, 'bg-[#111111]')
           .replace(/bg-slate-100/g, 'bg-neutral-800')
           .replace(/bg-slate-200/g, 'bg-neutral-800')
           .replace(/bg-slate-800/g, 'bg-neutral-800')
           .replace(/bg-slate-900/g, 'bg-neutral-900')
           .replace(/bg-slate-950/g, 'bg-[#050505]')
           .replace(/border-slate-100/g, 'border-neutral-800')
           .replace(/border-slate-200/g, 'border-neutral-800')
           .replace(/border-slate-300/g, 'border-neutral-800')
           .replace(/divide-slate-100/g, 'divide-neutral-800')
           .replace(/divide-slate-200/g, 'divide-neutral-800')
           .replace(/bg-blue-100/g, 'bg-blue-900\/30')
           .replace(/text-blue-600/g, 'text-blue-500')
           .replace(/bg-emerald-100/g, 'bg-green-900\/30')
           .replace(/text-emerald-600/g, 'text-green-500')
           .replace(/text-emerald-800/g, 'text-green-500')
           .replace(/bg-amber-100/g, 'bg-amber-900\/30')
           .replace(/text-amber-600/g, 'text-amber-500')
           .replace(/text-amber-800/g, 'text-amber-500')
           .replace(/bg-red-100/g, 'bg-red-900\/30')
           .replace(/text-red-800/g, 'text-red-500')
           .replace(/bg-red-50\/30/g, 'bg-red-900\/10')
           .replace(/#e2e8f0/g, '#262626')
           .replace(/#64748b/g, '#737373')
           .replace(/#f1f5f9/g, '#171717');
      fs.writeFileSync(fp, c);
    }
  }
}
rep('./src/views');
