/* Local evidence, not a mastery score. First answers are immutable; retries stay separate. */
(()=>{'use strict';
const KEY='naodai-learning-insights-v1',LIMIT=5000,MIN_COMPARE=10;
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let records=Object.create(null),hintedIds=new Set(),failed=false,mode=null;
const choice=()=>window.ReaderTools?.storageChoice?.();
const storage=()=>choice()==='local'?localStorage:choice()==='session'?sessionStorage:null;
const validTime=(at,now=Date.now())=>Number.isSafeInteger(at)&&at>0&&at<=now;
function catalog(){const out=Object.assign(Object.create(null),window.LEARNING_QUESTION_CATALOG||{});for(const p of window.ExamPractice?.getPacks?.()||[])for(const q of p.questions||[])out['exam:'+q.id]={skill:q.skill,label:q.skillLabel||q.skill};return out}
function normalize(x,now=Date.now(),known=catalog()){
 if(!x||typeof x.id!=='string'||!Object.hasOwn(known,x.id)||typeof x.correct!=='boolean'||!validTime(x.at,now))return null;
 const q=known[x.id];return{id:x.id,skill:q.skill||'reading.general',skillLabel:q.label||q.skill||'阅读理解',correct:x.correct,at:x.at,...(x.hinted===true?{hinted:true}:{}),...(x.imported===true||x.verified===false||x.unverified===true?{imported:true,verified:false}:{})};
}
function merge(incoming){const known=catalog();for(const x of Array.isArray(incoming)?incoming:[]){const n=normalize(x,Date.now(),known);if(!n)continue;const prev=records[n.id];if(!prev)records[n.id]=n;/* Existing first answers cannot be rewritten by refresh or restore. */}records=Object.assign(Object.create(null),Object.fromEntries(Object.values(records).sort((a,b)=>b.at-a.at).slice(0,LIMIT).map(x=>[x.id,x])))}
function read(){const next=choice()||'memory';if(mode!==null&&next!==mode){records=Object.create(null);hintedIds=new Set()}mode=next;if(!storage())return;try{const x=JSON.parse(storage().getItem(KEY)||'null');if(x?.version===1){merge((x.records||[]).slice().sort((a,b)=>a.at-b.at));const known=catalog();for(const id of x.hintedIds||[])if(Object.hasOwn(known,id))hintedIds.add(id)}}catch{failed=true}}
function write(){if(!storage())return true;try{storage().setItem(KEY,JSON.stringify({version:1,records:Object.values(records),hintedIds:[...hintedIds]}));failed=false;return true}catch{failed=true;return false}}
function markHint(id){read();if(!Object.hasOwn(catalog(),id))return false;hintedIds.add(id);write();return true}
function record({id,skill,correct,at=Date.now(),hinted=false}={}){read();const x=normalize({id,skill,correct,at,hinted:hinted||hintedIds.has(id)});if(!x||records[id])return false;records[id]=x;merge([]);write();return true}

function allRows(){read();const known=catalog(),rows=Object.values(records).map(r=>normalize(r,Date.now(),known)).filter(Boolean);for(const r of window.ExamPractice?.getResults?.()||[]){const x=normalize({id:'exam:'+r.questionId,correct:r.correct,at:r.attemptedAt,hinted:r.hinted,imported:r.imported,verified:r.verified},Date.now(),known);if(x)rows.push(x)}const byId=new Map();for(const r of rows.sort((a,b)=>a.at-b.at))if(!byId.has(r.id))byId.set(r.id,r);return[...byId.values()]}
const tally=rows=>({total:rows.length,correct:rows.filter(r=>r.correct).length});
function range(days,offset=0,now=Date.now()){const end=new Date(now);end.setHours(0,0,0,0);end.setDate(end.getDate()+1-offset);const start=new Date(end);start.setDate(start.getDate()-days);return{start:+start,end:Math.min(+end,now+1),calendarEnd:+end}}
function within(rows,r){return rows.filter(x=>x.at>=r.start&&x.at<r.end)}
function period(rows,days,now){const currentRange=range(days,0,now),previousRange=range(days,days,now),current=tally(within(rows,currentRange)),previous=tally(within(rows,previousRange));return{days,currentRange,previousRange,current,previous,comparable:current.total>=MIN_COMPARE&&previous.total>=MIN_COMPARE,delta:current.total&&previous.total?Math.round(100*(current.correct/current.total-previous.correct/previous.total)):null}}
function summary(now=Date.now()){const all=allRows(),rows=all.filter(r=>!r.imported&&r.verified!==false&&!r.hinted),skills=Object.create(null);for(const r of within(rows,range(30,0,now))){const s=skills[r.skill]||(skills[r.skill]={label:r.skillLabel,total:0,correct:0});s.total++;s.correct+=Number(r.correct)}return{...tally(rows),skills,periods:[period(rows,7,now),period(rows,30,now)],hinted:all.filter(r=>r.hinted&&!r.imported).length,imported:all.filter(r=>r.imported||r.verified===false).length,lastAt:rows.reduce((n,r)=>Math.max(n,r.at),0),local:choice()==='local'&&!failed,failed}}
function dateLabel(at){return new Date(at).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'})}
function periodHTML(p){const count=s=>`${s.correct} / ${s.total} 题`;return`<p class="small">近 ${p.days} 天（${dateLabel(p.currentRange.start)}—${dateLabel(p.currentRange.end-1)}）：${count(p.current)}；前 ${p.days} 天：${count(p.previous)}。${p.comparable?`本期答对比例${p.delta===0?'与前期相同':p.delta>0?'高 '+p.delta+' 个百分点':'低 '+Math.abs(p.delta)+' 个百分点'}；题目不同，仅供观察。`:`样本不足，暂不判断变化（每期至少 ${MIN_COMPARE} 道不同题）。`}</p>`}
function selfRating(now){const data=window.ReviewEngine?.exportData?.(),seen=new Set();let total=0,correct=0;for(const e of data?.events||[]){if(!e||typeof e.token!=='string'||seen.has(e.token)||!validTime(e.at,now)||!e.delayed||!['again','recalled'].includes(e.response)||e.imported||e.verified===false||e.unverified)continue;seen.add(e.token);if(e.at<range(30,0,now).start)continue;total++;correct+=Number(e.response==='recalled')}return{total,correct}}
function suggestion(s){const weak=Object.values(s.skills).filter(v=>v.total>=5&&v.correct/v.total<.6).sort((a,b)=>a.correct/a.total-b.correct/b.total)[0];const raw=window.ReviewEngine?.stats?.(),due=Number.isSafeInteger(raw?.dueCount)&&raw.dueCount>=0?raw.dueCount:null;let out=due>0?`复习记录中有 ${due} 项已到期，可以先做一小轮回忆。`:due===0?'现有复习记录暂没有到期项。':'暂时无法确认到期复习数量。';if(weak)out+=`近 30 天「${weak.label}」首次答对 ${weak.correct} / ${weak.total} 题，可回原文找线索，再做同类新题。`;else out+='有余力时读一篇，独立完成新题后再看解析。';return out}
function activeSummary(now=Date.now()){
 const api=window.ActiveRecall;if(!api?.feedbackReady?.())return null;
 const groups={spelling:{total:0,correct:0,words:new Set()},cloze:{total:0,correct:0,words:new Set()},recognition:{total:0,correct:0,words:new Set()}},tokens=new Set(),firsts=new Set();
 for(const e of [...(api.exportData?.().events||[])].sort((a,b)=>a.at-b.at)){
  if(!api.validEventForFeedback?.(e)||!validTime(e.at,now)||tokens.has(e.token)||e.imported||e.verified===false||e.unverified)continue;tokens.add(e.token);
  if(!e.firstAttempt||!groups[e.mode])continue;const first=JSON.stringify([e.round,e.key,e.mode]);if(firsts.has(first))continue;firsts.add(first);
  if(e.at<range(30,0,now).start)continue;const g=groups[e.mode];
  if(e.mode==='recognition'){if(!['self-recalled','self-again'].includes(e.outcome))continue;g.total++;g.correct+=Number(e.outcome==='self-recalled')}
  else{if(!['correct','incorrect'].includes(e.outcome)||!['correct','incorrect'].includes(e.objective))continue;g.total++;g.correct+=Number(e.outcome==='correct'&&e.objective==='correct')}
  g.words.add(e.key);
 }
 return Object.fromEntries(Object.entries(groups).map(([k,g])=>[k,{total:g.total,correct:g.correct,unique:g.words.size}]));
}
function activeHTML(){const s=activeSummary();if(!s)return'<p class="small">主动回忆：词表尚未载入，暂不统计；打开词汇学习后可查看可核验的记录。</p>';const labels={spelling:'看义拼词',cloze:'语境填词',recognition:'词义识别自评'};return`<details><summary>主动回忆 · 近 30 天</summary>${Object.entries(s).map(([k,g])=>`<p class="small">${labels[k]} · ${g.correct} / ${g.total} 次${k==='recognition'?'反馈想起来了':'无提示答对'}，涉及 ${g.unique} 个不同词项${g.unique<5?'；样本少，暂不判断变化':''}。</p>`).join('')}<p class="small">每轮每个词项只计首次作答；重试、提示及直接看答案不计入。隔天重测可再次计次，因此次数不等于词汇量；词义识别是自评，与拼词、填词分开看。</p></details>`}

function html(){const s=summary(),self=selfRating(Date.now());return`<details class="account-data learning-feedback"><summary>学习反馈</summary><p>独立首次作答 · 答对 ${s.correct} / ${s.total} 题</p><p class="small">每道题只计第一次，重选、重做、提示后作答和导入记录不增加独立作答成绩。日期按此设备本地时区，今天尚未结束。</p>${s.periods.map(periodHTML).join('')}${s.lastAt&&s.lastAt<range(30).start?'<p class="small">近 30 天没有独立新题记录，旧成绩不能代表现在的状态。</p>':''}${s.hinted?`<p class="small">另有 ${s.hinted} 道首次作答使用过提示，单独保留，不用于上述比较。</p>`:''}${s.imported?`<p class="small">${s.imported} 道导入首次作答仅供回顾，来源无法验证，不用于成绩比较。</p>`:''}<p class="small">${E(suggestion(s))}</p>${Object.values(s.skills).length?`<details><summary>近 30 天题型样本</summary>${Object.values(s.skills).map(v=>`<p class="small">${E(v.label)} · ${v.correct} / ${v.total}${v.total<5?' · 样本少，暂不判断':''}</p>`).join('')}</details>`:''}<p class="small">隔天回忆自评 · 近 30 天 ${self.correct} / ${self.total} 次反馈“想起来了”。这是间隔至少一天的自评，不是客观掌握率。</p>${activeHTML()}<p class="small">这些练习不能证明掌握程度，也不换算考试分数。${s.failed?'浏览器读取或保存受限，本次统计可能不完整。':s.local?'反馈保存在此浏览器，不跨设备同步。':choice()==='session'?'反馈仅在当前标签页保留，关闭后清除。':'当前反馈仅在本次打开期间保留。'}</p></details>`}
function exportData(){read();return{version:1,records:Object.values(records).map(x=>({...x})),hintedIds:[...hintedIds]}}
function restoreData(data){read();for(const id of data?.hintedIds||[])if(Object.hasOwn(catalog(),id))hintedIds.add(id);let added=0;for(const r of data?.version===1&&Array.isArray(data.records)?data.records:[]){const x=normalize({...r,imported:true,verified:false});if(x&&!records[x.id]){records[x.id]=x;added++}}merge([]);const saved=write();return{added,saved}}
function replaceBackup(data){records=Object.create(null);hintedIds=new Set((data?.hintedIds||[]).filter(id=>Object.hasOwn(catalog(),id)));failed=false;mode=choice()||'memory';merge(data?.version===1?data.records:[]);return true}
function reload(){records=Object.create(null);hintedIds=new Set();failed=false;read()}
window.LearningInsights={record,markHint,summary,html,exportData,restoreData,replaceBackup,reload,_test:{range,period,normalize,selfRating,activeSummary}};
addEventListener('storage',e=>{if(e.key===KEY)reload()});
})();
