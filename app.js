const state={q:null};

function renderCode(q){
 document.getElementById('code').innerText=q.code.lines.join('
');
}

function renderAnswers(q){
 const div=document.getElementById('answers');
 div.innerHTML='';
 q.choices.forEach(c=>{
  const b=document.createElement('button');
  b.innerText=c;
  b.onclick=()=>showExplanation(q);
  div.appendChild(b);
 });
}

function renderSteps(exp){
 const el=document.getElementById('explanation');
 el.innerHTML=exp.steps.map((s,i)=>
  `<div class="step"><h3>Step ${i+1}: ${s.title}</h3><p>${s.content}</p></div>`
 ).join('');
}

function showExplanation(q){
 renderSteps(q.explanation);
}

function newQ(){
 const lvl=parseInt(document.getElementById('levelSelect').value);
 const f=TrainerData.getTemplatesForLevel(lvl);
 const q=f[Math.floor(Math.random()*f.length)]();
 state.q=q;
 renderCode(q);
 renderAnswers(q);
 document.getElementById('explanation').innerHTML='';
}

document.getElementById('nextBtn').onclick=newQ;
window.onload=newQ;
