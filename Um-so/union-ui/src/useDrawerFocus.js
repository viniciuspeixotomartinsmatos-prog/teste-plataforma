import {useEffect,useRef} from 'react';
export function useDrawerFocus(open,selector,onClose){
 const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
  if(!open)return;
  const panel=document.querySelector(selector);if(!panel)return;
  const previous=document.activeElement;
  const controls=()=>[...panel.querySelectorAll('button,a[href],input,select,textarea,[tabindex]')].filter(node=>!node.disabled&&node.tabIndex>=0&&!node.closest('[hidden],[aria-hidden="true"]')&&window.getComputedStyle(node).display!=='none'&&window.getComputedStyle(node).visibility!=='hidden');
  controls()[0]?.focus();
  const key=event=>{
   if(event.key==='Escape'){event.preventDefault();close.current();}
   if(event.key==='Tab'){
    const list=controls(),first=list[0],last=list.at(-1);if(!first)return;
    if(event.shiftKey&&(document.activeElement===first||!panel.contains(document.activeElement))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||!panel.contains(document.activeElement))){event.preventDefault();first.focus();}
   }
  };
  document.addEventListener('keydown',key);
  return()=>{document.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus();};
 },[open,selector]);
}
