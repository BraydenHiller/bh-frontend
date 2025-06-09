import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import './EditShowcase.css';
import axios from 'axios';

const API = 'https://bh-backend-clean.onrender.com';

const EditShowcase = () => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    fetchLayout();
  }, []);

  const fetchLayout = async () => {
    const res = await axios.get(`${API}/showcase`);
    if (res.data) setElements(res.data.elements || []);
  };

  const addText = () => {
    const newText = {
      id: Date.now(),
      type: 'text',
      content: 'Edit Me',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
    };
    setElements([...elements, newText]);
  };

  const addImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImage = {
        id: Date.now(),
        type: 'image',
        src: reader.result,
        x: 100,
        y: 200,
        width: 200,
        height: 200,
      };
      setElements([...elements, newImage]);
    };
    if (file) reader.readAsDataURL(file);
  };

  const addButton = () => {
    const newBtn = {
      id: Date.now(),
      type: 'button',
      content: 'Click Me',
      url: 'https://example.com',
      x: 100,
      y: 300,
      width: 150,
      height: 40,
    };
    setElements([...elements, newBtn]);
  };

  const updatePosition = (id, x, y, width, height) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, x, y, width, height } : el));
  };

  const updateText = (id, newText) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, content: newText } : el));
  };

  const saveLayout = async () => {
    await axios.post(`${API}/showcase`, {
      layout: { elements },
    });
    alert('Saved');
  };

  return (
    <div className="edit-showcase">
      <div className="toolbar">
        <button onClick={addText}>Add Text</button>
        <input type="file" accept="image/*" onChange={addImage} />
        <button onClick={addButton}>Add Button</button>
        <button onClick={saveLayout}>Save & Publish</button>
      </div>
      <div className="canvas">
        {elements.map(el => (
          <Rnd
            key={el.id}
            size={{ width: el.width, height: el.height }}
            position={{ x: el.x, y: el.y }}
            onDragStop={(e, d) => updatePosition(el.id, d.x, d.y, el.width, el.height)}
            onResizeStop={(e, direction, ref, delta, pos) =>
              updatePosition(el.id, pos.x, pos.y, parseInt(ref.style.width), parseInt(ref.style.height))
            }
          >
            {el.type === 'text' && (
              <textarea
                className="text-box"
                value={el.content}
                onChange={e => updateText(el.id, e.target.value)}
              />
            )}
            {el.type === 'image' && <img src={el.src} alt="" className="image-box" />}
            {el.type === 'button' && (
              <a href={el.url} className="btn-box" target="_blank" rel="noreferrer">
                {el.content}
              </a>
            )}
          </Rnd>
        ))}
      </div>
    </div>
  );
};

export default EditShowcase;
