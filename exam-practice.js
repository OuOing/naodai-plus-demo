/* Original, authored practice. No official exam questions, score conversion, or runtime AI. */
(() => {
  'use strict';
  const PACKS = [{"id":"cet4-library-v1","goal":"cet4","label":"四级","title":"A Different Kind of Library","skills":"词语搭配 · 信息定位","passage":"When Lina moved into a small flat, she had little space for tools. A neighbour told her about a library that lent useful objects instead of books. Lina signed up online and borrowed a drill to put up a shelf. Members can keep an item for seven days, but they must return it in person. The library also runs a repair class on Saturday mornings. At first, Lina joined to save money. Now she goes to the class to learn from other members. She still buys things she uses every day, but borrows tools that she needs only occasionally.","questions":[{"id":"cet4-library-collocation-v1","skill":"cet4.collocation","skillLabel":"词语搭配","prompt":"Which phrase means “registered” in the passage?","options":["signed up","put up","keep an item","return it"],"answer":0,"evidence":"Lina signed up online and borrowed a drill to put up a shelf.","explanation":"sign up 意为“报名、注册”，对应 registered；put up a shelf 是“安装架子”，不能混淆两个带 up 的短语。"},{"id":"cet4-library-detail-v1","skill":"cet4.detail","skillLabel":"信息定位","prompt":"How must members return a borrowed object?","options":["By post","Through the website","In person","At a repair class only"],"answer":2,"evidence":"Members can keep an item for seven days, but they must return it in person.","explanation":"题目问归还方式，定位 return it in person，即“亲自归还”。online 描述的是注册方式；Saturday mornings 描述的是课程时间。"},{"id":"cet4-library-purpose-v1","skill":"cet4.detail.change","skillLabel":"目的变化","prompt":"Why does Lina go to the repair class now?","options":["To sell her tools","To learn from other members","To find a larger flat","To borrow books"],"answer":1,"evidence":"Now she goes to the class to learn from other members.","explanation":"now 是定位词，答案来自 Now 开头的句子。At first 的“省钱”是最初动机，不能代替现在参加课程的目的。"}]},{"id":"cet6-office-v1","goal":"cet6","label":"六级","title":"The Quiet Hour","skills":"同义改写 · 推断边界","passage":"A design company introduced a quiet hour during which employees could turn off message alerts. Managers expected faster work, yet the number of completed tasks barely changed. Interviews revealed a different benefit: employees found it easier to return to difficult problems after lunch. Some welcomed the arrangement, while staff who handled urgent customer requests could rarely use it. The company therefore kept the quiet hour but stopped treating it as a universal solution. Teams were asked to adapt the practice to their responsibilities. The experiment suggests that a workplace policy may be valuable even when its most easily counted outcome remains stable. It also shows why an average result can conceal important differences between jobs.","questions":[{"id":"cet6-office-paraphrase-v1","skill":"cet6.paraphrase","skillLabel":"同义改写","prompt":"Which best paraphrases “the number of completed tasks barely changed”?","options":["Employees stopped finishing tasks","Task totals stayed almost the same","Every task took much longer","Task totals rose sharply"],"answer":1,"evidence":"Managers expected faster work, yet the number of completed tasks barely changed.","explanation":"barely changed 表示“几乎没有变化”，对应 stayed almost the same。yet 提示实际结果与管理者的预期不同，但不等于效率大幅下降。"},{"id":"cet6-office-inference-v1","skill":"cet6.inference","skillLabel":"有限推断","prompt":"What can reasonably be inferred about the quiet hour?","options":["It is useless unless task totals rise","All workers benefited equally","It removed the need to answer customers","Its usefulness depended partly on job duties"],"answer":3,"evidence":"Some welcomed the arrangement, while staff who handled urgent customer requests could rarely use it.","explanation":"普通员工与处理紧急客户请求的员工使用条件不同，因此可以推断效果部分取决于岗位职责。原文没有支持 all、useless 或取消客服职责等绝对判断。"},{"id":"cet6-office-measure-v1","skill":"cet6.inference.evaluation","skillLabel":"评价标准","prompt":"Which evaluation approach would the author most likely support?","options":["Combine task totals with accounts of different work experiences","Rank every team only by task totals","Ignore employees whose duties differ","Assume unchanged totals mean the policy failed"],"answer":0,"evidence":"The experiment suggests that a workplace policy may be valuable even when its most easily counted outcome remains stable.","explanation":"作者指出“最容易计数的结果不变”不等于政策没有价值，并提醒平均值会掩盖岗位差异。把数量指标与不同岗位的体验结合，最符合这一论证。"}]},{"id":"postgrad-river-v1","goal":"postgrad","label":"考研","title":"What a Cleaner River Proves","skills":"长句结构 · 论证关系","passage":"After a town opened a new riverside park, volunteers reported less litter along the water. Officials, who had promoted the park as a way to strengthen local pride, presented the change as proof that the project had altered public behaviour. Yet a waste collection service had also begun visiting the river twice as often. Unless the effect of that service is separated from the effect of the park, the reported improvement cannot establish which change mattered more. This does not mean that the park brought no benefits. It means only that an attractive explanation is not necessarily a demonstrated one. A comparison with a similar river where collection increased but no park opened would provide more useful evidence.","questions":[{"id":"postgrad-river-clause-v1","skill":"postgrad.clause","skillLabel":"主干与从句","prompt":"In the sentence beginning “Officials, who had promoted...”, what did the officials do?","options":["Proved that the collection service had failed","Stopped promoting the park","Presented the change as evidence of altered behaviour","Reported that the park had no benefits"],"answer":2,"evidence":"Officials, who had promoted the park as a way to strengthen local pride, presented the change as proof that the project had altered public behaviour.","explanation":"主干是 Officials presented the change as proof。两逗号之间的 who 从句补充说明 officials；that 从句说明 proof 的内容。作者转述官员的说法，并未认可它已被证明。"},{"id":"postgrad-river-argument-v1","skill":"postgrad.argument.alternative","skillLabel":"替代解释","prompt":"Why does the author mention the more frequent collection service?","options":["To claim that local pride never affects behaviour","To introduce another possible cause of the improvement","To show that the river became dirtier","To prove that volunteers counted incorrectly"],"answer":1,"evidence":"Yet a waste collection service had also begun visiting the river twice as often.","explanation":"Yet 引出对官员因果解释的质疑：清洁服务更频繁也可能导致垃圾减少。这是替代原因，不能据此直接断言公园无效或志愿者出错。"},{"id":"postgrad-river-qualification-v1","skill":"postgrad.argument.qualification","skillLabel":"论证限定","prompt":"Which statement best captures the author’s position?","options":["The park definitely had no effect","No comparison could improve the evidence","Officials deliberately hid all the facts","The observation alone cannot isolate the park’s contribution"],"answer":3,"evidence":"Unless the effect of that service is separated from the effect of the park, the reported improvement cannot establish which change mattered more.","explanation":"Unless 引出必要条件：不区分两种因素，就无法确定各自贡献。作者质疑证据的因果解释力，而非断言公园无效，也没有指控官员故意隐瞒。"}]},{"id":"ielts-seed-v1","goal":"ielts","label":"雅思","title":"A Seed-Sharing Scheme","skills":"True / False / Not Given","passage":"Westfield Library began a seed-sharing scheme in March. Visitors can take up to three packets each month without paying. They are encouraged, but not required, to return seeds from the plants they grow. Each packet carries the plant name and basic growing instructions. Volunteers check the shelves every Friday and remove packets with damaged labels. During the first month, tomato seeds were requested more often than any other variety. The library plans to hold a gardening workshop in autumn, although a date has not been announced. A notice near the seed shelf invites visitors to suggest plants they would like the library to offer next year.","questions":[{"id":"ielts-seed-true-v1","skill":"ielts.tfng.true","skillLabel":"判断：同义对应","prompt":"Visitors do not have to pay for the seed packets they take within the monthly limit.","options":["True","False","Not Given"],"answer":0,"evidence":"Visitors can take up to three packets each month without paying.","explanation":"without paying 与 do not have to pay 同义；within the monthly limit 对应每月最多三包，题干与原文一致，选 True。"},{"id":"ielts-seed-false-v1","skill":"ielts.tfng.false","skillLabel":"判断：明确矛盾","prompt":"Everyone who takes seeds must return seeds from the plants they grow.","options":["True","False","Not Given"],"answer":1,"evidence":"They are encouraged, but not required, to return seeds from the plants they grow.","explanation":"题干的 must 与原文 not required 直接矛盾。原文明确说明并非强制，因此选 False，而不是 Not Given。"},{"id":"ielts-seed-notgiven-v1","skill":"ielts.tfng.not-given","skillLabel":"判断：信息缺失","prompt":"The gardening workshop will be led by a professional gardener.","options":["True","False","Not Given"],"answer":2,"evidence":"The library plans to hold a gardening workshop in autumn, although a date has not been announced.","explanation":"这句只交代计划在秋季举办活动，未说明主持人的身份或职业。全文也没有补充这项信息；既不能确认也不能否定，选 Not Given。这里引用的是最相关句，并不是“未提及”的证明句。"}]}];
  // Optional authored packs are loaded before this script; reject incomplete or duplicate data.
  const goals = new Set(PACKS.map(p => p.goal));
  const packIds = new Set(PACKS.map(p => p.id));
  const questionIds = new Set(PACKS.flatMap(p => p.questions.map(q => q.id)));
  const nonempty = value => typeof value === 'string' && value.trim().length > 0;
  for (const candidate of Array.isArray(window.EXAM_EXTRA_PACKS) ? window.EXAM_EXTRA_PACKS : []) {
    if (!candidate || !goals.has(candidate.goal) || !['id', 'label', 'title', 'skills', 'passage'].every(key => nonempty(candidate[key])) || packIds.has(candidate.id) || !Array.isArray(candidate.questions) || !candidate.questions.length) continue;
    const ids = new Set();
    const valid = candidate.questions.every(q => {
      if (!q || !['id', 'skill', 'skillLabel', 'prompt', 'evidence', 'explanation'].every(key => nonempty(q[key])) || questionIds.has(q.id) || ids.has(q.id) || !Array.isArray(q.options) || q.options.length < 2 || !q.options.every(nonempty) || !Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length || !candidate.passage.includes(q.evidence)) return false;
      ids.add(q.id); return true;
    });
    if (!valid) continue;
    const added = {id:candidate.id, goal:candidate.goal, label:candidate.label, title:candidate.title, skills:candidate.skills, passage:candidate.passage, questions:candidate.questions.map(q => ({id:q.id, skill:q.skill, skillLabel:q.skillLabel, prompt:q.prompt, options:[...q.options], answer:q.answer, evidence:q.evidence, explanation:q.explanation}))};
    PACKS.push(added); packIds.add(added.id); ids.forEach(id => questionIds.add(id));
  }
  const KEY = 'naodai-exam-first-attempts-v1';
  const VIEW_KEY = 'naodai-exam-view-v1';
  const SELECTION_KEY = 'naodai-exam-selected-packs-v1';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const allQuestions = new Map(PACKS.flatMap(pack => pack.questions.map(q => [q.id, {q, pack}])));
  let memory = Object.create(null), viewMemory = Object.create(null), selectedMemory = Object.create(null), container = null, options = {}, pack = null, index = 0, generation = 0, storageWarning = false, activeMode = null;
  function validRecord(id, entry) {
    const source = allQuestions.get(id);
    return source && entry && entry.questionId === id && entry.packId === source.pack.id && entry.goal === source.pack.goal && entry.skill === source.q.skill && Number.isInteger(entry.answer) && entry.answer >= 0 && entry.answer < source.q.options.length && entry.correct === (entry.answer === source.q.answer) && Number.isFinite(entry.attemptedAt) && entry.attemptedAt > 0;
  }
  function storageMode() { const choice = window.ReaderTools?.storageChoice?.(); return choice === 'local' || choice === 'session' ? choice : 'memory'; }
  function progressStorage() { return activeMode === 'local' ? localStorage : activeMode === 'session' ? sessionStorage : null; }
  function read() {
    const mode = storageMode();
    if (mode !== activeMode) { memory = Object.create(null); selectedMemory = Object.create(null); activeMode = mode; storageWarning = false; }
    try {
      const storage = progressStorage();
      if (!storage) return memory;
      const saved = JSON.parse(storage.getItem(KEY) || '{}');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        for (const [id, entry] of Object.entries(saved)) {
          if (validRecord(id, entry) && (!memory[id] || entry.attemptedAt < memory[id].attemptedAt)) memory[id] = entry;
        }
      }
    } catch { /* Keep a usable in-memory session when browser storage is unavailable. */ }
    return memory;
  }
  function warnStorage() {
    if (!storageWarning) { storageWarning = true; options.toast?.('练习暂存于本次打开期间；浏览器未能保存进度'); }
  }
  function save() {
    try { progressStorage()?.setItem(KEY, JSON.stringify(memory)); }
    catch { warnStorage(); }
  }
  // Pack selection is navigation metadata. Without learning-data consent, keep IDs in this tab only.
  function selectionStorage() { return activeMode === 'local' ? localStorage : sessionStorage; }
  function loadSelections() {
    try {
      const saved = JSON.parse(selectionStorage().getItem(SELECTION_KEY) || '{}');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        for (const [goal, id] of Object.entries(saved)) {
          if (PACKS.some(p => p.goal === goal && p.id === id)) selectedMemory[goal] = id;
        }
      }
    } catch { /* Ignore invalid or unavailable saved selections. */ }
  }
  function saveSelection() {
    if (!pack) return;
    selectedMemory[pack.goal] = pack.id;
    try { selectionStorage().setItem(SELECTION_KEY, JSON.stringify(selectedMemory)); } catch { warnStorage(); }
  }
  function savedIndex(source, value) {
    // Continue legacy numeric positions; new refresh metadata contains IDs only, never answers.
    if (Number.isInteger(value) && value >= 0 && value <= source.questions.length) return value;
    if (value === '$result') return source.questions.length;
    return typeof value === 'string' ? source.questions.findIndex(q => q.id === value) : -1;
  }
  function loadViews() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(VIEW_KEY) || '{}');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        for (const source of PACKS) {
          if (savedIndex(source, saved[source.id]) >= 0) viewMemory[source.id] = saved[source.id];
        }
      }
    } catch { /* Fall back to the current view. */ }
  }
  function saveView() {
    if (!pack) return;
    viewMemory[pack.id] = index === pack.questions.length ? '$result' : pack.questions[index]?.id;
    try { sessionStorage.setItem(VIEW_KEY, JSON.stringify(viewMemory)); } catch { warnStorage(); }
  }
  function count(source = pack) { return source.questions.filter(q => memory[q.id]).length; }
  function unfinished(source) { return count(source) < source.questions.length; }
  function nextPack() {
    const choices = PACKS.filter(p => p.goal === pack.goal), current = choices.indexOf(pack);
    return [...choices.slice(current + 1), ...choices.slice(0, current)].find(unfinished);
  }
  function selectPack(source, focus = false) {
    if (!source) return;
    read();
    if (pack) saveView();
    pack = source;
    const saved = savedIndex(pack, viewMemory[pack.id]), firstUnanswered = pack.questions.findIndex(q => !memory[q.id]);
    index = saved >= 0 ? saved : firstUnanswered === -1 ? pack.questions.length : firstUnanswered;
    saveSelection(); draw(focus);
  }
  function ensureStyles() {
    if (document.getElementById('exam-practice-styles')) return;
    const style = document.createElement('style');
    style.id = 'exam-practice-styles';
    style.textContent = `.ep-home{max-width:680px}.ep-home h1{font:400 32px/1.3 var(--serif);margin:20px 0 10px}.ep-home h2{font-size:18px;font-weight:500;line-height:1.7}.ep-top{display:flex;gap:14px;align-items:center}.ep-passage{font:19px/1.9 var(--serif);margin:28px 0;overflow-wrap:anywhere}.ep-choices{border:0;padding:0;margin:18px 0;min-width:0}.ep-choices legend{font-size:13px;color:var(--muted);margin-bottom:12px}.ep-option{display:flex;align-items:flex-start;gap:10px;padding:14px 12px;border-bottom:1px solid var(--line);font-size:15px;line-height:1.6;cursor:pointer}.ep-option input{margin:5px 0 0;accent-color:var(--green);flex-shrink:0}.ep-option:focus-within{outline:2px solid var(--green);outline-offset:2px}.ep-feedback{border-left:2px solid var(--green);padding:4px 0 4px 18px;margin:24px 0;line-height:1.8}.ep-evidence{font-family:var(--serif);font-size:17px;overflow-wrap:anywhere}.ep-actions{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:24px}.ep-actions button{min-height:44px}.ep-home details{margin-top:26px;padding-top:18px;border-top:1px solid var(--line)}.ep-home summary{cursor:pointer;font-size:13px;min-height:28px}.ep-home button:disabled{opacity:.45;cursor:default}.ep-result-list{list-style:none;padding:0}.ep-result-list button{width:100%;text-align:left;padding:16px 0;border-bottom:1px solid var(--line);line-height:1.8}.ep-home .small{line-height:1.8}`;
    document.head.appendChild(style);
  }
  const backIcon = '<svg class="ui-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6M8 12h12"/></svg>';
  function notice() {
    const storageText = activeMode === 'local' ? '首次答案按你的选择保存在当前浏览器，清除浏览器数据后将丢失。' : activeMode === 'session' ? '首次答案按你的选择仅在当前标签页保留；刷新可继续，关闭标签页后不再保留。' : '首次答案仅在本次打开期间保留；未选择保存方式，刷新后不会保留。';
    return `<details><summary>练习说明</summary><p class="small">本站原创短文与题目，用于练习具体阅读技能，非官方真题。结果只反映本组 ${pack.questions.length} 道题的首次作答，不代表考试水平或雅思分数。${storageText}不跨设备同步。</p></details>`;
  }
  function packSelector() {
    const choices = PACKS.filter(p => p.goal === pack.goal);
    if (choices.length < 2) return '';
    return `<details data-ep-packs><summary>其他练习</summary><ul class="ep-result-list">${choices.map((p, i) => `<li><button class="quiet" data-ep-pack="${escape(p.id)}" ${p === pack ? 'disabled aria-current="true"' : ''}><span lang="en">${escape(p.title)}</span><br><span class="small">第 ${i + 1} 组 · ${escape(p.skills)} · ${p === pack ? '当前组 · ' : ''}${count(p) === p.questions.length ? '已完成' : count(p) ? `已答 ${count(p)} / ${p.questions.length} 题` : '未开始'}</span></button></li>`).join('')}</ul></details>`;
  }
  function draw(focus = false) {
    if (!container || !pack) return;
    read();
    // Every redraw invalidates handlers on detached forms, not just route changes.
    const ticket = ++generation, activeContainer = container;
    const isCurrent = () => ticket === generation && activeContainer === container && activeContainer.isConnected;
    const done = !unfinished(pack);
    if (index >= pack.questions.length && !done) index = pack.questions.findIndex(q => !memory[q.id]);
    saveView();
    const header = `<div class="ep-top"><button class="ui-icon-button" data-ep-back aria-label="返回阅读">${backIcon}</button><span class="small">阅读 / ${escape(pack.label)}专项</span></div><h1 tabindex="-1" data-ep-title>${escape(pack.title)}</h1><p class="small">${escape(pack.skills)} · 原创练习</p>`;
    if (index === pack.questions.length) {
      const correct = pack.questions.filter(q => memory[q.id].correct).length, next = nextPack();
      container.innerHTML = `<section class="library ep-home">${header}<h2>这组练习已完成</h2><p>首次作答：${correct} / ${pack.questions.length} 题答对</p>${next ? '<div class="ep-actions"><button class="primary" data-ep-next-pack>下一组 →</button></div>' : ''}<ul class="ep-result-list">${pack.questions.map((q, i) => `<li><button data-ep-review="${i}">${i + 1}. ${escape(q.skillLabel)} <span class="small">· ${memory[q.id].correct ? '答对了' : '再看解析'} →</span></button></li>`).join('')}</ul><p class="small">回看解析不会新增作答记录。</p>${packSelector()}${notice()}</section>`;
      container.querySelectorAll('[data-ep-review]').forEach(button => button.onclick = () => { if (!isCurrent()) return; index = Number(button.dataset.epReview); draw(true); });
      const nextButton = container.querySelector('[data-ep-next-pack]');
      if (nextButton) nextButton.onclick = () => { if (isCurrent()) selectPack(next, true); };
    } else {
      const q = pack.questions[index], result = memory[q.id];
      const isTfng = q.options.length === 3 && q.options[0] === 'True' && q.options[1] === 'False' && q.options[2] === 'Not Given';
      container.innerHTML = `<section class="library ep-home">${header}<p class="small">第 ${index + 1} / ${pack.questions.length} 题 · ${escape(q.skillLabel)}</p><div class="ep-passage" lang="en"><p>${escape(pack.passage)}</p></div><h2 id="ep-question" lang="en" tabindex="-1">${escape(q.prompt)}</h2><form data-ep-form><fieldset class="ep-choices" ${result ? 'disabled' : ''}><legend>选择一个答案${isTfng ? '：True 一致 / False 矛盾 / Not Given 未提及' : ''}</legend>${q.options.map((answer, i) => `<label class="ep-option"><input type="radio" name="ep-answer" value="${i}" ${result?.answer === i ? 'checked' : ''}><span lang="en">${isTfng ? '' : String.fromCharCode(65 + i) + '. '}${escape(answer)}</span></label>`).join('')}</fieldset>${!result ? '<button class="primary" type="submit" data-ep-submit disabled>确认答案</button>' : ''}</form><div aria-live="polite" aria-atomic="true">${result ? `<div class="ep-feedback" tabindex="-1" data-ep-feedback><strong>${result.correct ? '答对了' : '再看一下证据'}</strong><p>正确答案：<span lang="en">${escape(q.options[q.answer])}</span></p><p class="small">${isTfng && q.options[q.answer] === 'Not Given' ? '最相关原句（所问信息未在全文中说明）' : '原文证据'}</p><p class="ep-evidence" lang="en">“${escape(q.evidence)}”</p><p>${escape(q.explanation)}</p></div>` : ''}</div><div class="ep-actions"><button class="quiet" data-ep-prev ${index === 0 ? 'disabled' : ''}>上一题</button><button class="quiet" data-ep-next ${!result ? 'disabled' : ''}>${index === pack.questions.length - 1 ? '查看本组结果' : '下一题'} →</button></div>${packSelector()}${notice()}</section>`;
      const form = container.querySelector('[data-ep-form]'), submit = container.querySelector('[data-ep-submit]');
      form.onchange = () => { if (isCurrent() && submit) submit.disabled = !form.querySelector('input:checked'); };
      form.onsubmit = event => {
        event.preventDefault();
        if (!isCurrent()) return;
        const input = form.querySelector('input:checked');
        if (!input) { options.toast?.('先选一个答案'); return; }
        const answer = Number(input.value);
        if (!Number.isInteger(answer) || answer < 0 || answer >= q.options.length) return;
        read();
        if (memory[q.id]) { draw(); return; }
        const entry = {questionId:q.id,packId:pack.id,goal:pack.goal,skill:q.skill,skillLabel:q.skillLabel,answer,correct:answer === q.answer,attemptedAt:Date.now()};
        memory[q.id] = entry;
        save(); // Persist before callbacks: double clicks and reloads cannot emit the same first attempt again.
        draw();
        container?.querySelector('[data-ep-feedback]')?.focus();
        try { options.onResult?.({...entry}); } catch { options.toast?.('答案已保留，学习统计暂时未更新'); }
        window.dispatchEvent(new CustomEvent('naodai:exam-result', {detail:{...entry}}));
      };
      container.querySelector('[data-ep-prev]').onclick = () => { if (!isCurrent() || index <= 0) return; index--; draw(true); };
      container.querySelector('[data-ep-next]').onclick = () => { if (!isCurrent() || !memory[q.id]) return; index++; draw(true); };
    }
    container.querySelectorAll('[data-ep-pack]').forEach(button => button.onclick = () => {
      if (!isCurrent()) return;
      const selected = PACKS.find(p => p.id === button.dataset.epPack && p.goal === pack.goal);
      if (selected && selected !== pack) selectPack(selected, true);
    });
    const back = container.querySelector('[data-ep-back]');
    back.onclick = () => {
      if (!isCurrent()) return;
      saveView(); generation++;
      if (typeof options.onBack === 'function') options.onBack();
      else if (window.AppNav?.back) window.AppNav.back('reading-home');
      else location.hash = 'reading-home';
    };
    if (focus) container.querySelector('#ep-question, [data-ep-title]')?.focus();
  }
  function render(el, opts = {}) {
    if (container) saveView();
    generation++;
    container = el; options = opts; pack = null;
    document.body.classList.remove('is-vocabulary', 'is-onboarding');
    document.body.classList.add('is-reading');
    ensureStyles(); read(); loadViews(); loadSelections();
    const goal = goals.has(opts.goal) ? opts.goal : 'postgrad', choices = PACKS.filter(p => p.goal === goal);
    const selected = choices.find(p => p.id === selectedMemory[goal]);
    selectPack(selected || choices.find(unfinished) || choices[0]);
  }
  function cleanup() { saveView(); generation++; container = null; pack = null; }
  function getResults() { read(); return Object.values(memory).map(entry => ({...entry})); }
  function getPacks() { return JSON.parse(JSON.stringify(PACKS)); }
  function openQuestion(id) {
    const source = allQuestions.get(id); if (!source) return false;
    read(); loadViews(); loadSelections();
    viewMemory[source.pack.id] = id; selectedMemory[source.pack.goal] = source.pack.id;
    try { sessionStorage.setItem(VIEW_KEY, JSON.stringify(viewMemory)); selectionStorage().setItem(SELECTION_KEY, JSON.stringify(selectedMemory)); } catch { warnStorage(); }
    location.hash = 'practice/' + source.pack.goal; return true;
  }
  window.ExamPractice = {replaceBackup:rows=>{activeMode=storageMode();memory=Object.assign(Object.create(null),Object.fromEntries(rows.map(r=>[r.questionId,{...r}])));},render, cleanup, getResults, getPacks, openQuestion};
  window.addEventListener('pagehide', saveView);
})();
