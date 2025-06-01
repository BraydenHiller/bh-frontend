// EditShowcase.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import './EditShowcase.css';
import { v4 as uuidv4 } from 'uuid';

const API = 'https://bh-backend-clean.onrender.com';

const defaultElement = (type) => ({
  id: uuidv4(),
  type,
  x: 100,
  y: 100,
  width: 200,
  height: 100,
  zIndex: 1,
  rotation: 0,
  locked: false,
  group: null,
  ...(type === 'text' && { content: 'Edit text', fontSize: '16px', color: '#000', backgroundColor: 'transparent', fontFamily: 'Arial' }),
  ...(type === 'image' && { src: '', border: 'none', boxShadow: 'none' }),
  ...(type === 'button' && { text: 'Click Me', link: '' }),
});

const EditShowcase = () => {
  const [elements, setElements] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('#fff');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
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

  const saveStateToHistory = () => {
    setHistory((prev) => [...prev, { elements, backgroundColor, backgroundImage }]);
    setRedoStack([]);
  };

  const undo = () => {
    if (history.length) {
      const prevState = history[history.length - 1];
      setRedoStack((prev) => [...prev, { elements, backgroundColor, backgroundImage }]);
      setElements(prevState.elements);
      setBackgroundColor(prevState.backgroundColor);
      setBackgroundImage(prevState.backgroundImage);
      setHistory((prev) => prev.slice(0, prev.length - 1));
    }
  };

  const redo = () => {
    if (redoStack.length) {
      const nextState = redoStack[redoStack.length - 1];
      setHistory((prev) => [...prev, { elements, backgroundColor, backgroundImage }]);
      setElements(nextState.elements);
      setBackgroundColor(nextState.backgroundColor);
      setBackgroundImage(nextState.backgroundImage);
      setRedoStack((prev) => prev.slice(0, prev.length - 1));
    }
  };

  const saveLayout = async () => {
    try {
      await fetch(`${API}/showcase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements, backgroundColor, backgroundImage }),
      });
      alert('Layout saved!');
    } catch (err) {
      console.error('Error saving layout:', err);
    }
  };

  const updateElement = (id, updates) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const deleteElement = (id) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
  };

  return (
    <div className="edit-showcase" style={{ backgroundColor, backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}>
      <div className="toolbar">
        <button onClick={() => { saveStateToHistory(); setElements((prev) => [...prev, defaultElement('text')]); }}>Add Text</button>
        <button onClick={() => { saveStateToHistory(); setElements((prev) => [...prev, defaultElement('image')]); }}>Add Image</button>
        <button onClick={() => { saveStateToHistory(); setElements((prev) => [...prev, defaultElement('button')]); }}>Add Button</button>
        <input type="color" value={backgroundColor} onChange={(e) => { saveStateToHistory(); setBackgroundColor(e.target.value); }} />
        <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onloadend = () => { saveStateToHistory(); setBackgroundImage(reader.result); }; reader.readAsDataURL(file); }} />
        <button onClick={saveLayout}>Publish</button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
      </div>

      {elements.map((el) => (
        <Rnd key={el.id} size={{ width: el.width, height: el.height }} position={{ x: el.x, y: el.y }} onDragStop={(e, d) => { if (!el.locked) { saveStateToHistory(); updateElement(el.id, { x: d.x, y: d.y }); } }} onResizeStop={(e, direction, ref, delta, position) => { if (!el.locked) { saveStateToHistory(); updateElement(el.id, { width: ref.offsetWidth, height: ref.offsetHeight, ...position }); } }} style={{ zIndex: el.zIndex, transform: `rotate(${el.rotation}deg)` }} bounds="parent" onClick={() => setSelectedId(el.id)}>
          {el.type === 'text' && selectedId === el.id ? (
            <textarea value={el.content} onChange={(e) => updateElement(el.id, { content: e.target.value })} style={{ fontSize: el.fontSize, color: el.color, backgroundColor: el.backgroundColor, fontFamily: el.fontFamily, width: '100%', height: '100%' }} />
          ) : el.type === 'text' ? (
            <div style={{ fontSize: el.fontSize, color: el.color, backgroundColor: el.backgroundColor, fontFamily: el.fontFamily }}>{el.content}</div>
          ) : null}

          {el.type === 'image' && (
            <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onloadend = () => updateElement(el.id, { src: reader.result }); reader.readAsDataURL(file); }} />
          )}
          {el.type === 'image' && el.src && <img src={el.src} alt="" style={{ width: '100%', height: '100%' }} />}

          {el.type === 'button' && selectedId === el.id ? (
            <div>
              <input value={el.text} onChange={(e) => updateElement(el.id, { text: e.target.value })} />
              <input value={el.link} placeholder="Link" onChange={(e) => updateElement(el.id, { link: e.target.value })} />
            </div>
          ) : el.type === 'button' ? (
            <button>{el.text}</button>
          ) : null}

          <div className="element-controls">
            <button onClick={() => updateElement(el.id, { locked: !el.locked })}>{el.locked ? 'Unlock' : 'Lock'}</button>
            <button onClick={() => deleteElement(el.id)}>Delete</button>
          </div>
        </Rnd>
      ))}
    </div>
  );
};

export default EditShowcase;
