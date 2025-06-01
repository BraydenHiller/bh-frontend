import React, { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import './Showcase.css';

const API = 'https://bh-backend-clean.onrender.com';

const Showcase = () => {
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
        console.error('Error fetching showcase:', err);
      }
    };
    fetchShowcase();
  }, []);

  return (
    <div
      className="showcase"
      style={{
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'auto',
      }}
    >
      {elements.map((el) => (
        <Rnd
          key={el.id}
          size={{ width: el.width, height: el.height }}
          position={{ x: el.x, y: el.y }}
          disableDragging
          enableResizing={false}
          style={{
            zIndex: el.zIndex,
            transform: `rotate(${el.rotation}deg)`,
            pointerEvents: 'none', // Disable interactions on showcase
          }}
        >
          {el.type === 'text' && (
            <div
              style={{
                fontSize: el.fontSize,
                color: el.color,
                backgroundColor: el.backgroundColor,
                fontFamily: el.fontFamily,
                textDecoration: el.textDecoration,
                fontStyle: el.fontStyle,
                fontWeight: el.fontWeight,
                textAlign: el.textAlign,
                whiteSpace: 'pre-wrap',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              {el.content}
            </div>
          )}
          {el.type === 'image' && (
            <img
              src={el.src}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                border: el.border,
                boxShadow: el.boxShadow,
                borderRadius: el.borderRadius,
              }}
            />
          )}
          {el.type === 'button' && (
            <a href={el.link} target="_blank" rel="noopener noreferrer">
              <button
                style={{
                  width: '100%',
                  height: '100%',
                  fontSize: el.fontSize,
                  backgroundColor: el.backgroundColor,
                  color: el.color,
                  border: el.border,
                  borderRadius: el.borderRadius,
                }}
              >
                {el.text}
              </button>
            </a>
          )}
        </Rnd>
      ))}
    </div>
  );
};

export default Showcase;
