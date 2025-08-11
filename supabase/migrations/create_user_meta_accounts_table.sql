/*
      # Create user_meta_accounts table

      1. New Tables
        - `user_meta_accounts`
          - `id` (uuid, primary key)
          - `user_id` (uuid, foreign key to auth.users.id, unique)
          - `meta_access_token` (text, stores the Meta API access token)
          - `meta_ad_account_id` (text, stores the Meta Ad Account ID)
          - `created_at` (timestamp)
          - `updated_at` (timestamp)
      2. Security
        - Enable RLS on `user_meta_accounts` table
        - Add policy for authenticated users to insert their own data
        - Add policy for authenticated users to select their own data
        - Add policy for authenticated users to update their own data
        - Add policy for authenticated users to delete their own data
    */

    CREATE TABLE IF NOT EXISTS user_meta_accounts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      meta_access_token text NOT NULL,
      meta_ad_account_id text NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    ALTER TABLE user_meta_accounts ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can insert their own meta accounts"
      ON user_meta_accounts
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can select their own meta accounts"
      ON user_meta_accounts
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can update their own meta accounts"
      ON user_meta_accounts
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can delete their own meta accounts"
      ON user_meta_accounts
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);