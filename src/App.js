import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ClientLogin from './ClientLogin';
import ClientGallery from './ClientGallery';
import Photographer from './Photographer';
import Showcase from './Showcase';
import EditShowcase from './EditShowcase';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ClientLogin />} />
          <Route path="/photographer" element={<Photographer />} />
          <Route path="/gallery/:id" element={<ClientGallery />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/edit-showcase" element={<EditShowcase />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
"// trigger redeploy" 
