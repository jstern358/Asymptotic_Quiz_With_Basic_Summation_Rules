(() => {
  const LINE_HEIGHT = 28;
  const state = {
    current: null,
    answered: false,
    deckByLevel: {},
    recentTemplateNamesByLevel: { 1: [], 2: [], 3: [], 4: [] }
  };

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function typesetMath(node) {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([node]).catch(() => {});
    }
  }

  function currentLevel() {
    return parseInt(document.getElementById('levelSelect').value, 10);
  }

  function shouldShowBlocksBeforeAnswer() {
    return document.getElementById('showBlocksToggle').checked;
  }

  function visibleBlocks(blocks, showBlocks) {
    return showBlocks ? blocks : [];
  }

  function buildDeck(level) {
    const templates = window.TrainerData.getTemplatesForLevel(level);
    state.deckByLevel[level] = shuffle(templates.map((_, idx) => idx));
  }

  function takeNextTemplateFactory(level) {
    const templates = window.TrainerData.getTemplatesForLevel(level);
    if (!state.deckByLevel[level] || state.deckByLevel[level].length === 0) {
      buildDeck(level);
    }

    const deck = state.deckByLevel[level];
    const recent = state.recentTemplateNamesByLevel[level] || [];
    let chosenDeckIndex = 0;

    for (let i = 0; i < deck.length; i++) {
      const factory = templates[deck[i]];
      const familyName = factory.name || ('template_' + deck[i]);
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
    state.recentTemplateNamesByLevel[level] = recent;
    return factory;
  }

  function renderCode(question, showBlocks) {
    const codeArea = document.getElementById('codeArea');
    codeArea.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';

    const bracketLayer = document.createElement('div');
    bracketLayer.className = 'bracket-layer';

    visibleBlocks(question.code.blocks, showBlocks).forEach(block => {
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

    const linesDiv = document.createElement('div');
    linesDiv.className = 'code-lines';

    question.code.lines.forEach((line, idx) => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'code-line';

      const no = document.createElement('span');
      no.className = 'line-no';
      no.textContent = String(idx + 1).padStart(2, ' ');

      const txt = document.createElement('span');
      txt.className = 'code-text';
      txt.textContent = line;

      lineDiv.appendChild(no);
      lineDiv.appendChild(txt);
      linesDiv.appendChild(lineDiv);
    });

    wrapper.appendChild(bracketLayer);
    wrapper.appendChild(linesDiv);
    codeArea.appendChild(wrapper);
  }

  function renderBlockSummaries(blocks) {
    return blocks.map(block => `
      <div class="block-summary">
        <strong>${block.name}</strong>${block.lines ? ` (${block.lines})` : ''}<br>
        <strong>Runtime of one execution of this block:</strong> ${block.perExecution}<br>
        <strong>How many times this block executes in the worst case:</strong> ${block.executions}<br>
        <strong>Total contribution of this block:</strong> ${block.contribution}<br>
        <span class="muted">${block.note || ''}</span>
      </div>
    `).join('');
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
      <div class="summary-caption">
        Quick summary of the highlighted blocks before the full explanation.
      </div>
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

  function mathBox(content) {
    return `<div class="math-box">${content}</div>`;
  }

  function renderAnalysisSection(explanation) {
    if (!explanation.hasSummation) {
      return `
        <h4>4) Iteration-count analysis</h4>
        <p>${explanation.analysisIntro}</p>
        ${mathBox(explanation.analysisDisplay)}
      `;
    }

    return `
      <h4>4) Convert repeated work into a summation</h4>
      <p>${explanation.analysisIntro}</p>
      ${mathBox(explanation.analysisDisplay)}

      <h4>5) Summation type classification</h4>
      <div class="type-box">
        <strong>Object being classified:</strong><br>
        ${explanation.classificationTarget}<br><br>
        <strong>Type used:</strong> ${explanation.typeName}<br><br>
        ${explanation.typeReason}
      </div>

      <h4>6) Implication of the type classification</h4>
      <div class="rule-box">${explanation.typeImplication}</div>
    `;
  }

  function renderExplanation(question) {
    const e = question.explanation;
    return `
      <h3>Step-by-Step Explanation</h3>

      <h4>Summary</h4>
      <p>
        Before the long-form explanation, here is a compact table showing the key runtime
        accounting for each highlighted block.
      </p>
      ${renderSummaryTable(e.blockSummaries)}

      <h4>1) Break the algorithm into highlighted blocks</h4>
      <p>
        The brackets identify the major blocks whose work we count. For each block, keep
        <strong>two separate quantities</strong>: (i) the runtime of <em>one execution</em>
        of that block, and (ii) the <em>number of times</em> that block executes in the
        worst case. The total contribution of a block is the product of those two quantities.
      </p>
      ${renderBlockSummaries(e.blockSummaries)}

      <h4>2) Exact-style total runtime before asymptotic simplification</h4>
      <p>${e.exactIntro}</p>
      ${mathBox(e.exactRuntime)}

      <h4>3) How the blocks combine</h4>
      <div class="rule-box">${e.compositionRule}</div>

      ${renderAnalysisSection(e)}

      <h4>${e.hasSummation ? '7' : '5'}) Asymptotic simplification</h4>
      <p>${e.asymptoticIntro}</p>
      ${mathBox(e.asymptoticSimplification)}

      <h4>${e.hasSummation ? '8' : '6'}) Final runtime</h4>
      <div class="final-box">${e.finalRuntime}</div>
    `;
  }

  function renderAnswers(question) {
    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';

    shuffle(question.choices).forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.innerHTML = choice;
      btn.onclick = () => handleAnswer(choice, btn);
      answersDiv.appendChild(btn);
    });

    typesetMath(answersDiv);
  }

  function refreshCodeVisibility() {
    if (!state.current) return;

    const showBlocks = state.answered || shouldShowBlocksBeforeAnswer();
    renderCode(state.current, showBlocks);

    const note = document.getElementById('codeNote');
    if (state.answered) {
      note.textContent = 'Highlighted code blocks are shown below and are referenced in the explanation.';
    } else if (shouldShowBlocksBeforeAnswer()) {
      note.textContent = 'Code block labels are currently visible because the checkbox is enabled.';
    } else {
      note.textContent = 'Code block labels are hidden until you answer, unless you enable the checkbox above.';
    }

    document.getElementById('currentLevelBadge').textContent = 'Level ' + state.current.level;
  }

  function newQuestion() {
    state.answered = false;
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

    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => { btn.disabled = true; });

    const feedback = document.getElementById('feedback');
    if (choice === state.current.answer) {
      clickedBtn.classList.add('correct');
      feedback.innerHTML = '✅ Correct!';
    } else {
      clickedBtn.classList.add('wrong');
      feedback.innerHTML = '❌ Incorrect. Correct answer: ' + state.current.answer;
      buttons.forEach(btn => {
        if (btn.innerHTML === state.current.answer) {
          btn.classList.add('missed-correct');
        }
      });
    }

    refreshCodeVisibility();

    const explanation = document.getElementById('explanation');
    explanation.innerHTML = renderExplanation(state.current);
    explanation.style.display = 'block';
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
