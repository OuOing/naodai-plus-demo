/* Sentence listening: optional device speech, no recordings or speech scoring. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SentenceListening=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
function splitParagraph(text,p){
  // All ranges refer to untouched UTF-16 source text, as reader annotations do.
  const out=[];let start=0;
  const push=end=>{let a=start,b=end;while(a<b&&/\s/.test(text[a]))a++;while(b>a&&/\s/.test(text[b-1]))b--;if(b>a)out.push({text:text.slice(a,b),start:a,end:b,paragraphIndex:p});start=end;};
  for(let i=0;i<text.length;i++){
    if(!/[.!?]/.test(text[i]))continue;
    if(text[i]==='.'&&/\d/.test(text[i-1]||'')&&/\d/.test(text[i+1]||''))continue;
    if(text[i]==='.'&&text[i+1]==='.')continue;
    const prefix=text.slice(start,i+1);
    if(text[i]==='.'&&/(?:\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc|e\.g|i\.e)|\b[A-Z]|\b(?:[A-Za-z]\.)+[A-Za-z])\.$/i.test(prefix))continue;
    let end=i+1;while(end<text.length&&/[.!?"'”’)]/.test(text[end]))end++;
    if(end<text.length&&!/\s/.test(text[end]))continue;
    push(end);i=end-1;
  }
  push(text.length);return out;
}
function sentences(paragraphs,selected){
  const out=paragraphs.flatMap((t,p)=>splitParagraph(t,p));
  // Respect verified curated/reader sentence boundaries for the initial selection.
  const p=selected?.paragraphIndex;
  if(selected&&Number.isInteger(p)&&paragraphs[p]?.slice(selected.start,selected.end)===selected.text){
    const hits=out.map((s,i)=>s.paragraphIndex===p&&s.start<selected.end&&s.end>selected.start?i:-1).filter(i=>i>=0);
    if(hits.length){const first=hits[0],last=hits[hits.length-1],a=out[first],b=out[last],replacement=[];
      if(a.start<selected.start&&paragraphs[p].slice(a.start,selected.start).trim())replacement.push({text:paragraphs[p].slice(a.start,selected.start),start:a.start,end:selected.start,paragraphIndex:p});
      replacement.push({...selected});
      if(b.end>selected.end&&paragraphs[p].slice(selected.end,b.end).trim())replacement.push({text:paragraphs[p].slice(selected.end,b.end),start:selected.end,end:b.end,paragraphIndex:p});
      out.splice(first,last-first+1,...replacement);
    }
  }
  return out;
}
function normalize(text){return String(text).normalize('NFKC').toLowerCase().replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[^\p{L}\p{N}'\s]/gu,' ').replace(/\s+/g,' ').trim();}
function compare(input,original){return {matches:normalize(input)===normalize(original),original:String(original)};}
function createController(env,onChange=()=>{}){
  const synth=env.speechSynthesis,U=env.SpeechSynthesisUtterance;
  const schedule=env.setTimeout?.bind(env)||setTimeout,unschedule=env.clearTimeout?.bind(env)||clearTimeout;
  let state='idle',message='',token=0,current=null,timer=null,disposed=false;
  const available=!!(synth&&U&&typeof synth.speak==='function');
  const emit=(next,msg='')=>{state=next;message=msg;if(!disposed)onChange({state,message});};
  const clear=()=>{if(timer!==null)unschedule(timer);timer=null;};
  const voices=()=>{try{return available?synth.getVoices().filter(v=>/^en(?:[-_]|$)/i.test(v.lang||'')):[];}catch{return [];}};
  const choose=allowRemote=>voices().find(v=>v.localService===true)||(allowRemote?voices()[0]:null);
  function stop(quiet=false){token++;clear();current=null;try{synth?.cancel();if(synth?.paused)synth.resume();}catch{}if(!quiet)emit('idle');}
  function watch(id,msg){clear();timer=schedule(()=>{if(id!==token||disposed)return;stop(true);emit('error',msg);},8000);}
  function play(text,{rate=.85,allowRemote=false}={}){
    stop(true);if(disposed)return false;
    if(!available){emit('unavailable','此浏览器不支持设备朗读，可以查看原句或换用支持朗读的浏览器');return false;}
    const voice=choose(allowRemote);
    if(!voice){emit('unavailable',voices().length?'没有可用的本机英语语音；可在下方选择是否允许可能联网的设备语音':'尚未找到英语语音，请在设备设置中添加英语语音后重试');return false;}
    const id=token,u=new U(text);current=u;u.lang=voice.lang;u.voice=voice;u.rate=[.75,.85,1].includes(Number(rate))?Number(rate):.85;
    const live=()=>!disposed&&id===token&&current===u;
    u.onstart=()=>{if(live()){clear();emit('playing');}};
    u.onend=()=>{if(live()){clear();current=null;emit('ended');}};
    u.onerror=e=>{if(live()){stop(true);emit('error',e?.error==='not-allowed'?'设备未允许朗读，请再次点击播放':'设备朗读未成功，请重试或查看原句');}};
    u.onpause=()=>{if(live()){clear();emit('paused');}};
    u.onresume=()=>{if(live()){clear();emit('playing');}};
    emit('starting','正在请求设备语音…');watch(id,'设备语音没有开始，请重试或查看原句');
    try{synth.speak(u);}catch{if(live()){stop(true);emit('error','此设备无法开始朗读，请查看原句');}return false;}return true;
  }
  function pause(){if(state!=='playing'||!current)return;const id=token;emit('pausing','正在暂停…');watch(id,'设备未能暂停，已停止；可以重播');try{synth.pause();}catch{stop(true);emit('error','设备不支持暂停，已停止；可以重播');}}
  function resume(){if(state!=='paused'||!current)return;const id=token;emit('starting','正在继续…');watch(id,'设备未能继续，请重播');try{synth.resume();}catch{stop(true);emit('error','设备未能继续，请重播');}}
  const changed=()=>{if(!disposed)onChange({state,message,voicesChanged:true});};
  synth?.addEventListener?.('voiceschanged',changed);
  return {play,pause,resume,stop,voices,choose,get state(){return state;},get available(){return available;},destroy(){stop(true);disposed=true;synth?.removeEventListener?.('voiceschanged',changed);}};
}
let mounted=null;
function close(){if(mounted){const old=mounted;mounted=null;old();}}
function mount({host,paragraphs,selected,env=window}){
  close();if(!host||!paragraphs?.length)return;
  const doc=host.ownerDocument,list=sentences(paragraphs,selected);if(!list.length)return;
  let index=list.findIndex(s=>s.paragraphIndex===selected.paragraphIndex&&s.start===selected.start);if(index<0)index=0;
  const section=doc.createElement('section');section.className='sl-widget';
  section.innerHTML=`<button class="pill sl-open" type="button" aria-expanded="false" aria-controls="sl-panel"><svg class="ui-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="M4 14v-3a8 8 0 0 1 16 0v3M4 12H3v7h4v-7H4zm16 0h1v7h-4v-7h3z"/></svg> 听这句话</button>
    <div id="sl-panel" class="sl-panel" hidden>
      <p class="sl-heading">设备朗读 <span class="sl-position"></span></p>
      <p class="small">这是设备合成语音，不是真人录音。先听，再按需要显示原句。</p>
      <p class="sl-voice small"></p>
      <label class="sl-remote small"><input type="checkbox"> 允许可能联网的设备语音（原句可能由系统发送给语音服务商）</label>
      <div class="sl-controls"><button type="button" class="pill sl-prev" aria-label="上一句">上一句</button><button type="button" class="primary sl-play">播放</button><button type="button" class="pill sl-replay">重播</button><button type="button" class="pill sl-next" aria-label="下一句">下一句</button></div>
      <div class="sl-options"><label>语速 <select class="sl-rate" aria-label="朗读速度"><option value=".75">慢速 0.75×</option><option value=".85" selected>舒缓 0.85×</option><option value="1">正常 1×</option></select></label><button type="button" class="quiet sl-reveal" aria-expanded="false" aria-controls="sl-transcript">显示原句</button></div>
      <p class="small sl-status" role="status" aria-live="polite"></p><p id="sl-transcript" class="sentence sl-transcript" lang="en" hidden></p>
      <details class="sl-practice"><summary>试着听写这一句</summary><label class="small" for="sl-answer">写下听到的内容（仅本次打开使用）</label><textarea id="sl-answer" class="sl-answer" maxlength="2000" autocomplete="off" spellcheck="false" placeholder="听一句，写一句"></textarea><button type="button" class="pill sl-check">与原句对照并显示原句</button><p class="small sl-result" role="status"></p><p class="small">只对照原文，忽略大小写和常见标点；不评估发音，也不评分。</p></details>
    </div>`;
  const original=doc.createElement('div');original.className='sl-original';while(host.firstChild)original.append(host.firstChild);host.append(section,original);
  const q=s=>section.querySelector(s),panel=q('.sl-panel'),open=q('.sl-open'),play=q('.sl-play'),status=q('.sl-status'),transcript=q('.sl-transcript'),reveal=q('.sl-reveal'),remote=q('.sl-remote input'),rate=q('.sl-rate'),answer=q('.sl-answer'),result=q('.sl-result');
  let expanded=false,revealed=false,dead=false,controller;
  function voiceUI(){const voice=controller.choose(remote.checked),all=controller.voices(),local=all.some(v=>v.localService===true);q('.sl-remote').hidden=local||!controller.available;q('.sl-voice').textContent=voice?(voice.localService===true?'本机语音：':'可能联网的设备语音：')+voice.name:!controller.available?'当前浏览器不支持设备朗读':all.length?'尚未选择语音：本机英语语音不可用':'英语语音尚未就绪；可在设备设置中添加英语语音后重试';}
  controller=createController(env,({state,message})=>{if(dead)return;voiceUI();play.textContent=state==='playing'?'暂停':state==='paused'?'继续':state==='starting'?'等待语音…':state==='pausing'?'正在暂停…':'播放';play.disabled=['starting','pausing'].includes(state)||!controller.available;status.textContent=message||({playing:'正在朗读',paused:'已暂停',ended:'这一句读完了',idle:''}[state]||'');});
  function showText(value){revealed=value;transcript.hidden=!value;transcript.textContent=value?list[index].text:'';reveal.textContent=value?'隐藏原句':'显示原句';reveal.setAttribute('aria-expanded',String(value));if(!value)result.textContent='';}
  function render(){q('.sl-position').textContent=`第 ${index+1} / ${list.length} 句`;q('.sl-prev').disabled=index===0;q('.sl-next').disabled=index===list.length-1;showText(revealed);voiceUI();play.disabled=!controller.available;q('.sl-replay').disabled=!controller.available;}
  open.onclick=()=>{expanded=!expanded;panel.hidden=!expanded;original.hidden=expanded;open.setAttribute('aria-expanded',String(expanded));open.textContent=expanded?'收起听句 · 返回讲解':'听这句话';if(!expanded){controller.stop();}else{showText(false);render();}};
  const playCurrent=()=>controller.play(list[index].text,{rate:Number(rate.value),allowRemote:remote.checked});
  play.onclick=()=>{if(controller.state==='playing')controller.pause();else if(controller.state==='paused')controller.resume();else playCurrent();};
  q('.sl-replay').onclick=playCurrent;
  function move(delta){controller.stop();index=Math.min(list.length-1,Math.max(0,index+delta));answer.value='';result.textContent='';revealed=false;render();}
  q('.sl-prev').onclick=()=>move(-1);q('.sl-next').onclick=()=>move(1);
  rate.onchange=()=>{controller.stop();status.textContent='语速已更改，点击播放即可使用';};remote.onchange=()=>{controller.stop();voiceUI();};
  reveal.onclick=()=>showText(!revealed);
  q('.sl-check').onclick=()=>{if(!answer.value.trim()){result.textContent='先写下一点听到的内容，再与原句对照';return;}showText(true);result.textContent=compare(answer.value,list[index].text).matches?'和原句一致（已忽略大小写和常见标点）':'与原句有不同，看看上方原文，再听一次';};
  const stop=()=>close();const dialog=host.closest('dialog');env.addEventListener?.('hashchange',stop);env.addEventListener?.('pagehide',stop);dialog?.addEventListener('close',stop);dialog?.addEventListener('cancel',stop);
  mounted=()=>{dead=true;controller.destroy();env.removeEventListener?.('hashchange',stop);env.removeEventListener?.('pagehide',stop);dialog?.removeEventListener('close',stop);dialog?.removeEventListener('cancel',stop);if(original.parentNode===host){while(original.firstChild)host.insertBefore(original.firstChild,original);original.remove();section.remove();}};
  render();return {close,controller};
}
return {mount,close,createController,splitParagraph,sentences,compare};
});
