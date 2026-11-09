// Original nitido demo; independent of the research catalog and its assets.
const stage=document.querySelector('.demo-stage');
document.querySelectorAll('.mood-picker button').forEach(button=>button.addEventListener('click',()=>{
 stage.dataset.mood=button.dataset.mood;
 document.querySelectorAll('.mood-picker button').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
}));
document.querySelector('.demo-action')?.addEventListener('click',()=>{
 stage.classList.toggle('expanded');
 document.getElementById('demo-feedback').textContent=document.documentElement.lang==='en'?'A new perspective. Try another atmosphere.':'Uma nova perspectiva. Experimente outra atmosfera.';
});
