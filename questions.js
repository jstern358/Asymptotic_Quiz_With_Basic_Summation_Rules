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

  function shuffledChoices(correct, wrongs) {
    const copy = [correct, ...wrongs];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function makeQuestion({ id, level, lines, blocks, answer, choices, explanation }) {
    return { id, level, code: { lines, blocks }, answer, choices, explanation };
  }

  function makeSummary(blockSummaries, steps, finalRuntime) {
    return { blockSummaries, steps, finalRuntime };
  }

  function simplifyPolynomialSumStep(indexVar, canonicalPower, variantText) {
    return {
      title: 'Simplify the sum',
      content:
        `We now simplify the summation to a canonical form. ${variantText} ` +
        `For polynomial-type summands, multiplying by positive constants, shifting bounds by constants, and replacing expressions such as ` +
        `\\(${indexVar}-c\\), \\(${indexVar}+c\\), or \\(${indexVar}/c\\) by \\(${indexVar}\\) changes only constant factors or lower-order terms. ` +
        `So the sum has the same asymptotic order as the canonical polynomial sum ` +
        `\\[\\sum_{${indexVar}=1}^{n} ${indexVar}^{${canonicalPower}}\\].`
    };
  }

  function linearExplanation(v) {
    return makeSummary(
      [{ name: 'Loop body', lines: 'lines 1-2', perExecution: '\\(c_1\\)', executions: `${v} takes all values from 1 through n`, contribution: '\\(c_1 n\\)' }],
      [
        { title: 'Summary', content: `This is a single linear loop in the variable ${v}.` },
        { title: 'Count executions', content: `${v} takes each integer value from 1 through n, so the body executes n times.` },
        { title: 'Exact runtime', content: '\\[T(n)=c_1 n\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n)\\]' }
      ],
      fmtTheta('n')
    );
  }

  function logGrowthExplanation(v, mult) {
    return makeSummary(
      [
        { name: 'Initialization', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '1', contribution: '\\(c_1\\)' },
        { name: 'While-loop body', lines: 'lines 2-4', perExecution: '\\(c_2\\)', executions: `the number of times ${v} can be multiplied by ${mult} before exceeding n`, contribution: '\\(c_2 \cdot \text{(#iterations)}\\)' }
      ],
      [
        { title: 'Summary', content: `We analyze the loop directly in terms of ${v}, so the explanation uses the same variable name as the pseudocode.` },
        { title: 'Track the loop variable', content: `After t iterations, \\(${v}=${mult}^t\\). The loop continues while \\(${mult}^t \\le n\\).` },
        { title: 'Solve for the iteration count', content: `\\[${mult}^t \\le n \\implies t=\\Theta(\\log n)\\]` },
        { title: 'Exact runtime', content: '\\[T(n)=c_1+c_2 t\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(1)+\\Theta(\\log n)=\\Theta(\\log n)\\]' }
      ],
      fmtTheta('\\log n')
    );
  }

  function logDecayExplanation(v) {
    return makeSummary(
      [
        { name: 'Initialization', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '1', contribution: '\\(c_1\\)' },
        { name: 'While-loop body', lines: 'lines 2-4', perExecution: '\\(c_2\\)', executions: `the number of times ${v} can be halved before dropping below 1`, contribution: '\\(c_2 \cdot \text{(#iterations)}\\)' }
      ],
      [
        { title: 'Summary', content: `The variable ${v} shrinks by a factor of 2 each iteration, so the number of iterations is logarithmic.` },
        { title: 'Track the loop variable', content: `After t iterations, \\(${v}\\approx n/2^t\\). The loop stops when \\(n/2^t < 1\\).` },
        { title: 'Solve for the iteration count', content: `\\[n/2^t < 1 \\implies 2^t > n \\implies t=\\Theta(\\log n)\\]` },
        { title: 'Exact runtime', content: '\\[T(n)=c_1+c_2 t\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(1)+\\Theta(\\log n)=\\Theta(\\log n)\\]' }
      ],
      fmtTheta('\\log n')
    );
  }

  function independentNestedExplanation(i, j) {
    return makeSummary(
      [
        { name: 'Outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: `${i} takes all values from 1 through n`, contribution: '\\(c_1 n\\)' },
        { name: 'Inner loop body', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: `for each fixed ${i}, ${j} takes all values from 1 through n`, contribution: '\\(c_2 n\\) for each outer iteration' }
      ],
      [
        { title: 'Summary', content: `The inner loop bound does not depend on ${i}, so the two iteration counts multiply directly.` },
        { title: 'Count the inner work', content: `For each fixed ${i}, the inner loop executes n times.` },
        { title: 'Multiply outer and inner counts', content: '\\[n \\cdot n = n^2\\]' },
        { title: 'Exact runtime', content: '\\[T(n)=c_1 n + n(c_2 n)\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n^2)\\]' }
      ],
      fmtTheta('n^2')
    );
  }

  function triangularExplanation(i) {
    return makeSummary(
      [
        { name: 'Outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: `${i} takes all values from 1 through n`, contribution: '\\(c_1 n\\)' },
        { name: 'Inner loop body', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: `for fixed ${i}, exactly ${i} times`, contribution: `\\(c_2 ${i}\\)` }
      ],
      [
        { title: 'Summary', content: `The inner loop depends on ${i}, so we first compute the cost for a fixed ${i}, and then sum over all values of ${i}.` },
        { title: 'Exact runtime', content: `\\[T(n)=c_1 n + \\sum_{${i}=1}^{n} c_2 ${i}\\]` },
        { title: 'Form the summation', content: `For each fixed ${i}, the inner loop contributes \\(c_2 ${i}\\), so the total repeated work is \\(\\sum_{${i}=1}^{n} c_2 ${i}\\).` },
        simplifyPolynomialSumStep(i, 1, 'This sum is already in canonical form.'),
        { title: 'Classify the sum', content: `${i} is a degree-1 polynomial summand, so \\(\\sum_{${i}=1}^{n} ${i}=\\Theta(n^2)\\).` },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n^2)\\]' }
      ],
      fmtTheta('n^2')
    );
  }

  function polyInnerExplanation(i, power) {
    return makeSummary(
      [
        { name: 'Outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: `${i} takes all values from 1 through n`, contribution: '\\(c_1 n\\)' },
        { name: 'Inner loop body', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: `for fixed ${i}, exactly ${i}^${power} times`, contribution: `\\(c_2 ${i}^{${power}}\\)` }
      ],
      [
        { title: 'Summary', content: `For each fixed ${i}, the inner loop contributes \\(${i}^{${power}}\\), so we sum over ${i}.` },
        { title: 'Exact runtime', content: `\\[T(n)=c_1 n + \\sum_{${i}=1}^{n} c_2 ${i}^{${power}}\\]` },
        { title: 'Form the summation', content: `The repeated work is \\(\\sum_{${i}=1}^{n} c_2 ${i}^{${power}}\\).` },
        simplifyPolynomialSumStep(i, power, 'This sum is already in canonical polynomial form.'),
        { title: 'Classify the sum', content: `This is a polynomial-type sum of degree ${power}, so \\(\\sum_{${i}=1}^{n} ${i}^{${power}}=\\Theta(n^{${power + 1}})\\).` },
        { title: 'Final runtime', content: `\\[T(n)=\\Theta(n^{${power + 1}})\\]` }
      ],
      fmtTheta(`n^${power + 1}`)
    );
  }

  function shiftedTriangularExplanation(i, j) {
    return makeSummary(
      [
        { name: 'Outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: `${i} takes values from 3 through n-2`, contribution: '\\(\\Theta(n)\\)' },
        { name: 'Inner loop body', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: `for fixed ${i}, ${j} takes values from 2 through ${i}-1`, contribution: `\\(c_2(${i}-2)\\)` }
      ],
      [
        { title: 'Summary', content: `The inner loop still grows linearly with ${i}, but the bounds are shifted by constants.` },
        { title: 'Exact runtime', content: `\\[T(n)=\\Theta(n)+\\sum_{${i}=3}^{n-2} c_2(${i}-2)\\]` },
        { title: 'Form the summation', content: `For fixed ${i}, the inner loop executes ${i}-2 times.` },
        simplifyPolynomialSumStep(i, 1, `The lower bound starts at 3 instead of 1, the upper bound ends at n-2 instead of n, and the summand is ${i}-2 instead of ${i}. By the lecture-slide rule, these constant shifts do not change the asymptotic order.`),
        { title: 'Canonical sum', content: `\\[\\sum_{${i}=3}^{n-2} (${i}-2)=\\Theta\\!\\left(\\sum_{${i}=1}^{n} ${i}\\right)=\\Theta(n^2)\\]` },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n^2)\\]' }
      ],
      fmtTheta('n^2')
    );
  }

  function scaledPolynomialExplanation(i) {
    return makeSummary(
      [
        { name: 'Outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: `${i} takes values from 1 through \\lfloor n/2 \\rfloor-3`, contribution: '\\(\\Theta(n)\\)' },
        { name: 'Inner loop body', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: `for fixed ${i}, exactly ${i}^2 times`, contribution: `\\(c_2 ${i}^2\\)` }
      ],
      [
        { title: 'Summary', content: `The upper bound is scaled and shifted, but the summand is still polynomial.` },
        { title: 'Exact runtime', content: `\\[T(n)=\\Theta(n)+\\sum_{${i}=1}^{\\lfloor n/2 \\rfloor-3} c_2 ${i}^2\\]` },
        { title: 'Form the summation', content: `The repeated work is \\(\\sum_{${i}=1}^{\\lfloor n/2 \\rfloor-3} c_2 ${i}^2\\).` },
        simplifyPolynomialSumStep(i, 2, `The upper bound \\(\\lfloor n/2 \\rfloor-3\\) differs from n only by a constant factor and a constant shift. By the lecture-slide rule, this sum has the same asymptotic order as \\(\\sum_{${i}=1}^{n} ${i}^2\\).`),
        { title: 'Canonical sum', content: `\\[\\sum_{${i}=1}^{\\lfloor n/2 \\rfloor-3} ${i}^2=\\Theta\\!\\left(\\sum_{${i}=1}^{n} ${i}^2\\right)=\\Theta(n^3)\\]` },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n^3)\\]' }
      ],
      fmtTheta('n^3')
    );
  }

  function outerNInnerLogNExplanation(i, j) {
    return makeSummary(
      [
        { name: 'Outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: `${i} takes all values from 1 through n`, contribution: '\\(c_1 n\\)' },
        { name: 'Inner while-loop', lines: 'lines 2-5', perExecution: '\\(c_2\\)', executions: `for each fixed ${i}, the number of times ${j} can double before exceeding n`, contribution: '\\(\\Theta(\\log n)\\) for each outer iteration' }
      ],
      [
        { title: 'Summary', content: `The outer loop repeats n times, and for each outer iteration the inner loop is logarithmic in n.` },
        { title: 'Inner loop cost', content: `For each fixed ${i}, ${j} starts at 1 and doubles until it exceeds n, so the inner loop costs \\(\\Theta(\\log n)\\).` },
        { title: 'Multiply', content: '\\[n \\cdot \\Theta(\\log n)=\\Theta(n\\log n)\\]' },
        { title: 'Exact runtime', content: '\\[T(n)=\\Theta(n)+n\\cdot\\Theta(\\log n)\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n\\log n)\\]' }
      ],
      fmtTheta('n\\log n')
    );
  }

  function sequentialLinearTriangularExplanation(i) {
    return makeSummary(
      [
        { name: 'First section', lines: 'lines 1-2', perExecution: '\\(c_1\\)', executions: 'n', contribution: '\\(c_1 n\\)' },
        { name: 'Second section outer loop', lines: 'line 4', perExecution: '\\(c_2\\)', executions: 'n', contribution: '\\(c_2 n\\)' },
        { name: 'Second section inner body', lines: 'lines 5-6', perExecution: '\\(c_3\\)', executions: `for fixed ${i}, exactly ${i} times`, contribution: `\\(c_3 ${i}\\)` }
      ],
      [
        { title: 'Summary', content: 'There are two sequential sections, so their runtimes add. The second section contains a dependent nested loop, so it becomes a summation.' },
        { title: 'Exact runtime', content: `\\[T(n)=c_1 n + c_2 n + \\sum_{${i}=1}^{n} c_3 ${i}\\]` },
        { title: 'Simplify the sum', content: `The nontrivial summation is already in canonical form: \\(\\sum_{${i}=1}^{n} ${i}\\).` },
        { title: 'Evaluate the sum', content: `\\[\\sum_{${i}=1}^{n} ${i}=\\Theta(n^2)\\]` },
        { title: 'Add the sequential sections', content: '\\[\\Theta(n)+\\Theta(n)+\\Theta(n^2)=\\Theta(n^2)\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n^2)\\]' }
      ],
      fmtTheta('n^2')
    );
  }

  function sequentialQuadraticPlusLinearExplanation(i) {
    return makeSummary(
      [
        { name: 'Quadratic section outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: 'n', contribution: '\\(c_1 n\\)' },
        { name: 'Quadratic section inner body', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: `for fixed ${i}, exactly ${i}^2 times`, contribution: `\\(c_2 ${i}^2\\)` },
        { name: 'Linear section', lines: 'lines 5-6', perExecution: '\\(c_3\\)', executions: 'n', contribution: '\\(c_3 n\\)' }
      ],
      [
        { title: 'Summary', content: 'There are two sequential sections: a quadratic-inner polynomial section and a separate linear section.' },
        { title: 'Exact runtime', content: `\\[T(n)=\\sum_{${i}=1}^{n} c_2 ${i}^2 + c_3 n\\]` },
        { title: 'Simplify the sum', content: `The sum is already in canonical form: \\(\\sum_{${i}=1}^{n} ${i}^2\\).` },
        { title: 'Evaluate the sum', content: `\\[\\sum_{${i}=1}^{n} ${i}^2=\\Theta(n^3)\\]` },
        { title: 'Add the sequential sections', content: '\\[\\Theta(n^3)+\\Theta(n)=\\Theta(n^3)\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n^3)\\]' }
      ],
      fmtTheta('n^3')
    );
  }

  function logOuterLinearInnerExplanation(i, j) {
    return makeSummary(
      [
        { name: 'Initialization', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '1', contribution: '\\(c_1\\)' },
        { name: 'Outer while-loop', lines: 'lines 2-5', perExecution: 'the full inner linear loop cost for one while-iteration', executions: `the number of times ${i} can double before exceeding n`, contribution: 'linear-per-iteration cost times logarithmically many iterations' },
        { name: 'Inner linear loop', lines: 'lines 3-4', perExecution: '\\(c_3\\)', executions: `for each fixed value of ${i}, ${j} takes all values from 1 through n`, contribution: '\\(c_3 n\\) per while-iteration' }
      ],
      [
        { title: 'Summary', content: `For each outer while-iteration, the inner loop contributes \\(\\Theta(n)\\). The variable ${i} doubles, so the number of while-iterations is logarithmic.` },
        { title: 'Cost per outer iteration', content: '\\[\\Theta(n)\\]' },
        { title: 'Number of outer iterations', content: `\\[${i}=2^t \\le n \\implies t=\\Theta(\\log n)\\]` },
        { title: 'Multiply', content: '\\[\\Theta(n)\\cdot\\Theta(\\log n)=\\Theta(n\\log n)\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n\\log n)\\]' }
      ],
      fmtTheta('n\\log n')
    );
  }

  function tripleDependentExplanation(i, j) {
    return makeSummary(
      [
        { name: 'Outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: `${i} takes all values from 1 through n`, contribution: '\\(c_1 n\\)' },
        { name: 'Middle loop', lines: 'line 2', perExecution: '\\(c_2\\)', executions: `for fixed ${i}, exactly ${i} times`, contribution: `\\(c_2 ${i}\\)` },
        { name: 'Innermost loop', lines: 'lines 3-4', perExecution: '\\(c_3\\)', executions: `for fixed ${i} and ${j}, exactly ${j} times`, contribution: `\\(c_3 ${j}\\)` }
      ],
      [
        { title: 'Summary', content: `Work from the inside out. The innermost loop depends on ${j}, and the middle loop depends on ${i}.` },
        { title: 'Inner summation', content: `For fixed ${i}, \\(\\sum_{${j}=1}^{${i}} ${j}=\\Theta(${i}^2)\\).` },
        simplifyPolynomialSumStep(i, 2, `After simplifying the inner summation, the outer sum becomes a polynomial sum in ${i}.`),
        { title: 'Outer summation', content: `\\[\\sum_{${i}=1}^{n} ${i}^2 = \\Theta(n^3)\\]` },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n^3)\\]' }
      ],
      fmtTheta('n^3')
    );
  }

  function seqPolyPlusLogExplanation(i, c) {
    return makeSummary(
      [
        { name: 'Polynomial section', lines: 'lines 1-3', perExecution: `for fixed ${i}, \\(${i}^2\\)`, executions: `${i}=1 through n`, contribution: '\\(\\Theta(n^3)\\)' },
        { name: 'Logarithmic section', lines: 'lines 5-8', perExecution: '\\(c_4\\)', executions: `the number of times ${c} can double before exceeding n`, contribution: '\\(\\Theta(\\log n)\\)' }
      ],
      [
        { title: 'Summary', content: 'There are two sequential sections: a polynomial section and a logarithmic section.' },
        { title: 'First section', content: `\\[\\sum_{${i}=1}^{n} ${i}^2 = \\Theta(n^3)\\]` },
        { title: 'Simplify the sum', content: `The first summation is already in canonical form, so it simplifies directly to \\(\\Theta(n^3)\\).` },
        { title: 'Second section', content: `The variable ${c} doubles, so the second section is \\(\\Theta(\\log n)\\).` },
        { title: 'Add the sequential sections', content: '\\[\\Theta(n^3)+\\Theta(\\log n)=\\Theta(n^3)\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n^3)\\]' }
      ],
      fmtTheta('n^3')
    );
  }

  function expIncreasingSumExplanation(i) {
    return makeSummary(
      [
        { name: 'Outer loop', lines: 'line 1', perExecution: '\\(c_1\\)', executions: '\\(\\lfloor \\log_2 n \\rfloor + 1\\)', contribution: '\\(\\Theta(\\log n)\\)' },
        { name: 'Inner loop body', lines: 'lines 2-3', perExecution: '\\(c_2\\)', executions: `for fixed ${i}, exactly 2^${i} times`, contribution: `\\(c_2 2^${i}\\)` }
      ],
      [
        { title: 'Summary', content: `The summand grows exponentially with ${i}, so the sum is dominated by its last term.` },
        { title: 'Exact runtime', content: `\\[T(n)=\\Theta(\\log n)+\\sum_{${i}=0}^{\\lfloor \\log_2 n \\rfloor} c_2 2^${i}\\]` },
        { title: 'Simplify the sum', content: `The upper bound \\(\\lfloor \\log_2 n \\rfloor\\) is already canonical for an exponentially increasing sum. The relevant last term is \\(2^{\\lfloor \\log_2 n \\rfloor}\\).` },
        { title: 'Evaluate the dominant term', content: '\\[2^{\\lfloor \\log_2 n \\rfloor}=\\Theta(n)\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n)\\]' }
      ],
      fmtTheta('n')
    );
  }

  function expDecreasingSumExplanation(t) {
    return makeSummary(
      [
        { name: 'Outer halving loop', lines: 'lines 1-5', perExecution: 'current inner contribution', executions: 'logarithmically many outer iterations', contribution: 'captured by geometric summation' },
        { name: 'Inner linear loop', lines: 'lines 3-4', perExecution: '\\(c_3\\)', executions: 'current outer value times', contribution: 'current outer value' }
      ],
      [
        { title: 'Summary', content: 'The outer variable halves each time, so the inner contributions form a geometrically decreasing sum.' },
        { title: 'Summation', content: `\\[\\sum_{${t}=0}^{\\lfloor \\log_2 n \\rfloor} \\frac{n}{2^${t}}\\]` },
        { title: 'Simplify the sum', content: `This is already in canonical exponentially decreasing form. The first term dominates.` },
        { title: 'Evaluate the dominant term', content: '\\[\\frac{n}{2^0}=n\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n)\\]' }
      ],
      fmtTheta('n')
    );
  }

  function mixedDominanceExplanation(i) {
    return makeSummary(
      [
        { name: 'Triangular section', lines: 'lines 1-3', perExecution: `for fixed ${i}, \\(${i}\\)`, executions: `${i}=1 through n`, contribution: '\\(\\Theta(n^2)\\)' },
        { name: 'Quadratic-inner section', lines: 'lines 5-7', perExecution: `for fixed ${i}, \\(${i}^2\\)`, executions: `${i}=1 through n`, contribution: '\\(\\Theta(n^3)\\)' },
        { name: 'Logarithmic section', lines: 'lines 9-12', perExecution: '\\(c_3\\)', executions: '\\(\\Theta(\\log n)\\)', contribution: '\\(\\Theta(\\log n)\\)' }
      ],
      [
        { title: 'Summary', content: 'This problem has three sequential sections, so the total runtime is the sum of the runtimes of the three sections.' },
        { title: 'Section 1', content: `\\[\\sum_{${i}=1}^{n} ${i}=\\Theta(n^2)\\]` },
        { title: 'Section 2', content: `\\[\\sum_{${i}=1}^{n} ${i}^2=\\Theta(n^3)\\]` },
        { title: 'Section 3', content: '\\[\\Theta(\\log n)\\]' },
        { title: 'Add and compare', content: '\\[\\Theta(n^2)+\\Theta(n^3)+\\Theta(\\log n)=\\Theta(n^3)\\]' },
        { title: 'Final runtime', content: '\\[T(n)=\\Theta(n^3)\\]' }
      ],
      fmtTheta('n^3')
    );
  }

  function qLinear() {
    const v = varSet().a;
    return makeQuestion({
      id: 'L1_linear_' + v,
      level: 1,
      lines: [`for ${v} = 1 to n:`, '    do O(1) work'],
      blocks: [{ label: 'Block 1', start: 1, end: 2, color: '#10b981' }],
      answer: fmtTheta('n'),
      choices: shuffledChoices(fmtTheta('n'), [fmtTheta('1'), fmtTheta('\\log n'), fmtTheta('n^2')]),
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
      choices: shuffledChoices(fmtTheta('\\log n'), [fmtTheta('1'), fmtTheta('n'), fmtTheta('n\\log n')]),
      explanation: logGrowthExplanation(v, mult)
    });
  }

  function qLogDecay() {
    const v = varSet().a;
    return makeQuestion({
      id: 'L1_log_decay_' + v,
      level: 1,
      lines: [`${v} = n`, `while ${v} >= 1:`, '    do O(1) work', `    ${v} = floor(${v}/2)`],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#10b981' },
        { label: 'Block 2', start: 2, end: 4, color: '#8b5cf6' }
      ],
      answer: fmtTheta('\\log n'),
      choices: shuffledChoices(fmtTheta('\\log n'), [fmtTheta('1'), fmtTheta('n'), fmtTheta('n^2')]),
      explanation: logDecayExplanation(v)
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
      choices: shuffledChoices(fmtTheta('n^2'), [fmtTheta('n'), fmtTheta('n\\log n'), fmtTheta('n^3')]),
      explanation: triangularExplanation(vars.a)
    });
  }

  function qIndependentNested() {
    const vars = varSet();
    return makeQuestion({
      id: 'L2_independent_nested_' + vars.a + vars.b,
      level: 2,
      lines: [`for ${vars.a} = 1 to n:`, `    for ${vars.b} = 1 to n:`, '        do O(1) work'],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' }
      ],
      answer: fmtTheta('n^2'),
      choices: shuffledChoices(fmtTheta('n^2'), [fmtTheta('n'), fmtTheta('n\\log n'), fmtTheta('n^3')]),
      explanation: independentNestedExplanation(vars.a, vars.b)
    });
  }

  function qSequentialLinearTriangular() {
    const vars = varSet();
    return makeQuestion({
      id: 'L2_seq_linear_triangular_' + vars.a + vars.b,
      level: 2,
      lines: [`for ${vars.a} = 1 to n:`, '    do O(1) work', '', `for ${vars.a} = 1 to n:`, `    for ${vars.b} = 1 to ${vars.a}:`, '        do O(1) work'],
      blocks: [
        { label: 'Block 1', start: 1, end: 2, color: '#10b981' },
        { label: 'Block 2', start: 4, end: 4, color: '#60a5fa' },
        { label: 'Block 3', start: 5, end: 6, color: '#f59e0b' }
      ],
      answer: fmtTheta('n^2'),
      choices: shuffledChoices(fmtTheta('n^2'), [fmtTheta('n'), fmtTheta('n\\log n'), fmtTheta('n^3')]),
      explanation: sequentialLinearTriangularExplanation(vars.a)
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
      choices: shuffledChoices(fmtTheta('n\\log n'), [fmtTheta('\\log n'), fmtTheta('n'), fmtTheta('n^2')]),
      explanation: outerNInnerLogNExplanation(vars.a, vars.b)
    });
  }

  function qPolyInner2() {
    const vars = varSet();
    return makeQuestion({
      id: 'L3_poly_inner2_' + vars.a,
      level: 3,
      lines: [`for ${vars.a} = 1 to n:`, `    for ${vars.b} = 1 to ${vars.a}^2:`, '        do O(1) work'],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' }
      ],
      answer: fmtTheta('n^3'),
      choices: shuffledChoices(fmtTheta('n^3'), [fmtTheta('n^2'), fmtTheta('n\\log n'), fmtTheta('n^4')]),
      explanation: polyInnerExplanation(vars.a, 2)
    });
  }

  function qPolyInner3() {
    const vars = varSet();
    return makeQuestion({
      id: 'L3_poly_inner3_' + vars.a,
      level: 3,
      lines: [`for ${vars.a} = 1 to n:`, `    for ${vars.b} = 1 to ${vars.a}^3:`, '        do O(1) work'],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' }
      ],
      answer: fmtTheta('n^4'),
      choices: shuffledChoices(fmtTheta('n^4'), [fmtTheta('n^3'), fmtTheta('n^5'), fmtTheta('n^2')]),
      explanation: polyInnerExplanation(vars.a, 3)
    });
  }

  function qLogOuterLinearInner() {
    const vars = varSet();
    return makeQuestion({
      id: 'L3_log_outer_linear_inner_' + vars.a + vars.b,
      level: 3,
      lines: [`${vars.a} = 1`, `while ${vars.a} <= n:`, `    for ${vars.b} = 1 to n:`, '        do O(1) work', `    ${vars.a} = 2*${vars.a}`],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#10b981' },
        { label: 'Block 2', start: 2, end: 5, color: '#8b5cf6' },
        { label: 'Block 3', start: 3, end: 4, color: '#f59e0b' }
      ],
      answer: fmtTheta('n\\log n'),
      choices: shuffledChoices(fmtTheta('n\\log n'), [fmtTheta('\\log n'), fmtTheta('n'), fmtTheta('n^2')]),
      explanation: logOuterLinearInnerExplanation(vars.a, vars.b)
    });
  }

  function qSequentialQuadraticPlusLinear() {
    const vars = varSet();
    return makeQuestion({
      id: 'L3_seq_quadratic_plus_linear_' + vars.a,
      level: 3,
      lines: [`for ${vars.a} = 1 to n:`, `    for ${vars.b} = 1 to ${vars.a}^2:`, '        do O(1) work', '', 'for t = 1 to n:', '    do O(1) work'],
      blocks: [
        { label: 'Block 1', start: 1, end: 3, color: '#f59e0b' },
        { label: 'Block 2', start: 5, end: 6, color: '#10b981' }
      ],
      answer: fmtTheta('n^3'),
      choices: shuffledChoices(fmtTheta('n^3'), [fmtTheta('n^2'), fmtTheta('n\\log n'), fmtTheta('n^4')]),
      explanation: sequentialQuadraticPlusLinearExplanation(vars.a)
    });
  }

  function qTripleDependent() {
    const vars = varSet();
    return makeQuestion({
      id: 'L4_triple_dependent_' + vars.a + vars.b + vars.c,
      level: 4,
      lines: [`for ${vars.a} = 1 to n:`, `    for ${vars.b} = 1 to ${vars.a}:`, `        for ${vars.c} = 1 to ${vars.b}:`, '            do O(1) work'],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 2, color: '#0ea5e9' },
        { label: 'Block 3', start: 3, end: 4, color: '#f59e0b' }
      ],
      answer: fmtTheta('n^3'),
      choices: shuffledChoices(fmtTheta('n^3'), [fmtTheta('n^2'), fmtTheta('n^4'), fmtTheta('n\\log n')]),
      explanation: tripleDependentExplanation(vars.a, vars.b)
    });
  }

  function qShiftedTriangular() {
    const vars = varSet();
    return makeQuestion({
      id: 'L4_shifted_triangular_' + vars.a + vars.b,
      level: 4,
      lines: [`for ${vars.a} = 3 to n-2:`, `    for ${vars.b} = 2 to ${vars.a}-1:`, '        do O(1) work'],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' }
      ],
      answer: fmtTheta('n^2'),
      choices: shuffledChoices(fmtTheta('n^2'), [fmtTheta('n'), fmtTheta('n\\log n'), fmtTheta('n^3')]),
      explanation: shiftedTriangularExplanation(vars.a, vars.b)
    });
  }

  function qScaledPolynomial() {
    const vars = varSet();
    return makeQuestion({
      id: 'L4_scaled_polynomial_' + vars.a + vars.b,
      level: 4,
      lines: [`for ${vars.a} = 1 to floor(n/2)-3:`, `    for ${vars.b} = 1 to ${vars.a}^2:`, '        do O(1) work'],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' }
      ],
      answer: fmtTheta('n^3'),
      choices: shuffledChoices(fmtTheta('n^3'), [fmtTheta('n^2'), fmtTheta('n^4'), fmtTheta('n\\log n')]),
      explanation: scaledPolynomialExplanation(vars.a)
    });
  }

  function qExpIncreasingSum() {
    const vars = varSet();
    return makeQuestion({
      id: 'L5_exp_increasing_sum_' + vars.a + vars.b,
      level: 5,
      lines: [`for ${vars.a} = 0 to floor(log_2 n):`, `    for ${vars.b} = 1 to 2^${vars.a}:`, '        do O(1) work'],
      blocks: [
        { label: 'Block 1', start: 1, end: 1, color: '#60a5fa' },
        { label: 'Block 2', start: 2, end: 3, color: '#f59e0b' }
      ],
      answer: fmtTheta('n'),
      choices: shuffledChoices(fmtTheta('n'), [fmtTheta('\\log n'), fmtTheta('n\\log n'), fmtTheta('n^2')]),
      explanation: expIncreasingSumExplanation(vars.a)
    });
  }

  function qExpDecreasingSum() {
    return makeQuestion({
      id: 'L5_exp_decreasing_sum',
      level: 5,
      lines: ['u = n', 'while u >= 1:', '    for v = 1 to u:', '        do O(1) work', '    u = floor(u/2)'],
      blocks: [
        { label: 'Block 1', start: 1, end: 5, color: '#8b5cf6' }
      ],
      answer: fmtTheta('n'),
      choices: shuffledChoices(fmtTheta('n'), [fmtTheta('\\log n'), fmtTheta('n\\log n'), fmtTheta('n^2')]),
      explanation: expDecreasingSumExplanation('t')
    });
  }

  function qMixedDominance() {
    const vars = varSet();
    return makeQuestion({
      id: 'L5_mixed_dominance_' + vars.a + vars.b + vars.c,
      level: 5,
      lines: [`for ${vars.a} = 1 to n:`, `    for ${vars.b} = 1 to ${vars.a}:`, '        do O(1) work', '', `for ${vars.a} = 1 to n:`, `    for ${vars.b} = 1 to ${vars.a}^2:`, '        do O(1) work', '', `${vars.c} = 1`, `while ${vars.c} <= n:`, '    do O(1) work', `    ${vars.c} = 2*${vars.c}`],
      blocks: [
        { label: 'Block 1', start: 1, end: 3, color: '#0ea5e9' },
        { label: 'Block 2', start: 5, end: 7, color: '#f59e0b' },
        { label: 'Block 3', start: 9, end: 12, color: '#8b5cf6' }
      ],
      answer: fmtTheta('n^3'),
      choices: shuffledChoices(fmtTheta('n^3'), [fmtTheta('n^2'), fmtTheta('n\\log n'), fmtTheta('n^3\\log n')]),
      explanation: mixedDominanceExplanation(vars.a)
    });
  }

  const templatesByLevel = {
    1: [qLinear, qLogGrowth, qLogDecay, qTriangular],
    2: [qIndependentNested, qSequentialLinearTriangular, qOuterNInnerLogN],
    3: [qPolyInner2, qPolyInner3, qLogOuterLinearInner, qSequentialQuadraticPlusLinear],
    4: [qTripleDependent, qShiftedTriangular, qScaledPolynomial],
    5: [qExpIncreasingSum, qExpDecreasingSum, qMixedDominance]
  };

  return {
    getTemplatesForLevel(level) {
      return templatesByLevel[level] || templatesByLevel[1];
    }
  };
})();
