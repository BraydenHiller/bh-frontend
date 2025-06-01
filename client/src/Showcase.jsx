import React, { useEffect, useState } from 'react';

const API = 'https://bh-backend-clean.onrender.com';

const Showcase = () => {
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    const fetchLayout = async () => {
      const res = await fetch(`${API}/showcase`);
      const data = await res.json();
      setLayout(data);
    };
    fetchLayout();
  }, []);

  if (!layout) return <div>Loading Showcase...</div>;

  return (
    <div style={{ 
      backgroundColor: layout.backgroundColor || '#fff', 
      backgroundImage: layout.backgroundImage ? `url(${layout.backgroundImage})` : 'none', 
      minHeight: '100vh', 
      overflowY: 'scroll' 
    }}>
      {layout.elements.map((el) => {
        const style = {
          position: 'absolute',
          top: el.y,
          left: el.x,
          width: el.width,
          height: el.height,
          zIndex: el.zIndex,
          transform: `rotate(${el.rotation || 0}deg)`,
          backgroundColor: el.backgroundColor || 'transparent',
          color: el.color || '#000',
          fontSize: el.fontSize || '16px',
          fontFamily: el.fontFamily || 'Arial',
          border: el.border || 'none',
          boxShadow: el.boxShadow || 'none',
          textAlign: 'center',
          padding: '4px'
        };
        if (el.type === 'text') {
          return <div key={el.id} style={style}>{el.content}</div>;
        } else if (el.type === 'image') {
          return <img key={el.id} src={el.src} alt="" style={style} />;
        } else if (el.type === 'button') {
          return <button key={el.id} style={style} onClick={() => window.open(el.link, '_blank')}>{el.text}</button>;
        }
        return null;
      })}
    </div>
  );
};

export default Showcase;
