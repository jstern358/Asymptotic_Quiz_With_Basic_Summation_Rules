(() => {
  const LINE_HEIGHT = 28;
  const state = {
    current: null,
    answered: false,
    deckByLevel: {},
    recentNamesByLevel: { 1: [], 2: [], 3: [], 4: [], 5: [] },
    showDetailedType: false
  };

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function currentLevel() { return parseInt(document.getElementById('levelSelect').value, 10); }
  function shouldShowBlocksBeforeAnswer() { return document.getElementById('showBlocksToggle').checked; }

  function typesetMath(node) {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([node]).catch(() => {});
    }
  }

  function buildDeck(level) {
    const templates = window.TrainerData.getTemplatesForLevel(level);
    state.deckByLevel[level] = shuffle(templates.map((_, idx) => idx));
  }

  function takeNextTemplateFactory(level) {
    const templates = window.TrainerData.getTemplatesForLevel(level);
    if (!state.deckByLevel[level] || state.deckByLevel[level].length === 0) buildDeck(level);
    const deck = state.deckByLevel[level];
    const recent = state.recentNamesByLevel[level] || [];
    let chosenDeckIndex = 0;
    for (let i = 0; i < deck.length; i++) {
      const familyName = templates[deck[i]].name || ('template_' + deck[i]);
      if (!recent.includes(familyName) || deck.length === 1) {
        chosenDeckIndex = i;
        break;
      }
    }
    const templateIndex = deck.splice(chosenDeckIndex, 1)[0];
    const factory = templates[templateIndex];
    const familyName = factory.name || ('template_' + templateIndex);
    recent.push(familyName);
    while (recent.length > 2) recent.shift();
    state.recentNamesByLevel[level] = recent;
    return factory;
  }

  function renderCode(question, showBlocks) {
    const codeArea = document.getElementById('codeArea');
    codeArea.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    const bracketLayer = document.createElement('div');
    bracketLayer.className = 'bracket-layer';

    if (showBlocks) {
      question.code.blocks.forEach(block => {
        const bracket = document.createElement('div');
        bracket.className = 'block-bracket';
        bracket.style.borderColor = block.color;
        bracket.style.top = ((block.start - 1) * LINE_HEIGHT) + 'px';
        bracket.style.height = ((block.end - block.start + 1) * LINE_HEIGHT - 4) + 'px';
        const label = document.createElement('div');
        label.className = 'block-label';
        label.textContent = block.label;
        label.style.borderColor = block.color;
        bracket.appendChild(label);
        bracketLayer.appendChild(bracket);
      });
    }

    const linesDiv = document.createElement('div');
    linesDiv.className = 'code-lines';
    question.code.lines.forEach((line, idx) => {
      const row = document.createElement('div');
      row.className = 'code-line';
      const no = document.createElement('span');
      no.className = 'line-no';
      no.textContent = String(idx + 1).padStart(2, ' ');
      const txt = document.createElement('span');
      txt.className = 'code-text';
      txt.textContent = line;
      row.appendChild(no);
      row.appendChild(txt);
      linesDiv.appendChild(row);
    });

    wrapper.appendChild(bracketLayer);
    wrapper.appendChild(linesDiv);
    codeArea.appendChild(wrapper);
  }

  function renderAnswers(question) {
    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';
    question.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.innerHTML = choice;
      btn.onclick = () => handleAnswer(choice, btn);
      answersDiv.appendChild(btn);
    });
    typesetMath(answersDiv);
  }

  function renderSummaryTable(blocks) {
    const rows = blocks.map(block => `
      <tr>
        <td><strong>${block.name}</strong>${block.lines ? `<br><span class="muted">${block.lines}</span>` : ''}</td>
        <td>${block.perExecution}</td>
        <td>${block.executions}</td>
        <td>${block.contribution}</td>
      </tr>
    `).join('');
    return `
      <div class="summary-caption">Quick summary of the highlighted blocks before the full explanation.</div>
      <div class="summary-table-wrap">
        <table class="summary-table">
          <thead>
            <tr>
              <th>Block</th>
              <th>Runtime of one execution</th>
              <th>Number of executions</th>
              <th>Total contribution</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function expandedSteps(explanation) {
    if (!state.showDetailedType || !explanation.detailedTypeSteps || explanation.detailedTypeSteps.length === 0) return explanation.steps;
    let detailIndex = 0;
    const out = [];
    explanation.steps.forEach(step => {
      out.push(step);
      if (step.title === 'Determine the summation type' && detailIndex < explanation.detailedTypeSteps.length) {
        out.push(explanation.detailedTypeSteps[detailIndex]);
        detailIndex += 1;
      }
    });
    return out;
  }

  function renderSteps(explanation) {
    return expandedSteps(explanation).map((step, idx) => `
      <div class="step">
        <h4>Step ${idx + 1}: ${step.title}</h4>
        <div>${step.content}</div>
      </div>
    `).join('');
  }

  function detailButtonMarkup(explanation) {
    if (!explanation.detailedTypeSteps || explanation.detailedTypeSteps.length === 0 || state.showDetailedType) return '';
    return `
      <div class="detail-wrap">
        <button class="detail-btn" id="detailTypeBtn">Full summation type analysis/breakdown</button>
      </div>
    `;
  }

  function renderExplanation(question) {
    const e = question.explanation;
    return `
      <h3>Step-by-Step Explanation</h3>
      <h4>Summary Table</h4>
      ${renderSummaryTable(e.blockSummaries)}
      ${detailButtonMarkup(e)}
      ${renderSteps(e)}
      <div class="step"><h4>Final Answer</h4><div>${e.finalRuntime}</div></div>
    `;
  }

  function refreshCodeVisibility() {
    if (!state.current) return;
    const showBlocks = state.answered || shouldShowBlocksBeforeAnswer();
    renderCode(state.current, showBlocks);
    const note = document.getElementById('codeNote');
    if (state.answered) note.textContent = 'Highlighted code blocks are shown below and are referenced in the explanation.';
    else if (shouldShowBlocksBeforeAnswer()) note.textContent = 'Code block labels are currently visible because the checkbox is enabled.';
    else note.textContent = 'Code block labels are hidden until you answer, unless you enable the checkbox above.';
    document.getElementById('currentLevelBadge').textContent = 'Level ' + state.current.level;
  }

  function attachDetailButtonIfPresent() {
    const btn = document.getElementById('detailTypeBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      state.showDetailedType = true;
      const explanation = document.getElementById('explanation');
      explanation.innerHTML = renderExplanation(state.current);
      attachDetailButtonIfPresent();
      typesetMath(explanation);
    });
  }

  function newQuestion() {
    state.answered = false;
    state.showDetailedType = false;
    const factory = takeNextTemplateFactory(currentLevel());
    state.current = factory();
    renderAnswers(state.current);
    refreshCodeVisibility();
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('explanation').style.display = 'none';
    document.getElementById('explanation').innerHTML = '';
    document.getElementById('nextBtn').style.display = 'none';
  }

  function handleAnswer(choice, clickedBtn) {
    if (state.answered) return;
    state.answered = true;
    document.querySelectorAll('.answer-btn').forEach(btn => { btn.disabled = true; });
    const feedback = document.getElementById('feedback');
    if (choice === state.current.answer) {
      clickedBtn.classList.add('correct');
      feedback.innerHTML = '✅ Correct!';
    } else {
      clickedBtn.classList.add('wrong');
      feedback.innerHTML = '❌ Incorrect. Correct answer: ' + state.current.answer;
      document.querySelectorAll('.answer-btn').forEach(btn => {
        if (btn.innerHTML === state.current.answer) btn.classList.add('missed-correct');
      });
    }
    refreshCodeVisibility();
    const explanation = document.getElementById('explanation');
    explanation.innerHTML = renderExplanation(state.current);
    explanation.style.display = 'block';
    attachDetailButtonIfPresent();
    document.getElementById('nextBtn').style.display = 'inline-block';
    typesetMath(feedback);
    typesetMath(explanation);
  }

  function init() {
    document.getElementById('nextBtn').addEventListener('click', newQuestion);
    document.getElementById('showBlocksToggle').addEventListener('change', refreshCodeVisibility);
    document.getElementById('levelSelect').addEventListener('change', newQuestion);
    newQuestion();
  }

  window.addEventListener('DOMContentLoaded', init);
})();