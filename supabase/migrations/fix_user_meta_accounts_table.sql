/*
      # Fix user_meta_accounts table policies

      1. Changes
        - Ensures `user_meta_accounts` table exists.
        - Drops and recreates RLS policies for `user_meta_accounts` to prevent "already exists" errors.
      2. Security
        - Re-establishes RLS on `user_meta_accounts` table.
        - Re-adds policies for authenticated users to insert, select, update, and delete their own data.
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

    -- Drop policies if they exist to prevent "already exists" errors
    DROP POLICY IF EXISTS "Authenticated users can insert their own meta accounts" ON user_meta_accounts;
    DROP POLICY IF EXISTS "Authenticated users can select their own meta accounts" ON user_meta_accounts;
    DROP POLICY IF EXISTS "Authenticated users can update their own meta accounts" ON user_meta_accounts;
    DROP POLICY IF EXISTS "Authenticated users can delete their own meta accounts" ON user_meta_accounts;

    -- Recreate policies
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