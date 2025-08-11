import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is not defined in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Auth Service is running!');
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:5173/dashboard', // Adjust as needed for your frontend
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'User signed up successfully. Check your email for confirmation.', user: data.user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Fetch Meta API tokens if available for the user
    let metaData = null;
    if (data.user) {
      const { data: userMeta, error: metaError } = await supabase
        .from('user_meta_accounts')
        .select('meta_access_token, meta_ad_account_id')
        .eq('user_id', data.user.id)
        .single();

      if (metaError && metaError.code !== 'PGRST116') { // PGRST116 means no rows found (expected if user hasn't linked Meta)
        console.error('Error fetching user meta accounts:', metaError.message);
      } else if (userMeta) {
        metaData = userMeta;
      }
    }

    res.status(200).json({
      message: 'User signed in successfully.',
      session: data.session,
      user: data.user,
      meta: metaData, // Include Meta data in the response
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// New endpoint to link Meta Business Account
app.post('/link-meta-account', async (req, res) => {
  const { user_id, meta_access_token, meta_ad_account_id } = req.body;

  if (!user_id || !meta_access_token || !meta_ad_account_id) {
    return res.status(400).json({ error: 'user_id, meta_access_token, and meta_ad_account_id are required.' });
  }

  try {
    // Check if an entry already exists for this user
    const { data: existingMeta, error: fetchError } = await supabase
      .from('user_meta_accounts')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      throw fetchError;
    }

    let upsertData = {
      user_id,
      meta_access_token,
      meta_ad_account_id,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existingMeta) {
      // Update existing entry
      const { data, error } = await supabase
        .from('user_meta_accounts')
        .update(upsertData)
        .eq('user_id', user_id)
        .select();
      result = { data, error };
    } else {
      // Insert new entry
      const { data, error } = await supabase
        .from('user_meta_accounts')
        .insert([{ ...upsertData, created_at: new Date().toISOString() }])
        .select();
      result = { data, error };
    }

    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }

    res.status(200).json({ message: 'Meta account linked successfully.', data: result.data[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(port, () => {
  console.log(`Auth Service listening on port ${port}`);
});
