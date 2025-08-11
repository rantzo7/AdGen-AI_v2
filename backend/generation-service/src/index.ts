import express from 'express';
import dotenv from 'dotenv';
import amqp from 'amqplib';
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;
const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
const geminiApiKey = process.env.GEMINI_API_KEY;
const straicoApiKey = process.env.STRAICO_API_KEY;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!geminiApiKey) {
  console.error('GEMINI_API_KEY is not defined in environment variables.');
  process.exit(1);
}

if (!straicoApiKey) {
  console.error('STRAICO_API_KEY is not defined in environment variables.');
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key are required.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" }); // Using gemini-pro for text generation
const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Generation Service is running!');
});

// Function to scrape content from a URL
async function scrapeContent(url: string) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const content = await page.evaluate(() => {
      const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.textContent);
      const images = Array.from(document.querySelectorAll('img')).map(img => img.src);
      return { paragraphs: paragraphs.join('\n'), images };
    });
    return content;
  } catch (error) {
    console.error('Error scraping content:', error);
    return { paragraphs: '', images: [] };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Function to generate ad copy using Gemini
async function generateAdCopy(prompt: string) {
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating ad copy with Gemini:', error);
    return null;
  }
}

// Function to generate image suggestions using Straico
async function generateImageSuggestion(prompt: string) {
  try {
    const response = await axios.post(
      'https://api.straico.com/v1/text-to-image',
      {
        text: prompt,
        style: 'realistic', // Example style, can be customized
        resolution: '1024x1024' // Example resolution
      },
      {
        headers: {
          'Authorization': `Bearer ${straicoApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    // Straico API returns an array of image URLs
    return response.data.image_urls;
  } catch (error: any) {
    console.error('Error generating image suggestion with Straico:', error.response ? error.response.data : error.message);
    return [];
  }
}

// RabbitMQ consumer setup
async function startConsumer() {
  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    const queue = 'ad_generation_queue';

    await channel.assertQueue(queue, { durable: true });
    console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        console.log(" [x] Received %s", content);

        const { url, objective, campaignId } = content;

        // 1. Scrape content
        const scrapedData = await scrapeContent(url);
        console.log('Scraped Data:', scrapedData);

        // 2. Generate ad copy
        const adCopyPrompt = `Generate compelling ad copy for a campaign with the objective: "${objective}". Use the following scraped text as inspiration:\n\n${scrapedData.paragraphs}\n\nSuggest a few variations.`;
        const generatedCopy = await generateAdCopy(adCopyPrompt);
        console.log('Generated Ad Copy:', generatedCopy);

        // 3. Generate image suggestions based on the objective and scraped content
        const imagePrompt = `Generate a realistic image that represents the ad campaign objective: "${objective}" and is relevant to the following content: ${scrapedData.paragraphs.substring(0, 200)}...`; // Limit content length for prompt
        const suggestedImages = await generateImageSuggestion(imagePrompt);
        console.log('Suggested Images:', suggestedImages);

        // Save generated content (ad copy and image URLs) to database (Supabase)
        try {
          // Insert into ad_creatives
          const { data: creativeData, error: creativeError } = await supabase
            .from('ad_creatives')
            .insert([{ campaign_id: campaignId, image_url: suggestedImages[0] || '' }]) // Take the first suggested image
            .select();

          if (creativeError) throw creativeError;

          const creativeId = creativeData[0].id;

          // Insert into ad_copies
          if (generatedCopy) {
            const adCopies = generatedCopy.split('\n\n').filter(copy => copy.trim() !== ''); // Split into multiple copies
            for (const copy of adCopies) {
              const { error: copyError } = await supabase
                .from('ad_copies')
                .insert([{ creative_id: creativeId, text: copy.trim() }]);
              if (copyError) console.error('Error inserting ad copy:', copyError);
            }
          }
          console.log('Generated content saved to Supabase.');
        } catch (dbError: any) {
          console.error('Error saving generated content to Supabase:', dbError.message);
        }

        channel.ack(msg);
      }
    }, {
      noAck: false
    });
  } catch (error) {
    console.error('Failed to connect to RabbitMQ or consume messages:', error);
    setTimeout(startConsumer, 5000); // Retry connection after 5 seconds
  }
}

startConsumer();

app.listen(port, () => {
  console.log(`Generation Service listening on port ${port}`);
});
