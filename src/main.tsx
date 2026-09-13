import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { RuntimeProvider } from './context/RuntimeContext';
import { AIProvider } from './context/AIContext';
import { CreditsProvider } from './context/CreditsContext';
import { PersonalizationProvider } from './context/PersonalizationContext';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <CreditsProvider>
          <PersonalizationProvider>
            <ProjectProvider>
              <RuntimeProvider>
                <AIProvider>
                  <App />
                </AIProvider>
              </RuntimeProvider>
            </ProjectProvider>
          </PersonalizationProvider>
        </CreditsProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
