window.TrainerData=(()=>{
function sample(a){return a[Math.floor(Math.random()*a.length)]}
function varSet(){return sample([{a:'i',b:'j',c:'k'},{a:'u',b:'v',c:'w'}])}
function fmtTheta(s){return `\(Θ(${s})\)`}

function logGen(v){return{
 finalRuntime:fmtTheta('log n'),
 steps:[
 {title:'Summary',content:`Track how ${v} grows.`},
 {title:'Loop behavior',content:`${v} doubles each iteration.`},
 {title:'Equation',content:`${v}=2^t ≤ n`},
 {title:'Solve',content:`t = Θ(log n)`},
 {title:'Result',content:`Θ(log n)`}
 ]}}

function triGen(i){return{
 finalRuntime:fmtTheta('n^2'),
 steps:[
 {title:'Structure',content:`Inner depends on ${i}`},
 {title:'Sum',content:`∑ ${i}`},
 {title:'Evaluate',content:`Θ(n^2)`}
 ]}}

function q1(){const v=varSet().a;return{
 code:{lines:[`for ${v}=1 to n`]},
 answer:fmtTheta('n'),choices:[fmtTheta('n')],
 explanation:{steps:[{title:'Linear loop',content:'Runs n times'}]}
}}

function q2(){const v=varSet().a;return{
 code:{lines:[`${v}=1`,`while ${v}<=n`,`${v}=2*${v}`]},
 answer:fmtTheta('log n'),choices:[fmtTheta('log n')],
 explanation:logGen(v)
}}

function q3(){const vs=varSet();return{
 code:{lines:[`for ${vs.a}=1 to n`,`for ${vs.b}=1 to ${vs.a}`]},
 answer:fmtTheta('n^2'),choices:[fmtTheta('n^2')],
 explanation:triGen(vs.a)
}}

const t={1:[q1,q2,q3]};
return{getTemplatesForLevel:(l)=>t[l]||t[1]}
})();
