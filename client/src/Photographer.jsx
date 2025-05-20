
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
  const [enlargedIndex, setEnlargedIndex] = useState(0);
  const [enlargedGroup, setEnlargedGroup] = useState([]);
  const [bulkDelete, setBulkDelete] = useState({});

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

  // (The rest of your component logic remains unchanged...)
  return <motion.div>Photographer Dashboard loaded...</motion.div>;
};

export default Photographer;
