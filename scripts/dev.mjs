import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
const root=fileURLToPath(new URL('../src/',import.meta.url))
const allowed=new Set(['index.html','app.js','knowledge.js','storage.js','styles.css','favicon.svg'])
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'}
createServer(async(req,res)=>{
 const path=new URL(req.url||'/', 'http://localhost').pathname
 const file=path==='/'?'index.html':decodeURIComponent(path.slice(1))
 if(!allowed.has(file)){res.writeHead(404);res.end('Страница не найдена');return}
 try {
  const bytes=await readFile(resolve(root,file))
  res.writeHead(200,{'Content-Type':types[extname(file)]+'; charset=utf-8','Cache-Control':'no-store'})
  res.end(bytes)
 }catch{res.writeHead(500);res.end('Ошибка чтения')}
}).listen(4179,'127.0.0.1',()=>console.log('KnowledgeAI: http://127.0.0.1:4179'))
