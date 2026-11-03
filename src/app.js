import { CATEGORIES, demoDocuments, answerQuestion, searchDocuments, rankDocuments, dateRU, validateDocument } from './knowledge.js'
import { loadDocuments, storeDocuments, exportDocuments, importDocuments, loadDialog, storeDialog } from './storage.js'

const root=document.getElementById('root')
const initial=loadDocuments()
const state={
  page:'chat', docs:initial.documents, messages:loadDialog(),
  category:'Все', search:'', toast:initial.recovered?'Сохранённые документы повреждены. Загружена демонстрационная база знаний.':'',
}
const topics=[
  ['Как оформить отпуск?','Отпуск'],
  ['Что делать при жалобе клиента?','Обращения'],
  ['Как выставить счёт?','Оплата'],
  ['Как получить доступ к системе?','Доступ'],
]
const nav=[
  ['chat','Консультант','✦'],
  ['overview','Обзор','▦'],
  ['knowledge','База знаний','▤'],
  ['settings','Настройки','⚙'],
]
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const nl=v=>esc(v).replace(/\n/g,'<br>')
function ico(type){
 const paths={
  send:'<path d="m22 2-7 20-4-9-9-4 20-7ZM11 13 22 2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  book:'<path d="M4 19V5c0-1 1-2 2-2h14v18H6a2 2 0 0 1 0-4h14"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  arrow:'<path d="m7 17 10-10M7 7h10v10"/>',
  bot:'<rect x="4" y="7" width="16" height="13" rx="3"/><path d="M12 3v4M9 3h6M8 13h.01M16 13h.01M9 17h6"/>',
  folder:'<path d="M3 6h7l2 3h9v11H3z"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  download:'<path d="M12 3v13m-4-4 4 4 4-4M4 18v3h16v-3"/>',
  light:'<path d="M9 18h6m-5 3h4m-2-19a7 7 0 0 0-4 13l1 2h6l1-2a7 7 0 0 0-4-13Z"/>',
  shield:'<path d="M12 2 4 6v6c0 5 4 8 8 10 4-2 8-5 8-10V6zM9 12l2 2 4-4"/>',
 }
 return '<svg class="icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[type]||paths.arrow)+'</svg>'
}
const categoryTheme=c=>({
 'Сотрудникам':'violet','Клиентский сервис':'teal','Продажи и оплата':'amber','Доставка':'blue','ИТ и безопасность':'rose'
})[c]||'violet'
const categoryBadge=c=>'<span class="category-pill category-pill--'+categoryTheme(c)+'">'+esc(c)+'</span>'
const savedNotice=message=>{
 state.toast=message
 const el=document.getElementById('toast')
 if(el){el.textContent=message;el.hidden=false}
}
function persist(docs,message='База знаний обновлена'){
 state.docs=docs
 const ok=storeDocuments(docs)
 render()
 savedNotice(ok?message:'Изменения применены, но сохранить их в браузере не удалось')
}
function sidebar(){
 return '<aside class="sidebar"><a class="brand" data-nav="chat" href="#консультант"><span class="brand-icon">✳</span><span>Knowledge<span class="brand-accent">AI</span><small>БАЗА ЗНАНИЙ КОМПАНИИ</small></span></a>'+
 '<div class="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>'+
 '<nav class="side-nav" aria-label="Разделы">'+nav.map(([key,label,symbol])=>'<button type="button" data-nav="'+key+'" class="side-link '+(state.page===key?'active':'')+'" aria-current="'+(state.page===key?'page':'false')+'"><span>'+symbol+'</span>'+label+(key==='knowledge'?'<em>'+state.docs.length+'</em>':'')+'</button>').join('')+'</nav>'+
 '<div class="sidebar-spacer"></div><div class="sidebar-note"><div class="note-graphic">✦ <span>↗</span></div><strong>Знания всегда под рукой</strong><p>Проверяемые ответы с указанием первоисточника.</p></div>'+
 '<div class="sidebar-profile"><span class="profile-avatar">КО</span><span><strong>Сотрудник компании</strong><small>Локальная демонстрация</small></span></div></aside>'
}
function topbar(){
 const labels={chat:'Консультант',overview:'Обзор',knowledge:'База знаний',settings:'Настройки'}
 return '<header class="topbar"><div class="breadcrumbs">Рабочее пространство <b>/</b> <strong>'+labels[state.page]+'</strong></div>'+
 '<div class="top-right"><span class="demo-label"><i></i> ДЕМОРЕЖИМ</span><span class="avatar-header">КО</span></div></header>'
}
function pageHead(title,subtitle,action=''){
 return '<div class="page-heading"><div><div class="section-eyebrow"><span class="tiny-sparkle">✳</span> ИНТЕЛЛЕКТУАЛЬНОЕ ПРОСТРАНСТВО</div><h1>'+title+'<span>.</span></h1><p>'+subtitle+'</p></div>'+action+'</div>'
}
function chatWelcome(){
 return '<div class="chat-welcome"><div class="welcome-bot">✳<span>✦</span></div><div class="chat-overline">ВАШ ПОМОЩНИК ПО ЗНАНИЯМ</div>'+
 '<h2>Здравствуйте!<br><em>Чем могу помочь?</em></h2><p>Найду подходящий регламент, инструкцию или ответ в материалах компании. Каждый результат — со ссылкой на источник.</p>'+
 '<div class="suggested-title">ПОПРОБУЙТЕ СПРОСИТЬ</div><div class="suggestions">'+topics.map(([q,label])=>'<button type="button" data-question="'+esc(q)+'"><span>'+esc(label)+'</span><strong>'+esc(q)+'</strong><b>↗</b></button>').join('')+'</div></div>'
}
function messageHtml(m){
 if(m.role==='user')return '<div class="chat-message chat-message--user"><div class="bubble-user">'+nl(m.text)+'</div><span class="message-label">Вы</span></div>'
 return '<div class="chat-message chat-message--bot"><div class="bot-badge">✳</div><div class="bot-content"><div class="bot-heading"><strong>KnowledgeAI</strong><span>Поиск по базе знаний</span></div>'+
 '<div class="bot-text">'+nl(m.text)+'</div>'+
 (m.sources?.length?'<div class="sources-heading">ИСТОЧНИКИ · '+m.sources.length+'</div><div class="sources">'+m.sources.map((source,i)=>
 '<button class="source-card" type="button" data-open-source="'+esc(source.id)+'"><span class="source-number">'+(i+1)+'</span><span><strong>'+esc(source.title)+'</strong><small>Открыть документ →</small></span><span class="source-arrow">↗</span></button>').join('')+'</div>':'<div class="uncertainty">Подтверждающих источников нет — ответ не придуман.</div>')+
 '</div></div>'
}
function chat(){
 return '<div class="chat-shell">'+
 '<div class="chat-titlebar"><div><h2>Консультант по базе знаний <span class="beta">ДЕМО</span></h2><p><span class="online-dot"></span> Локальный поиск · '+state.docs.length+' материалов</p></div>'+
 (state.messages.length?'<button class="quiet-btn" type="button" data-clear>Очистить диалог</button>':'')+'</div>'+
 '<div class="chat-thread" id="chat-thread" role="log" aria-live="polite">'+(state.messages.length?state.messages.map(messageHtml).join(''):chatWelcome())+'</div>'+
 '<div class="chat-bottom"><form id="question-form" class="composer"><label class="sr-only" for="question">Задайте вопрос</label><textarea id="question" name="question" maxlength="500" rows="2" placeholder="Напишите вопрос по работе компании..." required></textarea><button type="submit" aria-label="Найти ответ">'+ico('send')+'</button></form>'+
 '<div class="composer-note"><span>✧ Ответы формируются по совпадениям в документах, без подключения языковой модели.</span><span>Источники проверяемы</span></div></div></div>'
}
function overview(){
 const cats=CATEGORIES.slice(1).map(c=>({c,num:state.docs.filter(d=>d.category===c).length}))
 return pageHead('Центр знаний','Всё, что нужно команде, — в одном рабочем пространстве.')+
 '<div class="intro-banner"><div class="intro-copy"><div class="intro-kicker">✦ БАЗА ЗНАНИЙ</div><h2>Один вопрос —<br><em>проверенный ответ.</em></h2><p>Быстрый поиск регламентов с указанием источника. Никаких выдуманных правил.</p><button type="button" class="light-button" data-nav="chat">Задать вопрос ↗</button></div><div class="intro-shape"><span>✳</span></div></div>'+
 '<div class="stats-row"><div><span>Материалов</span><strong>'+state.docs.length+'</strong><small>В базе знаний</small></div><div><span>Разделов</span><strong>'+cats.filter(c=>c.num>0).length+'</strong><small>Тематические категории</small></div><div><span>Вопросов</span><strong>'+state.messages.filter(m=>m.role==='user').length+'</strong><small>В этом браузере</small></div></div>'+
 '<div class="overview-columns"><section class="surface-panel"><div class="panel-head"><h2>Разделы знаний</h2><button type="button" class="plain-link" data-nav="knowledge">Все документы →</button></div><div class="category-list">'+cats.map(({c,num})=>'<button class="category-row" data-category-link="'+esc(c)+'"><span class="category-graphic '+categoryTheme(c)+'">'+ico('folder')+'</span><span><strong>'+esc(c)+'</strong><small>'+num+' материалов</small></span><b>↗</b></button>').join('')+'</div></section>'+
 '<section class="surface-panel"><div class="panel-head"><h2>Частые вопросы</h2><span class="panel-tip">БЫСТРЫЙ СТАРТ</span></div><div class="popular-list">'+topics.map(([q],i)=>'<button type="button" data-question="'+esc(q)+'"><span>'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(q)+'</strong><b>↗</b></button>').join('')+'</div></section></div>'
}
function currentDocs(){return searchDocuments(state.search,state.docs,state.category)}
function docCard(d){
 const length=d.body.length>120?d.body.slice(0,120).trimEnd()+'…':d.body
 return '<article class="doc-card"><div class="doc-icon doc-icon--'+categoryTheme(d.category)+'">'+ico('book')+'</div><div class="doc-card-top">'+categoryBadge(d.category)+'<span class="doc-updated">Обновлено '+dateRU(d.updatedAt)+'</span></div>'+
 '<h3>'+esc(d.title)+'</h3><p>'+esc(length)+'</p>'+
 '<div class="doc-card-footer"><button type="button" data-open-source="'+esc(d.id)+'">Читать <span>↗</span></button>'+
 '<button type="button" class="doc-edit" data-edit-doc="'+esc(d.id)+'" aria-label="Редактировать '+esc(d.title)+'">Изменить</button></div></article>'
}
function docList(){
 const docs=currentDocs()
 return docs.length?'<div class="documents-grid">'+docs.map(docCard).join('')+'</div>':
 '<div class="empty-docs"><div>⌕</div><h3>Документы не найдены</h3><p>Попробуйте другой запрос или выберите другую категорию.</p></div>'
}
function knowledge(){
 return pageHead('База знаний','Внутренние документы, инструкции и рабочие регламенты.',
 '<button type="button" class="primary-btn" data-add>'+ico('plus')+' Добавить документ</button>')+
 '<div class="knowledge-toolbar"><label class="knowledge-search">'+ico('search')+'<input type="search" id="doc-search" value="'+esc(state.search)+'" placeholder="Поиск по документам..." aria-label="Поиск по документам"></label><div class="doc-count">'+state.docs.length+' материалов</div></div>'+
 '<div class="categories" role="group" aria-label="Категории">'+CATEGORIES.map(c=>'<button type="button" data-category="'+esc(c)+'" aria-pressed="'+(state.category===c)+'" class="'+(state.category===c?'selected':'')+'">'+esc(c)+'</button>').join('')+'</div>'+
 '<div id="documents-list">'+docList()+'</div>'
}
function settings(){
 return pageHead('Настройки','Управление локальной базой знаний и прозрачность работы сервиса.')+
 '<div class="settings-grid"><section class="surface-panel setting-panel"><div class="setting-icon">'+ico('download')+'</div><h2>Резервная копия</h2><p>Скачайте документы в JSON или загрузите ранее сохранённую копию. Импорт заменит текущую базу после подтверждения.</p><div class="setting-buttons"><button class="outline-btn" data-export>Скачать JSON</button><button class="outline-btn" data-import>Загрузить JSON</button><input type="file" accept=".json,application/json" id="import-file" hidden></div></section>'+
 '<section class="surface-panel setting-panel"><div class="setting-icon setting-icon--rose">'+ico('book')+'</div><h2>Демонстрационная база</h2><p>Верните вымышленные регламенты и инструкции, которые входили в начальную версию. Текущие изменения будут заменены.</p><button class="warn-btn" data-reset>Восстановить демоданные</button></section>'+
 '<section class="surface-panel setting-panel setting-panel--wide"><div class="setting-icon setting-icon--teal">'+ico('shield')+'</div><h2>Как обрабатываются данные</h2>'+
 '<div class="setting-table"><div><span>Язык интерфейса</span><strong>Русский</strong></div><div><span>Хранение</span><strong>Только в браузере</strong></div><div><span>Поиск</span><strong>Локальный, с указанием источников</strong></div><div><span>Языковая модель (LLM)</span><strong>Не подключена</strong></div><div><span>Командный доступ</span><strong>Не реализован</strong></div></div>'+
 '<p class="safety-note">Не добавляйте настоящие документы компании, персональные данные или секреты: это публичный демонстрационный проект без серверных прав доступа. Для промышленного использования необходимы сервер, авторизация, разграничение доступа и проверенное подключение языковой модели.</p></section></div>'
}
function dialog(){
 return '<dialog id="doc-dialog" aria-labelledby="dialog-title"><div class="dialog-header"><div><p>БАЗА ЗНАНИЙ / ДОКУМЕНТ</p><h2 id="dialog-title">Новый документ</h2></div><button type="button" class="dialog-x" data-close aria-label="Закрыть">'+ico('x')+'</button></div>'+
 '<div id="doc-read" hidden></div><form id="doc-form" hidden><input type="hidden" name="id"><label>Название документа<input type="text" maxlength="130" minlength="3" name="title" required placeholder="Например, правила обработки заказов"></label><label>Раздел<select name="category">'+CATEGORIES.slice(1).map(c=>'<option>'+esc(c)+'</option>').join('')+'</select></label><label>Содержание<textarea name="body" rows="10" maxlength="6000" required placeholder="Добавьте понятную инструкцию, процедуру или правило..."></textarea></label>'+
 '<p class="dialog-warning" id="doc-error" role="alert" hidden></p><div class="dialog-actions"><button type="button" class="outline-btn" data-close>Отмена</button><button type="submit" class="primary-btn">Сохранить документ</button></div></form></dialog>'
}
function render(){
 const pages={chat,overview,knowledge,settings}
 root.innerHTML=sidebar()+'<div class="main-area">'+topbar()+'<main id="main" tabindex="-1">'+pages[state.page]()+'</main><footer class="footer"><span>KnowledgeAI · Демонстрационный продукт</span><span>Ответы только по локальным документам</span></footer></div>'+dialog()+
 '<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>'
 if(state.page==='chat'&&state.messages.length) {
  const thread=document.getElementById('chat-thread')
  if(thread) thread.scrollTop=thread.scrollHeight
 }
}
function navigate(page){
 if(!nav.some(([key])=>key===page))return
 state.page=page;state.search='';state.category='Все';render()
 document.getElementById('main')?.focus()
}
function ask(raw){
 const question=String(raw||'').trim()
 if(question.length<3){savedNotice('Сформулируйте вопрос подробнее');return}
 try{
  const result=answerQuestion(question,state.docs)
  const id=globalThis.crypto?.randomUUID?.()||String(Date.now())
  state.messages.push({id:'Q'+id,role:'user',text:question,sources:[]})
  state.messages.push({id:'A'+id,role:'assistant',text:result.text,sources:result.sources.map(s=>({id:s.id,title:s.title}))})
  state.messages=state.messages.slice(-80)
  storeDialog(state.messages)
  state.page='chat';render()
 }catch(error){savedNotice(error.message)}
}
function openDoc(id,editable=false) {
 const doc=state.docs.find(d=>d.id===id)
 if(!doc && id)return
 const dlg=document.getElementById('doc-dialog')
 const reader=document.getElementById('doc-read')
 const form=document.getElementById('doc-form')
 reader.hidden=true;form.hidden=true
 document.getElementById('doc-error').hidden=true
 if(editable || !doc){
  form.hidden=false;form.reset()
  document.getElementById('dialog-title').textContent=doc?'Изменить документ':'Новый документ'
  const data=doc||{id:'',title:'',body:'',category:CATEGORIES[1]}
  for(const [key,value] of Object.entries(data)) {
   const field=form.elements.namedItem(key)
   if(field && 'value' in field)field.value=String(value)
  }
  dlg.showModal()
  form.elements.namedItem('title').focus()
 }else{
  reader.hidden=false
  document.getElementById('dialog-title').textContent=doc.title
  reader.innerHTML='<div class="reader-meta">'+categoryBadge(doc.category)+'<span>Обновлено '+dateRU(doc.updatedAt)+'</span></div>'+
   '<div class="reader-body">'+nl(doc.body)+'</div><div class="reader-actions"><button type="button" class="outline-btn" data-edit-doc="'+esc(doc.id)+'">Редактировать</button>'+
   '<button type="button" class="danger-link" data-delete-doc="'+esc(doc.id)+'">Удалить документ</button></div>'
  dlg.showModal()
 }
}
function download(content,name){
 const url=URL.createObjectURL(new Blob([content],{type:'application/json;charset=utf-8'}))
 const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove()
 setTimeout(()=>URL.revokeObjectURL(url),1000)
}
document.addEventListener('click',event=>{
 if(!(event.target instanceof Element))return
 const el=event.target.closest('[data-nav],[data-question],[data-category-link],[data-category],[data-add],[data-edit-doc],[data-open-source],[data-delete-doc],[data-close],[data-clear],[data-export],[data-import],[data-reset]')
 if(!el)return
 if('nav' in el.dataset){if(el.tagName==='A')event.preventDefault();navigate(el.dataset.nav)}
 else if('question' in el.dataset)ask(el.dataset.question)
 else if('categoryLink' in el.dataset){navigate('knowledge');state.category=el.dataset.categoryLink;render()}
 else if('category' in el.dataset){state.category=el.dataset.category;render()}
 else if('add' in el.dataset)openDoc('')
 else if('editDoc' in el.dataset){document.getElementById('doc-dialog')?.close();openDoc(el.dataset.editDoc,true)}
 else if('openSource' in el.dataset)openDoc(el.dataset.openSource)
 else if('deleteDoc' in el.dataset){
  const id=el.dataset.deleteDoc
  if(confirm('Удалить этот документ из локальной базы знаний?')){
   document.getElementById('doc-dialog')?.close()
   persist(state.docs.filter(d=>d.id!==id),'Документ удалён')
  }
 }
 else if('close' in el.dataset)document.getElementById('doc-dialog')?.close()
 else if('clear' in el.dataset && confirm('Очистить историю диалога в этом браузере?')){state.messages=[];storeDialog([]);render()}
 else if('export' in el.dataset){download(exportDocuments(state.docs),'knowledgeai-baza-znaniy.json');savedNotice('Копия документов готова')}
 else if('import' in el.dataset)document.getElementById('import-file')?.click()
 else if('reset' in el.dataset && confirm('Восстановить исходные демонстрационные документы?'))persist(demoDocuments(),'База знаний восстановлена')
})
document.addEventListener('input',event=>{
 if(event.target?.id==='doc-search'){
  state.search=event.target.value
  const list=document.getElementById('documents-list')
  if(list)list.innerHTML=docList()
 }
})
document.addEventListener('change',async event=>{
 if(event.target?.id!=='import-file')return
 const file=event.target.files?.[0]
 if(!file)return
 try {
  if(file.size>5_000_000)throw Error('Файл слишком большой (до 5 МБ)')
  const docs=importDocuments(await file.text())
  if(confirm('Импортировать '+docs.length+' документов? Это заменит текущую локальную базу.'))persist(docs,'Документы импортированы')
 }catch(error){savedNotice(error.message)}
 event.target.value=''
})
document.addEventListener('submit',event=>{
 if(event.target?.matches?.('#question-form')){
  event.preventDefault()
  const field=event.target.elements.namedItem('question')
  ask(field.value)
  return
 }
 if(event.target?.matches?.('#doc-form')){
  event.preventDefault()
  const form=event.target
  const values=Object.fromEntries(new FormData(form).entries())
  const original=state.docs.find(d=>d.id===values.id)
  const id=original?.id||'doc-'+(globalThis.crypto?.randomUUID?.()||Date.now())
  const date=new Date(),today=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')
  try {
   const valid=validateDocument({...values,id,updatedAt:today})
   document.getElementById('doc-dialog')?.close()
   persist(original?state.docs.map(d=>d.id===id?valid:d):[valid,...state.docs],original?'Документ обновлён':'Документ добавлен')
  }catch(error){
   const node=document.getElementById('doc-error')
   node.textContent=error.message;node.hidden=false
  }
 }
})
render()
