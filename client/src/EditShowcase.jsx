import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API = 'https://bh-backend-clean.onrender.com';

const EditShowcase = () => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    axios.get(`${API}/showcase`).then(res => {
      if (res.data?.elements) setElements(res.data.elements);
    });
  }, []);

  const addText = () => {
    setElements(prev => [...prev, { id: uuidv4(), type: 'text', content: 'Edit me', x: 100, y: 100, size: 16 }]);
  };

  const addButton = () => {
    setElements(prev => [...prev, { id: uuidv4(), type: 'button', content: 'Click Me', x: 100, y: 100 }]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setElements(prev => [...prev, { id: uuidv4(), type: 'image', src: reader.result, x: 100, y: 100, width: 200 }]);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (id, dx, dy) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } : el));
  };

  const handleSave = () => {
    axios.post(`${API}/showcase`, { layout: { elements } });
    alert('Saved!');
  };

  const renderElement = (el) => {
    const style = {
      position: 'absolute',
      left: el.x,
      top: el.y,
      cursor: 'move',
      resize: 'both',
      overflow: 'auto',
      fontSize: el.size,
    };

    const onMouseDown = (e) => {
      const startX = e.clientX;
      const startY = e.clientY;
      const move = (e) => handleDrag(el.id, e.clientX - startX, e.clientY - startY);
      const up = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    };

    if (el.type === 'text') {
      return <div key={el.id} style={style} contentEditable onMouseDown={onMouseDown}>{el.content}</div>;
    }
    if (el.type === 'button') {
      return <button key={el.id} style={style} onMouseDown={onMouseDown}>{el.content}</button>;
    }
    if (el.type === 'image') {
      return <img key={el.id} src={el.src} alt="" style={{ ...style, width: el.width || 200 }} onMouseDown={onMouseDown} />;
    }
    return null;
  };

  return (
    <div style={{ height: '200vh', padding: 20, position: 'relative', backgroundColor: '#f9f9f9' }}>
      <h2>Edit Showcase</h2>
      <button onClick={addText}>Add Text</button>
      <button onClick={addButton}>Add Button</button>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleSave}>Save</button>
      {elements.map(renderElement)}
    </div>
  );
};

export default EditShowcase;
