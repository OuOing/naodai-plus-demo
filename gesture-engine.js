/* Reader gesture recognition. Timing values are product defaults, not Apple requirements. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ReaderGestureEngine=api})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const DEFAULTS=Object.freeze({holdMs:520,movePx:10,doubleTapMs:330,doubleTapPx:24,maxTapMs:300,compatibilityMs:700,nativeDoubleClickMs:1500});
class Controller{
 constructor(options={}){this.options=options;this.config={...DEFAULTS,...options.config};this.now=options.now||(()=>Date.now());this.schedule=options.schedule||((fn,ms)=>setTimeout(fn,ms));this.unschedule=options.unschedule||(id=>clearTimeout(id));this.pointers=new Map();this.suppressed=new Map();this.press=null;this.lastTap=null;this.lastMouseUp=null;this.blocked=false;this.disposed=false}
 enabled(){return !this.disposed&&(!this.options.enabled||this.options.enabled())}
 touchCount(){return [...this.pointers.values()].filter(x=>x!=='mouse').length}
 clearTimer(){if(this.press?.timer!=null)this.unschedule(this.press.timer)}
 prune(){const t=this.now();for(const [key,value]of this.suppressed)if(value.until<t)this.suppressed.delete(key)}
 cancel(reason='cancel',{resetPointers=false,hard=false}={}){this.clearTimer();this.press=null;this.lastTap=null;this.lastMouseUp=null;if(resetPointers){this.pointers.clear();this.blocked=false}if(hard)this.suppressed.clear();this.options.onCancel?.(reason)}
 pointerDown(p){if(this.disposed)return;this.prune();const wasDown=this.pointers.has(p.id);this.pointers.set(p.id,p.type||'mouse');if(!wasDown&&p.key)this.suppressed.delete(p.key);this.lastMouseUp=null;
  if(this.touchCount()>1||p.isPrimary===false||this.blocked){this.blocked=true;this.cancel('multi-pointer');return}
  if(p.button!==0||p.modifiers||!p.key||!this.enabled()){this.cancel('ineligible-start');return}
  if(this.press&&this.press.id!==p.id){this.cancel('mixed-pointer');this.blocked=true;return}
  this.clearTimer();const now=this.now(),last=this.lastTap;const candidate=(p.type!=='mouse'&&last&&last.key===p.key&&last.type===p.type&&now-last.at<=this.config.doubleTapMs&&Math.hypot(p.x-last.x,p.y-last.y)<=this.config.doubleTapPx);if(!candidate)this.lastTap=null;
  const s={...p,type:p.type||'mouse',startedAt:now,status:'pressing',second:!!candidate,timer:null};this.press=s;
  s.timer=this.schedule(()=>{if(this.press!==s)return;if(!this.enabled()||this.blocked||this.touchCount()>1||!this.pointers.has(s.id)){this.cancel('ineligible-hold');return}this.fireWord(s)},this.config.holdMs)
 }
 fireWord(s){if(this.press!==s||s.status!=='pressing')return false;this.clearTimer();s.timer=null;s.status='held';this.lastTap=null;this.lastMouseUp=null;this.suppressed.set(s.key,{id:s.id,type:s.type,until:Infinity});this.options.onWord?.(s.info);return true}
 pointerMove(p){const s=this.press;if(!s||s.id!==p.id)return;if(Math.hypot(p.x-s.x,p.y-s.y)>this.config.movePx)this.cancel('movement')}
 pointerUp(p){this.pointers.delete(p.id);for(const value of this.suppressed.values())if(value.id===p.id&&value.until===Infinity)value.until=this.now()+this.config.compatibilityMs;const s=this.press;if(!this.pointers.size)this.blocked=false;if(!s||s.id!==p.id)return;this.clearTimer();this.press=null;
  if(s.status==='held'){this.lastTap=null;this.lastMouseUp=null;return}
  if(!this.enabled()||this.blocked||p.key!==s.key||Math.hypot(p.x-s.x,p.y-s.y)>this.config.movePx){this.lastTap=null;this.lastMouseUp=null;return}
  const now=this.now(),duration=now-s.startedAt;
  if(s.type==='mouse'){this.lastTap=null;this.lastMouseUp={key:s.key,at:now,info:s.info};return}
  if(duration>this.config.maxTapMs){this.lastTap=null;return}
  if(s.second){this.lastTap=null;this.suppressed.set(s.key,{id:s.id,type:s.type,until:now+this.config.compatibilityMs});this.options.onSentence?.(s.info);return}
  this.lastTap={key:s.key,type:s.type,x:p.x,y:p.y,at:now}
 }
 pointerCancel(p){this.pointers.delete(p.id);if(this.press?.id===p.id||this.blocked){this.cancel('pointer-cancel')}if(!this.pointers.size)this.blocked=false;for(const value of this.suppressed.values())if(value.id===p.id)value.until=this.now()+this.config.compatibilityMs}
 lostCapture(p){if(this.press?.id===p.id)this.pointerCancel(p)}
 shouldSuppressClick(key){this.prune();return !!key&&this.suppressed.has(key)}
 doubleClick(key,info,{modifiers=false}={}){if(!key||modifiers||!this.enabled()||this.shouldSuppressClick(key))return false;const mouse=this.lastMouseUp;if(!mouse||mouse.key!==key||this.now()-mouse.at>this.config.nativeDoubleClickMs)return false;this.cancel('native-double');this.suppressed.set(key,{id:null,type:'mouse',until:this.now()+this.config.compatibilityMs});this.options.onSentence?.(info||mouse.info);return true}
 contextMenu(key,{pointerType=''}={}){if(pointerType==='mouse'){this.cancel('native-context');return false}const s=this.press;if(s&&s.key===key&&s.type!=='mouse'&&this.enabled()&&!this.blocked){this.fireWord(s);return true}if((pointerType==='touch'||pointerType==='pen'||this.touchCount()>0)&&this.shouldSuppressClick(key))return true;this.cancel('native-context');return false}
 reset(reason='reset'){this.cancel(reason,{resetPointers:true,hard:true})}
 dispose(){this.reset('dispose');this.disposed=true}
 snapshot(){return {state:this.press?.status||(this.lastTap?'awaiting-tap':'idle'),pointerId:this.press?.id??null,key:this.press?.key??null,pointers:this.pointers.size,blocked:this.blocked,hasTap:!!this.lastTap,hasMouseUp:!!this.lastMouseUp}}
}
return {Controller,DEFAULTS};
});
