import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API = 'https://bh-backend-clean.onrender.com';

const ClientGallery = () => {
  const { id } = useParams();
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetch(`${API}/clients`)
      .then(res => res.json())
      .then(data => {
        const client = data.find(c => c.id === id);
        if (client) setImages(client.images || []);
      });
  }, [id]);

  const toggleSelect = (url) => {
    setSelected(prev => prev.includes(url) ? prev.filter(i => i !== url) : [...prev, url]);
  };

  const submitSelections = async () => {
    await fetch(`${API}/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, selected }),
    });
    alert('Your selections were submitted!');
  };

  return (
    <div className="client-gallery">
      <h1>Your Gallery</h1>
      <div className="gallery-grid">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt="Gallery"
            className={selected.includes(img) ? 'selected' : ''}
            onClick={() => toggleSelect(img)}
          />
        ))}
      </div>
      <button onClick={submitSelections}>Submit Selections</button>
    </div>
  );
};

export default ClientGallery;
