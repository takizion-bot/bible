import fs from 'fs'; import path from 'path'
const root = 'public'
const walk = d => fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):p.endsWith('.html')?[p]:[]})
let n=0, bad=[], back=0
for (const f of walk(root)) {
  const h = fs.readFileSync(f,'utf8')
  for (const m of h.matchAll(/<a[^>]*class="[^"]*internal[^"]*"[^>]*href="([^"#?]*)/g)) {
    n++
    let href = decodeURIComponent(m[1])
    const base = path.dirname(f)
    const t = path.resolve(base, href)
    const ok = [t, t+'.html', path.join(t,'index.html')].some(x=>fs.existsSync(x) && fs.statSync(x).isFile())
    if(!ok) bad.push(path.relative(root,f)+' -> '+m[1])
  }
  if (/backlinks/.test(h) && !/백링크가 없습니다/.test(h.split('backlinks')[1]||'')) back++
}
console.log('internal links', n, 'broken', bad.length, 'pages with backlinks', back)
console.log(bad.slice(0,15).join('\n'))
