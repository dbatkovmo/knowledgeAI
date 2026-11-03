import { KNOWLEDGE_KEY, CHAT_KEY, demoDocuments, validateDocuments } from './knowledge.js'

export function loadDocuments(storage=globalThis.localStorage){
 try{
  const raw=storage.getItem(KNOWLEDGE_KEY)
  if(raw===null)return {documents:demoDocuments(),recovered:false}
  const parsed=JSON.parse(raw)
  if(parsed?.version!==1)throw Error('Версия')
  return {documents:validateDocuments(parsed.documents),recovered:false}
 }catch{return {documents:demoDocuments(),recovered:true}}
}
export function storeDocuments(docs,storage=globalThis.localStorage){
 const validated=validateDocuments(docs)
 try{storage.setItem(KNOWLEDGE_KEY,JSON.stringify({version:1,documents:validated}));return true}
 catch{return false}
}
export function exportDocuments(docs){
 return JSON.stringify({version:1,exportedAt:new Date().toISOString(),documents:validateDocuments(docs)},null,2)
}
export function importDocuments(raw){
 if(raw.length>5_000_000)throw Error('Файл слишком большой')
 let parsed
 try{parsed=JSON.parse(raw)}catch{throw Error('Файл не является корректным JSON')}
 if(parsed?.version!==1)throw Error('Неподдерживаемая версия файла')
 return validateDocuments(parsed.documents)
}
export function loadDialog(storage=globalThis.localStorage){
 try {
  const raw=storage.getItem(CHAT_KEY)
  if(!raw)return []
  const value=JSON.parse(raw)
  if(!Array.isArray(value)||value.length>100)return []
  return value.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.text==='string'&&m.text.length<=4000)
   .map(m=>({id:String(m.id).slice(0,100),role:m.role,text:m.text,sources:Array.isArray(m.sources)?m.sources.filter(s=>s&&typeof s.id==='string'&&typeof s.title==='string').slice(0,3):[]}))
 }catch{return []}
}
export function storeDialog(messages,storage=globalThis.localStorage){
 try {storage.setItem(CHAT_KEY,JSON.stringify(messages.slice(-80)));return true}
 catch{return false}
}
