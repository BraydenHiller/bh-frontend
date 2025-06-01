import React, { useEffect, useState } from 'react';
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
  ...(type === 'button' && { text: 'Click Me', link: '' }),
});

const EditShowcase = () => {
  const [elements, setElements] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('#fff');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const res = await fetch(`${API}/showcase/draft`);
        const data = await res.json();
        setElements(data.elements || []);
        setBackgroundColor(data.backgroundColor || '#fff');
        setBackgroundImage(data.backgroundImage || null);
      } catch (err) {
        console.error('Error loading draft:', err);
      }
    };
    fetchDraft();
  }, []);

  const saveLayout = async (isDraft) => {
    try {
      await fetch(`${API}/showcase/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: { elements, backgroundColor, backgroundImage }, isDraft }),
      });
      alert(isDraft ? 'Draft saved!' : 'Published successfully!');
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  const updateElement = (id, updates) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  return (
    <div
      className="edit-showcase"
      style={{
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        minHeight: '200vh',
      }}
    >
      <div className="toolbar">
        <button onClick={() => setElements((prev) => [...prev, defaultElement('text')])}>Add Text</button>
        <button onClick={() => setElements((prev) => [...prev, defaultElement('image')])}>Add Image</button>
        <button onClick={() => setElements((prev) => [...prev, defaultElement('button')])}>Add Button</button>
        <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => setBackgroundImage(reader.result);
            reader.readAsDataURL(file);
          }}
        />
        <button onClick={() => saveLayout(true)}>Save Draft</button>
        <button onClick={() => saveLayout(false)}>Publish</button>
      </div>

      {elements.map((el) => (
        <Rnd
          key={el.id}
          size={{ width: el.width, height: el.height }}
          position={{ x: el.x, y: el.y }}
          onDragStop={(e, d) => !el.locked && updateElement(el.id, { x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, pos) => !el.locked && updateElement(el.id, { width: ref.offsetWidth, height: ref.offsetHeight, ...pos })}
          style={{ zIndex: el.zIndex, transform: `rotate(${el.rotation}deg)` }}
          bounds="parent"
          onClick={() => setSelectedElement(el)}
        >
          {el.type === 'text' && (
            <div
              contentEditable
              suppressContentEditableWarning
              style={{
                fontSize: el.fontSize,
                color: el.color,
                backgroundColor: el.backgroundColor,
                fontFamily: el.fontFamily,
              }}
              onBlur={(e) => updateElement(el.id, { content: e.target.innerText })}
            >
              {el.content}
            </div>
          )}
          {el.type === 'image' && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => updateElement(el.id, { src: reader.result });
                reader.readAsDataURL(file);
              }}
            />
          )}
          {el.type === 'button' && (
            <button
              onClick={() => {
                const link = prompt('Enter button link:', el.link);
                if (link) updateElement(el.id, { link });
              }}
            >
              {el.text}
            </button>
          )}
        </Rnd>
      ))}
    </div>
  );
};

export default EditShowcase;
