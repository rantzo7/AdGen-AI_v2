/*
      # Create ad_sets and ads tables

      This migration sets up the tables for managing ad sets and ads,
      mirroring Meta's campaign structure.

      1. New Tables
        - `ad_sets`
          - `id` (uuid, primary key, default gen_random_uuid())
          - `campaign_id` (uuid, foreign key to campaigns, NOT NULL)
          - `meta_ad_set_id` (text, stores Meta Ad Set ID, nullable)
          - `name` (text, NOT NULL, default '')
          - `budget` (numeric, default 0)
          - `targeting_details` (jsonb, stores audience targeting, default '{}')
          - `status` (text, default 'PAUSED')
          - `created_at` (timestamptz, default now())
          - `updated_at` (timestamptz, default now())
        - `ads`
          - `id` (uuid, primary key, default gen_random_uuid())
          - `ad_set_id` (uuid, foreign key to ad_sets, NOT NULL)
          - `creative_id` (uuid, foreign key to ad_creatives, NOT NULL)
          - `meta_ad_id` (text, stores Meta Ad ID, nullable)
          - `name` (text, NOT NULL, default '')
          - `status` (text, default 'PAUSED')
          - `created_at` (timestamptz, default now())
          - `updated_at` (timestamptz, default now())

      2. Security
        - Enable RLS on `ad_sets` and `ads` tables.
        - Add policies for authenticated users to perform CRUD operations on their own data,
          ensuring ownership through the `campaigns` table.
    */

    -- Create ad_sets table
    CREATE TABLE IF NOT EXISTS ad_sets (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
      meta_ad_set_id text, -- Stores the Meta Ad Set ID
      name text NOT NULL DEFAULT '',
      budget numeric DEFAULT 0,
      targeting_details jsonb DEFAULT '{}'::jsonb, -- Stores audience targeting details
      status text DEFAULT 'PAUSED',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Enable RLS for ad_sets table
    ALTER TABLE ad_sets ENABLE ROW LEVEL SECURITY;

    -- Policies for ad_sets table
    CREATE POLICY "Authenticated users can view their own ad sets."
      ON ad_sets FOR SELECT
      TO authenticated
      USING (EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND user_id = auth.uid()));

    CREATE POLICY "Authenticated users can create ad sets for their campaigns."
      ON ad_sets FOR INSERT
      TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND user_id = auth.uid()));

    CREATE POLICY "Authenticated users can update their own ad sets."
      ON ad_sets FOR UPDATE
      TO authenticated
      USING (EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND user_id = auth.uid()));

    CREATE POLICY "Authenticated users can delete their own ad sets."
      ON ad_sets FOR DELETE
      TO authenticated
      USING (EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND user_id = auth.uid()));

    -- Create ads table
    CREATE TABLE IF NOT EXISTS ads (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      ad_set_id uuid REFERENCES ad_sets(id) ON DELETE CASCADE NOT NULL,
      creative_id uuid REFERENCES ad_creatives(id) ON DELETE CASCADE NOT NULL,
      meta_ad_id text, -- Stores the Meta Ad ID
      name text NOT NULL DEFAULT '',
      status text DEFAULT 'PAUSED',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Enable RLS for ads table
    ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

    -- Policies for ads table
    CREATE POLICY "Authenticated users can view their own ads."
      ON ads FOR SELECT
      TO authenticated
      USING (EXISTS (SELECT 1 FROM ad_sets ads JOIN campaigns c ON ads.campaign_id = c.id WHERE ads.id = ad_set_id AND c.user_id = auth.uid()));

    CREATE POLICY "Authenticated users can create ads for their ad sets."
      ON ads FOR INSERT
      TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM ad_sets ads JOIN campaigns c ON ads.campaign_id = c.id WHERE ads.id = ad_set_id AND c.user_id = auth.uid()));

    CREATE POLICY "Authenticated users can update their own ads."
      ON ads FOR UPDATE
      TO authenticated
      USING (EXISTS (SELECT 1 FROM ad_sets ads JOIN campaigns c ON ads.campaign_id = c.id WHERE ads.id = ad_set_id AND c.user_id = auth.uid()));

    CREATE POLICY "Authenticated users can delete their own ads."
      ON ads FOR DELETE
      TO authenticated
      USING (EXISTS (SELECT 1 FROM ad_sets ads JOIN campaigns c ON ads.campaign_id = c.id WHERE ads.id = ad_set_id AND c.user_id = auth.uid()));