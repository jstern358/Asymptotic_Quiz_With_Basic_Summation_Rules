window.TrainerData = (() => {
  function sample(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function varSet() {
    return sample([
      { a: 'i', b: 'j', c: 'k' },
      { a: 'p', b: 'q', c: 'r' },
      { a: 'x', b: 'y', c: 'z' },
      { a: 'u', b: 'v', c: 'w' }
    ]);
  }

  function fmtTheta(s) {
    return `\\(\\Theta(${s})\\)`;
  }

  function makeQuestion({ id, level, lines, blocks, answer, choices, explanation }) {
    return { id, level, code: { lines, blocks }, answer, choices, explanation };
  }

  function linearExplanation(v) {
    return {
      blockSummaries: [
        { name: 'Loop body', lines: 'lines 1-2', perExecution: '\\(c_1\\)', executions: `${v} takes all values from 1 through n`, contribution: '\\(c_1 n\\)' }
      ],
      steps: [
        { title: 'Summary', content: `This is a single linear loop in the variable ${v}.` },
        { title: 'Block accounting', content: `One execution of the loop body costs \\(c_1\\), and ${v} takes n values.` },
        { title: 'Exact runtime', content: '\\[T(n)=c_1 n\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n)\\]' }
      ],
      finalRuntime: fmtTheta('n')
    };
  }

  function logGrowthExplanation(v, mult) {
    return {
      blockSummaries: [
        { name: 'Initialization', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '1', contribution: '\\(c_1\\)' },
        { name: 'While-loop body', lines: 'lines 2-4', perExecution: '\\(c_2\\)', executions: `the number of times ${v} can be multiplied by ${mult} before exceeding n`, contribution: '\\(c_2 \cdot \text{(#iterations)}\\)' }
      ],
      steps: [
        { title: 'Summary', content: `We analyze the loop directly in terms of ${v}, rather than replacing it by a different symbol.` },
        { title: 'Iteration count', content: `After t iterations, \\(${v}=${mult}^t\\). The loop continues while \\(${mult}^t \\le n\\).` },
        { title: 'Solve', content: `\\[${mult}^t \\le n \\implies t=\\Theta(\\log n)\\]` },
        { title: 'Exact runtime', content: '\\[T(n)=c_1+c_2 t\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(1)+\\Theta(\\log n)=\\Theta(\\log n)\\]' }
      ],
      finalRuntime: fmtTheta('\\log n')
    };
  }

  function triangularExplanation(i) {
    return {
      blockSummaries: [
        { name: 'Outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: 'n', contribution: '\\(c_1 n\\)' },
        { name: 'Inner loop body', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: `for fixed ${i}, exactly ${i} times`, contribution: `\\(c_2 ${i}\\)` }
      ],
      steps: [
        { title: 'Summary', content: `The inner loop depends on ${i}, so we sum over all values of ${i}.` },
        { title: 'Exact runtime', content: `\\[T(n)=c_1 n + \\sum_{${i}=1}^{n} c_2 ${i}\\]` },
        { title: 'Summation', content: `\\[\\sum_{${i}=1}^{n} ${i}\\]` },
        { title: 'Classification', content: `${i} is a polynomial summand of degree 1, so the sum is \\(\\Theta(n^2)\\).` },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n^2)\\]' }
      ],
      finalRuntime: fmtTheta('n^2')
    };
  }

  function independentNestedExplanation() {
    return {
      blockSummaries: [
        { name: 'Outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: 'n', contribution: '\\(c_1 n\\)' },
        { name: 'Inner loop body', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: 'n for each outer iteration', contribution: '\\(c_2 n\\) per outer iteration' }
      ],
      steps: [
        { title: 'Summary', content: 'The inner loop bound does not depend on the outer variable, so the two counts multiply directly.' },
        { title: 'Direct product', content: '\\[n \\cdot n = n^2\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n^2)\\]' }
      ],
      finalRuntime: fmtTheta('n^2')
    };
  }

  function polyInnerExplanation(i, power) {
    return {
      blockSummaries: [
        { name: 'Outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: 'n', contribution: '\\(c_1 n\\)' },
        { name: 'Inner loop body', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: `for fixed ${i}, exactly ${i}^${power} times`, contribution: `\\(c_2 ${i}^{${power}}\\)` }
      ],
      steps: [
        { title: 'Summary', content: `For each fixed ${i}, the inner loop contributes \\(${i}^{${power}}\\), so we sum over ${i}.` },
        { title: 'Exact runtime', content: `\\[T(n)=c_1 n + \\sum_{${i}=1}^{n} c_2 ${i}^{${power}}\\]` },
        { title: 'Summation', content: `\\[\\sum_{${i}=1}^{n} ${i}^{${power}}\\]` },
        { title: 'Classification', content: `This is a polynomial-type summation of degree ${power}, so it is \\(\\Theta(n^{${power + 1}})\\).` },
        { title: 'Final runtime', content: `\\[T(n)=\\Theta(n^{${power + 1}})\\]` }
      ],
      finalRuntime: fmtTheta(`n^${power + 1}`)
    };
  }

  function outerNInnerLogNExplanation(i, j) {
    return {
      blockSummaries: [
        { name: 'Outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: 'n', contribution: '\\(c_1 n\\)' },
        { name: 'Inner while-loop', lines: 'lines 2-5', perExecution: '\\(c_2\\)', executions: `for each fixed ${i}, the number of times ${j} can double before exceeding n`, contribution: '\\(\\Theta(\\log n)\\) per outer iteration' }
      ],
      steps: [
        { title: 'Summary', content: `The outer loop repeats n times, and for each outer iteration the inner loop is logarithmic in n.` },
        { title: 'Inner loop cost', content: `For each fixed ${i}, the inner loop costs \\(\\Theta(\\log n)\\).` },
        { title: 'Multiply', content: '\\[n \\cdot \\Theta(\\log n)=\\Theta(n\\log n)\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n\\log n)\\]' }
      ],
      finalRuntime: fmtTheta('n\\log n')
    };
  }

  function tripleDependentExplanation(i, j) {
    return {
      blockSummaries: [
        { name: 'Outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: 'n', contribution: '\\(c_1 n\\)' },
        { name: 'Middle loop', lines: 'line 2', perExecution: '\\(c_2\\)', executions: `for fixed ${i}, exactly ${i} times`, contribution: `\\(c_2 ${i}\\)` },
        { name: 'Innermost loop', lines: 'lines 3-4', perExecution: '\\(c_3\\)', executions: `for fixed ${i}, ${j}, exactly ${j} times`, contribution: `\\(c_3 ${j}\\)` }
      ],
      steps: [
        { title: 'Summary', content: 'Work from the inside out. The innermost loop depends on the middle variable, and the middle loop depends on the outer variable.' },
        { title: 'Inner summation', content: `For fixed ${i}, \\(\\sum_{${j}=1}^{${i}} ${j}=\\Theta(${i}^2)\\).` },
        { title: 'Outer summation', content: `\\[\\sum_{${i}=1}^{n} ${i}^2 = \\Theta(n^3)\\]` },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n^3)\\]' }
      ],
      finalRuntime: fmtTheta('n^3')
    };
  }

  function seqPolyPlusLogExplanation(i, c) {
    return {
      blockSummaries: [
        { name: 'Polynomial section', lines: 'lines 1-3', perExecution: `for fixed ${i}, \\(${i}^2\\)`, executions: `${i}=1 through n`, contribution: '\\(\\Theta(n^3)\\)' },
        { name: 'Logarithmic section', lines: 'lines 5-8', perExecution: '\\(c_4\\)', executions: `the number of times ${c} can double before exceeding n`, contribution: '\\(\\Theta(\\log n)\\)' }
      ],
      steps: [
        { title: 'Summary', content: 'There are two sequential sections: a polynomial section and a logarithmic section.' },
        { title: 'First section', content: `\\[\\sum_{${i}=1}^{n} ${i}^2 = \\Theta(n^3)\\]` },
        { title: 'Second section', content: `The variable ${c} doubles, so the second section is \\(\\Theta(\\log n)\\).` },
        { title: 'Dominance', content: '\\[\\Theta(n^3)+\\Theta(\\log n)=\\Theta(n^3)\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n^3)\\]' }
      ],
      finalRuntime: fmtTheta('n^3')
    };
  }

  function expIncreasingSumExplanation(i) {
    return {
      blockSummaries: [
        { name: 'Outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '\\(\\lfloor \\log_2 n \\rfloor + 1\\)', contribution: '\\(\\Theta(\\log n)\\)' },
        { name: 'Inner loop body', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: `for fixed ${i}, exactly 2^${i} times`, contribution: `\\(c_2 2^${i}\\)` }
      ],
      steps: [
        { title: 'Summary', content: 'The summand grows exponentially with the outer-loop variable.' },
        { title: 'Summation', content: `\\[\\sum_{${i}=0}^{\\lfloor \\log_2 n \\rfloor} 2^${i}\\]` },
        { title: 'Classification', content: 'This is an exponentially increasing summation, so the last term dominates.' },
        { title: 'Last term', content: '\\[2^{\\lfloor \\log_2 n \\rfloor}=\\Theta(n)\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n)\\]' }
      ],
      finalRuntime: fmtTheta('n')
    };
  }

  function expDecreasingSumExplanation(t) {
    return {
      blockSummaries: [
        { name: 'Outer halving loop', lines: 'lines 1-5', perExecution: 'current inner contribution', executions: 'logarithmically many outer iterations', contribution: 'captured by geometric summation' },
        { name: 'Inner linear loop', lines: 'lines 3-4', perExecution: '\\(c_3\\)', executions: 'current outer value times', contribution: 'current outer value' }
      ],
      steps: [
        { title: 'Summary', content: 'The outer variable halves each time, so the inner contributions form a geometrically decreasing sum.' },
        { title: 'Summation', content: `\\[\\sum_{${t}=0}^{\\lfloor \\log_2 n \\rfloor} \\frac{n}{2^${t}}\\]` },
        { title: 'Classification', content: 'This is an exponentially decreasing summation, so the first term dominates.' },
        { title: 'First term', content: '\\[\\frac{n}{2^0}=n\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n)\\]' }
      ],
      finalRuntime: fmtTheta('n')
    };
  }

  function qLinear() {
    const v = varSet().a;
    return makeQuestion({
      id: 'L1_linear_' + v,
      level: 1,
      lines: [`for ${v} = 1 to n:`, '    do O(1) work'],
      blocks: [{ label: 'Block 1', start: 1, end: 2, color: '#10b981' }],
      answer: fmtTheta('n'),
      choices: [fmtTheta('1'), fmtTheta('\\log n'), fmtTheta('n'), fmtTheta('n^2')],
      explanation: linearExplanation(v)
    });
  }

  function qLogGrowth() {
    const v = varSet().a;
    const mult = sample([2, 3]);
    return makeQuestion({
      id: 'L1_log_growth_' + v + '_' + mult,
      level: 1,
      lines: [`${v} = 1`, `while ${v} <= n:`, '    do O(1) work', `    ${v} = ${mult}*${v}`],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#10b981' },
        { label: 'Block 2', start: 2, end: 4, color: '#8b5cf6' }
      ],
      answer: fmtTheta('\\log n'),
      choices: [fmtTheta('1'), fmtTheta('\\log n'), fmtTheta('n'), fmtTheta('n\\log n')],
      explanation: logGrowthExplanation(v, mult)
    });
  }

  function qTriangular() {
    const vars = varSet();
    return makeQuestion({
      id: 'L1_triangular_' + vars.a + vars.b,
      level: 1,
      lines: [`for ${vars.a} = 1 to n:`, `    for ${vars.b} = 1 to ${vars.a}:`, '        do O(1) work'],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' }
      ],
      answer: fmtTheta('n^2'),
      choices: [fmtTheta('n'), fmtTheta('n\\log n'), fmtTheta('n^2'), fmtTheta('n^3')],
      explanation: triangularExplanation(vars.a)
    });
  }

  function qIndependentNested() {
    return makeQuestion({
      id: 'L2_independent_nested',
      level: 2,
      lines: ['for i = 1 to n:', '    for j = 1 to n:', '        do O(1) work'],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' }
      ],
      answer: fmtTheta('n^2'),
      choices: [fmtTheta('n'), fmtTheta('n\\log n'), fmtTheta('n^2'), fmtTheta('n^3')],
      explanation: independentNestedExplanation()
    });
  }

  function qPolyInner() {
    const vars = varSet();
    const power = sample([2, 3]);
    const answer = power === 2 ? fmtTheta('n^3') : fmtTheta('n^4');
    const wrong = power === 2
      ? [fmtTheta('n^2'), fmtTheta('n\\log n'), fmtTheta('n^4')]
      : [fmtTheta('n^3'), fmtTheta('n^5'), fmtTheta('n^2')];
    return makeQuestion({
      id: 'L2_poly_inner_' + vars.a + '_' + power,
      level: 2,
      lines: [`for ${vars.a} = 1 to n:`, `    for ${vars.b} = 1 to ${vars.a}^${power}:`, '        do O(1) work'],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' }
      ],
      answer,
      choices: shuffleChoices([answer, ...wrong]),
      explanation: polyInnerExplanation(vars.a, power)
    });
  }

  function qOuterNInnerLogN() {
    const vars = varSet();
    return makeQuestion({
      id: 'L2_outer_n_inner_logn_' + vars.a + vars.b,
      level: 2,
      lines: [`for ${vars.a} = 1 to n:`, `    ${vars.b} = 1`, `    while ${vars.b} <= n:`, '        do O(1) work', `        ${vars.b} = 2*${vars.b}`],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 5, color: '#8b5cf6' }
      ],
      answer: fmtTheta('n\\log n'),
      choices: [fmtTheta('\\log n'), fmtTheta('n'), fmtTheta('n\\log n'), fmtTheta('n^2')],
      explanation: outerNInnerLogNExplanation(vars.a, vars.b)
    });
  }

  function qTripleDependent() {
    const vars = varSet();
    return makeQuestion({
      id: 'L3_triple_dependent_' + vars.a + vars.b + vars.c,
      level: 3,
      lines: [`for ${vars.a} = 1 to n:`, `    for ${vars.b} = 1 to ${vars.a}:`, `        for ${vars.c} = 1 to ${vars.b}:`, '            do O(1) work'],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 2, color: '#0ea5e9' },
        { label: 'Block 3', start: 3, end: 4, color: '#f59e0b' }
      ],
      answer: fmtTheta('n^3'),
      choices: [fmtTheta('n^2'), fmtTheta('n^3'), fmtTheta('n^4'), fmtTheta('n\\log n')],
      explanation: tripleDependentExplanation(vars.a, vars.b)
    });
  }

  function qSequentialPolyPlusLog() {
    const vars = varSet();
    return makeQuestion({
      id: 'L3_seq_poly_log_' + vars.a + vars.b + vars.c,
      level: 3,
      lines: [`for ${vars.a} = 1 to n:`, `    for ${vars.b} = 1 to ${vars.a}^2:`, '        do O(1) work', '', `${vars.c} = 1`, `while ${vars.c} <= n:`, '    do O(1) work', `    ${vars.c} = 2*${vars.c}`],
      blocks: [
        { label: 'Block 1', start: 1, end: 3, color: '#60a5fa' },
        { label: 'Block 2', start: 5, end: 8, color: '#8b5cf6' }
      ],
      answer: fmtTheta('n^3'),
      choices: [fmtTheta('n^2'), fmtTheta('n^3'), fmtTheta('n^3\\log n'), fmtTheta('n\\log n')],
      explanation: seqPolyPlusLogExplanation(vars.a, vars.c)
    });
  }

  function qExpIncreasingSum() {
    const vars = varSet();
    return makeQuestion({
      id: 'L4_exp_increasing_sum_' + vars.a + vars.b,
      level: 4,
      lines: [`for ${vars.a} = 0 to floor(log_2 n):`, `    for ${vars.b} = 1 to 2^${vars.a}:`, '        do O(1) work'],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' }
      ],
      answer: fmtTheta('n'),
      choices: [fmtTheta('\\log n'), fmtTheta('n'), fmtTheta('n\\log n'), fmtTheta('n^2')],
      explanation: expIncreasingSumExplanation(vars.a)
    });
  }

  function qExpDecreasingSum() {
    return makeQuestion({
      id: 'L4_exp_decreasing_sum',
      level: 4,
      lines: ['u = n', 'while u >= 1:', '    for v = 1 to u:', '        do O(1) work', '    u = floor(u/2)'],
      blocks: [
        { label: 'Block 1', start: 1, end: 5, color: '#8b5cf6' }
      ],
      answer: fmtTheta('n'),
      choices: [fmtTheta('\\log n'), fmtTheta('n'), fmtTheta('n\\log n'), fmtTheta('n^2')],
      explanation: expDecreasingSumExplanation('t')
    });
  }

  function shuffleChoices(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const templatesByLevel = {
    1: [qLinear, qLogGrowth, qTriangular],
    2: [qIndependentNested, qPolyInner, qOuterNInnerLogN],
    3: [qTripleDependent, qSequentialPolyPlusLog],
    4: [qExpIncreasingSum, qExpDecreasingSum]
  };

  return {
    getTemplatesForLevel(level) {
      return templatesByLevel[level] || templatesByLevel[1];
    }
  };
})();
