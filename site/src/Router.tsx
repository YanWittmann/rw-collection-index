import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DialogueInterface from './app/page';

const Router: React.FC = () => {
  // Determine basename based on the environment
  const basename = process.env.NODE_ENV === 'production' 
    ? '/rw-collection-index'
    : '/';
  
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<DialogueInterface />} />
        <Route path="/:pearlId" element={<DialogueInterface />} />
        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;