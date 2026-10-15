/* Wrong-answer practice: original first attempts are read-only. Retries are separate. */
(() => {
  'use strict';
  const KEY = 'naodai-mistake-retries-v1', VIEW_KEY = 'naodai-mistake-view-v1', LIMIT = 1000;
  // View metadata contains only IDs, never an answer. It can restore feedback only
  // when the separate consent-aware retry record is still available.
  let views = Object.create(null);
  try { const saved=JSON.parse(sessionStorage.getItem(VIEW_KEY)||'{}'); if(saved && typeof saved==='object' && !Array.isArray(saved)) for(const [id,token] of Object.entries(saved)) if(typeof token==='string' && token.length<=100) views[id]=token; } catch {}
  function saveView(id, token) { views[id]=token || ''; const keys=Object.keys(views); for(const key of keys.slice(0,Math.max(0,keys.length-100)))delete views[key]; try { sessionStorage.setItem(VIEW_KEY,JSON.stringify(views)); } catch {} }
  const E = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const parseId = id => typeof id === 'string' && (id.match(/^reading:([a-zA-Z0-9_-]+):(0|[1-9]\d{0,4})$/) || id.match(/^exam:([a-zA-Z0-9_-]+)$/));
  const routeFor = id => { const m = parseId(id); return !m ? 'mistakes' : id.startsWith('reading:') ? `mistakes/reading/${m[1]}/${m[2]}` : `mistakes/exam/${m[1]}`; };
  const idFor = route => { const r = route.match(/^mistakes\/reading\/([a-zA-Z0-9_-]+)\/(0|[1-9]\d{0,4})$/), e = route.match(/^mistakes\/exam\/([a-zA-Z0-9_-]+)$/); return r ? `reading:${r[1]}:${r[2]}` : e ? `exam:${e[1]}` : null; };
  let retries = [], mode = null, warning = false, generation = 0, container = null;
  function storageMode() { const c = window.ReaderTools?.storageChoice?.(); return c === 'local' || c === 'session' ? c : 'memory'; }
  function storage() { return mode === 'local' ? localStorage : mode === 'session' ? sessionStorage : null; }
  function valid(r) { return r && parseId(r.id) && typeof r.token === 'string' && r.token.length <= 100 && Number.isInteger(r.answer) && r.answer >= 0 && r.answer < 100 && typeof r.correct === 'boolean' && Number.isFinite(r.at) && r.at > 0; }
  function read() {
    const next = storageMode();
    if (next !== mode) { retries = []; mode = next; warning = false; }
    try {
      const saved = JSON.parse(storage()?.getItem(KEY) || 'null');
      const incoming = saved?.version === 1 && Array.isArray(saved.records) ? saved.records.filter(valid) : [];
      retries = [...new Map([...incoming, ...retries].map(r => [r.token, {id:r.id, token:r.token, answer:r.answer, correct:r.correct, at:r.at}])).values()].sort((a,b) => a.at-b.at).slice(-LIMIT);
    } catch { warning = true; }
  }
  function record(id, answer, correct) {
    read();
    const entry={id, answer, correct, at:Date.now(), token:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)};
    retries.push(entry);
    retries = retries.slice(-LIMIT);
    try { storage()?.setItem(KEY, JSON.stringify({version:1,records:retries})); } catch { warning = true; }
    saveView(id,entry.token); return entry;
  }
  function notice() {
    read();
    return `<details class="mr-notice"><summary>记录说明${warning ? ' · 保存受限' : ''}</summary><p class="small">${warning ? '浏览器未能可靠读取或保存重做记录；本次作答仍可继续，建议导出备份。' : mode === 'local' ? '重做记录保存在此浏览器，不跨设备同步。' : mode === 'session' ? '重做记录仅在当前标签页保留，关闭标签页后清除。' : '尚未选择保存方式，重做记录仅在本次打开期间保留，刷新后会消失。'} 重做不改变首次作答成绩；最多保留最近 ${LIMIT} 次。</p></details>`;
  }
  function firstAttempts() {
    const map = new Map();
    const add = r => { if (!parseId(r?.id) || typeof r.correct !== 'boolean' || !Number.isFinite(r.at) || r.at <= 0) return; const prev = map.get(r.id); if (!prev || r.at < prev.at) map.set(r.id,r); };
    for (const r of window.LearningInsights?.exportData?.().records || []) add({...r});
    for (const r of window.ExamPractice?.getResults?.() || []) add({id:'exam:'+r.questionId, correct:r.correct, at:r.attemptedAt, skill:r.skillLabel || r.skill});
    return [...map.values()].filter(r => !r.correct).sort((a,b) => b.at-a.at);
  }
  function entryHTML() { const n = firstAttempts().length; return `<details class="account-data"><summary>错题回顾${n ? ' · '+n+' 题' : ''}</summary><p class="small">先独立重做，再看原文线索与解析。首次作答记录保持不变。</p><button class="quiet" id="accountMistakes">${n ? '开始回顾 →' : '查看错题回顾 →'}</button></details>`; }
  function styles() {
    if (document.getElementById('mistake-review-styles')) return;
    const s = document.createElement('style'); s.id='mistake-review-styles';
    s.textContent='.mr-home{max-width:680px}.mr-home h1{font:400 32px/1.3 var(--serif);margin:22px 0 12px}.mr-home h2{font:400 23px/1.6 var(--serif)}.mr-passage{font:19px/1.9 var(--serif);overflow-wrap:anywhere;margin:25px 0}.mr-choices{border:0;padding:0;margin:20px 0;min-width:0}.mr-option{display:flex;gap:12px;padding:14px 4px;border-bottom:1px solid var(--line);line-height:1.65;cursor:pointer}.mr-option input{accent-color:var(--green);margin-top:6px;flex-shrink:0}.mr-option:focus-within{outline:2px solid var(--green);outline-offset:3px}.mr-actions{display:flex;gap:20px;flex-wrap:wrap;margin:24px 0}.mr-actions button{min-height:44px}.mr-feedback{border-left:2px solid var(--green);padding:2px 0 2px 18px;margin:28px 0;line-height:1.85}.mr-home .small{line-height:1.85}.mr-home button:disabled{opacity:.45}.mr-home details{margin:24px 0}.mr-notice{margin-top:32px}.mr-home .account-item{width:100%;text-align:left}.mr-context-link{display:inline-block;margin-top:12px}';
    document.head.appendChild(s);
  }
  const back = '<svg class="ui-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6M8 12h12"/></svg>';
  function header() { return `<button class="ui-icon-button back" data-mr-back aria-label="返回上一页">${back}</button><h1>错题回顾</h1>`; }
  function bindBack(el, fallback) { window.AppNav?.bind(el.querySelector('[data-mr-back]'), fallback); }
  function questionValid(q) { return q && typeof (q.prompt || q.question) === 'string' && Array.isArray(q.options) && q.options.length >= 2 && q.options.length < 100 && q.options.every(x=>typeof x==='string') && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length; }
  async function resolve(id, entries) {
    const m = parseId(id); if (!m) throw Error('id');
    if (id.startsWith('exam:')) {
      for (const p of window.ExamPractice?.getPacks?.() || []) { const q = p.questions.find(q=>q.id === m[1]); if (questionValid(q)) return {q, title:p.title, paragraphs:[p.passage], label:p.label+' · 原创专项练习', open:()=>window.ExamPractice.openQuestion(q.id)}; }
      throw Error('missing');
    }
    const source = entries.find(r=>r.id===m[1]); if (!source) throw Error('missing');
    let r = source;
    if (source.contentPath && !source.loaded) {
      // Resolve only a known catalog path, never a path derived from a stored question ID.
      const response = await fetch(source.contentPath); if (!response.ok) throw Error('fetch');
      const full = await response.json(); if (full.id !== source.id) throw Error('content');
      r = {...source, ...full};
    }
    const q = r.questions?.[Number(m[2])];
    if (!questionValid(q) || !Array.isArray(r.paragraphs) || !r.paragraphs.every(p=>typeof p==='string')) throw Error('content');
    return {q, title:r.title, paragraphs:r.paragraphs, label:r.isNews ? '新闻学习改写 · 原创理解题' : '阅读 · 原创理解题', open:()=>{location.hash='read/'+source.id;}};
  }
  async function render(el, {route='mistakes', entries=[]} = {}) {
    cleanup(); container=el; const ticket=generation, hash=location.hash;
    const current=()=>generation===ticket && container===el && el.isConnected && location.hash===hash;
    styles(); read();
    const rows=firstAttempts(), id=idFor(route);
    if (route === 'mistakes') {
      let shown=30;
      const drawList=()=>{
        if(!current())return;
        el.innerHTML=`<section class="library mr-home">${header()}<p class="small">首次答错的题会留在这里。重做答对后仍可回顾，不会改写原成绩。</p><div data-mr-list>${rows.slice(0,shown).map(r=>{const m=parseId(r.id), exam=r.id.startsWith('exam:'), p=exam?(window.ExamPractice?.getPacks?.()||[]).find(p=>p.questions.some(q=>q.id===m[1])):null, article=!exam?entries.find(x=>x.id===m[1]):null, attempts=retries.filter(x=>x.id===r.id), latest=attempts.at(-1);return `<button class="account-item" data-mr-id="${E(r.id)}"><span class="account-item-title">${E(exam?p?.title||'专项练习':article?.title||'原文章暂不可用')}</span><span class="small">${E(r.skill||'阅读理解')}${!exam?' · 第 '+(Number(m[2])+1)+' 题':''} · ${latest?'已重做 '+attempts.length+' 次':'尚未重做'}</span><span aria-hidden="true">→</span></button>`;}).join('') || '<p class="empty">还没有首次答错的题。完成阅读题或专项练习后，再来这里看看。</p>'}</div>${shown<rows.length?'<button class="quiet" data-mr-more>展开更多</button>':''}${notice()}</section>`;
        bindBack(el,'account');
        el.querySelectorAll('[data-mr-id]').forEach(b=>b.onclick=()=>{if(current()&&b.isConnected)location.hash=routeFor(b.dataset.mrId)});
        const more=el.querySelector('[data-mr-more]'); if(more)more.onclick=()=>{if(current()&&more.isConnected){shown+=30;drawList()}};
      };drawList();return;
    }
    if(!id || !rows.some(r=>r.id===id)) {
      el.innerHTML=`<section class="library mr-home">${header()}<p class="empty">没有找到这道题的首次答错记录。仅本次保留的记录可能已随页面关闭或刷新清除。</p></section>`;bindBack(el,'mistakes');return;
    }
    el.innerHTML=`<section class="library mr-home">${header()}<p role="status">正在翻开原文…</p></section>`;bindBack(el,'mistakes');
    let source;
    try { source=await resolve(id,entries); }
    catch {
      if(!current())return;
      el.innerHTML=`<section class="library mr-home">${header()}<p role="status">原文或题目暂时无法打开，原来的作答记录没有改变。</p><button class="quiet" data-mr-retry>重新打开</button></section>`;bindBack(el,'mistakes');
      const retry=el.querySelector('[data-mr-retry]'); retry.onclick=()=>{if(current()&&retry.isConnected)render(el,{route,entries})};return;
    }
    if(!current())return;
    const {q}=source;
    const restored=retries.find(r=>r.id===id && r.token===views[id] && r.answer<q.options.length && r.correct===(r.answer===q.answer));
    let result=restored ? {answer:restored.answer,correct:restored.correct} : null, drawVersion=0;
    const tfng=q.options.length===3 && q.options.join('|')==='True|False|Not Given';
    function draw(focus=false) {
      if(!current())return;
      const version=++drawVersion, live=()=>current()&&version===drawVersion;
      el.innerHTML=`<section class="library mr-home">${header()}<p class="small">${E(source.label)} · ${E(source.title)}</p><div class="mr-passage" lang="en">${source.paragraphs.map(p=>'<p>'+E(p)+'</p>').join('')}</div><h2 id="mr-question" tabindex="-1" lang="en">${E(q.prompt||q.question)}</h2><form data-mr-form><fieldset class="mr-choices" ${result?'disabled':''}><legend>先独立选择，再查看解析</legend>${q.options.map((option,i)=>`<label class="mr-option"><input type="radio" name="mr-answer" value="${i}" ${result?.answer===i?'checked':''}><span lang="en">${tfng?'':String.fromCharCode(65+i)+'. '}${E(option)}</span></label>`).join('')}</fieldset>${result?'':'<button type="submit" class="primary" disabled data-mr-submit>确认答案</button>'}</form><div aria-live="polite" aria-atomic="true">${result?`<div class="mr-feedback" tabindex="-1" data-mr-feedback><strong>${result.correct?'这次答对了':'再对照原文看看'}</strong><p>本次选择：${E(q.options[result.answer])}<br>正确答案：${E(q.options[q.answer])}</p>${q.evidence?`<p class="small">相关原句</p><p lang="en">${E(q.evidence)}</p>`:'<p class="small">请结合上方原文与下面的解析回看线索。</p>'}<p>${E(q.explanation||'这道题暂未提供详细解析，请回到原文核对。')}</p><p class="small">这是单独的重做记录，首次作答成绩保持不变。</p></div>`:''}</div><div class="mr-actions">${result?'<button class="quiet" data-mr-again>再独立做一次</button><button class="quiet" data-mr-listback>返回错题列表 →</button>':''}<button class="quiet" data-mr-source>打开原文所在页 ↗</button></div>${notice()}</section>`;
      bindBack(el,'mistakes');
      const form=el.querySelector('[data-mr-form]'), submit=el.querySelector('[data-mr-submit]');
      form.onchange=()=>{if(live()&&submit)submit.disabled=!form.querySelector('input:checked')};
      form.onsubmit=e=>{
        e.preventDefault(); if(!live()||result)return;
        const input=form.querySelector('input:checked'), answer=input?Number(input.value):-1;
        if(!Number.isInteger(answer)||answer<0||answer>=q.options.length)return;
        result={answer,correct:answer===q.answer}; record(id,answer,result.correct); draw();el.querySelector('[data-mr-feedback]')?.focus();
      };
      el.querySelector('[data-mr-source]').onclick=()=>{if(live()){drawVersion++;source.open()}};
      const again=el.querySelector('[data-mr-again]');if(again)again.onclick=()=>{if(live()){result=null;saveView(id,'');draw(true)}};
      const list=el.querySelector('[data-mr-listback]');if(list)list.onclick=()=>{if(live())location.hash='mistakes'};
      if(focus)el.querySelector('#mr-question')?.focus();
    }
    draw();
  }
  function cleanup(){generation++;container=null}
  function exportData(){read();return {version:1,records:retries.map(r=>({...r}))}}
  window.MistakeReview={replaceBackup:value=>{mode=storageMode();retries=value.records.map(r=>({...r}))},render,cleanup,entryHTML,exportData};
})();
