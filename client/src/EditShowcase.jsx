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
  ...(type === 'text' && {
    content: 'Edit text',
    fontSize: '16px',
    color: '#000',
    backgroundColor: 'transparent',
    fontFamily: 'Arial',
  }),
  ...(type === 'image' && { src: '', border: 'none', boxShadow: 'none' }),
  ...(type === 'button' && { text: 'Click Me', link: '' }),
});

const EditShowcase = () => {
  const [elements, setElements] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('#fff');
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    const fetchShowcase = async () => {
      try {
        const res = await fetch(`${API}/showcase`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
        />
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
        <button onClick={saveLayout}>Save</button>
      </div>

      {elements.map((el) => (
        <Rnd
          key={el.id}
          size={{ width: el.width, height: el.height }}
          position={{ x: el.x, y: el.y }}
          onDragStop={(e, d) =>
            !el.locked &&
            setElements((prev) =>
              prev.map((el2) =>
                el2.id === el.id ? { ...el2, x: d.x, y: d.y } : el2
              )
            )
          }
          onResizeStop={(e, direction, ref, delta, position) =>
            !el.locked &&
            setElements((prev) =>
              prev.map((el2) =>
                el2.id === el.id
                  ? {
                      ...el2,
                      width: ref.offsetWidth,
                      height: ref.offsetHeight,
                      ...position,
                    }
                  : el2
              )
            )
          }
          style={{ zIndex: el.zIndex, transform: `rotate(${el.rotation}deg)` }}
          bounds="parent"
        >
          {el.type === 'text' && <div>{el.content}</div>}
          {el.type === 'image' && (
            <div>
              {el.src ? (
                <img
                  src={el.src}
                  alt=""
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <span>No Image</span>
              )}
            </div>
          )}
          {el.type === 'button' && <button>{el.text}</button>}
        </Rnd>
      ))}
    </div>
  );
};

export default EditShowcase;
