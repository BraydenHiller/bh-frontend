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
      }}
    >
      {elements.map((el) => (
        <Rnd
          key={el.id}
          size={{ width: el.width, height: el.height }}
          position={{ x: el.x, y: el.y }}
          style={{ zIndex: el.zIndex, transform: `rotate(${el.rotation}deg)` }}
          enableResizing={false}
          disableDragging={true}
        >
          {el.type === 'text' && (
            <div
              style={{
                fontSize: el.fontSize,
                color: el.color,
                backgroundColor: el.backgroundColor,
                fontFamily: el.fontFamily,
              }}
            >
              {el.content}
            </div>
          )}
          {el.type === 'image' && <img src={el.src} alt="" style={{ width: '100%', height: '100%' }} />}
          {el.type === 'button' && (
            <a href={el.link} target="_blank" rel="noopener noreferrer">
              <button>{el.text}</button>
            </a>
          )}
        </Rnd>
      ))}
    </div>
  );
};

export default Showcase;
