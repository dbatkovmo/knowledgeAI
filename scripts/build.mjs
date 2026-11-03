import { rm, mkdir, copyFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root=fileURLToPath(new URL('../',import.meta.url))
const src=resolve(root,'src')
const dist=resolve(root,'dist')
const files=['index.html','app.js','knowledge.js','storage.js','styles.css','favicon.svg']
for(const file of files)if(!(await stat(resolve(src,file))).isFile())throw Error('Не найден файл: '+file)
await rm(dist,{recursive:true,force:true})
await mkdir(dist,{recursive:true})
for(const file of files)await copyFile(resolve(src,file),resolve(dist,file))
console.log('Сборка KnowledgeAI готова: '+files.length+' файлов')
