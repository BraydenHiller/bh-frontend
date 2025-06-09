import React, { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import './EditShowcase.css';

const Showcase = () => {
  const [elements, setElements] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('#fff');
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    fetch('https://bh-backend-clean.onrender.com/showcase')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setElements(data.elements || []);
          setBackgroundColor(data.backgroundColor || '#fff');
          setBackgroundImage(data.backgroundImage || null);
        }
      });
  }, []);

  const renderElement = (el, index) => {
    const style = {
      background: el.type === 'text' ? '#e0e1dd' : undefined,
      fontSize: el.fontSize || '16px',
      color: el.color || '#000',
      width: el.width || 200,
      height: el.height || 100,
    };

    return (
      <Rnd
        key={index}
        size={{ width: el.width, height: el.height }}
        position={{ x: el.x, y: el.y }}
        disableDragging
        enableResizing={false}
        style={{ zIndex: el.zIndex }}
      >
        {el.type === 'text' && (
          <div className="text-box" style={style}>{el.content}</div>
        )}
        {el.type === 'image' && (
          <img className="image-box" src={el.src} alt="uploaded" style={style} />
        )}
        {el.type === 'button' && (
          <a
            href={el.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-box"
            style={style}
          >
            {el.label || 'Click Me'}
          </a>
        )}
      </Rnd>
    );
  };

  return (
    <div
      className="canvas"
      style={{
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {elements.map((el, idx) => renderElement(el, idx))}
    </div>
  );
};

export default Showcase;
