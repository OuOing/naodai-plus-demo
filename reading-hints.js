/* Opt-in hints: reveal strategy progressively, never the answer or evidence. */
(()=>{'use strict';
function attach(article){
 const panel=document.getElementById('quizPanel');if(!panel||!Array.isArray(article?.questions))return;
 const quizzes=panel.querySelectorAll('.quiz');
 article.questions.forEach((q,i)=>{
  const box=quizzes[i],hints=Array.isArray(q.hints)?q.hints.filter(h=>typeof h==='string'&&h.trim()).slice(0,2):[];
  if(!box||!hints.length||box.querySelector('[data-reading-hints]'))return;
  const wrap=document.createElement('div');wrap.dataset.readingHints='';
  const button=document.createElement('button');button.type='button';button.className='quiet';button.textContent='需要一点提示';button.setAttribute('aria-expanded','false');
  const text=document.createElement('p');text.className='small';text.setAttribute('role','status');text.id='reading-hint-'+i;text.hidden=true;button.setAttribute('aria-controls',text.id);
  const note=document.createElement('p');note.className='small';note.textContent='提示后首次作答会单独记录，不计入独立作答比较。';note.hidden=true;
  let shown=0;button.onclick=()=>{if(!button.isConnected||document.getElementById('quizPanel')!==panel||shown>=hints.length)return;window.LearningInsights?.markHint?.('reading:'+article.id+':'+i);shown++;text.hidden=false;note.hidden=false;text.textContent=hints.slice(0,shown).map((h,j)=>`${j+1}. ${h}`).join(' ');button.setAttribute('aria-expanded','true');button.textContent=shown<hints.length?'再给一点提示':'提示已展开';button.disabled=shown>=hints.length};
  wrap.append(button,text,note);const explanation=box.querySelector('.explanation');explanation?box.insertBefore(wrap,explanation):box.append(wrap);
 });
}
window.ReadingHints={attach};
})();
