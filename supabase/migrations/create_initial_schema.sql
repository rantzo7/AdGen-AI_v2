/*
          # Create initial schema for AdGen-AI

          This migration sets up the core tables for managing campaigns, ad creatives, and ad copies.

          1. New Tables
            - `campaigns`
              - `id` (uuid, primary key, default gen_random_uuid())
              - `user_id` (uuid, foreign key to auth.users, NOT NULL)
              - `name` (text, NOT NULL, default '')
              - `objective` (text, NOT NULL, default '')
              - `status` (text, default 'draft')
              - `created_at` (timestamptz, default now())
              - `updated_at` (timestamptz, default now())
            - `ad_creatives`
              - `id` (uuid, primary key, default gen_random_uuid())
              - `campaign_id` (uuid, foreign key to campaigns, NOT NULL)
              - `image_url` (text, default '')
              - `created_at` (timestamptz, default now())
              - `updated_at` (timestamptz, default now())
            - `ad_copies`
              - `id` (uuid, primary key, default gen_random_uuid())
              - `creative_id` (uuid, foreign key to ad_creatives, NOT NULL)
              - `text` (text, NOT NULL, default '')
              - `created_at` (timestamptz, default now())
              - `updated_at` (timestamptz, default now())

          2. Security
            - Enable RLS on `campaigns`, `ad_creatives`, and `ad_copies` tables.
            - Add policies for authenticated users to perform CRUD operations on their own data.
        */

        -- Create campaigns table
        CREATE TABLE IF NOT EXISTS campaigns (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES auth.users(id) NOT NULL,
          name text NOT NULL DEFAULT '',
          objective text NOT NULL DEFAULT '',
          status text DEFAULT 'draft',
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );

        -- Enable RLS for campaigns table
        ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

        -- Policies for campaigns table
        CREATE POLICY "Authenticated users can view their own campaigns."
          ON campaigns FOR SELECT
          TO authenticated
          USING (auth.uid() = user_id);

        CREATE POLICY "Authenticated users can create campaigns."
          ON campaigns FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Authenticated users can update their own campaigns."
          ON campaigns FOR UPDATE
          TO authenticated
          USING (auth.uid() = user_id);

        CREATE POLICY "Authenticated users can delete their own campaigns."
          ON campaigns FOR DELETE
          TO authenticated
          USING (auth.uid() = user_id);

        -- Create ad_creatives table
        CREATE TABLE IF NOT EXISTS ad_creatives (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
          image_url text DEFAULT '',
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );

        -- Enable RLS for ad_creatives table
        ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;

        -- Policies for ad_creatives table
        CREATE POLICY "Authenticated users can view ad creatives for their campaigns."
          ON ad_creatives FOR SELECT
          TO authenticated
          USING (EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND user_id = auth.uid()));

        CREATE POLICY "Authenticated users can create ad creatives for their campaigns."
          ON ad_creatives FOR INSERT
          TO authenticated
          WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND user_id = auth.uid()));

        CREATE POLICY "Authenticated users can update ad creatives for their campaigns."
          ON ad_creatives FOR UPDATE
          TO authenticated
          USING (EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND user_id = auth.uid()));

        CREATE POLICY "Authenticated users can delete ad creatives for their campaigns."
          ON ad_creatives FOR DELETE
          TO authenticated
          USING (EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND user_id = auth.uid()));

        -- Create ad_copies table
        CREATE TABLE IF NOT EXISTS ad_copies (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          creative_id uuid REFERENCES ad_creatives(id) ON DELETE CASCADE NOT NULL,
          text text NOT NULL DEFAULT '',
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );

        -- Enable RLS for ad_copies table
        ALTER TABLE ad_copies ENABLE ROW LEVEL SECURITY;

        -- Policies for ad_copies table
        CREATE POLICY "Authenticated users can view ad copies for their creatives."
          ON ad_copies FOR SELECT
          TO authenticated
          USING (EXISTS (SELECT 1 FROM ad_creatives ac JOIN campaigns c ON ac.campaign_id = c.id WHERE ac.id = creative_id AND c.user_id = auth.uid()));

        CREATE POLICY "Authenticated users can create ad copies for their creatives."
          ON ad_copies FOR INSERT
          TO authenticated
          WITH CHECK (EXISTS (SELECT 1 FROM ad_creatives ac JOIN campaigns c ON ac.campaign_id = c.id WHERE ac.id = creative_id AND c.user_id = auth.uid()));

        CREATE POLICY "Authenticated users can update ad copies for their creatives."
          ON ad_copies FOR UPDATE
          TO authenticated
          USING (EXISTS (SELECT 1 FROM ad_creatives ac JOIN campaigns c ON ac.campaign_id = c.id WHERE ac.id = creative_id AND c.user_id = auth.uid()));

        CREATE POLICY "Authenticated users can delete ad copies for their creatives."
          ON ad_copies FOR DELETE
          TO authenticated
          USING (EXISTS (SELECT 1 FROM ad_creatives ac JOIN campaigns c ON ac.campaign_id = c.id WHERE ac.id = creative_id AND c.user_id = auth.uid()));