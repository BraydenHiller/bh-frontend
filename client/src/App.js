import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Photographer from './Photographer';
import ClientLogin from './ClientLogin';
import ClientGallery from './ClientGallery';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Photographer dashboard */}
        <Route path="/" element={<Photographer />} />

        {/* Client login page */}
        <Route path="/login" element={<ClientLogin />} />

        {/* Client-specific gallery */}
        <Route path="/gallery/:id" element={<ClientGallery />} />
      </Routes>
    </Router>
  );
};

export default App;
