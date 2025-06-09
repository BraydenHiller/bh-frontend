import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Showcase.css';

const API = 'https://bh-backend-clean.onrender.com';

export default function Showcase() {
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

  return (
    <div className="showcase-container" style={{ backgroundColor, backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}>
      {elements.map(el => (
        <div
          key={el.id}
          className="element"
          style={{
            position: 'absolute',
            top: el.y,
            left: el.x,
            fontSize: el.fontSize,
          }}
        >
          {el.type === 'text' && <div>{el.content}</div>}
          {el.type === 'image' && <img src={el.src} width={el.width} alt="" />}
        </div>
      ))}
    </div>
  );
}
