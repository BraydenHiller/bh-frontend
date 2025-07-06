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
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const res = await fetch(`${API}/clients`);
        const clients = await res.json();
        const clientMatch = clients.find(c => c.id === id);
        if (clientMatch) {
          setClient(clientMatch);
        } else {
          console.error('Client not found');
        }
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

  const maxSelections = client?.maxSelections || Infinity;

  const handleSelect = (img) => {
    const isSelected = selected.includes(img);
    if (!isSelected && selected.length >= maxSelections) {
      alert(`You’ve reached your selection limit of ${maxSelections} images.`);
      return;
    }
    setSelected((prev) =>
      isSelected ? prev.filter(i => i !== img) : [...prev, img]
    );
  };

  const handleSubmit = async () => {
    try {
      await fetch(`${API}/selections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, selected }),
      });
      alert('Selections submitted!');
    } catch (err) {
      console.error('Failed to submit selections:', err);
    }
  };

  const goToPrev = () => {
    if (!client?.images?.length) return;
    setEnlargedIndex((prev) => (prev === 0 ? client.images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    if (!client?.images?.length) return;
    setEnlargedIndex((prev) => (prev === client.images.length - 1 ? 0 : prev + 1));
  };

  if (!client) {
    return <p style={{ color: 'white', textAlign: 'center' }}>Loading gallery...</p>;
  }

  const visibleImages = showOnlySelected
    ? client.images.filter((img) => selected.includes(img))
    : client.images;

  return (
    <motion.div
      className="client-gallery"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ textAlign: 'center' }}
    >
      <h1 style={{ color: '#f5c518' }}>{client.name}'s Gallery</h1>
      <p style={{ color: '#ffffff', marginBottom: '1rem', fontWeight: 'bold' }}>
        You have selected {selected.length} of {maxSelections === Infinity ? '∞' : maxSelections} images
      </p>

      <button
        onClick={() => setShowOnlySelected((prev) => !prev)}
        style={{
          marginBottom: '1rem',
          background: '#f5c518',
          color: '#0d1117',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {showOnlySelected ? 'Show All Images' : 'Show Selected Only'}
      </button>

      <div className="thumbnail-grid" style={{ justifyContent: 'center' }}>
        {visibleImages.map((src, idx) => (
          <div
            key={idx}
            className="thumbnail-wrapper"
            onClick={() => setEnlargedIndex(client.images.indexOf(src))}
            onDoubleClick={() => handleSelect(src)}
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
                  ? '3px solid #f5c518'
                  : '1px solid #666',
                boxShadow: selected.includes(src) ? '0 0 8px #f5c518' : 'none',
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        style={{
          marginTop: '1.5rem',
          background: '#f5c518',
          color: '#0d1117',
          padding: '10px 20px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
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

            <p style={{ color: '#f5c518', fontWeight: 'bold', marginTop: '1rem' }}>
              {selected.includes(client.images[enlargedIndex])
                ? `Selected`
                : `You can select ${maxSelections - selected.length} more`}
            </p>

            <button
              className="select-btn"
              style={{
                background: '#f5c518',
                color: '#0d1117',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 'bold',
                marginTop: '0.5rem'
              }}
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
