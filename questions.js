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
    return '\\(\\Theta(' + s + ')\\)';
  }

  function makeQuestion({ id, level, lines, blocks, answer, choices, explanation }) {
    return { id, level, code: { lines, blocks }, answer, choices, explanation };
  }

  function qLinear() {
    const v = varSet().a;
    return makeQuestion({
      id: 'L1_linear_' + v,
      level: 1,
      lines: [
        `for ${v} = 1 to n:`,
        `    do O(1) work`
      ],
      blocks: [{ label: 'Block 1', start: 1, end: 2, color: '#10b981' }],
      answer: fmtTheta('n'),
      choices: [fmtTheta('1'), fmtTheta('\\log n'), fmtTheta('n'), fmtTheta('n^2')],
      explanation: {
        hasSummation: false,
        blockSummaries: [
          {
            name: 'Block 1: loop body',
            lines: 'lines 1-2',
            perExecution: '\\(c_1\\)',
            executions: '\\(n\\)',
            contribution: '\\(c_1 n\\)',
            note: `${v} takes each integer value from 1 through n.`
          }
        ],
        exactIntro: 'There is only one repeated block, so the exact-style runtime is just the cost of one execution times the number of executions.',
        exactRuntime: '\\[T(n)=c_1 n\\]',
        compositionRule: 'There is only one block, so there is no need to add sequential pieces or form a summation over a changing inner-loop contribution.',
        analysisIntro: 'This is a direct count of loop iterations. No summation classification is needed.',
        analysisDisplay: '\\[\\text{# iterations}=n\\]',
        asymptoticIntro: 'Replace the exact-style expression by its asymptotic order.',
        asymptoticSimplification: '\\[T(n)=c_1 n = \\Theta(n)\\]',
        finalRuntime: '\\(\\Theta(n)\\)'
      }
    });
  }

  function qTriangular() {
    const vars = varSet();
    return makeQuestion({
      id: 'L1_triangular_' + vars.a + vars.b,
      level: 1,
      lines: [
        `for ${vars.a} = 1 to n:`,
        `    for ${vars.b} = 1 to ${vars.a}:`,
        `        do O(1) work`
      ],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' }
      ],
      answer: fmtTheta('n^2'),
      choices: [fmtTheta('n'), fmtTheta('n \\log n'), fmtTheta('n^2'), fmtTheta('n^3')],
      explanation: {
        hasSummation: true,
        blockSummaries: [
          {
            name: 'Block 1: outer loop',
            lines: 'line 1',
            perExecution: '\\(c_1\\)',
            executions: '\\(n\\)',
            contribution: '\\(c_1 n\\)',
            note: `${vars.a} ranges from 1 to n.`
          },
          {
            name: 'Block 2: inner loop body',
            lines: 'lines 2-3',
            perExecution: '\\(c_2\\)',
            executions: `for a fixed \\(${vars.a}\\), exactly \\(${vars.a}\\) times`,
            contribution: `for fixed \\(${vars.a}\\): \\(c_2 ${vars.a}\\)`,
            note: `When ${vars.a} is fixed, ${vars.b} runs from 1 through ${vars.a}.`
          }
        ],
        exactIntro: `First analyze Block 2 for one fixed outer-loop value \\(${vars.a}\\). For that fixed value, Block 2 contributes \\(c_2 ${vars.a}\\). Then add those contributions over all outer-loop values.`,
        exactRuntime: `\\[T(n)=c_1 n + \\sum_{${vars.a}=1}^{n} c_2 ${vars.a}\\]`,
        compositionRule: 'Block 2 is nested inside Block 1. Because the number of executions of Block 2 depends on the current outer-loop value, first compute the fixed-outer-value contribution, then sum over the outer loop.',
        analysisIntro: 'The summation appears only after computing the total contribution of Block 2 for a fixed outer-loop value. The explicit bounds come from the outer loop.',
        analysisDisplay: `\\[\\text{For fixed } ${vars.a},\\; \\text{Block 2 contributes } c_2 ${vars.a}.\\]\n\\[\\therefore \\sum_{${vars.a}=1}^{n} c_2 ${vars.a}\\]`,
        classificationTarget: `The summand is \\(f(${vars.a})=${vars.a}\\).`,
        typeName: 'Polynomial type',
        typeReason: `The function \\(f(${vars.a})=${vars.a}\\) is eventually nonnegative and nondecreasing. Also \\(f(${vars.a}/2)=${vars.a}/2\\), so \\(f(${vars.a})=2f(${vars.a}/2)\\). Therefore the polynomial-type criterion applies.`,
        typeImplication: `For polynomial-type functions, \\(\\sum_{${vars.a}=1}^{n} f(${vars.a}) = \\Theta(n f(n))\\). Here \\(f(n)=n\\), so \\(\\sum_{${vars.a}=1}^{n} ${vars.a} = \\Theta(n^2)\\).`,
        asymptoticIntro: 'Substitute the asymptotic value of the summation and simplify.',
        asymptoticSimplification: `\\[T(n)=c_1 n + \\sum_{${vars.a}=1}^{n} c_2 ${vars.a}\n= \\Theta(n)+\\Theta\\!\\left(\\sum_{${vars.a}=1}^{n} ${vars.a}\\right)\n= \\Theta(n)+\\Theta(n^2)\n= \\Theta(n^2)\\]`,
        finalRuntime: '\\(\\Theta(n^2)\\)'
      }
    });
  }

  function qLogGrowth() {
    const v = varSet().a;
    const mult = sample([2, 3]);
    return makeQuestion({
      id: 'L1_log_growth_' + v + '_' + mult,
      level: 1,
      lines: [
        `${v} = 1`,
        `while ${v} <= n:`,
        `    do O(1) work`,
        `    ${v} = ${mult}*${v}`
      ],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#10b981' },
        { label: 'Block 2', start: 2, end: 4, color: '#8b5cf6' }
      ],
      answer: fmtTheta('\\log n'),
      choices: [fmtTheta('1'), fmtTheta('\\log n'), fmtTheta('n'), fmtTheta('n \\log n')],
      explanation: {
        hasSummation: false,
        blockSummaries: [
          { name: 'Block 1: initialization', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '\\(1\\)', contribution: '\\(c_1\\)', note: `The assignment ${v}=1 happens once.` },
          { name: 'Block 2: while-loop body', lines: 'lines 2-4', perExecution: '\\(c_2\\)', executions: '\\(k\\) times', contribution: '\\(c_2 k\\)', note: 'Keep the cost of one iteration separate from the number of loop iterations.' }
        ],
        exactIntro: 'There is no summation here. One execution of Block 2 costs \\(c_2\\), and Block 2 repeats \\(k\\) times, so its contribution is \\(c_2 k\\).',
        exactRuntime: '\\[T(n)=c_1+c_2 k\\]',
        compositionRule: 'Block 1 runs once, and then Block 2 repeats. So the only remaining task is to determine the iteration count \\(k\\).',
        analysisIntro: 'Because no fixed-outer-value contributions are being added across a range of indices, there is no summation to classify. Solve directly for \\(k\\).',
        analysisDisplay: `\\[\\text{After } k \\text{ iterations, } ${v}=${mult}^{k}.\\]\n\\[${mult}^{k} \\le n \\implies k \\le \\log_${mult}(n).\\]\n\\[\\therefore k=\\Theta(\\log n).\\]`,
        asymptoticIntro: 'Substitute the iteration count into the exact-style runtime expression.',
        asymptoticSimplification: '\\[T(n)=c_1+c_2 k = \\Theta(1)+\\Theta(\\log n)=\\Theta(\\log n)\\]',
        finalRuntime: '\\(\\Theta(\\log n)\\)'
      }
    });
  }

  function qLogDecay() {
    const v = varSet().a;
    return makeQuestion({
      id: 'L1_log_decay_' + v,
      level: 1,
      lines: [
        `${v} = n`,
        `while ${v} >= 1:`,
        `    do O(1) work`,
        `    ${v} = floor(${v}/2)`
      ],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#10b981' },
        { label: 'Block 2', start: 2, end: 4, color: '#8b5cf6' }
      ],
      answer: fmtTheta('\\log n'),
      choices: [fmtTheta('1'), fmtTheta('\\log n'), fmtTheta('n'), fmtTheta('n^2')],
      explanation: {
        hasSummation: false,
        blockSummaries: [
          { name: 'Block 1: initialization', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '\\(1\\)', contribution: '\\(c_1\\)', note: `The assignment ${v}=n happens once.` },
          { name: 'Block 2: while-loop body', lines: 'lines 2-4', perExecution: '\\(c_2\\)', executions: '\\(k\\) times', contribution: '\\(c_2 k\\)', note: 'Again, keep cost per iteration separate from iteration count.' }
        ],
        exactIntro: 'There is still no summation. The contribution of the loop body is cost per iteration times number of iterations.',
        exactRuntime: '\\[T(n)=c_1+c_2 k\\]',
        compositionRule: 'Block 1 happens once; Block 2 repeats until the loop variable falls below 1.',
        analysisIntro: 'No summation type applies here because nothing is being summed over an index. Instead, solve for the number of halvings.',
        analysisDisplay: `\\[\\text{After } k \\text{ iterations, } ${v}\\approx n/2^k.\\]\n\\[n/2^k < 1 \\implies 2^k > n.\\]\n\\[\\therefore k=\\Theta(\\log n).\\]`,
        asymptoticIntro: 'Substitute the logarithmic iteration count.',
        asymptoticSimplification: '\\[T(n)=c_1+c_2 k = \\Theta(1)+\\Theta(\\log n)=\\Theta(\\log n)\\]',
        finalRuntime: '\\(\\Theta(\\log n)\\)'
      }
    });
  }

  function qIndependentNested() {
    const vars = varSet();
    return makeQuestion({
      id: 'L2_independent_nested_' + vars.a + vars.b,
      level: 2,
      lines: [
        `for ${vars.a} = 1 to n:`,
        `    for ${vars.b} = 1 to n:`,
        `        do O(1) work`
      ],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' }
      ],
      answer: fmtTheta('n^2'),
      choices: [fmtTheta('n'), fmtTheta('n \\log n'), fmtTheta('n^2'), fmtTheta('n^3')],
      explanation: {
        hasSummation: false,
        blockSummaries: [
          { name: 'Block 1: outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '\\(n\\)', contribution: '\\(c_1 n\\)', note: `${vars.a} ranges from 1 through n.` },
          { name: 'Block 2: inner loop body', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: 'for each fixed outer-loop value, \\(n\\) times', contribution: 'for fixed outer-loop value: \\(c_2 n\\)', note: `The inner loop bound does not depend on ${vars.a}.` }
        ],
        exactIntro: 'For each fixed outer-loop value, the entire inner block contributes \\(c_2 n\\). Then the outer loop repeats that inner contribution \\(n\\) times.',
        exactRuntime: '\\[T(n)=c_1 n + n(c_2 n)\\]',
        compositionRule: 'This is nested repetition, but the inner-loop contribution is the same for every outer-loop iteration. So a direct product is enough; no nontrivial summation is needed.',
        analysisIntro: 'Since the inner contribution is identical on each outer-loop iteration, multiply the two counts directly.',
        analysisDisplay: '\\[n \\text{ outer iterations} \\times n \\text{ inner iterations per outer iteration} = n^2\\]',
        asymptoticIntro: 'Simplify the product.',
        asymptoticSimplification: '\\[T(n)=c_1 n + n(c_2 n)=\\Theta(n)+\\Theta(n^2)=\\Theta(n^2)\\]',
        finalRuntime: '\\(\\Theta(n^2)\\)'
      }
    });
  }

  function qOuterNInnerLogN() {
    const vars = varSet();
    return makeQuestion({
      id: 'L2_outer_n_inner_logn_' + vars.a + vars.b,
      level: 2,
      lines: [
        `for ${vars.a} = 1 to n:`,
        `    ${vars.b} = 1`,
        `    while ${vars.b} <= n:`,
        `        do O(1) work`,
        `        ${vars.b} = 2*${vars.b}`
      ],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 5, color: '#8b5cf6' }
      ],
      answer: fmtTheta('n \\log n'),
      choices: [fmtTheta('\\log n'), fmtTheta('n'), fmtTheta('n \\log n'), fmtTheta('n^2')],
      explanation: {
        hasSummation: false,
        blockSummaries: [
          { name: 'Block 1: outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '\\(n\\)', contribution: '\\(c_1 n\\)', note: `${vars.a} ranges from 1 through n.` },
          { name: 'Block 2: reinitialized logarithmic inner loop', lines: 'lines 2-5', perExecution: 'for one inner-loop iteration, \\(c_2\\)', executions: 'for each fixed outer-loop value, \\(\\Theta(\\log n)\\) iterations', contribution: 'for fixed outer-loop value: \\(\\Theta(\\log n)\\)', note: `Because ${vars.b} is reset to 1 for every outer-loop iteration, each outer-loop pass incurs a fresh logarithmic loop.` }
        ],
        exactIntro: 'For one fixed outer-loop value, the inner while loop runs logarithmically many times. Then the outer loop repeats that entire inner contribution \\(n\\) times.',
        exactRuntime: '\\[T(n)=c_1 n + n\\cdot \\Theta(\\log n)\\]',
        compositionRule: 'The inner while loop does not depend on the outer-loop index except that it is restarted every time. Therefore each outer iteration costs \\(\\Theta(\\log n)\\), and the total is that cost repeated \\(n\\) times.',
        analysisIntro: 'No summation classification is needed because the same logarithmic inner cost is repeated on every outer iteration.',
        analysisDisplay: '\\[n \\times \\Theta(\\log n)=\\Theta(n\\log n)\\]',
        asymptoticIntro: 'Multiply the per-outer-iteration cost by the number of outer iterations.',
        asymptoticSimplification: '\\[T(n)=\\Theta(n)+\\Theta(n\\log n)=\\Theta(n\\log n)\\]',
        finalRuntime: '\\(\\Theta(n\\log n)\\)'
      }
    });
  }

  function qPolyInner() {
    const vars = varSet();
    const pow = sample([2, 3]);
    const answer = pow === 2 ? fmtTheta('n^3') : fmtTheta('n^4');
    return makeQuestion({
      id: 'L2_poly_inner_' + vars.a + '_' + pow,
      level: 2,
      lines: [
        `for ${vars.a} = 1 to n:`,
        `    for ${vars.b} = 1 to ${vars.a}^${pow}:`,
        `        do O(1) work`
      ],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' }
      ],
      answer,
      choices: pow === 2
        ? [fmtTheta('n^2'), fmtTheta('n^3'), fmtTheta('n \\log n'), fmtTheta('n^4')]
        : [fmtTheta('n^3'), fmtTheta('n^4'), fmtTheta('n^5'), fmtTheta('n^2')],
      explanation: {
        hasSummation: true,
        blockSummaries: [
          { name: 'Block 1: outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '\\(n\\)', contribution: '\\(c_1 n\\)', note: `${vars.a} ranges from 1 through n.` },
          { name: 'Block 2: inner loop body', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: `for fixed \\(${vars.a}\\), exactly \\(${vars.a}^{${pow}}\\) times`, contribution: `for fixed \\(${vars.a}\\): \\(c_2 ${vars.a}^{${pow}}\\)`, note: 'The inner-loop bound is a polynomial in the outer variable.' }
        ],
        exactIntro: `For one fixed outer-loop value, Block 2 contributes \\(c_2 ${vars.a}^{${pow}}\\). Then sum those contributions over all outer-loop values.`,
        exactRuntime: `\\[T(n)=c_1 n + \\sum_{${vars.a}=1}^{n} c_2 ${vars.a}^{${pow}}\\]`,
        compositionRule: 'The inner block is nested inside the outer loop, and its number of executions depends on the current outer-loop value, so we need a summation over the outer index.',
        analysisIntro: 'The explicit summation bounds come from the outer loop. The summand is the total contribution of Block 2 for one fixed outer-loop value.',
        analysisDisplay: `\\[\\text{For fixed } ${vars.a},\\; \\text{Block 2 contributes } c_2 ${vars.a}^{${pow}}.\\]\n\\[\\therefore \\sum_{${vars.a}=1}^{n} c_2 ${vars.a}^{${pow}}\\]`,
        classificationTarget: `The summand is \\(f(${vars.a})=${vars.a}^{${pow}}\\).`,
        typeName: 'Polynomial type',
        typeReason: `The function \\(f(${vars.a})=${vars.a}^{${pow}}\\) is eventually nonnegative and nondecreasing. Also \\(f(${vars.a}/2)=(${vars.a}/2)^{${pow}}=${vars.a}^{${pow}}/2^{${pow}}\\), so \\(f(${vars.a})=2^{${pow}}f(${vars.a}/2)\\). Therefore the polynomial-type criterion holds.`,
        typeImplication: `For polynomial-type functions, \\(\\sum_{${vars.a}=1}^{n} f(${vars.a})=\\Theta(n f(n))\\). Here \\(f(n)=n^{${pow}}\\), so the sum is \\(\\Theta(n^{${pow + 1}})\\).`,
        asymptoticIntro: 'Substitute the asymptotic value of the summation and simplify.',
        asymptoticSimplification: `\\[T(n)=c_1 n + \\sum_{${vars.a}=1}^{n} c_2 ${vars.a}^{${pow}}\n= \\Theta(n)+\\Theta\\!\\left(\\sum_{${vars.a}=1}^{n} ${vars.a}^{${pow}}\\right)\n= \\Theta(n)+\\Theta(n^{${pow + 1}})\n= \\Theta(n^{${pow + 1}})\\]`,
        finalRuntime: pow === 2 ? '\\(\\Theta(n^3)\\)' : '\\(\\Theta(n^4)\\)'
      }
    });
  }

  function qSequentialLinearTriangular() {
    const vars = varSet();
    return makeQuestion({
      id: 'L2_seq_linear_triangular_' + vars.a + vars.b,
      level: 2,
      lines: [
        `for ${vars.a} = 1 to n:`,
        `    do O(1) work`,
        '',
        `for ${vars.a} = 1 to n:`,
        `    for ${vars.b} = 1 to ${vars.a}:`,
        `        do O(1) work`
      ],
      blocks: [
        { label: 'Block 1', start: 1, end: 2, color: '#10b981' },
        { label: 'Block 2', start: 4, end: 4, color: '#60a5fa' },
        { label: 'Block 3', start: 5, end: 6, color: '#f59e0b' }
      ],
      answer: fmtTheta('n^2'),
      choices: [fmtTheta('n'), fmtTheta('n \\log n'), fmtTheta('n^2'), fmtTheta('n^3')],
      explanation: {
        hasSummation: true,
        blockSummaries: [
          { name: 'Block 1: first linear block', lines: 'lines 1-2', perExecution: '\\(c_1\\)', executions: '\\(n\\)', contribution: '\\(c_1 n\\)', note: 'This is a complete sequential block by itself.' },
          { name: 'Block 2: outer loop of second section', lines: 'line 4', perExecution: '\\(c_2\\)', executions: '\\(n\\)', contribution: '\\(c_2 n\\)', note: 'This controls the second major section.' },
          { name: 'Block 3: inner loop body of second section', lines: 'lines 5-6', perExecution: '\\(c_3\\)', executions: `for fixed \\(${vars.a}\\), exactly \\(${vars.a}\\) times`, contribution: `for fixed \\(${vars.a}\\): \\(c_3 ${vars.a}\\)`, note: 'This block depends on the current outer-loop value of the second section.' }
        ],
        exactIntro: 'Add the first sequential block to the second major section. Inside the second section, first compute the fixed-outer-value contribution of the inner block, then sum over the outer-loop values.',
        exactRuntime: `\\[T(n)=c_1 n + c_2 n + \\sum_{${vars.a}=1}^{n} c_3 ${vars.a}\\]`,
        compositionRule: 'Use both rules: sequential pieces add, while the dependent inner block of the second section creates a summation over the outer index.',
        analysisIntro: 'Only Block 3 creates a nontrivial summation. The summation bounds come directly from Block 2.',
        analysisDisplay: `\\[\\text{For fixed } ${vars.a},\\; \\text{Block 3 contributes } c_3 ${vars.a}.\\]\n\\[\\therefore \\sum_{${vars.a}=1}^{n} c_3 ${vars.a}\\]`,
        classificationTarget: `The summand is \\(f(${vars.a})=${vars.a}\\).`,
        typeName: 'Polynomial type',
        typeReason: `The function \\(f(${vars.a})=${vars.a}\\) satisfies \\(f(${vars.a})=2f(${vars.a}/2)\\), so the polynomial-type criterion applies.`,
        typeImplication: `Therefore \\(\\sum_{${vars.a}=1}^{n} ${vars.a}=\\Theta(n^2)\\). The linear terms are lower order than the quadratic term.`,
        asymptoticIntro: 'Keep only the dominant term after substituting the asymptotic value of the sum.',
        asymptoticSimplification: `\\[T(n)=\\Theta(n)+\\Theta(n)+\\Theta\\!\\left(\\sum_{${vars.a}=1}^{n} ${vars.a}\\right)=\\Theta(n^2)\\]`,
        finalRuntime: '\\(\\Theta(n^2)\\)'
      }
    });
  }

  function qTripleDependent() {
    const vars = varSet();
    return makeQuestion({
      id: 'L3_triple_dependent_' + vars.a + vars.b + vars.c,
      level: 3,
      lines: [
        `for ${vars.a} = 1 to n:`,
        `    for ${vars.b} = 1 to ${vars.a}:`,
        `        for ${vars.c} = 1 to ${vars.b}:`,
        `            do O(1) work`
      ],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 2, color: '#0ea5e9' },
        { label: 'Block 3', start: 3, end: 4, color: '#f59e0b' }
      ],
      answer: fmtTheta('n^3'),
      choices: [fmtTheta('n^2'), fmtTheta('n^3'), fmtTheta('n^4'), fmtTheta('n \\log n')],
      explanation: {
        hasSummation: true,
        blockSummaries: [
          { name: 'Block 1: outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '\\(n\\)', contribution: '\\(c_1 n\\)', note: `${vars.a} ranges from 1 to n.` },
          { name: 'Block 2: middle loop header', lines: 'line 2', perExecution: '\\(c_2\\)', executions: `for fixed \\(${vars.a}\\), exactly \\(${vars.a}\\) times`, contribution: `for fixed \\(${vars.a}\\): \\(c_2 ${vars.a}\\)`, note: `For a fixed ${vars.a}, the middle loop runs ${vars.a} times.` },
          { name: 'Block 3: innermost loop body', lines: 'lines 3-4', perExecution: '\\(c_3\\)', executions: `for fixed \\(${vars.a},${vars.b}\\), exactly \\(${vars.b}\\) times`, contribution: `for fixed \\(${vars.a},${vars.b}\\): \\(c_3 ${vars.b}\\)`, note: `For fixed ${vars.a} and ${vars.b}, the innermost loop runs ${vars.b} times.` }
        ],
        exactIntro: `Work from the inside out. For fixed \\(${vars.a},${vars.b}\\), Block 3 contributes \\(c_3 ${vars.b}\\). Summing over \\(${vars.b}=1\\) to \\(${vars.a}\\) gives a contribution of order \\(${vars.a}^2\\) for fixed \\(${vars.a}\\). Then sum over \\(${vars.a}=1\\) to \\(${vars.a}=n\\).`,
        exactRuntime: `\\[T(n)=c_1 n + \\sum_{${vars.a}=1}^{n}\\left(c_2 ${vars.a} + \\sum_{${vars.b}=1}^{${vars.a}} c_3 ${vars.b}\\right)\\]`,
        compositionRule: 'Because each inner loop depends on the current value of an outer index, analyze from the inside outward, converting one dependent loop at a time into a summation.',
        analysisIntro: 'First form the inner summation over the middle-loop index. That produces a polynomial in the outer index; then sum that polynomial over the outer loop.',
        analysisDisplay: `\\[\\text{For fixed } ${vars.a},\\; \\sum_{${vars.b}=1}^{${vars.a}} c_3 ${vars.b}=\\Theta(${vars.a}^2).\\]\n\\[\\therefore T(n)=\\Theta\\!\\left(\\sum_{${vars.a}=1}^{n} ${vars.a}^2\\right).\\]`,
        classificationTarget: `After evaluating the inner sum asymptotically, the outer summand is \\(f(${vars.a})=${vars.a}^2\\).`,
        typeName: 'Polynomial type',
        typeReason: `The function \\(f(${vars.a})=${vars.a}^2\\) is eventually nonnegative and nondecreasing, and \\(f(${vars.a})=4f(${vars.a}/2)\\). So the polynomial-type criterion applies.`,
        typeImplication: `Therefore \\(\\sum_{${vars.a}=1}^{n} ${vars.a}^2 = \\Theta(n^3)\\).`,
        asymptoticIntro: 'Substitute the asymptotic value of the outer summation.',
        asymptoticSimplification: `\\[T(n)=\\Theta\\!\\left(\\sum_{${vars.a}=1}^{n} ${vars.a}^2\\right)=\\Theta(n^3)\\]`,
        finalRuntime: '\\(\\Theta(n^3)\\)'
      }
    });
  }

  function qSequentialPolyPlusLog() {
    const vars = varSet();
    return makeQuestion({
      id: 'L3_seq_poly_log_' + vars.a + vars.b + vars.c,
      level: 3,
      lines: [
        `for ${vars.a} = 1 to n:`,
        `    for ${vars.b} = 1 to ${vars.a}^2:`,
        `        do O(1) work`,
        '',
        `${vars.c} = 1`,
        `while ${vars.c} <= n:`,
        `    do O(1) work`,
        `    ${vars.c} = 2*${vars.c}`
      ],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' },
        { label: 'Block 3', start: 5, end: 5, color: '#10b981' },
        { label: 'Block 4', start: 6, end: 8, color: '#8b5cf6' }
      ],
      answer: fmtTheta('n^3'),
      choices: [fmtTheta('n^2'), fmtTheta('n^3'), fmtTheta('n^3 \\log n'), fmtTheta('n \\log n')],
      explanation: {
        hasSummation: true,
        blockSummaries: [
          { name: 'Block 1: outer loop of first section', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '\\(n\\)', contribution: '\\(c_1 n\\)', note: 'This begins the polynomial first section.' },
          { name: 'Block 2: inner block of first section', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: `for fixed \\(${vars.a}\\), exactly \\(${vars.a}^2\\) times`, contribution: `for fixed \\(${vars.a}\\): \\(c_2 ${vars.a}^2\\)`, note: 'This yields the dominant polynomial sum.' },
          { name: 'Block 3: initialization of second section', lines: 'line 5', perExecution: '\\(c_3\\)', executions: '\\(1\\)', contribution: '\\(c_3\\)', note: 'This starts the logarithmic second section.' },
          { name: 'Block 4: logarithmic loop of second section', lines: 'lines 6-8', perExecution: '\\(c_4\\)', executions: '\\(\\Theta(\\log n)\\)', contribution: '\\(\\Theta(\\log n)\\)', note: 'This is a separate sequential piece.' }
        ],
        exactIntro: 'Add the two sequential sections. The first section produces a polynomial summation, while the second section contributes only logarithmic work.',
        exactRuntime: `\\[T(n)=c_1 n + \\sum_{${vars.a}=1}^{n} c_2 ${vars.a}^2 + c_3 + \\Theta(\\log n)\\]`,
        compositionRule: 'Sequential sections add. Only the first section requires summation classification; the second section is handled by direct iteration counting.',
        analysisIntro: 'The only nontrivial summation comes from Block 2 in the first section.',
        analysisDisplay: `\\[\\sum_{${vars.a}=1}^{n} c_2 ${vars.a}^2\\]`,
        classificationTarget: `The summand is \\(f(${vars.a})=${vars.a}^2\\).`,
        typeName: 'Polynomial type',
        typeReason: `Since \\(f(${vars.a})=${vars.a}^2\\) and \\(f(${vars.a})=4f(${vars.a}/2)\\), the polynomial-type criterion applies.`,
        typeImplication: `Therefore \\(\\sum_{${vars.a}=1}^{n} ${vars.a}^2=\\Theta(n^3)\\). The separate logarithmic term is lower order.`,
        asymptoticIntro: 'Keep only the dominant sequential term.',
        asymptoticSimplification: `\\[T(n)=\\Theta(n^3)+\\Theta(\\log n)=\\Theta(n^3)\\]`,
        finalRuntime: '\\(\\Theta(n^3)\\)'
      }
    });
  }

  function qLogOuterLinearInner() {
    const vars = varSet();
    return makeQuestion({
      id: 'L3_log_outer_linear_inner_' + vars.a + vars.b,
      level: 3,
      lines: [
        `${vars.a} = 1`,
        `while ${vars.a} <= n:`,
        `    for ${vars.b} = 1 to n:`,
        `        do O(1) work`,
        `    ${vars.a} = 2*${vars.a}`
      ],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#10b981' },
        { label: 'Block 2', start: 2, end: 5, color: '#8b5cf6' },
        { label: 'Block 3', start: 3, end: 4, color: '#f59e0b' }
      ],
      answer: fmtTheta('n \\log n'),
      choices: [fmtTheta('\\log n'), fmtTheta('n'), fmtTheta('n \\log n'), fmtTheta('n^2')],
      explanation: {
        hasSummation: false,
        blockSummaries: [
          { name: 'Block 1: initialization', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '\\(1\\)', contribution: '\\(c_1\\)', note: 'This happens once.' },
          { name: 'Block 2: outer logarithmic repetition', lines: 'lines 2-5', perExecution: 'for one outer while-iteration, the inner loop contributes \\(\\Theta(n)\\)', executions: '\\(\\Theta(\\log n)\\)', contribution: '\\(\\Theta(n\\log n)\\)', note: 'The while-loop doubles the control variable each time.' },
          { name: 'Block 3: inner linear loop', lines: 'lines 3-4', perExecution: '\\(c_3\\)', executions: 'for one outer while-iteration, \\(n\\) times', contribution: 'for one outer while-iteration: \\(c_3 n\\)', note: 'This inner work is the same on every while-iteration.' }
        ],
        exactIntro: 'For one iteration of the while loop, the inner for loop contributes \\(c_3 n\\). Then the while loop repeats that entire contribution logarithmically many times.',
        exactRuntime: '\\[T(n)=c_1 + \\Theta(\\log n)\\cdot(c_3 n)\\]',
        compositionRule: 'Because the inner linear contribution is the same on every while-iteration, use a direct product: linear work per while-iteration times logarithmically many while-iterations.',
        analysisIntro: 'No summation type is needed, because the repeated inner cost is identical on each outer repetition.',
        analysisDisplay: '\\[\\Theta(\\log n) \\times \\Theta(n)=\\Theta(n\\log n)\\]',
        asymptoticIntro: 'Multiply the per-while-iteration cost by the number of while-iterations.',
        asymptoticSimplification: '\\[T(n)=\\Theta(n\\log n)\\]',
        finalRuntime: '\\(\\Theta(n\\log n)\\)'
      }
    });
  }

  function qExpIncreasingSum() {
    const vars = varSet();
    return makeQuestion({
      id: 'L4_exp_increasing_sum_' + vars.a + vars.b,
      level: 4,
      lines: [
        `for ${vars.a} = 0 to floor(log_2 n):`,
        `    for ${vars.b} = 1 to 2^${vars.a}:`,
        `        do O(1) work`
      ],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' }
      ],
      answer: fmtTheta('n'),
      choices: [fmtTheta('\\log n'), fmtTheta('n'), fmtTheta('n \\log n'), fmtTheta('n^2')],
      explanation: {
        hasSummation: true,
        blockSummaries: [
          { name: 'Block 1: outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '\\(\\lfloor \\log_2 n \\rfloor + 1\\)', contribution: '\\(\\Theta(\\log n)\\)', note: 'The outer loop itself is logarithmic.' },
          { name: 'Block 2: inner loop body', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: `for fixed \\(${vars.a}\\), exactly \\(2^{${vars.a}}\\) times`, contribution: `for fixed \\(${vars.a}\\): \\(c_2 2^{${vars.a}}\\)`, note: 'The inner bound grows exponentially with the outer index.' }
        ],
        exactIntro: `For one fixed outer-loop value, Block 2 contributes \\(c_2 2^{${vars.a}}\\). Then sum over the logarithmically many outer-loop values.`,
        exactRuntime: `\\[T(n)=\\Theta(\\log n) + \\sum_{${vars.a}=0}^{\\lfloor \\log_2 n \\rfloor} c_2 2^{${vars.a}}\\]`,
        compositionRule: 'The inner-loop contribution depends on the current outer-loop value, so form a summation over the outer index.',
        analysisIntro: 'The summation bounds come from the outer loop, and the summand grows exponentially in the outer index.',
        analysisDisplay: `\\[\\text{For fixed } ${vars.a},\\; \\text{Block 2 contributes } c_2 2^{${vars.a}}.\\]\n\\[\\therefore \\sum_{${vars.a}=0}^{\\lfloor \\log_2 n \\rfloor} c_2 2^{${vars.a}}\\]`,
        classificationTarget: `The summand is \\(f(${vars.a})=2^{${vars.a}}\\).`,
        typeName: 'Exponentially increasing type',
        typeReason: 'Each time the index increases by 1, the summand is multiplied by 2, so the terms increase geometrically.',
        typeImplication: `For an exponentially increasing summation, the sum is asymptotically the same order as its last term. Here the last term is \\(2^{\\lfloor \\log_2 n \\rfloor}=\\Theta(n)\\), so the whole sum is \\(\\Theta(n)\\).`,
        asymptoticIntro: 'The geometric sum dominates the outer-loop header cost.',
        asymptoticSimplification: `\\[T(n)=\\Theta(\\log n)+\\Theta\\!\\left(\\sum_{${vars.a}=0}^{\\lfloor \\log_2 n \\rfloor}2^{${vars.a}}\\right)\n=\\Theta(\\log n)+\\Theta(n)\n=\\Theta(n)\\]`,
        finalRuntime: '\\(\\Theta(n)\\)'
      }
    });
  }

  function qExpDecreasingSum() {
    const vars = varSet();
    return makeQuestion({
      id: 'L4_exp_decreasing_sum_' + vars.a + vars.b,
      level: 4,
      lines: [
        `${vars.a} = n`,
        `while ${vars.a} >= 1:`,
        `    for ${vars.b} = 1 to ${vars.a}:`,
        `        do O(1) work`,
        `    ${vars.a} = floor(${vars.a}/2)`
      ],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#10b981' },
        { label: 'Block 2', start: 2, end: 5, color: '#8b5cf6' },
        { label: 'Block 3', start: 3, end: 4, color: '#f59e0b' }
      ],
      answer: fmtTheta('n'),
      choices: [fmtTheta('\\log n'), fmtTheta('n'), fmtTheta('n \\log n'), fmtTheta('n^2')],
      explanation: {
        hasSummation: true,
        blockSummaries: [
          { name: 'Block 1: initialization', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '\\(1\\)', contribution: '\\(c_1\\)', note: 'The assignment happens once.' },
          { name: 'Block 2: outer halving loop', lines: 'lines 2-5', perExecution: 'the inner block contribution for the current value of the control variable', executions: '\\(\\Theta(\\log n)\\)', contribution: 'captured by the summation below', note: 'The control variable halves each time.' },
          { name: 'Block 3: inner linear loop body', lines: 'lines 3-4', perExecution: '\\(c_3\\)', executions: `if the current outer value is \\(${vars.a}\\), exactly \\(${vars.a}\\) times`, contribution: `for current outer value \\(${vars.a}\\): \\(c_3 ${vars.a}\\)`, note: 'As the outer value shrinks geometrically, these per-outer-iteration contributions also shrink geometrically.' }
        ],
        exactIntro: `At the successive outer-loop iterations, the current value of the halving variable is approximately \\(n, n/2, n/4, \\dots\\). Therefore the inner-loop contributions form a geometric sum.`,
        exactRuntime: `\\[T(n)=c_1 + c_2\\log n + c_3\\left(n + n/2 + n/4 + \\cdots + 1\\right)\\]`,
        compositionRule: 'The inner contribution changes from one outer iteration to the next, so the total inner work must be added across the outer iterations. Those terms form a geometrically decreasing sequence.',
        analysisIntro: 'Re-indexing by the outer-loop iteration number gives an exponentially decreasing summation.',
        analysisDisplay: `\\[\\sum_{t=0}^{\\lfloor \\log_2 n \\rfloor} c_3 \\frac{n}{2^t}\\]`,
        classificationTarget: 'The summand is \\(f(t)=n/2^t\\) as a function of the outer-iteration number \\(t\\).',
        typeName: 'Exponentially decreasing type',
        typeReason: 'Each time \\(t\\) increases by 1, the summand is multiplied by \\(1/2\\). So the terms decrease geometrically.',
        typeImplication: 'For an exponentially decreasing summation, the sum is asymptotically the same order as its first term. The first term is \\(n\\), so the whole sum is \\(\\Theta(n)\\).',
        asymptoticIntro: 'The geometric sum dominates the extra logarithmic overhead from the outer loop control.',
        asymptoticSimplification: `\\[T(n)=\\Theta(1)+\\Theta(\\log n)+\\Theta\\!\\left(\\sum_{t=0}^{\\lfloor \\log_2 n \\rfloor}\\frac{n}{2^t}\\right)\n=\\Theta(1)+\\Theta(\\log n)+\\Theta(n)\n=\\Theta(n)\\]`,
        finalRuntime: '\\(\\Theta(n)\\)'
      }
    });
  }

  function qMixedDominance() {
    const vars = varSet();
    return makeQuestion({
      id: 'L4_mixed_dominance_' + vars.a + vars.b + vars.c,
      level: 4,
      lines: [
        `for ${vars.a} = 1 to n:`,
        `    for ${vars.b} = 1 to ${vars.a}:`,
        `        do O(1) work`,
        '',
        `for ${vars.a} = 1 to n:`,
        `    for ${vars.b} = 1 to ${vars.a}^2:`,
        `        do O(1) work`,
        '',
        `${vars.c} = 1`,
        `while ${vars.c} <= n:`,
        `    do O(1) work`,
        `    ${vars.c} = 2*${vars.c}`
      ],
      blocks: [
        { label: 'Block 1', start: 1, end: 3, color: '#0ea5e9' },
        { label: 'Block 2', start: 5, end: 7, color: '#f59e0b' },
        { label: 'Block 3', start: 9, end: 12, color: '#8b5cf6' }
      ],
      answer: fmtTheta('n^3'),
      choices: [fmtTheta('n^2'), fmtTheta('n^3'), fmtTheta('n^3 \\log n'), fmtTheta('n \\log n')],
      explanation: {
        hasSummation: true,
        blockSummaries: [
          { name: 'Block 1: triangular section', lines: 'lines 1-3', perExecution: `for fixed outer value, \\(c_1 ${vars.a}\\)`, executions: `summed over \\(${vars.a}=1\\) to \\(${vars.a}=n\\)`, contribution: '\\(\\Theta(n^2)\\)', note: 'This section alone is triangular.' },
          { name: 'Block 2: quadratic-inner section', lines: 'lines 5-7', perExecution: `for fixed outer value, \\(c_2 ${vars.a}^2\\)`, executions: `summed over \\(${vars.a}=1\\) to \\(${vars.a}=n\\)`, contribution: '\\(\\Theta(n^3)\\)', note: 'This section will dominate.' },
          { name: 'Block 3: logarithmic section', lines: 'lines 9-12', perExecution: '\\(c_3\\)', executions: '\\(\\Theta(\\log n)\\)', contribution: '\\(\\Theta(\\log n)\\)', note: 'This is lower order than the polynomial sections.' }
        ],
        exactIntro: 'Add the three sequential sections. Each section is analyzed separately, then the dominant term is kept.',
        exactRuntime: `\\[T(n)=\\sum_{${vars.a}=1}^{n} c_1 ${vars.a} + \\sum_{${vars.a}=1}^{n} c_2 ${vars.a}^2 + \\Theta(\\log n)\\]`,
        compositionRule: 'Sequential sections add. The first two sections require summations because their inner contributions depend on the current outer-loop value; the last section is only logarithmic.',
        analysisIntro: 'The key comparison is between the two polynomial-type sums.',
        analysisDisplay: `\\[\\sum_{${vars.a}=1}^{n} ${vars.a}=\\Theta(n^2), \\qquad \\sum_{${vars.a}=1}^{n} ${vars.a}^2=\\Theta(n^3).\\]`,
        classificationTarget: `The dominant summand is \\(f(${vars.a})=${vars.a}^2\\).`,
        typeName: 'Polynomial type',
        typeReason: `The dominant summand satisfies the polynomial-type criterion because \\(f(${vars.a})=4f(${vars.a}/2)\\).`,
        typeImplication: `Therefore the dominant sum is \\(\\Theta(n^3)\\), which dominates both \\(\\Theta(n^2)\\) and \\(\\Theta(\\log n)\\).`,
        asymptoticIntro: 'Keep only the highest-order sequential term.',
        asymptoticSimplification: '\\[T(n)=\\Theta(n^2)+\\Theta(n^3)+\\Theta(\\log n)=\\Theta(n^3)\\]',
        finalRuntime: '\\(\\Theta(n^3)\\)'
      }
    });
  }

  const templatesByLevel = {
    1: [qLinear, qTriangular, qLogGrowth, qLogDecay],
    2: [qIndependentNested, qOuterNInnerLogN, qPolyInner, qSequentialLinearTriangular],
    3: [qTripleDependent, qSequentialPolyPlusLog, qLogOuterLinearInner],
    4: [qExpIncreasingSum, qExpDecreasingSum, qMixedDominance]
  };

  return {
    fmtTheta,
    getTemplatesForLevel(level) {
      return templatesByLevel[level] || templatesByLevel[1];
    }
  };
})();
