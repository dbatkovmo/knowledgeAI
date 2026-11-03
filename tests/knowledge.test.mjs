import test from 'node:test'
import assert from 'node:assert/strict'
import { demoDocuments, validateDocument, validateDocuments, tokenize, rankDocuments, searchDocuments, answerQuestion } from '../src/knowledge.js'
import { loadDocuments, storeDocuments, exportDocuments, importDocuments, loadDialog, storeDialog } from '../src/storage.js'

test('демонстрационные материалы валидны, на русском и без дублированных идентификаторов',()=>{
 const docs=demoDocuments()
 assert.ok(docs.length>=12)
 assert.deepEqual(validateDocuments(docs),docs)
 assert.equal(new Set(docs.map(d=>d.id)).size,docs.length)
 assert.ok(docs.every(d=>/[а-яё]/i.test(d.title)))
})
test('нормализация русских слов и поиск по регламентам',()=>{
 const words=tokenize('Как оформить отпуск и отпуска?')
 assert.ok(words.includes('отпуск'))
 assert.ok(rankDocuments('как оформить отпуск',demoDocuments()).some(r=>r.doc.id==='vacation'))
 assert.equal(searchDocuments('выписать счёт',demoDocuments()).some(d=>d.id==='invoice'),false)
 assert.ok(searchDocuments('доставка',demoDocuments(),'Доставка').length>=1)
})
test('ответы содержат проверяемые источники и факты из базы',()=>{
 const docs=demoDocuments()
 const reply=answerQuestion('Как оформить отпуск?',docs)
 assert.equal(reply.found,true)
 assert.ok(reply.sources.some(s=>s.id==='vacation'))
 assert.match(reply.text,/руководител/i)
 for(const src of reply.sources){
  assert.ok(docs.some(d=>d.id===src.id))
  assert.ok(src.excerpt.length>10)
 }
})
test('при отсутствии источников помощник не придумывает ответ',()=>{
 const docs=demoDocuments()
 const reply=answerQuestion('Спектральная энтропия нейтринного телескопа',docs)
 assert.equal(reply.found,false)
 assert.equal(reply.sources.length,0)
 assert.match(reply.text,/не нашлось достаточно/)
 assert.throws(()=>answerQuestion('да',docs))
})
test('запрещены некорректные, чрезмерно длинные и дублированные документы',()=>{
 const sample=demoDocuments()[0]
 assert.throws(()=>validateDocument({...sample,title:''}))
 assert.throws(()=>validateDocument({...sample,category:'Секретный'}))
 assert.throws(()=>validateDocument({...sample,body:'a'.repeat(6001)}))
 assert.throws(()=>validateDocuments([sample,sample]))
})
test('импорт и экспорт материалов проходят с проверкой версии',()=>{
 const docs=demoDocuments()
 assert.deepEqual(importDocuments(exportDocuments(docs)),docs)
 assert.throws(()=>importDocuments('недопустимый JSON'))
 assert.throws(()=>importDocuments(JSON.stringify({version:2,documents:docs})))
})
test('локальное хранилище документов и истории корректно восстанавливается',()=>{
 const data=new Map()
 const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)}
 const docs=demoDocuments()
 assert.equal(storeDocuments(docs,storage),true)
 assert.deepEqual(loadDocuments(storage).documents,docs)
 data.set('knowledgeai.documents.v1','{bad')
 assert.equal(loadDocuments(storage).recovered,true)
 const messages=[{id:'1',role:'user',text:'Как оформить отпуск?',sources:[]}]
 assert.equal(storeDialog(messages,storage),true)
 assert.deepEqual(loadDialog(storage),messages)
 assert.equal(storeDocuments(docs,{setItem(){throw Error('full')}}),false)
})
