// Full EditShowcase.jsx with complete customization and backend save
import React, { useEffect, useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import './EditShowcase.css';

const API = 'https://bh-backend-clean.onrender.com';

const defaultElement = (type) => ({
  id: Date.now() + Math.random(),
  type,
  x: 100,
  y: 100,
  width: 200,
  height: 100,
  zIndex: 1,
  rotation: 0,
  locked: false,
  group: null,
  ...(type === 'text' && {
    content: 'Edit text', fontSize: 20, color: '#000', backgroundColor: 'transparent', fontFamily: 'Arial'
  }),
  ...(type === 'image' && { src: '', border: 'none', boxShadow: 'none' }),
  ...(type === 'button' && { text: 'Click Me', link: '', fontSize: 16, color: '#fff', backgroundColor: '#007bff' }),
});

const EditShowcase = () => {
  const [elements, setElements] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('#fff');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const saveState = () => setHistory((h) => [...h, { elements, backgroundColor, backgroundImage }]);
  const undo = () => {
    if (history.length === 0) return;
    setFuture((f) => [ { elements, backgroundColor, backgroundImage }, ...f ]);
    const prev = history[history.length - 1];
    setElements(prev.elements);
    setBackgroundColor(prev.backgroundColor);
    setBackgroundImage(prev.backgroundImage);
    setHistory((h) => h.slice(0, -1));
  };
  const redo = () => {
    if (future.length === 0) return;
    setHistory((h) => [...h, { elements, backgroundColor, backgroundImage }]);
    const next = future[0];
    setElements(next.elements);
    setBackgroundColor(next.backgroundColor);
    setBackgroundImage(next.backgroundImage);
    setFuture((f) => f.slice(1));
  };

  useEffect(() => {
    const fetchShowcase = async () => {
      try {
        const res = await fetch(`${API}/showcase`);
        const data = await res.json();
        setElements(data.elements || []);
        setBackgroundColor(data.backgroundColor || '#fff');
        setBackgroundImage(data.backgroundImage || null);
      } catch (err) {
        console.error('Error fetching edit showcase:', err);
      }
    };
    fetchShowcase();
  }, []);

  const saveLayout = async (isPublish = false) => {
    try {
      await fetch(`${API}/showcase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: { elements, backgroundColor, backgroundImage, published: isPublish } }),
      });
      alert(isPublish ? 'Published!' : 'Draft saved!');
    } catch (err) {
      console.error('Error saving layout:', err);
    }
  };

  const updateElement = (id, updates) => setElements((els) => els.map(el => el.id === id ? { ...el, ...updates } : el));
  const deleteElement = (id) => setElements((els) => els.filter(el => el.id !== id));

  return (
    <div
      className="edit-showcase"
      style={{ backgroundColor, backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none', minHeight: '200vh' }}
    >
      <div className="toolbar">
        <button onClick={() => { saveState(); setElements((p) => [...p, defaultElement('text')]); }}>Add Text</button>
        <button onClick={() => { saveState(); setElements((p) => [...p, defaultElement('image')]); }}>Add Image</button>
        <button onClick={() => { saveState(); setElements((p) => [...p, defaultElement('button')]); }}>Add Button</button>
        <input type="color" value={backgroundColor} onChange={(e) => { saveState(); setBackgroundColor(e.target.value); }} />
        <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onloadend = () => { saveState(); setBackgroundImage(r.result); }; r.readAsDataURL(f); }} />
        <button onClick={() => saveLayout(false)}>Save Draft</button>
        <button onClick={() => saveLayout(true)}>Publish</button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
      </div>
      {elements.map(el => (
        <Rnd key={el.id} size={{ width: el.width, height: el.height }} position={{ x: el.x, y: el.y }}
          onDragStop={(e, d) => !el.locked && updateElement(el.id, { x: d.x, y: d.y })}
          onResizeStop={(e, d, ref, delta, position) => !el.locked && updateElement(el.id, { width: ref.offsetWidth, height: ref.offsetHeight, ...position })}
          style={{ zIndex: el.zIndex, transform: `rotate(${el.rotation}deg)` }} bounds="parent">
          <div onClick={() => setSelectedId(el.id)} style={{ border: selectedId === el.id ? '2px dashed red' : 'none', width: '100%', height: '100%' }}>
            {el.type === 'text' && (
              <textarea value={el.content} onChange={(e) => updateElement(el.id, { content: e.target.value })} style={{ width: '100%', height: '100%', fontSize: el.fontSize, color: el.color, backgroundColor: el.backgroundColor, fontFamily: el.fontFamily }} />)}
            {el.type === 'image' && (
              <div>
                {el.src ? <img src={el.src} alt="" style={{ width: '100%', height: '100%' }} /> : <span>No Image</span>}
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onloadend = () => updateElement(el.id, { src: r.result }); r.readAsDataURL(f); }} />
              </div>)}
            {el.type === 'button' && (
              <div>
                <input value={el.text} onChange={(e) => updateElement(el.id, { text: e.target.value })} />
                <input value={el.link} placeholder="URL" onChange={(e) => updateElement(el.id, { link: e.target.value })} />
                <button style={{ fontSize: el.fontSize, backgroundColor: el.backgroundColor, color: el.color }}>{el.text}</button>
              </div>)}
            <button onClick={() => updateElement(el.id, { locked: !el.locked })}>{el.locked ? 'Unlock' : 'Lock'}</button>
            <button onClick={() => deleteElement(el.id)}>Delete</button>
          </div>
        </Rnd>
      ))}
    </div>
  );
};

export default EditShowcase;
