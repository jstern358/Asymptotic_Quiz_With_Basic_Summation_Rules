window.TrainerData = (() => {
  function sample(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function varSet(){ return sample([{a:'i',b:'j',c:'k'},{a:'p',b:'q',c:'r'},{a:'x',b:'y',c:'z'},{a:'u',b:'v',c:'w'}]); }
  function theta(s){ return `\(\Theta(${s})\)`; }
  function shuffleChoices(correct, wrongs){ const a=[correct,...wrongs]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function Q(o){ return { id:o.id, level:o.level, code:{lines:o.lines, blocks:o.blocks}, answer:o.answer, choices:o.choices, explanation:o.explanation }; }
  function E(blockSummaries, steps, finalRuntime, detailedTypeSteps=[]){ return { blockSummaries, steps, finalRuntime, detailedTypeSteps }; }

  const FACTORS = [
    { label:'O(1) work', latex:'1', theta:'1' },
    { label:'O(log n) work', latex:'\\log n', theta:'\\log n' },
    { label:'O(n) work', latex:'n', theta:'n' },
    { label:'O(n^2) work', latex:'n^2', theta:'n^2' }
  ];
  function factorText(f){ return f === '1' ? '' : `Since ${f} does not depend on the summation index, we factor it outside the sum. `; }
  function factorDisplay(f){ return f === '1' ? '' : `${f}\,`; }
  function polyTerm(idx,power){ return power===1 ? idx : `${idx}^{${power}}`; }
  function chooseFactor(level){
    if(level <= 2) return FACTORS[0];
    if(level === 3) return sample([FACTORS[1], FACTORS[2], FACTORS[3]]);
    if(level === 4) return sample([FACTORS[1], FACTORS[2], FACTORS[3]]);
    return sample([FACTORS[1], FACTORS[2]]);
  }
  function multiplyTheta(a,b){ if(a==='1') return b; if(b==='1') return a; return a+b; }
  function powPlus(baseExp, extraExp){ return baseExp+extraExp; }

  function polySimplify(idx,power,msg,f='1'){ return { title:'Simplify the sum', content:`${factorText(f)}${msg} The resulting canonical sum is \[${factorDisplay(f)}\sum_{${idx}=1}^{n} ${polyTerm(idx,power)}\].` }; }
  function polyType(idx,power){ return { title:'Determine the summation type', content:`After simplification, the canonical summand is \(f(${idx})=${polyTerm(idx,power)}\). This is of polynomial type.` }; }
  function polyProof(idx,power){ const c=2**power; return { title:'Full summation type analysis: polynomial type', content:`Let \(f(${idx})=${polyTerm(idx,power)}\). For sufficiently large ${idx}, \(f(${idx})\) is nonnegative and nondecreasing. Also \[f(${idx})=${c}f(${idx}/2).\] Hence there exists a constant \(c>1\) such that \[f(${idx})\le c\,f(${idx}/2).\] Therefore the simplified summand is of polynomial type.` }; }
  function expIncSimplify(idx,base,f='1'){ return { title:'Simplify the sum', content:`${f==='1'?'':`Since ${f} does not depend on ${idx}, factor it outside the sum first. `}The canonical exponentially-increasing sum is \[${factorDisplay(f)}\sum_{${idx}=0}^{\lfloor \log_2 n \rfloor} ${base}^{${idx}}\]. The key comparison term is the last term.` }; }
  function expIncType(idx,base){ return { title:'Determine the summation type', content:`After simplification, the canonical summand is \(f(${idx})=${base}^{${idx}}\). This is of exponentially-increasing type.` }; }
  function expIncProof(idx,base){ return { title:'Full summation type analysis: exponentially-increasing type', content:`Let \(f(${idx})=${base}^{${idx}}\). Choose \(k=1\) and \(c=${base}>1\). Then \[f(${idx})=${base}^{${idx}}=${base}\cdot ${base}^{${idx}-1}=c\,f(${idx}-1).\] Thus \[f(${idx})\ge c\,f(${idx}-k)\] for all sufficiently large ${idx}. Therefore the simplified summand is of exponentially-increasing type.` }; }
  function expDecSimplify(idx,f='n'){ return { title:'Simplify the sum', content:`Factor out the external multiplicative factor first: \[\sum_{${idx}=0}^{\lfloor \log_2 n \rfloor} ${f}\,2^{-${idx}}=${f}\sum_{${idx}=0}^{\lfloor \log_2 n \rfloor} 2^{-${idx}}.\] Now the simplified sum to classify is \(\sum 2^{-${idx}}\).` }; }
  function expDecType(idx){ return { title:'Determine the summation type', content:`After simplification, the canonical summand is \(f(${idx})=2^{-${idx}}\). This is of exponentially-decreasing type, so the canonical sum is \(\Theta(1)\).` }; }
  function expDecProof(idx){ return { title:'Full summation type analysis: exponentially-decreasing type', content:`Let \(f(${idx})=2^{-${idx}}\). Choose \(k=1\) and \(c=1/2\), where \(0<c<1\). Then \[f(${idx})=2^{-${idx}}=\frac{1}{2}\cdot 2^{-(${idx}-1)}=c\,f(${idx}-1).\] Hence \[f(${idx})\le c\,f(${idx}-k)\] for all sufficiently large ${idx}. Therefore the simplified summand is of exponentially-decreasing type.` }; }

  function polyQuestion(level, opts){
    const v = varSet();
    const idx = v.a, inner = v.b;
    const factor = opts.factor || chooseFactor(level);
    const power = opts.power;
    const finalBaseExp = power + 1;
    let finalTheta = factor.theta === '1' ? `n^${finalBaseExp}` : (factor.theta === '\\log n' ? `n^${finalBaseExp}\\log n` : `n^${powPlus(finalBaseExp, parseInt(factor.theta.replace('n^','').replace('n','1')))}${factor.theta==='n'?'':' '}`);
    if (factor.theta === 'n') finalTheta = `n^${finalBaseExp+1}`;
    if (factor.theta === 'n^2') finalTheta = `n^${finalBaseExp+2}`;
    const sumLatex = opts.sumLatex(idx, factor.latex);
    const exactLatex = opts.exactLatex(idx, factor.latex);
    const evalLatex = opts.evalLatex(idx, factor.latex, finalTheta);
    const lines = opts.lines(idx, inner, factor.label);
    const blocks = opts.blocks || [{label:'Block 1',start:1,end:1,color:'#60a5fa'},{label:'Block 2',start:2,end:3,color:'#f59e0b'}];
    const explanation = E(
      opts.blockSummaries(idx, factor.latex),
      [
        {title:'Summary',content:opts.summary(idx, factor.latex)},
        {title:'Exact runtime',content:exactLatex},
        {title:'Form the summation',content:`The repeated work is \(${sumLatex}\).`},
        polySimplify(idx, power, opts.simplifyMsg(idx), factor.latex),
        polyType(idx,power),
        {title:'Evaluate the canonical sum',content:evalLatex},
        {title:'Final runtime',content:`\[T(n)=\Theta(${finalTheta})\]`}
      ],
      theta(finalTheta),
      [polyProof(idx,power)]
    );
    const distractors = sample([
      [theta(`n^${finalBaseExp}`), theta(`n^${finalBaseExp+1}`), theta(`n^${finalBaseExp}\\log n`)],
      [theta(`n^${finalBaseExp+1}`), theta(`n^${finalBaseExp+2}`), theta(`n^${finalBaseExp-1}\\log n`)]
    ]);
    return Q({ id:opts.id+'_'+idx, level, lines, blocks, answer:theta(finalTheta), choices:shuffleChoices(theta(finalTheta), distractors), explanation });
  }

  function expIncQuestion(level){
    const v = varSet();
    const factor = sample([FACTORS[0], FACTORS[1], FACTORS[2]]);
    let finalTheta = 'n';
    if (factor.theta === '\\log n') finalTheta = 'n\\log n';
    if (factor.theta === 'n') finalTheta = 'n^2';
    const explanation = E(
      [
        {name:'Outer loop',lines:'line 1',perExecution:'\(c_1\)',executions:'\(\lfloor\log_2 n\rfloor+1\)',contribution:'\(\Theta(\log n)\)'},
        {name:'Inner loop body',lines:'lines 2-3',perExecution:`\(\Theta(${factor.theta})\)`,executions:`for fixed ${v.a}, exactly 2^${v.a} times`,contribution:`\(${factor.latex==='1'?'':factor.latex}2^${v.a}\)`}
      ],
      [
        {title:'Summary',content:`The summand grows exponentially with ${v.a}. ${factor.latex==='1'?'':`Because \(${factor.latex}\) does not depend on ${v.a}, it can be factored out of the sum.`}`},
        {title:'Exact runtime',content:`\[T(n)=\Theta(\log n)+\sum_{${v.a}=0}^{\lfloor \log_2 n \rfloor} c_2 ${factor.latex==='1'?'':factor.latex}2^${v.a}\]`},
        expIncSimplify(v.a,2,factor.latex),
        expIncType(v.a,2),
        {title:'Evaluate the canonical sum',content:`\[${factorDisplay(factor.latex)}\sum_{${v.a}=0}^{\lfloor \log_2 n \rfloor} 2^${v.a}=${factorDisplay(factor.latex)}\Theta(n)=\Theta(${finalTheta})\]`},
        {title:'Final runtime',content:`\[T(n)=\Theta(${finalTheta})\]`}
      ],
      theta(finalTheta),
      [expIncProof(v.a,2)]
    );
    return Q({ id:'L5_expinc_'+v.a, level, lines:[`for ${v.a} = 0 to floor(log_2 n):`,`    for ${v.b} = 1 to 2^${v.a}:`,`        do ${factor.label}`], blocks:[{label:'Block 1',start:1,end:1,color:'#60a5fa'},{label:'Block 2',start:2,end:3,color:'#f59e0b'}], answer:theta(finalTheta), choices:shuffleChoices(theta(finalTheta), [theta('n'), theta('n\\log n'), theta('n^2')].filter(x=>x!==theta(finalTheta))), explanation });
  }

  function expDecQuestion(level){
    const factor = sample([FACTORS[1], FACTORS[2]]);
    const finalTheta = factor.theta === '\\log n' ? 'n\\log n' : 'n^2';
    const explanation = E(
      [
        {name:'Outer halving loop',lines:'lines 1-5',perExecution:'current inner contribution',executions:'logarithmically many outer iterations',contribution:'captured by a geometric sum'},
        {name:'Inner linear loop',lines:'lines 3-4',perExecution:`\(\Theta(${factor.theta})\)`,executions:'current outer value times',contribution:`current outer value times \(${factor.theta}\)`}
      ],
      [
        {title:'Summary',content:`The outer variable halves each time, so the inner contributions form a geometrically decreasing sum. The factor \(${factor.theta}\) is independent of the summation index.`},
        {title:'Exact runtime',content:`\[T(n)=\Theta(1)+\Theta(\log n)+\Theta\!\left(\sum_{t=0}^{\lfloor \log_2 n \rfloor} n(${factor.latex})2^{-t}\right)\]`},
        expDecSimplify('t', `n${factor.latex==='1'?'':factor.latex==='\\log n'?'\\log n':factor.latex}`),
        expDecType('t'),
        {title:'Evaluate the canonical sum',content:`\[${factor.latex==='1'?'n':`n${factor.latex==='\\log n'?'\\log n':factor.latex}`}\sum_{t=0}^{\lfloor \log_2 n \rfloor}2^{-t}=\Theta(${finalTheta})\]`},
        {title:'Final runtime',content:`\[T(n)=\Theta(${finalTheta})\]`}
      ],
      theta(finalTheta),
      [expDecProof('t')]
    );
    return Q({ id:'L5_expdec_'+factor.theta, level, lines:['u = n','while u >= 1:','    for v = 1 to u:`,`        do ${factor.label}`,'    u = floor(u/2)'], blocks:[{label:'Block 1',start:1,end:5,color:'#8b5cf6'}], answer:theta(finalTheta), choices:shuffleChoices(theta(finalTheta), [theta('n'), theta('n\\log n'), theta('n^2')].filter(x=>x!==theta(finalTheta))), explanation });
  }

  function qSeqLinTri(){ const v=varSet(); return Q({ id:'L2_seqtri_'+v.a, level:2, lines:[`for ${v.a} = 1 to n:`, '    do O(1) work','',`for ${v.a} = 1 to n:`,`    for ${v.b} = 1 to ${v.a}:`,'        do O(1) work'], blocks:[{label:'Block 1',start:1,end:2,color:'#10b981'},{label:'Block 2',start:4,end:4,color:'#60a5fa'},{label:'Block 3',start:5,end:6,color:'#f59e0b'}], answer:theta('n^2'), choices:shuffleChoices(theta('n^2'), [theta('n'), theta('n\\log n'), theta('n^3')]), explanation:E([{name:'First section',lines:'lines 1-2',perExecution:'\(c_1\)',executions:'n',contribution:'\(c_1 n\)'},{name:'Second section outer loop',lines:'line 4',perExecution:'\(c_2\)',executions:'n',contribution:'\(c_2 n\)'},{name:'Second section inner body',lines:'lines 5-6',perExecution:'\(c_3\)',executions:`for fixed ${v.a}, exactly ${v.a} times`,contribution:`\(c_3 ${v.a}\)`}],[{title:'Summary',content:'There are two sequential sections, so their runtimes add. The second section creates a summation.'},{title:'Exact runtime',content:`\[T(n)=c_1n+c_2n+\sum_{${v.a}=1}^{n} c_3 ${v.a}\]`},{title:'Simplify the sum',content:`The nontrivial summation is already in canonical form: \(\sum_{${v.a}=1}^{n} ${v.a}\).`},polyType(v.a,1),{title:'Evaluate the sum',content:`\[\sum_{${v.a}=1}^{n} ${v.a}=\Theta(n^2)\]`},{title:'Add the sequential sections',content:'\[\Theta(n)+\Theta(n)+\Theta(n^2)=\Theta(n^2)\]'},{title:'Final runtime',content:'\[T(n)=\Theta(n^2)\]'}],theta('n^2'),[polyProof(v.a,1)]) }); }
  function qNLogN(){ const v=varSet(); return Q({ id:'L2_nlogn_'+v.a+v.b, level:2, lines:[`for ${v.a} = 1 to n:`,`${v.b} = 1`,`while ${v.b} <= n:`,'    do O(1) work',`${v.b} = 2*${v.b}`], blocks:[{label:'Block 1',start:1,end:1,color:'#60a5fa'},{label:'Block 2',start:2,end:4,color:'#8b5cf6'}], answer:theta('n\\log n'), choices:shuffleChoices(theta('n\\log n'), [theta('n'), theta('\\log n'), theta('n^2')]), explanation:E([{name:'Outer loop',lines:'line 1',perExecution:'\(c_1\)',executions:`${v.a} runs from 1 through n`,contribution:'\(c_1 n\)'},{name:'Inner while-loop',lines:'lines 2-4',perExecution:'\(c_2\)',executions:`for each fixed ${v.a}, the number of times ${v.b} can double before exceeding n`,contribution:'\(\Theta(\log n)\) per outer iteration'}],[{title:'Summary',content:`The outer loop repeats n times, and for each outer iteration the inner loop is logarithmic.`},{title:'Inner loop cost',content:`For each fixed ${v.a}, ${v.b} doubles until it exceeds n, so the inner loop costs \(\Theta(\log n)\).`},{title:'Multiply',content:'\[n\cdot\Theta(\log n)=\Theta(n\log n)\]'},{title:'Final runtime',content:'\[T(n)=\Theta(n\log n)\]'}],theta('n\\log n')) }); }

  const templatesByLevel = {
    1: [qLinear, qLogGrow, qLogDecay, qTriangular],
    2: [qIndependent, qSeqLinTri, qNLogN],
    3: [() => qPoly2LogBody(), () => qPoly1N2Body(), () => qSeqQuadLin()],
    4: [() => qShiftedNBody(), () => qScaledLogBody(), () => qPoly3NBody()],
    5: [() => expIncQuestion(5), () => expDecQuestion(5), () => qMixed()]
  };

  // wrapper names for deck anti-repeat
  function qPoly2LogBody(){ return qPoly2LogBodyInner(); }
  function qPoly2LogBodyInner(){ const v=varSet(); return Q({ id:'L3_poly2log_'+v.a, level:3, lines:[`for ${v.a} = 1 to n:`,`    for ${v.b} = 1 to ${v.a}^2:`,'        do O(log n) work'], blocks:[{label:'Block 1',start:1,end:1,color:'#60a5fa'},{label:'Block 2',start:2,end:3,color:'#f59e0b'}], answer:theta('n^3\\log n'), choices:shuffleChoices(theta('n^3\\log n'), [theta('n^3'),theta('n^2\\log n'),theta('n^4')]), explanation:polyProblem({ idx:v.a, power:2, sumExpr:`\\sum_{${v.a}=1}^{n} (\\log n)${v.a}^2`, exactRuntime:`\\[T(n)=c_1n+\\sum_{${v.a}=1}^{n} c_2(\\log n)${v.a}^2\\]`, blockSummaries:[{name:'Outer loop',lines:'line 1',perExecution:'\\(c_1\\)',executions:`${v.a} runs from 1 through n`,contribution:'\\(c_1 n\\)'},{name:'Inner loop body',lines:'lines 2-3',perExecution:'\\(\\Theta(\\log n)\\)',executions:`for fixed ${v.a}, exactly ${v.a}^2 times`,contribution:`\\((\\log n)${v.a}^2\\)`}], summary:`For fixed ${v.a}, the inner loop contributes \\((\\log n)${v.a}^2\\). Because \\(\\log n\\) does not depend on ${v.a}, it can be factored out of the sum.`, simplifyMsg:'The summand in the canonical sum is quadratic in the index.', factorLatex:'\\log n', evalExpr:`\\[(\\log n)\\sum_{${v.a}=1}^{n} ${v.a}^2=(\\log n)\\Theta(n^3)=\\Theta(n^3\\log n)\\]`, finalRuntime:'\\[T(n)=\\Theta(n^3\\log n)\\]' }) }); }
  function qPoly1N2Body(){ const v=varSet(); return Q({ id:'L3_poly1n2_'+v.a, level:3, lines:[`for ${v.a} = 1 to n:`,`    for ${v.b} = 1 to ${v.a}:`,'        do O(n^2) work'], blocks:[{label:'Block 1',start:1,end:1,color:'#60a5fa'},{label:'Block 2',start:2,end:3,color:'#f59e0b'}], answer:theta('n^4'), choices:shuffleChoices(theta('n^4'), [theta('n^3'),theta('n^4\\log n'),theta('n^5')]), explanation:polyProblem({ idx:v.a, power:1, sumExpr:`\\sum_{${v.a}=1}^{n} n^2${v.a}`, exactRuntime:`\\[T(n)=c_1n+\\sum_{${v.a}=1}^{n} c_2n^2${v.a}\\]`, blockSummaries:[{name:'Outer loop',lines:'line 1',perExecution:'\\(c_1\\)',executions:`${v.a} runs from 1 through n`,contribution:'\\(c_1 n\\)'},{name:'Inner loop body',lines:'lines 2-3',perExecution:'\\(\\Theta(n^2)\\)',executions:`for fixed ${v.a}, exactly ${v.a} times`,contribution:`\\(n^2${v.a}\\)`}], summary:`For fixed ${v.a}, the inner loop contributes \\(n^2${v.a}\\). Because \\(n^2\\) does not depend on ${v.a}, it can be factored out of the sum.`, simplifyMsg:'The summand in the canonical sum is linear in the index.', factorLatex:'n^2', evalExpr:`\\[n^2\\sum_{${v.a}=1}^{n} ${v.a}=n^2\\Theta(n^2)=\\Theta(n^4)\\]`, finalRuntime:'\\[T(n)=\\Theta(n^4)\\]' }) }); }
  function qSeqQuadLin(){ const v=varSet(); return Q({ id:'L3_seqquad_'+v.a, level:3, lines:[`for ${v.a} = 1 to n:`,`    for ${v.b} = 1 to ${v.a}^2:`,'        do O(log n) work','','for t = 1 to n:','    do O(1) work'], blocks:[{label:'Block 1',start:1,end:3,color:'#f59e0b'},{label:'Block 2',start:5,end:6,color:'#10b981'}], answer:theta('n^3\\log n'), choices:shuffleChoices(theta('n^3\\log n'), [theta('n^3'),theta('n^2\\log n'),theta('n^4')]), explanation:E([{name:'Polynomial section',lines:'lines 1-3',perExecution:`for fixed ${v.a}, \((\\log n)${v.a}^2\)`,executions:`${v.a}=1 through n`,contribution:'\\(\\Theta(n^3\\log n)\\)'},{name:'Linear section',lines:'lines 5-6',perExecution:'\\(c_3\\)',executions:'n',contribution:'\\(c_3 n\\)'}],[{title:'Summary',content:'There are two sequential sections: a polynomial section and a linear section.'},{title:'Exact runtime',content:`\\[T(n)=\\sum_{${v.a}=1}^{n} c_2(\\log n)${v.a}^2 + c_3n\\]`},{title:'Form the summation',content:`The repeated work in the first section is \\(\\sum_{${v.a}=1}^{n}(\\log n)${v.a}^2\\).`},polySimplify(v.a,2,'The summand in the canonical sum is quadratic in the index.','\\log n'),polyType(v.a,2),{title:'Evaluate the canonical sum',content:`\\[(\\log n)\\sum_{${v.a}=1}^{n} ${v.a}^2=(\\log n)\\Theta(n^3)=\\Theta(n^3\\log n)\\]`},{title:'Add the sequential sections',content:'\\[\\Theta(n^3\\log n)+\\Theta(n)=\\Theta(n^3\\log n)\\]'},{title:'Final runtime',content:'\\[T(n)=\\Theta(n^3\\log n)\\]'}],theta('n^3\\log n'),[polyProof(v.a,2)]) }); }
  function qShiftedNBody(){ const v=varSet(); return Q({ id:'L4_shiftedN_'+v.a, level:4, lines:[`for ${v.a} = 3 to n-2:`,`    for ${v.b} = 2 to ${v.a}-1:`,'        do O(n) work'], blocks:[{label:'Block 1',start:1,end:1,color:'#60a5fa'},{label:'Block 2',start:2,end:3,color:'#f59e0b'}], answer:theta('n^3'), choices:shuffleChoices(theta('n^3'), [theta('n^2'),theta('n^3\\log n'),theta('n^4')]), explanation:polyProblem({ idx:v.a, power:1, sumExpr:`\\sum_{${v.a}=3}^{n-2} n(${v.a}-2)`, exactRuntime:`\\[T(n)=\\Theta(n)+\\sum_{${v.a}=3}^{n-2} c_2n(${v.a}-2)\\]`, blockSummaries:[{name:'Outer loop',lines:'line 1',perExecution:'\\(c_1\\)',executions:`${v.a} runs from 3 through n-2`,contribution:'\\(\\Theta(n)\\)'},{name:'Inner loop body',lines:'lines 2-3',perExecution:'\\(\\Theta(n)\\)',executions:`for fixed ${v.a}, exactly ${v.a}-2 times`,contribution:`\\(n(${v.a}-2)\\)`}], summary:`For fixed ${v.a}, the inner loop contributes \\(n(${v.a}-2)\\). Because \\(n\\) does not depend on ${v.a}, it can be factored out of the sum.`, simplifyMsg:`The lower and upper bounds differ from the canonical bounds only by constants, and the summand ${v.a}-2 differs from ${v.a} by a constant.`, factorLatex:'n', evalExpr:`\\[n\\sum_{${v.a}=3}^{n-2} (${v.a}-2)=n\\Theta(n^2)=\\Theta(n^3)\\]`, finalRuntime:'\\[T(n)=\\Theta(n^3)\\]' }) }); }
  function qScaledLogBody(){ const v=varSet(); return Q({ id:'L4_scaledLog_'+v.a, level:4, lines:[`for ${v.a} = 1 to floor(n/2)-3:`,`    for ${v.b} = 1 to ${v.a}^2:`,'        do O(log n) work'], blocks:[{label:'Block 1',start:1,end:1,color:'#60a5fa'},{label:'Block 2',start:2,end:3,color:'#f59e0b'}], answer:theta('n^3\\log n'), choices:shuffleChoices(theta('n^3\\log n'), [theta('n^3'),theta('n^2\\log n'),theta('n^4')]), explanation:polyProblem({ idx:v.a, power:2, sumExpr:`\\sum_{${v.a}=1}^{\\lfloor n/2 \\rfloor-3}(\\log n)${v.a}^2`, exactRuntime:`\\[T(n)=\\Theta(n)+\\sum_{${v.a}=1}^{\\lfloor n/2 \\rfloor-3} c_2(\\log n)${v.a}^2\\]`, blockSummaries:[{name:'Outer loop',lines:'line 1',perExecution:'\\(c_1\\)',executions:`${v.a} runs from 1 through \\lfloor n/2 \\rfloor-3`,contribution:'\\(\\Theta(n)\\)'},{name:'Inner loop body',lines:'lines 2-3',perExecution:'\\(\\Theta(\\log n)\\)',executions:`for fixed ${v.a}, exactly ${v.a}^2 times`,contribution:`\\((\\log n)${v.a}^2\\)`}], summary:`For fixed ${v.a}, the inner loop contributes \\((\\log n)${v.a}^2\\). Because \\(\\log n\\) does not depend on ${v.a}, it can be factored out of the sum.`, simplifyMsg:'The upper bound differs from n only by a constant factor and a constant shift.', factorLatex:'\\log n', evalExpr:`\\[(\\log n)\\sum_{${v.a}=1}^{\\lfloor n/2 \\rfloor-3} ${v.a}^2=(\\log n)\\Theta(n^3)=\\Theta(n^3\\log n)\\]`, finalRuntime:'\\[T(n)=\\Theta(n^3\\log n)\\]' }) }); }
  function qPoly3NBody(){ const v=varSet(); return Q({ id:'L4_poly3n_'+v.a, level:4, lines:[`for ${v.a} = 1 to n:`,`    for ${v.b} = 1 to ${v.a}^3:`,'        do O(n) work'], blocks:[{label:'Block 1',start:1,end:1,color:'#60a5fa'},{label:'Block 2',start:2,end:3,color:'#f59e0b'}], answer:theta('n^5'), choices:shuffleChoices(theta('n^5'), [theta('n^4'),theta('n^5\\log n'),theta('n^6')]), explanation:polyProblem({ idx:v.a, power:3, sumExpr:`\\sum_{${v.a}=1}^{n} n${v.a}^3`, exactRuntime:`\\[T(n)=c_1n+\\sum_{${v.a}=1}^{n} c_2n${v.a}^3\\]`, blockSummaries:[{name:'Outer loop',lines:'line 1',perExecution:'\\(c_1\\)',executions:`${v.a} runs from 1 through n`,contribution:'\\(c_1 n\\)'},{name:'Inner loop body',lines:'lines 2-3',perExecution:'\\(\\Theta(n)\\)',executions:`for fixed ${v.a}, exactly ${v.a}^3 times`,contribution:`\\(n${v.a}^3\\)`}], summary:`For fixed ${v.a}, the inner loop contributes \\(n${v.a}^3\\). Because \\(n\\) does not depend on ${v.a}, it can be factored out of the sum.`, simplifyMsg:'The summand in the canonical sum is cubic in the index.', factorLatex:'n', evalExpr:`\\[n\\sum_{${v.a}=1}^{n} ${v.a}^3=n\\Theta(n^4)=\\Theta(n^5)\\]`, finalRuntime:'\\[T(n)=\\Theta(n^5)\\]' }) }); }
  function qExpInc(){ return expIncQuestion(5); }
  function qExpDec(){ return expDecQuestion(5); }
  function qMixed(){ const v=varSet(); return Q({ id:'L5_mixed_'+v.a, level:5, lines:[`for ${v.a} = 1 to n:`,`    for ${v.b} = 1 to ${v.a}:`,'        do O(log n) work','',`for ${v.a} = 1 to n:`,`    for ${v.b} = 1 to ${v.a}^2:`,'        do O(1) work','',`${v.c} = 1`,`while ${v.c} <= n:`,'    do O(1) work',`${v.c} = 2*${v.c}`], blocks:[{label:'Block 1',start:1,end:3,color:'#0ea5e9'},{label:'Block 2',start:5,end:7,color:'#f59e0b'},{label:'Block 3',start:9,end:12,color:'#8b5cf6'}], answer:theta('n^3'), choices:shuffleChoices(theta('n^3'), [theta('n^2\\log n'),theta('n\\log n'),theta('n^3\\log n')]), explanation:mixedDominanceExplanation(v.a) }); }

  return {
    getTemplatesForLevel(level){
      const templatesByLevel = {
        1: [qLinear, qLogGrow, qLogDecay, qTriangular],
        2: [qIndependent, qSeqLinTri, qNLogN],
        3: [qPoly2LogBody, qPoly1N2Body, qSeqQuadLin],
        4: [qShiftedNBody, qScaledLogBody, qPoly3NBody],
        5: [qExpInc, qExpDec, qMixed]
      };
      return templatesByLevel[level] || templatesByLevel[1];
    }
  };
})();