import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { FacebookAdsApi, Campaign, AdAccount, AdSet, AdCreative, Ad, AdImage } from 'facebook-nodejs-business-sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const metaAccessToken = process.env.META_ACCESS_TOKEN; // Temporary: Will be managed by Auth Service
const metaAdAccountId = process.env.META_AD_ACCOUNT_ID; // Temporary: Will be user-specific

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key are required.');
  process.exit(1);
}

if (!metaAccessToken || !metaAdAccountId) {
  console.warn('META_ACCESS_TOKEN or META_AD_ACCOUNT_ID is not set. Meta API calls will not function.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Meta Business SDK
let api: FacebookAdsApi | null = null;
if (metaAccessToken) {
  api = FacebookAdsApi.init(metaAccessToken);
} else {
  console.warn('Meta API not initialized due to missing access token.');
}

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Campaign Service is running!');
});

// Helper to create a campaign on Meta
async function createMetaCampaign(accessToken: string, accountId: string, campaignName: string, objective: string) {
  if (!api || !accountId) return null;
  try {
    const account = new AdAccount(accountId, api);
    const campaign = await account.createCampaign(
      [],
      {
        name: campaignName,
        objective: objective,
        status: 'PAUSED',
        special_ad_categories: [],
      }
    );
    console.log('Meta Campaign Created:', campaign.id);
    return campaign.id;
  } catch (error: any) {
    console.error('Error creating Meta Campaign:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Helper to create an ad set on Meta
async function createMetaAdSet(accessToken: string, accountId: string, campaignId: string, adSetName: string, budget: number, targeting: any) {
  if (!api || !accountId) return null;
  try {
    const account = new AdAccount(accountId, api);
    const adSet = await account.createAdSet(
      [],
      {
        name: adSetName,
        campaign_id: campaignId,
        daily_budget: budget.toString(), // Budget in cents
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'LINK_CLICKS', // Can be dynamic
        targeting: targeting, // Audience targeting
        status: 'PAUSED',
      }
    );
    console.log('Meta Ad Set Created:', adSet.id);
    return adSet.id;
  } catch (error: any) {
    console.error('Error creating Meta Ad Set:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Helper to create an ad creative on Meta
async function createMetaAdCreative(accessToken: string, accountId: string, imageUrl: string, headline: string, primaryText: string, adUrl: string) {
  if (!api || !accountId) return null;
  try {
    const account = new AdAccount(accountId, api);
    const creative = await account.createAdCreative(
      [],
      {
        name: 'Ad Creative for ' + headline,
        object_story_spec: {
          page_id: process.env.META_PAGE_ID || 'YOUR_META_PAGE_ID', // IMPORTANT: Replace with a real page ID
          link_data: {
            image_hash: '', // If using uploaded image, provide hash
            image_url: imageUrl, // Use direct image URL for now
            link: adUrl,
            message: primaryText,
            call_to_action: {
              type: 'LEARN_MORE',
              value: {
                link: adUrl,
              },
            },
            name: headline,
          },
        },
      }
    );
    console.log('Meta Ad Creative Created:', creative.id);
    return creative.id;
  } catch (error: any) {
    console.error('Error creating Meta Ad Creative:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Helper to create an ad on Meta
async function createMetaAd(accessToken: string, accountId: string, adSetId: string, creativeId: string, adName: string) {
  if (!api || !accountId) return null;
  try {
    const account = new AdAccount(accountId, api);
    const ad = await account.createAd(
      [],
      {
        name: adName,
        adset_id: adSetId,
        creative: {
          creative_id: creativeId,
        },
        status: 'PAUSED',
      }
    );
    console.log('Meta Ad Created:', ad.id);
    return ad.id;
  } catch (error: any) {
    console.error('Error creating Meta Ad:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Helper to get performance data from Meta
async function getMetaPerformanceData(accessToken: string, objectId: string, level: 'campaign' | 'adset' | 'ad') {
  if (!api || !objectId) return null;
  try {
    let insights;
    const fields = ['impressions', 'clicks', 'spend', 'conversions', 'reach', 'cpm', 'cpp', 'ctr'];
    const params = {
      time_range: { 'since': '2023-01-01', 'until': new Date().toISOString().split('T')[0] }, // Example: last year to today
      level: level,
      time_increment: 1, // Daily breakdown
    };

    if (level === 'campaign') {
      const campaign = new Campaign(objectId, api);
      insights = await campaign.getInsights(fields, params);
    } else if (level === 'adset') {
      const adSet = new AdSet(objectId, api);
      insights = await adSet.getInsights(fields, params);
    } else if (level === 'ad') {
      const ad = new Ad(objectId, api);
      insights = await ad.getInsights(fields, params);
    } else {
      throw new Error('Invalid level specified for performance data retrieval.');
    }

    console.log(`Meta Performance Data for ${level} ${objectId} retrieved.`);
    return insights.map((insight: any) => insight._data);
  } catch (error: any) {
    console.error(`Error getting Meta Performance Data for ${level} ${objectId}:`, error.response ? error.response.data : error.message);
    return null;
  }
}


// Get all campaigns for a user
app.get('/campaigns', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required.' });
  }
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, ad_sets(*, ads(*, ad_creatives(*)))') // Fetch related ad sets, ads, and creatives
      .eq('user_id', user_id);

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a full campaign (Campaign, Ad Set, Ad, Creative)
app.post('/campaigns', async (req, res) => {
  const {
    user_id,
    campaign_name,
    campaign_objective,
    ad_set_name,
    ad_set_budget, // Daily budget in USD
    ad_set_targeting, // JSON object for targeting
    ad_creative_image_url,
    ad_creative_headline,
    ad_creative_primary_text,
    ad_creative_ad_url,
    ad_name,
  } = req.body;

  if (!user_id || !campaign_name || !campaign_objective || !ad_set_name || !ad_set_budget || !ad_set_targeting || !ad_creative_image_url || !ad_creative_headline || !ad_creative_primary_text || !ad_creative_ad_url || !ad_name) {
    return res.status(400).json({ error: 'All campaign, ad set, creative, and ad details are required.' });
  }

  let localCampaign: any = null;
  let localAdSet: any = null;
  let localAdCreative: any = null;
  let localAd: any = null;

  let metaCampaignId: string | null = null;
  let metaAdSetId: string | null = null;
  let metaCreativeId: string | null = null;
  let metaAdId: string | null = null;

  try {
    // 1. Create Campaign in Supabase
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .insert([{ user_id, name: campaign_name, objective: campaign_objective }])
      .select();
    if (campaignError) throw campaignError;
    localCampaign = campaignData[0];

    // 2. Create Campaign on Meta
    if (api && metaAdAccountId && metaAccessToken) {
      metaCampaignId = await createMetaCampaign(metaAccessToken, metaAdAccountId, campaign_name, campaign_objective);
      if (metaCampaignId) {
        // Update local campaign with Meta ID
        await supabase.from('campaigns').update({ meta_campaign_id: metaCampaignId }).eq('id', localCampaign.id);
        localCampaign.meta_campaign_id = metaCampaignId;
      }
    }

    // 3. Create Ad Set in Supabase
    const { data: adSetData, error: adSetError } = await supabase
      .from('ad_sets')
      .insert([{
        campaign_id: localCampaign.id,
        name: ad_set_name,
        budget: ad_set_budget,
        targeting_details: ad_set_targeting,
      }])
      .select();
    if (adSetError) throw adSetError;
    localAdSet = adSetData[0];

    // 4. Create Ad Set on Meta
    if (api && metaAdAccountId && metaCampaignId && metaAccessToken) {
      metaAdSetId = await createMetaAdSet(metaAccessToken, metaAdAccountId, metaCampaignId, ad_set_name, ad_set_budget * 100, ad_set_targeting); // Convert budget to cents
      if (metaAdSetId) {
        // Update local ad set with Meta ID
        await supabase.from('ad_sets').update({ meta_ad_set_id: metaAdSetId }).eq('id', localAdSet.id);
        localAdSet.meta_ad_set_id = metaAdSetId;
      }
    }

    // 5. Create Ad Creative in Supabase
    const { data: creativeData, error: creativeError } = await supabase
      .from('ad_creatives')
      .insert([{ campaign_id: localCampaign.id, image_url: ad_creative_image_url }])
      .select();
    if (creativeError) throw creativeError;
    localAdCreative = creativeData[0];

    // 6. Create Ad Creative on Meta
    if (api && metaAdAccountId && metaAccessToken) {
      metaCreativeId = await createMetaAdCreative(metaAccessToken, metaAdAccountId, ad_creative_image_url, ad_creative_headline, ad_creative_primary_text, ad_creative_ad_url);
      if (metaCreativeId) {
        // Update local ad creative with Meta ID
        await supabase.from('ad_creatives').update({ meta_creative_id: metaCreativeId }).eq('id', localAdCreative.id);
        localAdCreative.meta_creative_id = metaCreativeId;
      }
    }

    // 7. Create Ad in Supabase
    const { data: adData, error: adError } = await supabase
      .from('ads')
      .insert([{
        ad_set_id: localAdSet.id,
        creative_id: localAdCreative.id,
        name: ad_name,
      }])
      .select();
    if (adError) throw adError;
    localAd = adData[0];

    // 8. Create Ad on Meta
    if (api && metaAdAccountId && metaAdSetId && metaCreativeId && metaAccessToken) {
      metaAdId = await createMetaAd(metaAccessToken, metaAdAccountId, metaAdSetId, metaCreativeId, ad_name);
      if (metaAdId) {
        // Update local ad with Meta ID
        await supabase.from('ads').update({ meta_ad_id: metaAdId }).eq('id', localAd.id);
        localAd.meta_ad_id = metaAdId;
      }
    }

    // Return comprehensive response
    res.status(201).json({
      message: 'Full campaign created successfully!',
      campaign: localCampaign,
      adSet: localAdSet,
      adCreative: localAdCreative,
      ad: localAd,
    });

  } catch (err: any) {
    console.error('Error creating full campaign:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get performance data for a specific campaign, ad set, or ad
app.get('/campaigns/:id/performance', async (req, res) => {
  const { id } = req.params;
  const { user_id, level = 'campaign' } = req.query; // Default to 'campaign' level

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required.' });
  }

  if (!['campaign', 'adset', 'ad'].includes(level as string)) {
    return res.status(400).json({ error: 'Invalid level specified. Must be "campaign", "adset", or "ad".' });
  }

  try {
    let performanceData: any[] = [];

    if (level === 'campaign') {
      // Fetch the campaign from Supabase to get its Meta Campaign ID
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('meta_campaign_id')
        .eq('id', id)
        .eq('user_id', user_id)
        .single();

      if (campaignError) {
        if (campaignError.code === 'PGRST116') { // No rows found
          return res.status(404).json({ error: 'Campaign not found or unauthorized.' });
        }
        throw campaignError;
      }

      const metaCampaignId = campaignData?.meta_campaign_id;

      if (!metaCampaignId) {
        return res.status(404).json({ error: 'Meta Campaign ID not found for this campaign.' });
      }

      // Fetch performance data from Meta for the campaign
      if (api && metaAccessToken) {
        const data = await getMetaPerformanceData(metaAccessToken, metaCampaignId, 'campaign');
        if (data) {
          performanceData = data;
        } else {
          return res.status(500).json({ error: 'Failed to retrieve campaign performance data from Meta.' });
        }
      } else {
        return res.status(500).json({ error: 'Meta API not initialized or access token missing.' });
      }
    } else if (level === 'adset') {
      // Fetch all ad sets for the campaign from Supabase
      const { data: adSetsData, error: adSetsError } = await supabase
        .from('ad_sets')
        .select('id, meta_ad_set_id')
        .eq('campaign_id', id); // Assuming 'id' here is the campaign_id

      if (adSetsError) throw adSetsError;

      if (!adSetsData || adSetsData.length === 0) {
        return res.status(404).json({ error: 'No ad sets found for this campaign.' });
      }

      // Fetch performance data for each ad set from Meta
      if (api && metaAccessToken) {
        for (const adSet of adSetsData) {
          if (adSet.meta_ad_set_id) {
            const data = await getMetaPerformanceData(metaAccessToken, adSet.meta_ad_set_id, 'adset');
            if (data) {
              performanceData.push({ adSetId: adSet.id, metaAdSetId: adSet.meta_ad_set_id, data });
            }
          }
        }
      } else {
        return res.status(500).json({ error: 'Meta API not initialized or access token missing.' });
      }
    } else if (level === 'ad') {
      // Fetch all ads for the campaign from Supabase (via ad sets)
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select('id, meta_ad_id, ad_sets(campaign_id)')
        .in('ad_set_id', supabase.from('ad_sets').select('id').eq('campaign_id', id)); // Subquery to get ad_set_ids for the campaign

      if (adsError) throw adsError;

      if (!adsData || adsData.length === 0) {
        return res.status(404).json({ error: 'No ads found for this campaign.' });
      }

      // Fetch performance data for each ad from Meta
      if (api && metaAccessToken) {
        for (const ad of adsData) {
          if (ad.meta_ad_id) {
            const data = await getMetaPerformanceData(metaAccessToken, ad.meta_ad_id, 'ad');
            if (data) {
              performanceData.push({ adId: ad.id, metaAdId: ad.meta_ad_id, data });
            }
          }
        }
      } else {
        return res.status(500).json({ error: 'Meta API not initialized or access token missing.' });
      }
    }

    res.status(200).json(performanceData);

  } catch (err: any) {
    console.error('Error fetching performance data:', err);
    res.status(500).json({ error: err.message });
  }
});


// Update a campaign
app.put('/campaigns/:id', async (req, res) => {
  const { id } = req.params;
  const { name, objective, status, user_id, meta_campaign_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required for update.' });
  }

  // Optional: Update on Meta if meta_campaign_id is present
  if (api && meta_campaign_id && metaAccessToken) {
    try {
      const campaign = new Campaign(meta_campaign_id, api);
      await campaign.update({
        name: name,
        objective: objective,
        status: status,
      });
      console.log(`Meta Campaign ${meta_campaign_id} updated.`);
    } catch (metaError: any) {
      console.error('Error updating Meta Campaign:', metaError.response ? metaError.response.data : metaError.message);
    }
  }

  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ name, objective, status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user_id)
      .select();

    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Campaign not found or unauthorized.' });
    }
    res.status(200).json(data[0]);
  } catch (err: any) {
      console.error('Error updating local campaign:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a campaign
app.delete('/campaigns/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, meta_campaign_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required for delete.' });
  }

  // Optional: Delete on Meta if meta_campaign_id is present
  if (api && meta_campaign_id && metaAccessToken) {
    try {
      const campaign = new Campaign(meta_campaign_id, api);
      await campaign.delete();
      console.log(`Meta Campaign ${meta_campaign_id} deleted.`);
    } catch (metaError: any) {
      console.error('Error deleting Meta Campaign:', metaError.response ? metaError.response.data : error.message);
    }
  }

  try {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) throw error;
    res.status(204).send();
  } catch (err: any) {
      console.error('Error deleting local campaign:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Campaign Service listening on port ${port}`);
});
