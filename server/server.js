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

// --- Showcase routes with drafts and publish ---
app.get('/showcase', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('showcase')
      .select('*')
      .eq('status', 'published')
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

app.get('/showcase/draft', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('showcase')
      .select('*')
      .eq('status', 'draft')
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

// --- Existing routes (clients, selections) remain the same ---
app.get('/clients', async (req, res) => {
  const { data, error } = await supabase.from('clients').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/clients', async (req, res) => {
  const { id, name, password } = req.body;
  if (!id || !name || !password) return res.status(400).json({ error: 'Missing fields' });

  const { data: existing } = await supabase.from('clients').select('id').eq('id', id);
  if (existing.length > 0) return res.status(400).json({ error: 'Client ID exists' });

  const { error } = await supabase.from('clients').insert([{ id, name, password, images: [] }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.post('/upload', async (req, res) => {
  const { id, images } = req.body;
  const { data, error: fetchErr } = await supabase.from('clients').select('images').eq('id', id).single();
  if (fetchErr || !data) return res.status(404).json({ error: 'Client not found' });
  const newImages = [...(data.images || []), ...images];
  const { error } = await supabase.from('clients').update({ images: newImages }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, updated: newImages });
});

app.get('/selections', async (req, res) => {
  const { data, error } = await supabase.from('selections').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/selections', async (req, res) => {
  const { id, selected } = req.body;
  await supabase.from('selections').delete().eq('id', id);
  const { error } = await supabase.from('selections').insert([{ id, selected }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.post('/update-images', async (req, res) => {
  const { id, images } = req.body;
  const { error } = await supabase.from('clients').update({ images }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.delete('/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { error: clientErr } = await supabase.from('clients').delete().eq('id', id);
  const { error: selErr } = await supabase.from('selections').delete().eq('id', id);
  if (clientErr || selErr) return res.status(500).json({ error: clientErr?.message || selErr?.message });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Enhanced backend with drafts/publish running on port ${PORT}`);
});
// Get draft showcase
app.get('/showcase/draft', async (req, res) => {
  const { data, error } = await supabase.from('showcase').select('*').eq('status', 'draft').single();
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  if (!data) return res.json({ elements: [], backgroundColor: '#fff', backgroundImage: null });
  res.json(data);
});

// Save draft or publish showcase
app.post('/showcase/save', async (req, res) => {
  const { layout, isDraft } = req.body;
  const status = isDraft ? 'draft' : 'published';

  // Delete existing entry with the same status
  const { error: delErr } = await supabase.from('showcase').delete().eq('status', status);
  if (delErr) console.error(`Error deleting existing ${status}:`, delErr.message);

  const { error } = await supabase.from('showcase').insert([{ ...layout, status }]);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true });
});

// Get published showcase
app.get('/showcase', async (req, res) => {
  const { data, error } = await supabase.from('showcase').select('*').eq('status', 'published').single();
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  if (!data) return res.json({ elements: [], backgroundColor: '#fff', backgroundImage: null });
  res.json(data);
});
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

app.get('/selections', async (req, res) => {
  try {
    const { data, error } = await supabase.from('selections').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('GET /selections error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
