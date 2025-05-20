import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const API = 'https://bh-backend-clean.onrender.com';

const Photographer = () => {
  const [clients, setClients] = useState([]);
  const [selections, setSelections] = useState([]);
  const [newClientName, setNewClientName] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    fetchClients();
    fetchSelections();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/clients`);
      const data = await res.json();
      setClients(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
      setLoading(false);
    }
  };

  const fetchSelections = async () => {
    try {
      const res = await fetch(`${API}/selections`);
      const data = await res.json();
      setSelections(data);
    } catch (err) {
      console.error('Failed to fetch selections:', err);
    }
  };

  const addClient = async () => {
    if (!newClientId || !newClientName || !newPassword) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch(`${API}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newClientId,
          name: newClientName,
          password: newPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to add client.');
        return;
      }

      setNewClientName('');
      setNewClientId('');
      setNewPassword('');
      fetchClients();
    } catch (err) {
      console.error('Error adding client:', err);
    }
  };

  const handleUpload = async (e, clientId) => {
    const files = Array.from(e.target.files);
    const uploadedURLs = [];
    setUploadingId(clientId);

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'unsigned-upload');
      formData.append('cloud_name', 'dsgeprirb');

      try {
        const res = await fetch('https://api.cloudinary.com/v1_1/dsgeprirb/image/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.secure_url) uploadedURLs.push(data.secure_url);
      } catch (err) {
        console.error('Cloudinary upload error:', err);
      }
    }

    if (uploadedURLs.length > 0) {
      try {
        await fetch(`${API}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: clientId, images: uploadedURLs })
        });
        fetchClients();
      } catch (err) {
        console.error('Failed to send to backend:', err);
      }
    }

    setUploadingId(null);
  };

  const getClientSelections = (clientId) => {
    const sel = selections.find(s => s.id === clientId);
    return sel ? sel.selected : [];
  };

  const handleImageRemove = async (clientId, imageURL) => {
    const client = clients.find(c => c.id === clientId);
    if (!client || !client.images) return;

    const updatedImages = client.images.filter(img => img !== imageURL);

    try {
      await fetch(`${API}/update-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId, images: updatedImages })
      });

      fetchClients();
    } catch (err) {
      console.error('Failed to update images:', err);
    }
  };

  const exportSelections = async (clientId, clientName) => {
    const selected = getClientSelections(clientId);
    if (!selected.length) return;

    const zip = new JSZip();

    for (let i = 0; i < selected.length; i++) {
      const imageUrl = selected[i];
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const filename = `image-${i + 1}.jpg`;
        zip.file(filename, blob);
      } catch (err) {
        console.error('Error downloading image:', imageUrl, err);
      }
    }

    zip.generateAsync({ type: 'blob' }).then((zipFile) => {
      saveAs(zipFile, `${clientName}_selections.zip`);
    });
  };

  const handleDeleteClient = async (clientId) => {
    const confirm = window.confirm("Are you sure you want to delete this client?");
    if (!confirm) return;

    try {
      await fetch(`${API}/clients/${clientId}`, {
        method: 'DELETE'
      });
      fetchClients();
    } catch (err) {
      console.error("Failed to delete client:", err);
    }
  };

  return (
    <motion.div className="photographer-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Photographer Dashboard</h1>

      {loading && <p style={{ color: 'orange' }}>Loading clients...</p>}

      <div className="form-section">
        <h2>Create New Client Gallery</h2>
        <input placeholder="Client Name" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
        <input placeholder="Client ID" value={newClientId} onChange={(e) => setNewClientId(e.target.value)} />
        <input placeholder="Client Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button onClick={addClient}>Add Client</button>
      </div>

      <div className="client-list">
        <h2>Existing Clients</h2>
        {clients.map((client) => {
          const selectedImages = getClientSelections(client.id).filter(img => client.images.includes(img));

          return (
            <div key={client.id} className="client-card">
              <p><strong>{client.name}</strong> (ID: {client.id})</p>
              <a href={`/gallery/${client.id}`} target="_blank" rel="noreferrer">View Gallery →</a>

              <input
                type="file"
                multiple
                accept="image/*"
                disabled={uploadingId === client.id}
                onChange={(e) => handleUpload(e, client.id)}
              />

              {uploadingId === client.id && <p style={{ color: 'orange' }}>Uploading...</p>}

              <div style={{ marginTop: '0.5rem' }}>
                <strong>Gallery:</strong> {client.images?.length || 0} images
                <br />
                <strong>Selected:</strong> {selectedImages.length} images
              </div>

              <button onClick={() => exportSelections(client.id, client.name)} disabled={selectedImages.length === 0}>
                Export Selections
              </button>

              <button onClick={() => handleDeleteClient(client.id)} style={{ marginLeft: '0.5rem', backgroundColor: '#a00' }}>
                Delete Client
              </button>

              {client.images && client.images.length > 0 && (
                <div className="thumbnail-grid">
                  {client.images.map((src, idx) => {
                    const isSelected = selectedImages.includes(src);
                    return (
                      <div
                        key={idx}
                        className="thumbnail-wrapper"
                        onDoubleClick={() => setEnlargedImage(src)}
                      >
                        <img
                          src={src}
                          alt={`Gallery ${idx}`}
                          className="thumbnail"
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: isSelected ? '3px solid gold' : '1px solid #666',
                            boxShadow: isSelected ? '0 0 8px gold' : 'none'
                          }}
                        />
                        <button
                          className="delete-thumbnail-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const confirmDelete = window.confirm("Remove this image?");
                            if (confirmDelete) handleImageRemove(client.id, src);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEnlargedImage(null)}
          >
            <motion.img
              src={enlargedImage}
              alt="Enlarged"
              className="enlarged-img"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
            />
            <button
              className="back-btn"
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedImage(null);
              }}
            >
              ⬅ Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Photographer;
