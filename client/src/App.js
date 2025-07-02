import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Photographer from './Photographer';
import ClientLogin from './ClientLogin';
import ClientGallery from './ClientGallery';
import EditShowcase from './EditShowcase';
import Showcase from './Showcase';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/photographer-login" element={<Photographer />} />
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/client-gallery/:id" element={<ClientGallery />} />
        <Route path="/edit-showcase" element={<EditShowcase />} />
        <Route path="/showcase" element={<Showcase />} />
      </Routes>
    </Router>
  );
}

export default App;
