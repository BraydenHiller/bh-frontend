import React, { useState, useEffect, useCallback } from 'react';
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
  group: null,
  ...(type === 'text' && { content: 'Edit text', fontSize: '16px', color: '#000', backgroundColor: 'transparent', fontFamily: 'Arial' }),
  ...(type === 'image' && { src: '', border: 'none', boxShadow: 'none' }),
  ...(type === 'button' && { text: 'Click Me', link: '' })
});

const EditShowcase = () => {
  const [elements, setElements] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('#fff');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

 useEffect(() => {
  fetch(`${API}/showcase`)
    .then(res => res.json())
    .then(data => {
      setElements(data.elements || []);
      setBackgroundColor(data.backgroundColor || '#fff');
      setBackgroundImage(data.backgroundImage || null);
    })
    .catch(err => console.error('Error fetching showcase:', err));
}, []);


  const saveLayout = () => {
    fetch(`${API}/showcase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layout: { elements, backgroundColor, backgroundImage } })
    }).then(() => alert('Layout saved!'));
  };

  const addElement = (type) => {
    const newEl = defaultElement(type);
    setElements(prev => [...prev, newEl]);
    setHistory(prev => [...prev, prev]);
    setRedoStack([]);
  };

  const updateElement = (id, changes) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...changes } : el));
  };

  const deleteElement = (id) => {
    setElements(prev => prev.filter(el => el.id !== id));
  };

  const bringForward = (id) => updateElement(id, { zIndex: (elements.find(e => e.id === id)?.zIndex || 1) + 1 });
  const sendBackward = (id) => updateElement(id, { zIndex: (elements.find(e => e.id === id)?.zIndex || 1) - 1 });
  const rotate = (id, angle) => updateElement(id, { rotation: angle });
  const lockToggle = (id) => updateElement(id, { locked: !elements.find(e => e.id === id)?.locked });
  const groupElements = (ids) => {
    const groupId = Date.now();
    setElements(prev => prev.map(el => ids.includes(el.id) ? { ...el, group: groupId } : el));
  };

  const undo = () => {
    if (!history.length) return;
    const prevState = history.pop();
    setRedoStack(stack => [elements, ...stack]);
    setElements(prevState);
  };

  const redo = () => {
    if (!redoStack.length) return;
    const nextState = redoStack.shift();
    setHistory(stack => [...stack, elements]);
    setElements(nextState);
  };

  const uploadImage = async (e, id) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned-upload');
    formData.append('cloud_name', 'dsgeprirb');
    const res = await fetch('https://api.cloudinary.com/v1_1/dsgeprirb/image/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.secure_url) updateElement(id, { src: data.secure_url });
  };

  return (
    <div className="edit-showcase" style={{ backgroundColor, backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none', minHeight: '200vh' }}>
      <div className="toolbar">
        <button onClick={() => addElement('text')}>Add Text</button>
        <button onClick={() => addElement('image')}>Add Image</button>
        <button onClick={() => addElement('button')}>Add Button</button>
        <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => setBackgroundImage(reader.result);
          reader.readAsDataURL(file);
        }} />
        <button onClick={saveLayout}>Save</button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
      </div>
      {elements.map(el => (
        <Rnd
          key={el.id}
          size={{ width: el.width, height: el.height }}
          position={{ x: el.x, y: el.y }}
          onDragStop={(e, d) => !el.locked && updateElement(el.id, { x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, position) => !el.locked && updateElement(el.id, { width: ref.offsetWidth, height: ref.offsetHeight, ...position })}
          style={{ zIndex: el.zIndex, transform: `rotate(${el.rotation}deg)` }}
          bounds="parent"
        >
          {el.type === 'text' && (
            <div style={{ fontSize: el.fontSize, color: el.color, backgroundColor: el.backgroundColor, fontFamily: el.fontFamily }}>
              <textarea value={el.content} onChange={(e) => updateElement(el.id, { content: e.target.value })} />
              <input type="number" value={el.fontSize} onChange={(e) => updateElement(el.id, { fontSize: `${e.target.value}px` })} />
              <input type="color" value={el.color} onChange={(e) => updateElement(el.id, { color: e.target.value })} />
              <input type="color" value={el.backgroundColor} onChange={(e) => updateElement(el.id, { backgroundColor: e.target.value })} />
              <select value={el.fontFamily} onChange={(e) => updateElement(el.id, { fontFamily: e.target.value })}>
                <option>Arial</option><option>Times</option><option>Courier</option>
              </select>
              <button onClick={() => bringForward(el.id)}>Bring Forward</button>
              <button onClick={() => sendBackward(el.id)}>Send Back</button>
              <button onClick={() => rotate(el.id, (el.rotation || 0) + 15)}>Rotate</button>
              <button onClick={() => lockToggle(el.id)}>{el.locked ? 'Unlock' : 'Lock'}</button>
              <button onClick={() => deleteElement(el.id)}>Delete</button>
            </div>
          )}
          {el.type === 'image' && (
            <div>
              {el.src ? <img src={el.src} alt="" style={{ width: '100%', height: '100%' }} /> : <input type="file" accept="image/*" onChange={(e) => uploadImage(e, el.id)} />}
              <button onClick={() => bringForward(el.id)}>Bring Forward</button>
              <button onClick={() => sendBackward(el.id)}>Send Back</button>
              <button onClick={() => rotate(el.id, (el.rotation || 0) + 15)}>Rotate</button>
              <button onClick={() => lockToggle(el.id)}>{el.locked ? 'Unlock' : 'Lock'}</button>
              <button onClick={() => deleteElement(el.id)}>Delete</button>
            </div>
          )}
          {el.type === 'button' && (
            <div>
              <input value={el.text} onChange={(e) => updateElement(el.id, { text: e.target.value })} />
              <input value={el.link} onChange={(e) => updateElement(el.id, { link: e.target.value })} />
              <button onClick={() => bringForward(el.id)}>Bring Forward</button>
              <button onClick={() => sendBackward(el.id)}>Send Back</button>
              <button onClick={() => rotate(el.id, (el.rotation || 0) + 15)}>Rotate</button>
              <button onClick={() => lockToggle(el.id)}>{el.locked ? 'Unlock' : 'Lock'}</button>
              <button onClick={() => deleteElement(el.id)}>Delete</button>
            </div>
          )}
        </Rnd>
      ))}
    </div>
  );
};

export default EditShowcase;
