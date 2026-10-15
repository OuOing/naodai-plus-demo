(() => {
  'use strict';

  // Only these local destinations are supported. Never use a query as a URL.
  const requestedReturn = new URLSearchParams(window.location.search).get('return');
  const returnRoute = requestedReturn === 'library' ? 'library' : 'subjects';
  const returnLink = document.getElementById('mathReturn');
  if (returnLink) {
    returnLink.href = `./#${returnRoute}`;
    returnLink.textContent = returnRoute === 'library' ? '← 返回书架' : '← 返回选择科目';
  }

  const range = document.getElementById('limitRange');
  if (range) {
    const updateLimit = () => {
      const rawN = Number(range.value);
      const n = Number.isFinite(rawN) ? Math.max(1, Math.min(100, Math.round(rawN))) : 1;
      const value = 1 / n;
      const decimal = String(Number(value.toFixed(6)));
      const relation = 1000000 % n === 0 ? '=' : '≈';
      const valueText = `1/n ${relation} ${decimal}`;
      range.value = String(n);
      range.setAttribute('aria-valuetext', `n = ${n}，${valueText}`);
      document.getElementById('limitN').textContent = `n = ${n}`;
      document.getElementById('limitValue').textContent = valueText;
      document.getElementById('limitPoint').setAttribute('cx', String(40 + 560 * value));
      document.getElementById('limitLineDescription').textContent = `n = ${n}，${valueText}，点位于零的右侧。`;
    };
    range.addEventListener('input', updateLimit);
    range.addEventListener('change', updateLimit);
    // Reconcile any form values restored by Back/Forward navigation.
    window.addEventListener('pageshow', updateLimit);
    updateLimit();
  }

  document.querySelectorAll('.question[data-question]').forEach(question => {
    const choices = [...question.querySelectorAll('input[type="radio"]')];
    const feedback = question.querySelector('.question-feedback');
    const updateAnswer = () => {
      const selected = choices.find(choice => choice.checked);
      choices.forEach(choice => {
        const label = choice.closest('.choice');
        label.classList.toggle('is-correct', choice.checked && choice.dataset.correct === 'true');
        label.classList.toggle('is-incorrect', choice.checked && choice.dataset.correct !== 'true');
      });
      if (!selected) {
        feedback.textContent = '';
        delete feedback.dataset.result;
        return;
      }
      const correct = selected.dataset.correct === 'true';
      feedback.dataset.result = correct ? 'correct' : 'incorrect';
      feedback.textContent = correct
        ? `回答正确。${question.dataset.correctMessage}`
        : `再想一想。${question.dataset.wrongMessage}`;
    };
    choices.forEach(choice => choice.addEventListener('change', updateAnswer));
    window.addEventListener('pageshow', updateAnswer);
    updateAnswer();
  });
})();
