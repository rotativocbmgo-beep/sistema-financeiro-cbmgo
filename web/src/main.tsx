// web/src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App'; // Importação nomeada está correta agora
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
