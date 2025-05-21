import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Landing from './Landing';
import Photographer from './Photographer';
import ClientLogin from './ClientLogin';
import ClientGallery from './ClientGallery';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/photographer" element={<Photographer />} />
        <Route path="/gallery/:clientId" element={<ClientGallery />} />
      </Routes>
    </Router>
  );
}

export default App;
