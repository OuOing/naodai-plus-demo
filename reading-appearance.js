/* Local reading appearance. Preset fonts, self-hosted assets, no content mutations. */
(() => {
  'use strict';
  if (window.ReadingAppearance) { window.ReadingAppearance.refresh(); return; }
  const KEY = 'naodai-reading-appearance-v1';
  const DEFAULTS = Object.freeze({ version: 1, family: 'serif', size: null, spacing: null });
  const FONTS = Object.freeze({
    serif: { label: '经典衬线 · Georgia', stack: 'Georgia,"Times New Roman","Songti SC",serif' },
    sans: { label: '清晰无衬线 · Arial', stack: 'Arial,Helvetica,"PingFang SC","Microsoft YaHei",sans-serif' },
    system: { label: '系统默认 · System UI', stack: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' },
    lora: { label: '书卷衬线 · Lora', stack: '"Lora",Georgia,"Songti SC",serif' },
    'libre-baskerville': { label: '复古衬线 · Libre Baskerville', stack: '"Libre Baskerville",Georgia,"Songti SC",serif' },
    lexend: { label: '舒展无衬线 · Lexend', stack: '"Lexend",Arial,"PingFang SC",sans-serif' },
    'jetbrains-mono': { label: '等宽字体 · JetBrains Mono', stack: '"JetBrains Mono",Consolas,"PingFang SC",monospace' }
  });
  const normalize = value => {
    const valid = value && typeof value === 'object' && !Array.isArray(value) && value.version === 1;
    return {
      version: 1,
      family: valid && Object.prototype.hasOwnProperty.call(FONTS, value.family) ? value.family : DEFAULTS.family,
      size: valid && Number.isInteger(value.size) && value.size >= 16 && value.size <= 30 ? value.size : DEFAULTS.size,
      spacing: valid && typeof value.spacing === 'number' && Number.isFinite(value.spacing) && value.spacing >= 1.4 && value.spacing <= 2.4 ? Math.round(value.spacing * 20) / 20 : DEFAULTS.spacing
    };
  };
  const mode = () => {
    try { const choice = window.ReaderTools?.storageChoice?.(); return choice === 'session' ? 'session' : 'local'; }
    catch { return 'memory'; }
  };
  let storageMode = mode(), warning = '', savedRange = null, current = null;
  const read = () => {
    if (storageMode === 'memory') return { ...DEFAULTS };
    try { return normalize(JSON.parse((storageMode === 'local' ? localStorage : sessionStorage).getItem(KEY))); }
    catch { warning = '读取设置失败，当前使用默认排版'; return { ...DEFAULTS }; }
  };
  let settings = read();
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const makeButton = (className, text) => { const b = element('button', className, text); b.type = 'button'; return b; };
  function status() {
    if (!current) return;
    current.status.textContent = warning || (storageMode === 'local' ? '排版偏好保存在此浏览器，仅影响正文与译文' : storageMode === 'session' ? '仅本次会话保存，不会保存到本机长期记录' : '当前设置仅在此页面有效');
  }
  function persist() {
    storageMode = mode(); warning = '';
    if (storageMode === 'memory') { status(); return; }
    try { (storageMode === 'local' ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(settings)); }
    catch {
      warning = '浏览器未能保存，本次页面仍可使用；刷新后可能恢复之前的设置';
    }
    status();
  }
  function apply() {
    if (!current) return;
    const style = current.article.style;
    const baseSize = window.matchMedia?.('(max-width:600px)')?.matches ? 20 : 21;
    const size = settings.size ?? baseSize, spacing = settings.spacing ?? 1.95;
    style.setProperty('--ra-font', FONTS[settings.family].stack);
    style.setProperty('--ra-size', settings.size === null ? 'var(--ra-default-size)' : size + 'px');
    style.setProperty('--ra-zh-size', settings.size === null ? '14px' : Math.max(12, Math.round(14 * size / baseSize)) + 'px');
    style.setProperty('--ra-line-height', String(spacing));
    style.setProperty('--ra-zh-line-height', String(settings.spacing ?? 1.85));
    current.family.value = settings.family;
    current.size.value = String(size);
    current.size.setAttribute('aria-valuetext', size + ' 像素' + (settings.size === null ? '，默认' : ''));
    current.sizeValue.value = size + ' px' + (settings.size === null ? '（默认）' : '');
    current.spacing.value = String(spacing);
    current.spacing.setAttribute('aria-valuetext', spacing.toFixed(2) + ' 倍行距' + (settings.spacing === null ? '，默认' : ''));
    current.spacingValue.value = spacing.toFixed(2) + ' 倍' + (settings.spacing === null ? '（默认）' : '');
    status();
  }
  function rememberSelection() {
    const selection = window.getSelection?.();
    savedRange = selection && !selection.isCollapsed && selection.rangeCount && current?.area.contains(selection.anchorNode) && current.area.contains(selection.focusNode) ? selection.getRangeAt(0).cloneRange() : null;
  }
  function close(returnFocus = true, restoreSelection = true) {
    if (!current || current.panel.hidden) return;
    const ownedFocus = current.panel.contains(document.activeElement) || current.button.contains(document.activeElement);
    current.panel.hidden = true;
    current.button.setAttribute('aria-expanded', 'false');
    if (returnFocus && ownedFocus && current.button.isConnected) current.button.focus({ preventScroll: true });
    if (restoreSelection && savedRange && current.area.contains(savedRange.startContainer) && current.area.contains(savedRange.endContainer)) {
      try { const s = window.getSelection(); if (s.isCollapsed) { s.removeAllRanges(); s.addRange(savedRange); } } catch { /* A newer render can invalidate a range. */ }
    }
    savedRange = null;
  }
  function dispose() {
    if (!current) return;
    close(false, false);
    current.button.remove(); current.panel.remove();
    current.article.removeAttribute('data-reading-appearance');
    ['--ra-font', '--ra-size', '--ra-zh-size', '--ra-line-height', '--ra-zh-line-height'].forEach(key => current.article.style.removeProperty(key));
    current = null; savedRange = null;
  }
  function open() {
    if (!current || document.querySelector('#note[open]')) return;
    if (storageMode !== mode()) persist();
    current.panel.hidden = false;
    current.button.setAttribute('aria-expanded', 'true');
    current.family.focus({ preventScroll: true });
  }
  function mount(article, area) {
    article.setAttribute('data-reading-appearance', '');
    const button = makeButton('ra-toggle', 'Aa');
    button.id = 'reading-appearance-toggle'; button.title = '字体与排版';
    button.setAttribute('aria-label', '字体与排版');
    button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', 'reading-appearance-panel');
    const panel = element('section', 'ra-panel'); panel.id = 'reading-appearance-panel'; panel.hidden = true;
    panel.setAttribute('role', 'region'); panel.setAttribute('aria-labelledby', 'reading-appearance-title');
    const head = element('div', 'ra-heading'), title = element('h2', '', '字体与排版'); title.id = 'reading-appearance-title';
    const dismiss = makeButton('ra-close', '×'); dismiss.setAttribute('aria-label', '关闭字体与排版');
    head.append(title, dismiss); panel.append(head);
    const familyLabel = element('label', 'ra-field', '字体'); familyLabel.htmlFor = 'ra-family';
    const family = element('select'); family.id = 'ra-family';
    Object.entries(FONTS).forEach(([key, font]) => { const option = element('option', '', font.label); option.value = key; family.append(option); });
    familyLabel.append(family); panel.append(familyLabel);
    function slider(id, label, min, max, step) {
      const row = element('div', 'ra-field'), caption = element('div', 'ra-caption'), name = element('label', '', label), output = element('output');
      name.htmlFor = id; output.htmlFor = id; output.setAttribute('aria-hidden', 'true');
      const input = element('input'); input.id = id; input.type = 'range'; input.min = min; input.max = max; input.step = step;
      caption.append(name, output); row.append(caption, input); panel.append(row); return { input, output };
    }
    const size = slider('ra-size', '字号', '16', '30', '1');
    const spacing = slider('ra-spacing', '行距', '1.4', '2.4', '.05');
    const preview = element('div', 'ra-preview'); preview.setAttribute('aria-label', '排版预览');
    const en = element('p', 'ra-preview-en', 'A little reading, every day.'); en.lang = 'en';
    const zh = element('p', 'ra-preview-zh', '按自己的节奏，读懂每一句。'); zh.lang = 'zh-CN'; preview.append(en, zh); panel.append(preview);
    const reset = makeButton('ra-reset', '恢复默认'); panel.append(reset);
    const note = element('p', 'ra-status'); note.setAttribute('role', 'status'); note.setAttribute('aria-live', 'polite'); panel.append(note);
    const sources = element('details', 'ra-sources');
    sources.append(element('summary', '', '字体来源'));
    sources.append(element('p', '', '新增英文阅读字体随本站提供，依 SIL Open Font License 1.1 使用。中文使用设备上可用的字体。'));
    const sourceList = element('ul');
    [
      ['Lora', 'lora'], ['Libre Baskerville', 'libre-baskerville'], ['Lexend', 'lexend'], ['JetBrains Mono', 'jetbrains-mono']
    ].forEach(([name, id]) => {
      const row = element('li'), project = element('a', '', name), license = element('a', '', '许可');
      project.href = 'https://github.com/google/fonts/tree/main/ofl/' + id.replace(/-/g, '');
      license.href = 'reading-fonts/' + id + '-OFL.txt';
      for (const link of [project, license]) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      row.append(project, element('span', '', ' · '), license); sourceList.append(row);
    });
    sources.append(sourceList); panel.append(sources);
    current = { article, area, button, panel, family, size: size.input, sizeValue: size.output, spacing: spacing.input, spacingValue: spacing.output, status: note };
    const alive = () => current?.panel === panel && panel.isConnected;
    const update = values => { if (!alive()) return; settings = normalize({ ...settings, ...values }); persist(); apply(); };
    family.addEventListener('change', () => update({ family: family.value }));
    size.input.addEventListener('input', () => update({ size: Number(size.input.value) }));
    spacing.input.addEventListener('input', () => update({ spacing: Number(spacing.input.value) }));
    reset.addEventListener('click', () => update(DEFAULTS)); dismiss.addEventListener('click', () => { if (alive()) close(); });
    button.addEventListener('pointerdown', event => { if (alive() && event.button === 0) { rememberSelection(); if (savedRange) event.preventDefault(); } });
    button.addEventListener('click', () => { if (!alive()) return; if (panel.hidden) { if (!savedRange) rememberSelection(); open(); } else close(); });
    const heading = article.querySelector('h1');
    article.insertBefore(button, heading); article.insertBefore(panel, heading); apply();
  }
  function refresh() {
    const article = /^#read\/[^/]+$/.test(location.hash) ? document.querySelector('#app article.reader') : null;
    const area = article?.querySelector('.reading');
    if (current && (current.article !== article || current.area !== area || !current.button.isConnected)) dispose();
    if (article && area && !current) mount(article, area);
    if (current && storageMode !== mode()) persist();
    if (current && document.querySelector('#note[open]')) close(false, false);
  }
  document.addEventListener('pointerdown', event => {
    if (current && !current.panel.hidden && !current.panel.contains(event.target) && !current.button.contains(event.target)) close(false, false);
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && current && !current.panel.hidden) { event.preventDefault(); close(); }
  });
  document.addEventListener('focusin', event => {
    if (current && !current.panel.hidden && !current.panel.contains(event.target) && !current.button.contains(event.target)) close(false, false);
  });
  window.addEventListener('hashchange', () => { dispose(); queueMicrotask(refresh); });
  window.addEventListener('resize', apply);
  const app = document.getElementById('app'), note = document.getElementById('note');
  if (app) new MutationObserver(refresh).observe(app, { childList: true, subtree: true });
  if (note) new MutationObserver(refresh).observe(note, { attributes: true, attributeFilter: ['open'] });
  window.ReadingAppearance = Object.freeze({ refresh, close });
  refresh();
})();
