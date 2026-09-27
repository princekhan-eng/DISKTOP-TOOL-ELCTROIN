import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { AppProvider } from './context/AppContext';
import { ProjectProvider } from './context/ProjectContext';
import './styles/globals.css';
import './styles/layout.css';
import './styles/components.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <ProjectProvider>
        <App />
      </ProjectProvider>
    </AppProvider>
  </React.StrictMode>
);
