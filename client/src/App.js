import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import Photographer from './Photographer';
import ClientLogin from './ClientLogin'; // or whatever your login component is
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
