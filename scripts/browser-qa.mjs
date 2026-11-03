import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const chrome=process.env.CHROME_BIN||['google-chrome','google-chrome-stable','chromium','chromium-browser'].find(x=>spawnSync('which',[x],{encoding:'utf8'}).status===0)
if(!chrome)throw Error('Не найден Chromium')
const profile=await mkdtemp(join(tmpdir(),'kai-cdp-'))
const processChrome=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--hide-scrollbars','--remote-debugging-port=9232','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'})
let ws,id=0
const pending=new Map(),errors=[]
const sleep=ms=>new Promise(r=>setTimeout(r,ms))
async function call(method,params={}){
 const key=++id
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{pending.delete(key);reject(Error('Браузер не ответил: '+method))},15000)
  pending.set(key,m=>{clearTimeout(timer);if(m.error)reject(Error(m.error.message));else resolve(m.result||{})})
  ws.send(JSON.stringify({id:key,method,params}))
 })
}
async function run(expr){const r=await call('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result?.value}
async function until(expr){for(let n=0;n<85;n++){try{if(await run(expr))return}catch{}await sleep(160)}throw Error('Не выполнено: '+expr)}
async function shot(name){const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile('artifacts/screens/'+name+'.png',Buffer.from(r.data,'base64'))}
try{
 let page
 for(let i=0;i<90;i++){try{page=(await (await fetch('http://127.0.0.1:9232/json/list')).json()).find(p=>p.type==='page');if(page?.webSocketDebuggerUrl)break}catch{}await sleep(140)}
 if(!page?.webSocketDebuggerUrl)throw Error('Нет подключения к Chromium')
 ws=new WebSocket(page.webSocketDebuggerUrl)
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject})
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id)}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails?.text||'Ошибка')}
 await call('Page.enable');await call('Runtime.enable')
 await mkdir('artifacts/screens',{recursive:true})
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false})
 await call('Page.navigate',{url:'http://127.0.0.1:4179/'})
 await until('document.querySelectorAll(".suggestions button").length===4')
 assert.ok(await run('document.documentElement.scrollWidth<=window.innerWidth+2'))
 await shot('knowledgeai-desktop-chat')
 await run('document.querySelector(".suggestions button").click()')
 await until('document.querySelectorAll(".chat-message").length===2')
 assert.ok(await run('document.querySelectorAll(".source-card").length>=1'))
 assert.ok(await run('document.querySelector(".bot-text").textContent.includes("отпуска")'))
 await run('document.querySelector(".source-card").click()')
 assert.equal(await run('document.querySelector("#doc-dialog").open'),true)
 await run('document.querySelector("[data-close]").click()')
 await run('document.querySelector("[data-nav=knowledge]").click()')
 assert.equal(await run('document.querySelectorAll(".doc-card").length'),14)
 await shot('knowledgeai-desktop-documents')
 await run('document.querySelector("#doc-search").value="отпуск";document.querySelector("#doc-search").dispatchEvent(new Event("input",{bubbles:true}))')
 assert.ok(await run('document.querySelectorAll(".doc-card").length>=1'))
 await run('document.querySelector("#doc-search").value="";document.querySelector("#doc-search").dispatchEvent(new Event("input",{bubbles:true}))')
 await run('document.querySelector("[data-add]").click()')
 assert.equal(await run('document.querySelector("#doc-dialog").open'),true)
 await run("(()=>{const f=document.querySelector('#doc-form');f.elements.namedItem('title').value='Тестовый регламент';f.elements.namedItem('body').value='Проверочный документ. Тестовые данные без личных сведений.';f.elements.namedItem('category').value='Сотрудникам';f.requestSubmit()})()")
 await until('document.querySelectorAll(".doc-card").length===15')
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true})
 await call('Page.navigate',{url:'http://127.0.0.1:4179/'})
 await until('document.querySelectorAll(".suggestions button").length===4')
 assert.ok(await run('document.documentElement.scrollWidth<=window.innerWidth+2'))
 await shot('knowledgeai-mobile-chat')
 assert.deepEqual(errors,[])
 console.log('Проверка браузера пройдена: русскоязычный консультант, источники, документы, поиск, создание и мобильная версия.')
}finally{
 try{ws?.close()}catch{}
 processChrome.kill('SIGTERM')
 await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:300}).catch(()=>{})
}
