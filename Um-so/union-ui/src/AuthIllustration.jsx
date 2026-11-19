import React from 'react';
import {CosmicScene} from './CosmicScene.jsx';

export default function AuthIllustration({locale}) {
  const english = locale === 'en';
  return <aside className="auth-art" aria-label={english ? 'A new universe for your ideas' : 'Um novo universo para suas ideias'}>
    <CosmicScene/>
    <blockquote className="auth-art-quote"><p>{english ? 'Your ideas deserve a new universe.' : 'Suas ideias merecem um novo universo.'}</p></blockquote>
  </aside>;
}
