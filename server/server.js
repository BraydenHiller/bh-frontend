const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 8080;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hkoymztwxehqaqwoninw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'your_supabase_key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('📸 BH Capture Co backend with Showcase updates');
});

// Get showcase layout by status (draft or published)
app.get('/showcase/:status', async (req, res) => {
  const { status } = req.params;
  try {
    const { data, error } = await supabase
      .from('showcase')
      .select('*')
      .eq('status', status)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.json({ elements: [], backgroundColor: '#fff', backgroundImage: null });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save layout as draft or published
app.post('/showcase/save', async (req, res) => {
  const { layout, isDraft } = req.body;
  const status = isDraft ? 'draft' : 'published';

  try {
    await supabase.from('showcase').delete().eq('status', status);
    const { error } = await supabase.from('showcase').insert([{ ...layout, status }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all clients
app.get('/clients', async (req, res) => {
  try {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('GET /clients error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Create a new client
app.post('/clients', async (req, res) => {
  const { id, name, password } = req.body;
  if (!id || !name || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const { data: existing } = await supabase.from('clients').select('id').eq('id', id);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Client ID exists' });
    }

    const { error } = await supabase
      .from('clients')
      .insert([{ id, name, password, images: [] }]);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload images to client gallery
app.post('/upload', async (req, res) => {
  const { id, images } = req.body;

  try {
    const { data, error: fetchErr } = await supabase
      .from('clients')
      .select('images')
      .eq('id', id)
      .single();

    if (fetchErr || !data) return res.status(404).json({ error: 'Client not found' });

    const newImages = [...(data.images || []), ...images];

    const { error } = await supabase
      .from('clients')
      .update({ images: newImages })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, updated: newImages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Replace client images
app.post('/update-images', async (req, res) => {
  const { id, images } = req.body;
  try {
    const { error } = await supabase
      .from('clients')
      .update({ images })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a client and their selections
app.delete('/clients/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error: clientErr } = await supabase.from('clients').delete().eq('id', id);
    const { error: selErr } = await supabase.from('selections').delete().eq('id', id);

    if (clientErr || selErr) {
      throw new Error(clientErr?.message || selErr?.message);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all selections
app.get('/selections', async (req, res) => {
  try {
    const { data, error } = await supabase.from('selections').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save selections for a client
app.post('/selections', async (req, res) => {
  const { id, selected } = req.body;

  try {
    await supabase.from('selections').delete().eq('id', id);
    const { error } = await supabase
      .from('selections')
      .insert([{ id, selected }]);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { name, password, maxSelections } = req.body;

  console.log('Received update for client:', id);
  console.log('Update payload:', { name, password, maxSelections });

  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (password !== undefined) updateFields.password = password;
  if (maxSelections !== undefined) updateFields.maxSelections = parseInt(maxSelections);

  try {
    const { error } = await supabase
      .from('clients')
      .update(updateFields)
      .eq('id', id);

    if (error) {
      console.error('Supabase update error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('PUT /clients/:id server error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ BH Capture Co backend running on port ${PORT}`);
});
// Update client info (name, password, maxSelections)
