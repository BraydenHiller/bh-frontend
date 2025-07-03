import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API = 'https://bh-backend-clean.onrender.com';

const ClientGallery = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [selected, setSelected] = useState([]);
  const [enlargedIndex, setEnlargedIndex] = useState(null);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const res = await fetch(`${API}/clients/${id}`);
        const data = await res.json();
        setClient(data);
      } catch (err) {
        console.error('Failed to fetch client data:', err);
      }
    };

    const fetchSelections = async () => {
      try {
        const res = await fetch(`${API}/selections`);
        const data = await res.json();
        const selectionMatch = data.find(s => s.id === id);
        setSelected(selectionMatch?.selected || []);
      } catch (err) {
        console.error('Failed to fetch selections:', err);
      }
    };

    fetchClientData();
    fetchSelections();
  }, [id]);

  const handleSelect = (img) => {
    setSelected((prev) =>
      prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]
    );
  };

  const handleSubmit = async () => {
    try {
      await fetch(`${API}/selections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, selected }),
      });
      alert('Selections submitted!');
    } catch (err) {
      console.error('Failed to submit selections:', err);
    }
  };

  const goToPrev = () => {
    if (client && client.images.length > 0) {
      setEnlargedIndex((prev) => (prev === 0 ? client.images.length - 1 : prev - 1));
    }
  };

  const goToNext = () => {
    if (client && client.images.length > 0) {
      setEnlargedIndex((prev) => (prev === client.images.length - 1 ? 0 : prev + 1));
    }
  };

  if (!client) {
    return <p style={{ color: 'white', textAlign: 'center' }}>Loading gallery...</p>;
  }

  return (
    <motion.div
      className="client-gallery"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ textAlign: 'center' }}
    >
      <h1 style={{ color: 'white' }}>{client.name}'s Gallery</h1>

      <div className="thumbnail-grid" style={{ justifyContent: 'center' }}>
        {client.images.map((src, idx) => (
          <div
            key={idx}
            className="thumbnail-wrapper"
            onClick={() => setEnlargedIndex(idx)}
          >
            <img
              src={src}
              alt=""
              className="thumbnail"
              style={{
                width: '90px',
                height: '90px',
                objectFit: 'cover',
                borderRadius: '6px',
                border: selected.includes(src)
                  ? '3px solid #bfa100'
                  : '1px solid #666',
                boxShadow: selected.includes(src) ? '0 0 8px #bfa100' : 'none',
              }}
            />
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} style={{ marginTop: '1rem' }}>
        Submit Selections
      </button>

      <AnimatePresence>
        {enlargedIndex !== null && client.images[enlargedIndex] && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEnlargedIndex(null)}
          >
            <motion.img
              src={client.images[enlargedIndex]}
              alt=""
              className="enlarged-img"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="nav-buttons">
              <button onClick={(e) => { e.stopPropagation(); goToPrev(); }}>◀</button>
              <button onClick={(e) => { e.stopPropagation(); setEnlargedIndex(null); }}>⬅ Back</button>
              <button onClick={(e) => { e.stopPropagation(); goToNext(); }}>▶</button>
            </div>
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
