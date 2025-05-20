import React, { useState, useEffect } from 'react';
import './App.css';

const Photographer = () => {
  const [clientData, setClientData] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedImages, setSelectedImages] = useState({});
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    fetch('/clients.json')
      .then((res) => res.json())
      .then((data) => setClientData(data))
      .catch((err) => console.error('Failed to load client data:', err));
  }, []);

  const handleClientSelect = (client) => {
    setSelectedClient(client);
  };

  const handleImageClick = (client, image) => {
    setSelectedImages((prev) => {
      const current = prev[client] || [];
      return {
        ...prev,
        [client]: current.includes(image)
          ? current.filter((img) => img !== image)
          : [...current, image],
      };
    });
  };

  const handleEnlarge = (image) => {
    setEnlargedImage(image);
  };

  const handleShrink = () => {
    setEnlargedImage(null);
  };

  const handleBulkDelete = () => {
    if (!selectedClient) return;
    if (!window.confirm('Are you sure you want to delete all images for this client?')) return;

    const updatedClientData = { ...clientData };
    updatedClientData[selectedClient].images = [];
    setClientData(updatedClientData);
    setSelectedImages((prev) => ({ ...prev, [selectedClient]: [] }));
  };

  const addClient = () => {
    const newClientName = prompt('Enter new client name:');
    if (!newClientName) return;

    const updatedClientData = {
      ...clientData,
      [newClientName]: { images: [] },
    };

    setClientData(updatedClientData);
  };

  return (
    <div className="photographer-dashboard">
      <h1>Photographer Dashboard</h1>

      <div className="client-list">
        <h2>Clients</h2>
        <button onClick={addClient}>+ Add Client</button>
        <ul>
          {Object.keys(clientData).map((client) => (
            <li
              key={client}
              onClick={() => handleClientSelect(client)}
              className={client === selectedClient ? 'active' : ''}
            >
              {client}
            </li>
          ))}
        </ul>
      </div>

      {selectedClient && (
        <div className="gallery">
          <h2>{selectedClient}'s Gallery</h2>

          {clientData[selectedClient]?.images?.length === 0 ? (
            <p>No images uploaded yet.</p>
          ) : (
            <>
              <div className="image-grid">
                {clientData[selectedClient]?.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`client-${i}`}
                    onDoubleClick={() => handleEnlarge(img)}
                    className={
                      selectedImages[selectedClient]?.includes(img)
                        ? 'selected'
                        : ''
                    }
                    onClick={() => handleImageClick(selectedClient, img)}
                  />
                ))}
              </div>

              <button onClick={handleBulkDelete} className="bulk-delete">
                🗑️ Bulk Delete All
              </button>
            </>
          )}
        </div>
      )}

      {enlargedImage && (
        <div className="overlay" onClick={handleShrink}>
          <img src={enlargedImage} alt="Enlarged" className="enlarged" />
          <button className="close-btn" onClick={handleShrink}>
            ← Back
          </button>
        </div>
      )}
    </div>
  );
};

export default Photographer;
