import fs from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Layers3} from 'lucide-react';
const svg=renderToStaticMarkup(React.createElement(Layers3,{width:32,height:32,color:'#b9f9ab',strokeWidth:2}));
fs.mkdirSync('public/assets',{recursive:true});
fs.writeFileSync('public/assets/union-icon.svg',svg);
