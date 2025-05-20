import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API = 'https://bh-backend-clean.onrender.com';

const ClientGallery = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [selected, setSelected] = useState([]);
  const [enlargedIndex, setEnlargedIndex] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await fetch(`${API}/clients`);
        const data = await res.json();
        const match = data.find(c => c.id === clientId);
        setClient(match || null);
      } catch (err) {
        console.error('Failed to fetch client:', err);
      }
    };

    const fetchSelections = async () => {
      try {
        const res = await fetch(`${API}/selections`);
        const data = await res.json();
        const match = data.find(s => s.id === clientId);
        setSelected(match?.selected || []);
      } catch (err) {
        console.error('Failed to fetch selections:', err);
      }
    };

    fetchClient();
    fetchSelections();
  }, [clientId]);

  const handleSelect = (img) => {
    setSelected(prev =>
      prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]
    );
  };

  const handleSubmit = async () => {
    try {
      await fetch(`${API}/selections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId, selected })
      });
      alert('Selections submitted!');
    } catch (err) {
      console.error('Failed to submit selections:', err);
    }
  };

  const goToPrev = useCallback(() => {
    setEnlargedIndex(prev =>
      prev === 0 ? client.images.length - 1 : prev - 1
    );
  }, [client]);

  const goToNext = useCallback(() => {
    setEnlargedIndex(prev =>
      prev === client.images.length - 1 ? 0 : prev + 1
    );
  }, [client]);

  if (!client) return <p style={{ color: 'white' }}>Loading gallery...</p>;
  if (!client.images || client.images.length === 0) {
    return <p style={{ color: 'white' }}>No images found in this gallery.</p>;
  }

  return (
    <motion.div className="client-gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>{client.name}'s Gallery</h1>

      <div className="thumbnail-grid">
        {client.images.map((src, idx) => (
          <div
            key={idx}
            className="thumbnail-wrapper"
            onClick={() => setEnlargedIndex(idx)}
          >
            <img
              src={src}
              alt={`Image ${idx}`}
              className="thumbnail"
              style={{
                width: '90px',
                height: '90px',
                objectFit: 'cover',
                borderRadius: '6px',
                border: selected.includes(src) ? '3px solid gold' : '1px solid #666',
                boxShadow: selected.includes(src) ? '0 0 8px gold' : 'none'
              }}
            />
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} style={{ marginTop: '1rem' }}>
        Submit Selections
      </button>

      <AnimatePresence>
        {enlargedIndex !== null && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEnlargedIndex(null)}
          >
            <motion.img
              src={client.images[enlargedIndex]}
              alt="Enlarged"
              className="enlarged-img"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button className="back-btn" onClick={(e) => { e.stopPropagation(); setEnlargedIndex(null); }}>⬅ Back</button>
            <button className="next-btn" onClick={(e) => { e.stopPropagation(); goToNext(); }}>➡</button>
            <button className="prev-btn" onClick={(e) => { e.stopPropagation(); goToPrev(); }}>⬅</button>
            <button
              className="select-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(client.images[enlargedIndex]);
              }}
            >
              {selected.includes(client.images[enlargedIndex]) ? 'Unselect' : 'Select'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientGallery;
