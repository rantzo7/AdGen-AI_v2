import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import Redis from 'ioredis';
import amqp from 'amqplib';

dotenv.config();

const app = express();
const port = process.env.PORT || 3004;

const geminiApiKey = process.env.GEMINI_API_KEY;
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
const campaignServiceUrl = process.env.CAMPAIGN_SERVICE_URL || 'http://localhost:3002'; // URL for the Campaign Service

if (!geminiApiKey) {
  console.error('GEMINI_API_KEY is not defined in environment variables.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const redis = new Redis(redisUrl);

let channel: amqp.Channel;
let connection: amqp.Connection;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertQueue('ad_generation_requests', { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    // Implement a retry mechanism or graceful degradation
  }
}

connectRabbitMQ();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Conversational AI Service is running!');
});

// Define the tool for Gemini
const tools = [
  {
    function_declarations: [
      {
        name: "get_campaign_performance",
        description: "Get performance data for a specific advertising campaign, ad set, or ad.",
        parameters: {
          type: "object",
          properties: {
            campaignId: {
              type: "string",
              description: "The ID of the campaign to get performance data for.",
            },
            userId: {
              type: "string",
              description: "The ID of the user who owns the campaign.",
            },
            level: {
              type: "string",
              description: "The level of performance data to retrieve (campaign, adset, or ad). Defaults to 'campaign'.",
              enum: ["campaign", "adset", "ad"],
              default: "campaign",
            },
          },
          required: ["campaignId", "userId"],
        },
      },
    ],
  },
];

