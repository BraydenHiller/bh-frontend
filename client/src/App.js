import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Photographer from './Photographer';
import Showcase from './Showcase';
import EditShowcase from './EditShowcase';
import ClientGallery from './ClientGallery';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Photographer />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/edit-showcase" element={<EditShowcase />} />
        <Route path="/gallery/:clientId" element={<ClientGallery />} />
      </Routes>
    </Router>
  );
}

export default App;
