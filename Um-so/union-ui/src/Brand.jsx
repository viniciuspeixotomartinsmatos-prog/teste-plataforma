import React from 'react';
import '../public/assets/brand.css';
export default function Brand({iconOnly=false,className=''}){return <span role="img" aria-label="nitido company" className={'nitido-brand '+(iconOnly?'nitido-brand--icon ':'')+className}><img src="/assets/branding/nitido-company.png" alt="" width="2172" height="724"/><span className="nitido-brand__word" aria-hidden="true"/><span className="nitido-brand__energy" aria-hidden="true"/></span>;}