// Endpoint to handle chat interactions
app.post('/chat', async (req, res) => {
  const { userId, message, conversationHistory } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'userId and message are required.' });
  }

  try {
    // Retrieve conversation history from Redis
    const historyKey = `chat:history:${userId}`;
    const storedHistory = await redis.get(historyKey);
    let parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];

    // Append new message to history
    parsedHistory.push({ role: "user", parts: [{ text: message }] });

    // Configure safety settings for Gemini
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const chat = model.startChat({
      history: parsedHistory,
      safetySettings,
      tools: tools, // Pass the defined tools to the model
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    let aiResponseText = '';

    // Check if the model wants to call a function
    const functionCall = response.functionCall();
    if (functionCall) {
      const { name, args } = functionCall;
      console.log(`Gemini requested function call: ${name} with args:`, args);

      if (name === 'get_campaign_performance') {
        const { campaignId, userId: reqUserId, level = 'campaign' } = args; // Use reqUserId to avoid conflict with outer userId, default level
        if (!campaignId || !reqUserId) {
          console.error('Missing campaignId or userId for get_campaign_performance.');
          aiResponseText = 'I need both a campaign ID and your user ID to get performance data.';
        } else {
          try {
            // Make a request to the Campaign Service with the level parameter
            const campaignPerformanceRes = await fetch(`${campaignServiceUrl}/campaigns/${campaignId}/performance?user_id=${reqUserId}&level=${level}`);
            if (!campaignPerformanceRes.ok) {
              const errorData = await campaignPerformanceRes.json();
              throw new Error(`Campaign Service error: ${campaignPerformanceRes.status} - ${errorData.error}`);
            }
            const performanceData = await campaignPerformanceRes.json();
            console.log('Campaign performance data:', performanceData);

            // Format the performance data into a readable string for the user
            let formattedPerformance = `Performance data for ${level} with ID ${campaignId}:\n\n`;
            if (Array.isArray(performanceData) && performanceData.length > 0) {
              performanceData.forEach((dataPoint: any) => {
                if (level === 'campaign') {
                  formattedPerformance += `  Date: ${dataPoint.date}\n`;
                  formattedPerformance += `  Impressions: ${dataPoint.impressions}\n`;
                  formattedPerformance += `  Clicks: ${dataPoint.clicks}\n`;
                  formattedPerformance += `  Spend: $${parseFloat(dataPoint.spend).toFixed(2)}\n`;
                  formattedPerformance += `  CTR: ${(parseFloat(dataPoint.ctr) * 100).toFixed(2)}%\n\n`;
                } else if (level === 'adset') {
                  formattedPerformance += `  Ad Set ID (Local): ${dataPoint.adSetId}\n`;
                  formattedPerformance += `  Ad Set ID (Meta): ${dataPoint.metaAdSetId}\n`;
                  dataPoint.data.forEach((insight: any) => {
                    formattedPerformance += `    Date: ${insight.date}\n`;
                    formattedPerformance += `    Impressions: ${insight.impressions}\n`;
                    formattedPerformance += `    Clicks: ${insight.clicks}\n`;
                    formattedPerformance += `    Spend: $${parseFloat(insight.spend).toFixed(2)}\n`;
                    formattedPerformance += `    CTR: ${(parseFloat(insight.ctr) * 100).toFixed(2)}%\n\n`;
                  });
                } else if (level === 'ad') {
                  formattedPerformance += `  Ad ID (Local): ${dataPoint.adId}\n`;
                  formattedPerformance += `  Ad ID (Meta): ${dataPoint.metaAdId}\n`;
                  dataPoint.data.forEach((insight: any) => {
                    formattedPerformance += `    Date: ${insight.date}\n`;
                    formattedPerformance += `    Impressions: ${insight.impressions}\n`;
                    formattedPerformance += `    Clicks: ${insight.clicks}\n`;
                    formattedPerformance += `    Spend: $${parseFloat(insight.spend).toFixed(2)}\n`;
                    formattedPerformance += `    CTR: ${(parseFloat(insight.ctr) * 100).toFixed(2)}%\n\n`;
                  });
                }
              });
            } else {
              formattedPerformance = `No performance data found for ${level} with ID ${campaignId}.`;
            }

            // Send the function response back to Gemini
            const toolResponse = await chat.sendMessage([
              {
                functionResponse: {
                  name: "get_campaign_performance",
                  response: {
                    summary: formattedPerformance,
                    rawData: performanceData, // Include raw data for Gemini's context
                  },
                },
              },
            ]);
            aiResponseText = toolResponse.response.text();
          } catch (toolError: any) {
            console.error('Error calling get_campaign_performance tool:', toolError);
            // Send an error response back to Gemini
            const toolErrorResponse = await chat.sendMessage([
              {
                functionResponse: {
                  name: "get_campaign_performance",
                  response: { error: toolError.message },
                },
              },
            ]);
            aiResponseText = toolErrorResponse.response.text();
          }
        }
      } else {
        aiResponseText = `I don't know how to handle the function "${name}".`;
      }
    } else {
      // If no function call, get the text response
      aiResponseText = response.text();
    }

    // Append AI response to history
    parsedHistory.push({ role: "model", parts: [{ text: aiResponseText }] });

    // Store updated conversation history in Redis
    await redis.set(historyKey, JSON.stringify(parsedHistory));

    // Example: If the user asks to generate an ad, publish a message to RabbitMQ
    if (aiResponseText.toLowerCase().includes('generate ad') || aiResponseText.toLowerCase().includes('create campaign')) {
      if (channel) {
        const adRequest = {
          userId,
          prompt: message, // Or extract more specific details from the conversation
          // Add other relevant campaign details extracted from conversation history
        };
        channel.sendToQueue('ad_generation_requests', Buffer.from(JSON.stringify(adRequest)), { persistent: true });
        console.log(`[x] Sent ad generation request for user ${userId}`);
      } else {
        console.warn('RabbitMQ channel not available. Ad generation request not sent.');
      }
    }

    res.status(200).json({ response: aiResponseText, history: parsedHistory });
  } catch (err: any) {
    console.error('Error in conversational AI:', err);
    res.status(500).json({ error: 'Failed to get AI response.', details: err.message });
  }
});

// Endpoint to clear conversation history
app.post('/clear-history', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required.' });
  }
  try {
    await redis.del(`chat:history:${userId}`);
    res.status(200).json({ message: 'Conversation history cleared.' });
  } catch (err: any) {
    console.error('Error clearing history:', err);
    res.status(500).json({ error: 'Failed to clear conversation history.', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Conversational AI Service listening on port ${port}`);
});
