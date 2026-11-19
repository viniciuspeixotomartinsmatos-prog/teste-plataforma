import React,{useMemo} from 'react';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
hljs.registerLanguage('typescript',typescript);hljs.registerLanguage('css',css);hljs.registerLanguage('json',json);
export function CodeView({code='',path=''}){const html=useMemo(()=>code.length>150000||(/\.(html|vue)$/.test(path))?null:hljs.highlight(code,{language:path.endsWith('.css')?'css':path.endsWith('.json')?'json':'typescript',ignoreIllegals:true}).value,[code,path]);return <pre className="code-view" tabIndex={0}>{html===null?<code>{code}</code>:<code dangerouslySetInnerHTML={{__html:html}}/>}</pre>;}
