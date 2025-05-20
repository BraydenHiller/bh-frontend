
import React from 'react';
import './App.css';
import ClientLogin from './ClientLogin';
import ClientGallery from './ClientGallery';
import Photographer from './Photographer';

function App() {
  const query = new URLSearchParams(window.location.search);
  const view = query.get('view');

  return (
    <div className="App">
      {view === 'gallery' ? (
        <ClientGallery />
      ) : view === 'photographer' ? (
        <Photographer />
      ) : (
        <ClientLogin />
      )}
    </div>
  );
}

export default App;
