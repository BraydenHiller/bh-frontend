const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 8080;

// Supabase keys – already wired up to use env variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hkoymztwxehqaqwoninw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrb3ltenR3eGVocWFxd29uaW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTA2NTksImV4cCI6MjA2MzM2NjY1OX0.UiyoYe_w5qnjgQwCJy5A5TYzosTtqBGS7ZQmmIjaP_k';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('📸 BH Capture Co backend running with Supabase persistence');
});

// Get all clients
app.get('/clients', async (req, res) => {
  const { data, error } = await supabase.from('clients').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create new client
app.post('/clients', async (req, res) => {
  const { id, name, password } = req.body;
  if (!id || !name || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const { data: existing, error: existsError } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id);

  if (existsError) return res.status(500).json({ error: existsError.message });
  if (existing.length > 0) return res.status(400).json({ error: 'Client ID already exists' });

  const { error } = await supabase
    .from('clients')
    .insert([{ id, name, password, images: [] }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Upload images to client
app.post('/upload', async (req, res) => {
  const { id, images } = req.body;

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

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true, updated: newImages });
});

// Get all selections
app.get('/selections', async (req, res) => {
  const { data, error } = await supabase.from('selections').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Save selections for a client
app.post('/selections', async (req, res) => {
  const { id, selected } = req.body;

  await supabase.from('selections').delete().eq('id', id);

  const { error } = await supabase
    .from('selections')
    .insert([{ id, selected }]);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true });
});

// Replace images for a client
app.post('/update-images', async (req, res) => {
  const { id, images } = req.body;

  const { error } = await supabase
    .from('clients')
    .update({ images })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true });
});

// Delete a client
app.delete('/clients/:id', async (req, res) => {
  const { id } = req.params;

  const { error: clientErr } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  const { error: selErr } = await supabase
    .from('selections')
    .delete()
    .eq('id', id);

  if (clientErr || selErr) {
    return res.status(500).json({ error: clientErr?.message || selErr?.message });
  }

  res.json({ success: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Supabase-powered backend running on port ${PORT}`);
});
// Showcase table routes
app.get('/showcase', async (req, res) => {
  const { data, error } = await supabase.from('showcase').select('*').single();
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  if (!data) return res.json({ elements: [], backgroundColor: '#fff', backgroundImage: null });
  res.json(data);
});

app.post('/showcase', async (req, res) => {
  const { layout } = req.body;
  const { error: delErr } = await supabase.from('showcase').delete();
  if (delErr) console.error('Error deleting existing layout:', delErr.message);
  const { error } = await supabase.from('showcase').insert([{ ...layout }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
