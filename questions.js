window.TrainerData = (() => {
  function sample(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function vars(){ return sample([{i:'i',j:'j',k:'k'},{i:'p',j:'q',k:'r'},{i:'x',j:'y',k:'z'},{i:'u',j:'v',k:'w'}]); }
  function theta(s){ return `\(\Theta(${s})\)`; }
  function shuffleChoices(correct, wrongs){ const a=[correct,...wrongs]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function makeQuestion(o){ return { id:o.id, level:o.level, code:{lines:o.lines, blocks:o.blocks}, answer:o.answer, choices:o.choices, explanation:o.explanation }; }
  function explanation(blockSummaries, steps, finalRuntime, detailedTypeSteps=[]){ return { blockSummaries, steps, finalRuntime, detailedTypeSteps }; }

  function polyType(idx, power){
    const term = power === 1 ? idx : `${idx}^{${power}}`;
    return { title:'Determine the summation type', content:`After simplification, the canonical summand is \(f(${idx})=${term}\). This is of polynomial type.` };
  }
  function polyProof(idx, power){
    const term = power === 1 ? idx : `${idx}^{${power}}`;
    const c = 2 ** power;
    return { title:'Full summation type analysis: polynomial type', content:`Let \(f(${idx})=${term}\). For sufficiently large ${idx}, \(f(${idx})\) is nonnegative and nondecreasing. Also \[f(${idx})=${c}f(${idx}/2).\] Hence there exists a constant \(c>1\) such that \[f(${idx})\le c\,f(${idx}/2).\] Therefore the simplified summand is of polynomial type.` };
  }
  function expIncType(idx, base){
    return { title:'Determine the summation type', content:`After simplification, the canonical summand is \(f(${idx})=${base}^{${idx}}\). This is of exponentially-increasing type.` };
  }
  function expIncProof(idx, base){
    return { title:'Full summation type analysis: exponentially-increasing type', content:`Let \(f(${idx})=${base}^{${idx}}\). Choose \(k=1\) and \(c=${base}>1\). Then \[f(${idx})=${base}^{${idx}}=${base}\cdot ${base}^{${idx}-1}=c\,f(${idx}-1).\] Thus \[f(${idx})\ge c\,f(${idx}-k)\] for all sufficiently large ${idx}. Therefore the simplified summand is of exponentially-increasing type.` };
  }
  function expDecType(idx){
    return { title:'Determine the summation type', content:`After simplification, the canonical summand is \(f(${idx})=2^{-${idx}}\). This is of exponentially-decreasing type, so the canonical sum is \(\Theta(1)\).` };
  }
  function expDecProof(idx){
    return { title:'Full summation type analysis: exponentially-decreasing type', content:`Let \(f(${idx})=2^{-${idx}}\). Choose \(k=1\) and \(c=1/2\), where \(0<c<1\). Then \[f(${idx})=2^{-${idx}}=\frac{1}{2}\cdot 2^{-(${idx}-1)}=c\,f(${idx}-1).\] Hence \[f(${idx})\le c\,f(${idx}-k)\] for all sufficiently large ${idx}. Therefore the simplified summand is of exponentially-decreasing type.` };
  }

  function qLinear(){
    const v = vars().i;
    return makeQuestion({
      id: 'L1_linear_'+v,
      level: 1,
      lines: [`for ${v} = 1 to n:`, '    do O(1) work'],
      blocks: [{label:'Block 1',start:1,end:2,color:'#10b981'}],
      answer: theta('n'),
      choices: shuffleChoices(theta('n'), [theta('1'), theta('\\log n'), theta('n^2')]),
      explanation: explanation(
        [{name:'Loop body',lines:'lines 1-2',perExecution:'\\(c_1\\)',executions:`${v} takes all values from 1 through n`,contribution:'\\(c_1 n\\)'}],
        [
          {title:'Summary',content:`This is a single linear loop in the variable ${v}.`},
          {title:'Count executions',content:`${v} takes each integer value from 1 through n, so the body executes n times.`},
          {title:'Exact runtime',content:'\\[T(n)=c_1 n\\]'},
          {title:'Final runtime',content:'\\[T(n)=\\Theta(n)\\]'}
        ],
        theta('n')
      )
    });
  }

  function qLogLoop(){
    const v = vars().i;
    return makeQuestion({
      id: 'L1_log_'+v,
      level: 1,
      lines: [`${v} = 1`, `while ${v} <= n:`, '    do O(1) work', `    ${v} = 2*${v}`],
      blocks: [{label:'Block 1',start:1,end:1,color:'#10b981'},{label:'Block 2',start:2,end:4,color:'#8b5cf6'}],
      answer: theta('\\log n'),
      choices: shuffleChoices(theta('\\log n'), [theta('1'), theta('n'), theta('n\\log n')]),
      explanation: explanation(
        [{name:'Initialization',lines:'line 1',perExecution:'\\(c_1\\)',executions:'1',contribution:'\\(c_1\\)'},{name:'While-loop body',lines:'lines 2-4',perExecution:'\\(c_2\\)',executions:`the number of times ${v} can double before exceeding n`,contribution:'\\(c_2\\cdot\\text{(#iterations)}\\)'}],
        [
          {title:'Summary',content:`We analyze the loop directly in terms of ${v}.`},
          {title:'Track the loop variable',content:`After t iterations, \(${v}=2^t\), and the loop continues while \(2^t\le n\).`},
          {title:'Solve for the iteration count',content:'\\[t=\\Theta(\\log n)\\]'},
          {title:'Final runtime',content:'\\[T(n)=\\Theta(\\log n)\\]'}
        ],
        theta('\\log n')
      )
    });
  }

  function qIndependent(){
    const v = vars();
    return makeQuestion({
      id: 'L2_indep_'+v.i+v.j,
      level: 2,
      lines: [`for ${v.i} = 1 to n:`, `    for ${v.j} = 1 to n:`, '        do O(1) work'],
      blocks: [{label:'Block 1',start:1,end:1,color:'#60a5fa'},{label:'Block 2',start:2,end:3,color:'#f59e0b'}],
      answer: theta('n^2'),
      choices: shuffleChoices(theta('n^2'), [theta('n'), theta('n\\log n'), theta('n^3')]),
      explanation: explanation(
        [{name:'Outer loop',lines:'line 1',perExecution:'\\(c_1\\)',executions:`${v.i} runs from 1 through n`,contribution:'\\(c_1 n\\)'},{name:'Inner loop body',lines:'lines 2-3',perExecution:'\\(c_2\\)',executions:`for each fixed ${v.i}, ${v.j} runs from 1 through n`,contribution:'\\(c_2 n\\) per outer iteration'}],
        [
          {title:'Summary',content:`The inner loop bound does not depend on ${v.i}, so the counts multiply.`},
          {title:'Direct product',content:'\\[n\\cdot n=n^2\\]'},
          {title:'Final runtime',content:'\\[T(n)=\\Theta(n^2)\\]'}
        ],
        theta('n^2')
      )
    });
  }

  function qTriangular(){
    const v = vars();
    return makeQuestion({
      id: 'L2_tri_'+v.i+v.j,
      level: 2,
      lines: [`for ${v.i} = 1 to n:`, `    for ${v.j} = 1 to ${v.i}:`, '        do O(1) work'],
      blocks: [{label:'Block 1',start:1,end:1,color:'#60a5fa'},{label:'Block 2',start:2,end:3,color:'#f59e0b'}],
      answer: theta('n^2'),
      choices: shuffleChoices(theta('n^2'), [theta('n'), theta('n\\log n'), theta('n^3')]),
      explanation: explanation(
        [{name:'Outer loop',lines:'line 1',perExecution:'\\(c_1\\)',executions:`${v.i} runs from 1 through n`,contribution:'\\(c_1 n\\)'},{name:'Inner loop body',lines:'lines 2-3',perExecution:'\\(c_2\\)',executions:`for fixed ${v.i}, exactly ${v.i} times`,contribution:`\\(c_2 ${v.i}\\)`}],
        [
          {title:'Summary',content:`The inner loop depends on ${v.i}, so we form a sum over ${v.i}.`},
          {title:'Exact runtime',content:`\\[T(n)=c_1 n+\\sum_{${v.i}=1}^{n} c_2 ${v.i}\\]`},
          {title:'Form the summation',content:`For fixed ${v.i}, the repeated work is \(c_2 ${v.i}\).`},
          {title:'Simplify the sum',content:`This sum is already in canonical form: \\[\\sum_{${v.i}=1}^{n} ${v.i}\\].`},
          polyType(v.i,1),
          {title:'Evaluate the canonical sum',content:`\\[\\sum_{${v.i}=1}^{n} ${v.i}=\\Theta(n^2)\\]`},
          {title:'Final runtime',content:'\\[T(n)=\\Theta(n^2)\\]'}
        ],
        theta('n^2'),
        [polyProof(v.i,1)]
      )
    });
  }

  function qPolyLog(){
    const v = vars();
    return makeQuestion({
      id: 'L3_polylog_'+v.i,
      level: 3,
      lines: [`for ${v.i} = 1 to n:`, `    for ${v.j} = 1 to ${v.i}^2:`, '        do O(log n) work'],
      blocks: [{label:'Block 1',start:1,end:1,color:'#60a5fa'},{label:'Block 2',start:2,end:3,color:'#f59e0b'}],
      answer: theta('n^3\\log n'),
      choices: shuffleChoices(theta('n^3\\log n'), [theta('n^3'), theta('n^2\\log n'), theta('n^4')]),
      explanation: explanation(
        [{name:'Outer loop',lines:'line 1',perExecution:'\\(c_1\\)',executions:`${v.i} runs from 1 through n`,contribution:'\\(c_1 n\\)'},{name:'Inner loop body',lines:'lines 2-3',perExecution:'\\(\\Theta(\\log n)\\)',executions:`for fixed ${v.i}, exactly ${v.i}^2 times`,contribution:`\\((\\log n) ${v.i}^2\\)`}],
        [
          {title:'Summary',content:`For fixed ${v.i}, the inner loop contributes \((\\log n)${v.i}^2\). Because \(\\log n\) does not depend on ${v.i}, it can be factored out of the sum.`},
          {title:'Exact runtime',content:`\\[T(n)=c_1 n+\\sum_{${v.i}=1}^{n} c_2(\\log n) ${v.i}^2\\]`},
          {title:'Form the summation',content:`The repeated work is \(\\sum_{${v.i}=1}^{n}(\\log n)${v.i}^2\).`},
          {title:'Simplify the sum',content:`Since \(\\log n\) does not depend on the summation index, factor it outside the sum. The canonical sum is \\[ (\\log n)\\sum_{${v.i}=1}^{n} ${v.i}^2 \\].`},
          polyType(v.i,2),
          {title:'Evaluate the canonical sum',content:`\\[(\\log n)\\sum_{${v.i}=1}^{n} ${v.i}^2=(\\log n)\\Theta(n^3)=\\Theta(n^3\\log n)\\]`},
          {title:'Final runtime',content:'\\[T(n)=\\Theta(n^3\\log n)\\]'}
        ],
        theta('n^3\\log n'),
        [polyProof(v.i,2)]
      )
    });
  }

  function qPolyN2(){
    const v = vars();
    return makeQuestion({
      id: 'L3_polyn2_'+v.i,
      level: 3,
      lines: [`for ${v.i} = 1 to n:`, `    for ${v.j} = 1 to ${v.i}:`, '        do O(n^2) work'],
      blocks: [{label:'Block 1',start:1,end:1,color:'#60a5fa'},{label:'Block 2',start:2,end:3,color:'#f59e0b'}],
      answer: theta('n^4'),
      choices: shuffleChoices(theta('n^4'), [theta('n^3'), theta('n^4\\log n'), theta('n^5')]),
      explanation: explanation(
        [{name:'Outer loop',lines:'line 1',perExecution:'\\(c_1\\)',executions:`${v.i} runs from 1 through n`,contribution:'\\(c_1 n\\)'},{name:'Inner loop body',lines:'lines 2-3',perExecution:'\\(\\Theta(n^2)\\)',executions:`for fixed ${v.i}, exactly ${v.i} times`,contribution:`\\(n^2 ${v.i}\\)`}],
        [
          {title:'Summary',content:`For fixed ${v.i}, the inner loop contributes \(n^2 ${v.i}\). Because \(n^2\) does not depend on ${v.i}, it can be factored out of the sum.`},
          {title:'Exact runtime',content:`\\[T(n)=c_1 n+\\sum_{${v.i}=1}^{n} c_2 n^2 ${v.i}\\]`},
          {title:'Form the summation',content:`The repeated work is \(\\sum_{${v.i}=1}^{n} n^2 ${v.i}\).`},
          {title:'Simplify the sum',content:`Factor out \(n^2\). The canonical sum is \\[ n^2\\sum_{${v.i}=1}^{n} ${v.i} \\].`},
          polyType(v.i,1),
          {title:'Evaluate the canonical sum',content:`\\[n^2\\sum_{${v.i}=1}^{n} ${v.i}=n^2\\Theta(n^2)=\\Theta(n^4)\\]`},
          {title:'Final runtime',content:'\\[T(n)=\\Theta(n^4)\\]'}
        ],
        theta('n^4'),
        [polyProof(v.i,1)]
      )
    });
  }

  function qShifted(){
    const v = vars();
    return makeQuestion({
      id: 'L4_shift_'+v.i,
      level: 4,
      lines: [`for ${v.i} = 3 to n-2:`, `    for ${v.j} = 2 to ${v.i}-1:`, '        do O(n) work'],
      blocks: [{label:'Block 1',start:1,end:1,color:'#60a5fa'},{label:'Block 2',start:2,end:3,color:'#f59e0b'}],
      answer: theta('n^3'),
      choices: shuffleChoices(theta('n^3'), [theta('n^2'), theta('n^3\\log n'), theta('n^4')]),
      explanation: explanation(
        [{name:'Outer loop',lines:'line 1',perExecution:'\\(c_1\\)',executions:`${v.i} runs from 3 through n-2`,contribution:'\\(\\Theta(n)\\)'},{name:'Inner loop body',lines:'lines 2-3',perExecution:'\\(\\Theta(n)\\)',executions:`for fixed ${v.i}, exactly ${v.i}-2 times`,contribution:`\\(n(${v.i}-2)\\)`}],
        [
          {title:'Summary',content:`For fixed ${v.i}, the inner loop contributes \(n(${v.i}-2)\). Because \(n\) does not depend on ${v.i}, it can be factored out of the sum.`},
          {title:'Exact runtime',content:`\\[T(n)=\\Theta(n)+\\sum_{${v.i}=3}^{n-2} c_2 n(${v.i}-2)\\]`},
          {title:'Form the summation',content:`The repeated work is \(\\sum_{${v.i}=3}^{n-2} n(${v.i}-2)\).`},
          {title:'Simplify the sum',content:`Factor out \(n\). The lower and upper bounds differ from the canonical bounds only by constants, and the summand ${v.i}-2 differs from ${v.i} by a constant.`},
          polyType(v.i,1),
          {title:'Evaluate the canonical sum',content:`\\[n\\sum_{${v.i}=3}^{n-2} (${v.i}-2)=n\\Theta(n^2)=\\Theta(n^3)\\]`},
          {title:'Final runtime',content:'\\[T(n)=\\Theta(n^3)\\]'}
        ],
        theta('n^3'),
        [polyProof(v.i,1)]
      )
    });
  }

  function qExpInc(){
    const v = vars();
    const factor = sample([{label:'O(log n) work', latex:'\\log n', final:'n\\log n'}, {label:'O(n) work', latex:'n', final:'n^2'}]);
    return makeQuestion({
      id: 'L5_expinc_'+v.i,
      level: 5,
      lines: [`for ${v.i} = 0 to floor(log_2 n):`, `    for ${v.j} = 1 to 2^${v.i}:`, `        do ${factor.label}`],
      blocks: [{label:'Block 1',start:1,end:1,color:'#60a5fa'},{label:'Block 2',start:2,end:3,color:'#f59e0b'}],
      answer: theta(factor.final),
      choices: shuffleChoices(theta(factor.final), [theta('n'), theta('n\\log n'), theta('n^2')].filter(x=>x!==theta(factor.final))),
      explanation: explanation(
        [{name:'Outer loop',lines:'line 1',perExecution:'\\(c_1\\)',executions:'\\(\\lfloor\\log_2 n\\rfloor+1\\)',contribution:'\\(\\Theta(\\log n)\\)'},{name:'Inner loop body',lines:'lines 2-3',perExecution:`\\(\\Theta(${factor.latex})\\)`,executions:`for fixed ${v.i}, exactly 2^${v.i} times`,contribution:`\\(${factor.latex}2^${v.i}\\)`}],
        [
          {title:'Summary',content:`The summand grows exponentially with ${v.i}. Because \(${factor.latex}\) does not depend on ${v.i}, it can be factored out of the sum.`},
          {title:'Exact runtime',content:`\\[T(n)=\\Theta(\\log n)+\\sum_{${v.i}=0}^{\\lfloor \\log_2 n \\rfloor} c_2 ${factor.latex}2^${v.i}\\]`},
          {title:'Simplify the sum',content:`Factor out \(${factor.latex}\). The canonical exponentially-increasing sum is \\[${factor.latex}\\sum_{${v.i}=0}^{\\lfloor \\log_2 n \\rfloor} 2^${v.i}\\].`},
          expIncType(v.i,2),
          {title:'Evaluate the canonical sum',content:`\\[${factor.latex}\\sum_{${v.i}=0}^{\\lfloor \\log_2 n \\rfloor} 2^${v.i}=\\Theta(${factor.final})\\]`},
          {title:'Final runtime',content:`\\[T(n)=\\Theta(${factor.final})\\]`}
        ],
        theta(factor.final),
        [expIncProof(v.i,2)]
      )
    });
  }

  function qExpDec(){
    const factor = sample([{label:'O(log n) work', theta:'n\\log n'}, {label:'O(n) work', theta:'n^2'}]);
    const multiplier = factor.theta === 'n\\log n' ? 'n\\log n' : 'n^2';
    return makeQuestion({
      id: 'L5_expdec_'+factor.theta,
      level: 5,
      lines: ['u = n','while u >= 1:','    for v = 1 to u:',`        do ${factor.label}`,'    u = floor(u/2)'],
      blocks: [{label:'Block 1',start:1,end:5,color:'#8b5cf6'}],
      answer: theta(factor.theta),
      choices: shuffleChoices(theta(factor.theta), [theta('n'), theta('n\\log n'), theta('n^2')].filter(x=>x!==theta(factor.theta))),
      explanation: explanation(
        [{name:'Outer halving loop',lines:'lines 1-5',perExecution:'current inner contribution',executions:'logarithmically many outer iterations',contribution:'captured by a geometric sum'},{name:'Inner linear loop',lines:'lines 3-4',perExecution:`\\(\\Theta(${factor.theta === 'n\\log n' ? '\\log n' : 'n'})\\)`,executions:'current outer value times',contribution:`captured by ${multiplier}` }],
        [
          {title:'Summary',content:`The outer variable halves each time, so the inner contributions form a geometrically decreasing sum. The factor captured outside the canonical sum is ${multiplier}.`},
          {title:'Exact runtime',content:`\\[T(n)=\\Theta(1)+\\Theta(\\log n)+\\Theta\\!\\left(\\sum_{t=0}^{\\lfloor \\log_2 n \\rfloor} ${multiplier}2^{-t}\\right)\\]`},
          {title:'Simplify the sum',content:`Factor out the external multiplicative factor first: \\[\\sum_{t=0}^{\\lfloor \\log_2 n \\rfloor} ${multiplier}2^{-t}=${multiplier}\\sum_{t=0}^{\\lfloor \\log_2 n \\rfloor}2^{-t}\\].`},
          expDecType('t'),
          {title:'Evaluate the canonical sum',content:`\\[${multiplier}\\sum_{t=0}^{\\lfloor \\log_2 n \\rfloor}2^{-t}=\\Theta(${factor.theta})\\]`},
          {title:'Final runtime',content:`\\[T(n)=\\Theta(${factor.theta})\\]`}
        ],
        theta(factor.theta),
        [expDecProof('t')]
      )
    });
  }

  function qMixed(){
    const v = vars();
    return makeQuestion({
      id: 'L5_mixed_'+v.i,
      level: 5,
      lines: [`for ${v.i} = 1 to n:`,`    for ${v.j} = 1 to ${v.i}:`,'        do O(log n) work','',`for ${v.i} = 1 to n:`,`    for ${v.j} = 1 to ${v.i}^2:`,'        do O(1) work','',`${v.k} = 1`,`while ${v.k} <= n:`,'    do O(1) work',`${v.k} = 2*${v.k}`],
      blocks: [{label:'Block 1',start:1,end:3,color:'#0ea5e9'},{label:'Block 2',start:5,end:7,color:'#f59e0b'},{label:'Block 3',start:9,end:12,color:'#8b5cf6'}],
      answer: theta('n^3'),
      choices: shuffleChoices(theta('n^3'), [theta('n^2\\log n'), theta('n\\log n'), theta('n^3\\log n')]),
      explanation: explanation(
        [{name:'Section 1: triangular',lines:'lines 1-3',perExecution:`for fixed ${v.i}, \\(\\log n\\cdot ${v.i}\\)`,executions:`${v.i}=1 through n`,contribution:'\\(\\Theta(n^2\\log n)\\)'},{name:'Section 2: quadratic-inner',lines:'lines 5-7',perExecution:`for fixed ${v.i}, \\(${v.i}^2\\)`,executions:`${v.i}=1 through n`,contribution:'\\(\\Theta(n^3)\\)'},{name:'Section 3: logarithmic',lines:'lines 9-12',perExecution:'\\(c_3\\)',executions:'\\(\\Theta(\\log n)\\)',contribution:'\\(\\Theta(\\log n)\\)'}],
        [
          {title:'Summary',content:'This problem has three sequential sections, so the total runtime is the sum of the runtimes of the three sections.'},
          {title:'Section 1: form the sum',content:`\\[\\sum_{${v.i}=1}^{n}(\\log n)${v.i}\\]`},
          {title:'Simplify the sum',content:'Since \\(\\log n\\) does not depend on the summation index, factor it outside the sum first. The canonical sum is \\(\\sum i\\).'},
          polyType(v.i,1),
          {title:'Evaluate Section 1',content:`\\[(\\log n)\\sum_{${v.i}=1}^{n}${v.i}=\\Theta(n^2\\log n)\\]`},
          {title:'Section 2: form the sum',content:`\\[\\sum_{${v.i}=1}^{n}${v.i}^2\\]`},
          {title:'Simplify the sum',content:'Section 2 is already in canonical form.'},
          polyType(v.i,2),
          {title:'Evaluate Section 2',content:`\\[\\sum_{${v.i}=1}^{n}${v.i}^2=\\Theta(n^3)\\]`},
          {title:'Section 3',content:'\\[\\Theta(\\log n)\\]'},
          {title:'Add and compare',content:'\\[\\Theta(n^2\\log n)+\\Theta(n^3)+\\Theta(\\log n)=\\Theta(n^3)\\]'},
          {title:'Final runtime',content:'\\[T(n)=\\Theta(n^3)\\]'}
        ],
        theta('n^3'),
        [polyProof(v.i,1), polyProof(v.i,2)]
      )
    });
  }

  function qLevel3Stable(){ return sample([qPolyLog, qPolyN2, qTriangular])(); }
  function qLevel4Stable(){ return sample([qShifted, qPolyN2, qPolyLog])(); }

  const templatesByLevel = {
    1: [qLinear, qLogLoop],
    2: [qIndependent, qTriangular, qSeqLinTri, qNLogN],
    3: [qPolyLog, qPolyN2, qSeqQuadLin],
    4: [qShifted, qPolyN2, qPolyLog],
    5: [qExpInc, qExpDec, qMixed]
  };

  return {
    getTemplatesForLevel(level){
      return templatesByLevel[level] || templatesByLevel[1];
    }
  };
})();