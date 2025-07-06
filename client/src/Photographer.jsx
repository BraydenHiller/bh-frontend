/* eslint-disable no-unused-vars */
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
  const [enlargedGroup, setEnlargedGroup] = useState([]);
  const [enlargedIndex, setEnlargedIndex] = useState(0);
  const [bulkDelete, setBulkDelete] = useState({});
  const [showSelectedOnly, setShowSelectedOnly] = useState({});
  const [collapsedClients, setCollapsedClients] = useState({});
  const [editingClient, setEditingClient] = useState(null); // { id, name, password }
  const [editName, setEditName] = useState('');
  const [editId, setEditId] = useState('');
  const [editPassword, setEditPassword] = useState('');

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

  const getClientSelections = (clientId) => {
    const sel = selections.find(s => s.id === clientId);
    return sel ? sel.selected : [];
  };

  const toggleClientCollapse = (clientId) => {
    setCollapsedClients(prev => ({ ...prev, [clientId]: !prev[clientId] }));
  };

  const openEditModal = (client) => {
    setEditName(client.name);
    setEditId(client.id);
    setEditPassword(client.password || '');
    setEditingClient(client);
  };

  const saveClientEdits = async () => {
    if (!editingClient) return;
    try {
      await fetch(`${API}/clients/${editingClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, name: editName, password: editPassword }),
      });
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      console.error('Failed to update client:', err);
    }
  };

  const cancelEdit = () => {
    setEditingClient(null);
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
        body: JSON.stringify({ id: newClientId, name: newClientName, password: newPassword })
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

  const exportSelections = async (clientId, clientName) => {
    const selected = getClientSelections(clientId);
    if (!selected.length) return;
    const zip = new JSZip();
    for (let i = 0; i < selected.length; i++) {
      const imageUrl = selected[i];
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        zip.file(`image-${i + 1}.jpg`, blob);
      } catch (err) {
        console.error('Error downloading image:', imageUrl, err);
      }
    }
    zip.generateAsync({ type: 'blob' }).then(zipFile => {
      saveAs(zipFile, `${clientName}_selections.zip`);
    });
  };

  const handleDeleteClient = async (clientId) => {
    const confirm = window.confirm("Are you sure you want to delete this client?");
    if (!confirm) return;
    try {
      await fetch(`${API}/clients/${clientId}`, { method: 'DELETE' });
      fetchClients();
    } catch (err) {
      console.error("Failed to delete client:", err);
    }
  };

  const handleBulkDelete = async (clientId) => {
    const selected = bulkDelete[clientId] || [];
    if (!selected.length) return;
    const confirm = window.confirm(`Delete ${selected.length} selected images?`);
    if (!confirm) return;
    const client = clients.find(c => c.id === clientId);
    const updatedImages = client.images.filter(img => !selected.includes(img));
    try {
      await fetch(`${API}/update-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId, images: updatedImages })
      });
      fetchClients();
      setBulkDelete(prev => ({ ...prev, [clientId]: [] }));
    } catch (err) {
      console.error('Bulk delete failed:', err);
    }
  };

  const updateSelection = async (clientId, imageUrl) => {
    const current = getClientSelections(clientId);
    const isSelected = current.includes(imageUrl);
    const updated = isSelected ? current.filter(i => i !== imageUrl) : [...current, imageUrl];
    try {
      await fetch(`${API}/selections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId, selected: updated })
      });
      fetchSelections();
    } catch (err) {
      console.error('Failed to update selections:', err);
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (!enlargedGroup.length) return;
    if (e.key === 'ArrowLeft') {
      const newIndex = (enlargedIndex === 0 ? enlargedGroup.length - 1 : enlargedIndex - 1);
      setEnlargedIndex(newIndex);
      setEnlargedImage(enlargedGroup[newIndex]);
    }
    if (e.key === 'ArrowRight') {
      const newIndex = (enlargedIndex === enlargedGroup.length - 1 ? 0 : enlargedIndex + 1);
      setEnlargedIndex(newIndex);
      setEnlargedImage(enlargedGroup[newIndex]);
    }
  }, [enlargedGroup, enlargedIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <motion.div className="photographer-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="dashboard-header">
        <h1>Photographer Dashboard</h1>
        <div className="form-section">
          <h2>Create New Client Gallery</h2>
          <input placeholder="Client Name" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
          <input placeholder="Client ID" value={newClientId} onChange={(e) => setNewClientId(e.target.value)} />
          <input placeholder="Client Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <button onClick={addClient}>Add Client</button>
        </div>
      </div>

      <div className="client-list">
        {clients.map((client) => {
          const selectedImages = getClientSelections(client.id).filter(img => client.images.includes(img));
          const markedForDelete = bulkDelete[client.id] || [];
          const onlySelected = showSelectedOnly[client.id];
          const isCollapsed = collapsedClients[client.id];
          const visibleImages = onlySelected ? client.images.filter(img => selectedImages.includes(img)) : client.images;

          return (
            <div key={client.id} className="client-card">
              <div className="client-header">
                <p><strong>{client.name}</strong> (ID: {client.id})</p>
                <div className="client-controls">
                  <button onClick={() => toggleClientCollapse(client.id)}>{isCollapsed ? 'Expand' : 'Collapse'}</button>
                  <button onClick={() => openEditModal(client)}>Edit Login Info</button>
                </div>
              </div>
              {!isCollapsed && (
                <>
                  <a href={`/gallery/${client.id}`} target="_blank" rel="noreferrer">
                    <button>View Gallery</button>
                  </a>
                  <input type="file" multiple accept="image/*" disabled={uploadingId === client.id} onChange={(e) => handleUpload(e, client.id)} />
                  <p>Gallery: {client.images?.length || 0} | Selected: {selectedImages.length}</p>
                  <button onClick={() => exportSelections(client.id, client.name)} disabled={selectedImages.length === 0}>Export Selections</button>
                  <button onClick={() => handleDeleteClient(client.id)} style={{ marginLeft: '0.5rem', backgroundColor: '#a00' }}>Delete Client</button>
                  <button onClick={() => setBulkDelete(prev => ({ ...prev, [client.id]: prev[client.id]?.length ? [] : null }))} style={{ marginLeft: '0.5rem' }}>
                    🗑️ Bulk Delete Mode
                  </button>
                  <button onClick={() => setShowSelectedOnly(prev => ({ ...prev, [client.id]: !prev[client.id] }))} style={{ marginLeft: '0.5rem' }}>
                    {onlySelected ? 'Show All' : 'Show Selected Only'}
                  </button>

                  <div className="thumbnail-grid">
                    {visibleImages.map((src, idx) => (
                      <div
                        key={idx}
                        className={`thumbnail-wrapper ${selectedImages.includes(src) ? 'selected-admin' : ''}`}
                        onDoubleClick={() => {
                          setEnlargedImage(src);
                          setEnlargedGroup(visibleImages);
                          setEnlargedIndex(idx);
                        }}
                      >
                        <img src={src} alt={`img-${idx}`} className="thumbnail" />
                        {bulkDelete[client.id] && (
                          <input
                            type="checkbox"
                            className="bulk-checkbox"
                            checked={bulkDelete[client.id]?.includes(src)}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...(bulkDelete[client.id] || []), src]
                                : (bulkDelete[client.id] || []).filter(i => i !== src);
                              setBulkDelete(prev => ({ ...prev, [client.id]: updated }));
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  {markedForDelete.length > 0 && (
                    <button onClick={() => handleBulkDelete(client.id)} style={{ marginTop: '0.5rem', backgroundColor: '#a00' }}>
                      Delete Selected ({markedForDelete.length})
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Image Overlay */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.img
              src={enlargedImage}
              alt="Enlarged"
              className="enlarged-img"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onDoubleClick={() => {
                const client = clients.find(c => c.images.includes(enlargedImage));
                if (client) updateSelection(client.id, enlargedImage);
              }}
            />
            <div className="nav-buttons">
              <button onClick={() => {
                const newIndex = (enlargedIndex - 1 + enlargedGroup.length) % enlargedGroup.length;
                setEnlargedIndex(newIndex);
                setEnlargedImage(enlargedGroup[newIndex]);
              }}>◀</button>
              <button onClick={() => setEnlargedImage(null)}>⬅ Back</button>
              <button onClick={() => {
                const client = clients.find(c => c.images.includes(enlargedImage));
                if (client) updateSelection(client.id, enlargedImage);
              }}>
                Toggle Select
              </button>
              <button onClick={() => {
                const newIndex = (enlargedIndex + 1) % enlargedGroup.length;
                setEnlargedIndex(newIndex);
                setEnlargedImage(enlargedGroup[newIndex]);
              }}>▶</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Edit Client Login Info</h3>
            <input placeholder="Client Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <input placeholder="Client ID" value={editId} onChange={(e) => setEditId(e.target.value)} />
            <input placeholder="Password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
            <div className="modal-actions">
              <button onClick={saveClientEdits}>Save</button>
              <button onClick={cancelEdit} style={{ backgroundColor: '#a00' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Photographer;
