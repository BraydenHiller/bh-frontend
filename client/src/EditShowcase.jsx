import React, { useState, useEffect } from 'react'; // Removed useCallback
import { Rnd } from 'react-rnd';
import './EditShowcase.css';

const API = 'https://bh-backend-clean.onrender.com';

const defaultElement = (type) => ({
  id: Date.now(),
  type,
  x: 100,
  y: 100,
  width: 200,
  height: 100,
  zIndex: 1,
  rotation: 0,
  locked: false,
  ...(type === 'text' && { content: 'Edit text', fontSize: '16px', color: '#000', backgroundColor: 'transparent', fontFamily: 'Arial' }),
  ...(type === 'image' && { src: '', border: 'none', boxShadow: 'none' }),
  ...(type === 'button' && { text: 'Click Me', link: '' }),
});

const EditShowcase = () => {
  const [elements, setElements] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('#fff');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    const fetchShowcase = async () => {
      try {
        const res = await fetch(`${API}/showcase`);
        const data = await res.json();
        setElements(data.elements || []);
        setBackgroundColor(data.backgroundColor || '#fff');
        setBackgroundImage(data.backgroundImage || null);
      } catch (err) {
        console.error('Error fetching showcase:', err);
      }
    };
    fetchShowcase();
  }, []);

  const saveLayout = async () => {
    try {
      await fetch(`${API}/showcase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: { elements, backgroundColor, backgroundImage } }),
      });
      alert('Layout saved!');
    } catch (err) {
      console.error('Error saving layout:', err);
    }
  };

  const addElement = (type) => {
    const newEl = defaultElement(type);
    setElements((prev) => [...prev, newEl]);
    setHistory((prev) => [...prev, prev]);
    setRedoStack([]);
  };

  const updateElement = (id, changes) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...changes } : el)));
  };

  const deleteElement = (id) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
  };

  const bringForward = (id) => updateElement(id, { zIndex: (elements.find((e) => e.id === id)?.zIndex || 1) + 1 });
  const sendBackward = (id) => updateElement(id, { zIndex: (elements.find((e) => e.id === id)?.zIndex || 1) - 1 });
  const rotate = (id, angle) => updateElement(id, { rotation: angle });
  const lockToggle = (id) => updateElement(id, { locked: !elements.find((e) => e.id === id)?.locked });

  const undo = () => {
    if (!history.length) return;
    const prevState = history[history.length - 1];
    setRedoStack((stack) => [elements, ...stack]);
    setElements(prevState);
    setHistory((stack) => stack.slice(0, -1));
  };

  const redo = () => {
    if (!redoStack.length) return;
    const nextState = redoStack[0];
    setHistory((stack) => [...stack, elements]);
    setElements(nextState);
    setRedoStack((stack) => stack.slice(1));
  };

  const uploadImage = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned-upload');
    formData.append('cloud_name', 'dsgeprirb');
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dsgeprirb/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) updateElement(id, { src: data.secure_url });
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  return (
    // unchanged body of component...
    <div> {/* paste rest of your unchanged render here, only fixed unused vars */}
    </div>
  );
};

export default EditShowcase;
