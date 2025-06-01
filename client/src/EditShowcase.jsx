import React, { useEffect, useState } from 'react';
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
  ...(type === 'text' && { content: 'Edit text', fontSize: '16px', color: '#000', backgroundColor: 'transparent', fontFamily: 'Arial' }),
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

  const uploadImage = (file, callback) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned-upload');
    formData.append('cloud_name', 'dsgeprirb');

    fetch('https://api.cloudinary.com/v1_1/dsgeprirb/image/upload', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => callback(data.secure_url))
      .catch((err) => console.error('Cloudinary upload error:', err));
  };

  const saveLayout = async () => {
    try {
      await fetch(`${API}/showcase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements, backgroundColor, backgroundImage }),
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
        <button
          onClick={() =>
            document.getElementById('imageUpload').click()
          }
        >Add Image</button>
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              uploadImage(file, (url) => {
                setElements((prev) => [...prev, { ...defaultElement('image'), src: url }]);
              });
            }
          }}
        />
        <button onClick={() => setElements((prev) => [...prev, defaultElement('button')])}>Add Button</button>
        <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onloadend = () => setBackgroundImage(reader.result);
          reader.readAsDataURL(file);
        }} />
        <button onClick={saveLayout}>Save</button>
      </div>
      {elements.map((el) => (
        <Rnd
          key={el.id}
          size={{ width: el.width, height: el.height }}
          position={{ x: el.x, y: el.y }}
          onDragStop={(e, d) => !el.locked && setElements((prev) => prev.map((e) => e.id === el.id ? { ...e, x: d.x, y: d.y } : e))}
          onResizeStop={(e, direction, ref, delta, pos) => !el.locked && setElements((prev) => prev.map((e) => e.id === el.id ? { ...e, width: ref.offsetWidth, height: ref.offsetHeight, ...pos } : e))}
          style={{ zIndex: el.zIndex, transform: `rotate(${el.rotation}deg)` }}
          bounds="parent"
        >
          {el.type === 'text' && <div>{el.content}</div>}
          {el.type === 'image' && <img src={el.src} alt="" style={{ width: '100%', height: '100%' }} />}
          {el.type === 'button' && <button>{el.text}</button>}
        </Rnd>
      ))}
    </div>
  );
};

export default EditShowcase;
