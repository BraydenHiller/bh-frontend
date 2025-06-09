import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EditShowcase.css';

const API = 'https://bh-backend-clean.onrender.com';

export default function EditShowcase() {
  const [elements, setElements] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    axios.get(`${API}/showcase`).then(res => {
      const { elements, backgroundColor, backgroundImage } = res.data;
      setElements(elements || []);
      setBackgroundColor(backgroundColor || '#ffffff');
      setBackgroundImage(backgroundImage || null);
    });
  }, []);

  useEffect(() => {
    const layout = { elements, backgroundColor, backgroundImage };
    axios.post(`${API}/showcase`, { layout });
  }, [elements, backgroundColor, backgroundImage]);

  const addText = () => {
    setElements(prev => [...prev, {
      id: Date.now(),
      type: 'text',
      content: 'New Text',
      x: 50,
      y: 50,
      fontSize: 24
    }]);
  };

  const addImage = () => {
    const url = prompt("Enter image URL");
    if (!url) return;
    setElements(prev => [...prev, {
      id: Date.now(),
      type: 'image',
      src: url,
      x: 50,
      y: 50,
      width: 200
    }]);
  };

  const updatePosition = (id, deltaX, deltaY) => {
    setElements(prev => prev.map(el => el.id === id
      ? { ...el, x: el.x + deltaX, y: el.y + deltaY }
      : el));
  };

  const resizeElement = (id, change) => {
    setElements(prev => prev.map(el => {
      if (el.id !== id) return el;
      if (el.type === 'text') return { ...el, fontSize: el.fontSize + change };
      if (el.type === 'image') return { ...el, width: el.width + change };
      return el;
    }));
  };

  return (
    <div className="edit-container" style={{ backgroundColor, backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}>
      <div className="toolbar">
        <button onClick={addText}>Add Text</button>
        <button onClick={addImage}>Add Image</button>
      </div>
      {elements.map(el => (
        <div
          key={el.id}
          className="element"
          style={{
            position: 'absolute',
            top: el.y,
            left: el.x,
            fontSize: el.fontSize,
            cursor: 'move',
          }}
          onMouseDown={e => {
            const startX = e.clientX;
            const startY = e.clientY;
            const handleMove = e => {
              updatePosition(el.id, e.clientX - startX, e.clientY - startY);
            };
            const handleUp = () => {
              window.removeEventListener('mousemove', handleMove);
              window.removeEventListener('mouseup', handleUp);
            };
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
          }}
        >
          {el.type === 'text' && (
            <div>
              <input
                value={el.content}
                onChange={e =>
                  setElements(prev => prev.map(e2 =>
                    e2.id === el.id ? { ...e2, content: e.target.value } : e2
                  ))
                }
              />
              <button onClick={() => resizeElement(el.id, 2)}>A+</button>
              <button onClick={() => resizeElement(el.id, -2)}>A-</button>
            </div>
          )}
          {el.type === 'image' && (
            <div>
              <img src={el.src} width={el.width} alt="" />
              <button onClick={() => resizeElement(el.id, 20)}>+</button>
              <button onClick={() => resizeElement(el.id, -20)}>-</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
