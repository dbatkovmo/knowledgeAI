export const KNOWLEDGE_KEY='knowledgeai.documents.v1'
export const CHAT_KEY='knowledgeai.dialog.v1'
export const CATEGORIES=['Все','Сотрудникам','Клиентский сервис','Продажи и оплата','Доставка','ИТ и безопасность']
const date='2026-10-20'
const demo=[
 ['hours','График работы и выходные','Сотрудникам','Стандартный график офиса: понедельник — пятница, с 09:00 до 18:00. Перерыв на обед — с 13:00 до 14:00. Суббота и воскресенье — выходные. При сменном графике время работы согласовывается с руководителем. В предпраздничные дни график уточняется отдельно.'],
 ['vacation','Как оформить отпуск','Сотрудникам','Для согласования отпуска сотрудник направляет заявление руководителю не позднее чем за 14 календарных дней до предполагаемого начала. После одобрения руководитель передаёт информацию кадровому специалисту. Даты отпуска считаются согласованными после подтверждения в кадровой системе. Это демонстрационный регламент вымышленной компании.'],
 ['sickleave','Больничный и отсутствие','Сотрудникам','При болезни сотрудник сообщает непосредственному руководителю о невозможности выйти на работу как можно раньше. После получения официального листка нетрудоспособности необходимо передать его номер кадровому специалисту. Не отправляйте медицинские документы через общие чаты.'],
 ['returns','Возврат товара','Клиентский сервис','Чтобы оформить возврат, сотрудник запрашивает номер заказа, дату покупки и причину обращения. Затем регистрирует заявку в системе обращений. Решение о возврате принимается после проверки условий покупки и применимых правил. Не обещайте возврат денег до подтверждения. Для уточнения сроков передайте запрос ответственному менеджеру.'],
 ['complaints','Обработка жалобы клиента','Клиентский сервис','При жалобе клиента выслушайте проблему, зафиксируйте номер заказа и краткое описание ситуации. Присвойте обращению статус «На проверке». Если проблему нельзя решить сразу, передайте заявку старшему специалисту. Клиенту сообщите номер обращения и ориентир следующего контакта, но не придумывайте срок решения.'],
 ['service','Первичная консультация клиента','Клиентский сервис','В начале общения уточните имя клиента, суть вопроса и удобный способ обратной связи. Сверьте информацию с действующими материалами базы знаний. Если ответа нет, создайте обращение специалисту. Не выдавайте предположения за официальные условия компании.'],
 ['invoice','Как выставить счёт','Продажи и оплата','Чтобы подготовить счёт для юридического лица, уточните реквизиты организации, список услуг или товаров и согласованную стоимость. Перед отправкой проверьте получателя и сумму. Счёт формируется через бухгалтерскую систему после подтверждения менеджером. В этом демо реальной бухгалтерской интеграции нет.'],
 ['payment','Способы оплаты','Продажи и оплата','В демонстрационном сценарии доступны безналичная оплата по счёту и банковская карта. Наличие конкретного способа оплаты нужно подтвердить у ответственного сотрудника. Не принимайте реквизиты банковских карт через обычный чат и не просите сообщать коды подтверждения.'],
 ['delivery','Доставка заказа','Доставка','После оформления заказа менеджер проверяет адрес доставки, контакты получателя и готовность товара. Когда заказ передан перевозчику, клиенту направляется номер отслеживания, если он предоставлен перевозчиком. Точную дату доставки необходимо уточнять по данным логистики. Демонстрационные материалы не устанавливают гарантированных сроков.'],
 ['shipment','Изменение адреса доставки','Доставка','Если клиент просит изменить адрес доставки, сотрудник сначала проверяет статус заказа. До передачи перевозчику адрес можно отправить на согласование логисту. После передачи перевозчику изменение зависит от его правил и технических возможностей. Сообщите клиенту результат только после подтверждения.'],
 ['security','Информационная безопасность','ИТ и безопасность','Пароли должны быть индивидуальными и не передаваться коллегам. Для учётных записей рекомендуется многофакторная аутентификация. Подозрительные письма и ссылки не открывайте; сообщите о них ИТ-специалисту. Не загружайте персональные данные клиентов в открытые демонстрационные сервисы или общедоступные AI-инструменты.'],
 ['access','Получение доступа к системе','ИТ и безопасность','Новый сотрудник запрашивает доступ через руководителя. Руководитель подтверждает роль и перечень необходимых прав, после чего ИТ-специалист оформляет доступ. Использование чужой учётной записи запрещено. При увольнении руководитель инициирует отключение доступов.'],
 ['support','Обращение в техническую поддержку','ИТ и безопасность','При проблеме с рабочим приложением сообщите название системы, время сбоя, последовательность действий и текст ошибки. Прикладывайте скриншоты без паролей и персональных данных. Срочные инциденты передаются ответственному ИТ-специалисту.'],
 ['onboarding','Первый рабочий день','Сотрудникам','В первый рабочий день сотрудник знакомится с руководителем и командой, получает план адаптации и проверяет доступность рабочих инструментов. Контакт ответственного наставника уточняется у руководителя. Доступы оформляются по внутреннему регламенту безопасности.'],
]
export const demoDocuments=()=>demo.map(([id,title,category,body])=>({id,title,category,body,updatedAt:date}))
export const dateRU=value=>new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(new Date(value+'T12:00:00'))
export function validateDocument(input){
 if(!input||typeof input!=='object')throw Error('Некорректный документ')
 const doc={id:String(input.id||''),title:String(input.title||'').trim(),category:String(input.category||''),body:String(input.body||'').trim(),updatedAt:String(input.updatedAt||'')}
 if(!/^[A-Za-z0-9-]{1,90}$/.test(doc.id)||doc.title.length<3||doc.title.length>130||!doc.body||doc.body.length>6000)throw Error('Название или текст документа некорректны')
 if(!CATEGORIES.slice(1).includes(doc.category))throw Error('Выберите раздел базы знаний')
 if(!/^\d{4}-\d{2}-\d{2}$/.test(doc.updatedAt)||!Number.isFinite(new Date(doc.updatedAt+'T12:00:00').getTime()))throw Error('Некорректная дата документа')
 return doc
}
export function validateDocuments(input){
 if(!Array.isArray(input)||input.length>1000)throw Error('Некорректный список документов')
 const docs=input.map(validateDocument)
 if(new Set(docs.map(d=>d.id)).size!==docs.length)throw Error('Обнаружены одинаковые идентификаторы документов')
 return docs
}
const stops=new Set(['как','что','где','когда','какие','какой','какая','кто','можно','нужно','для','или','после','надо','это','мне','мои','свои','наш','если','есть','из','по','не','на','за','вы','мы','вам','бы','ли','до','об','от','со','под','про','при','все','того','так','чтобы','зачем','почему','чем','быть','чего','куда','который'])
const ending=/(иями|ями|ами|ение|ений|овать|иваю|ировать|ация|ации|ости|ость|ства|ство|ённый|енные|анный|алась|или|ого|ему|ыми|ыми|ой|ий|ый|ая|ое|ее|ые|ых|ом|ем|ам|ям|ах|ях|ов|ев|ия|ие|ию|иям|ь|а|я|ы|и|у|ю|е|о)$/u
export function tokenize(text){
 return String(text||'').toLowerCase().replaceAll('ё','е').match(/[а-яa-z0-9]+/gu)?.filter(w=>w.length>1&&!stops.has(w)).map(w=>w.length>5?w.replace(ending,''):w)||[]
}
const uniqueWords=text=>[...new Set(tokenize(text))]
export function rankDocuments(question,documents){
 const query=uniqueWords(question)
 if(!query.length)return []
 return documents.map(doc=>{
   const title=uniqueWords(doc.title), category=uniqueWords(doc.category),body=uniqueWords(doc.body)
   const t=new Set(title),c=new Set(category),b=new Set(body)
   let score=0,matched=0
   for(const word of query){
     const found=t.has(word)||c.has(word)||b.has(word)
     if(found)matched++
     if(t.has(word))score+=6
     if(c.has(word))score+=3
     if(b.has(word))score+=1
   }
   if(matched===0)return {doc,score:0,matched}
   if(query.length>1&&matched===query.length)score+=5
   if(doc.title.toLowerCase().includes(question.trim().toLowerCase()))score+=9
   return {doc,score,matched}
 }).filter(item=>item.score>=1).sort((a,b)=>b.score-a.score||b.matched-a.matched||a.doc.title.localeCompare(b.doc.title,'ru'))
}
function excerpt(question,body){
 const query=new Set(uniqueWords(question))
 const sentences=body.split(/(?<=[.!?])\s+/u).map(t=>t.trim()).filter(Boolean)
 const scored=sentences.map((s,index)=>({s,index,match:uniqueWords(s).filter(w=>query.has(w)).length})).sort((a,b)=>b.match-a.match||a.index-b.index)
 const chosen=(scored.some(s=>s.match>0)?scored.filter(s=>s.match>0):scored).slice(0,2).sort((a,b)=>a.index-b.index)
 return chosen.map(s=>s.s).join(' ').slice(0,500)
}
export function answerQuestion(question,documents){
 const q=String(question||'').trim()
 if(q.length<3||q.length>500)throw Error('Вопрос должен содержать от 3 до 500 символов')
 const ranked=rankDocuments(q,documents)
 const maxMatched=ranked[0]?.matched||0
 const required=uniqueWords(q).length>=3?2:1
 if(!ranked.length||maxMatched<required) return {text:'По этому вопросу в базе знаний не нашлось достаточно подтверждённых сведений. Попробуйте уточнить запрос или обратитесь к ответственному сотруднику.',sources:[],found:false}
 const top=ranked.filter(r=>r.score>=Math.max(1,ranked[0].score*.48)&&r.matched>=required).slice(0,3)
 const sources=top.map(({doc})=>({id:doc.id,title:doc.title,excerpt:excerpt(q,doc.body),category:doc.category}))
 const text=sources.length===1
  ? 'В базе знаний найден материал по вашему вопросу:\n\n'+sources[0].excerpt
  : 'В базе знаний найдены следующие сведения:\n\n'+sources.map((s,i)=>(i+1)+'. '+s.excerpt).join('\n\n')
 return {text,sources,found:true}
}
export function searchDocuments(query,documents,category='Все'){
 const q=String(query||'').trim()
 const selected=category==='Все'?documents:documents.filter(d=>d.category===category)
 if(!q)return [...selected].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)||a.title.localeCompare(b.title,'ru'))
 return rankDocuments(q,selected).map(item=>item.doc)
}
