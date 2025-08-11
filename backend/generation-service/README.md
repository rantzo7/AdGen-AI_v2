# Generation Service

The Generation Service is a backend microservice responsible for AI-powered ad content generation within the AdGen-AI platform. It consumes ad generation requests from RabbitMQ, scrapes content from provided URLs, generates ad copy using Google Gemini, and suggests relevant images using Straico.

## Functionality

-   **RabbitMQ Consumer**: Listens for messages on the `ad_generation_queue` to process ad generation requests.
-   **Web Scraping**: Uses Puppeteer to scrape text content and image URLs from a given URL.
-   **Ad Copy Generation**: Leverages the Google Gemini API to generate compelling ad copy variations based on campaign objectives and scraped content.
-   **Image Suggestion**: Utilizes the Straico API to generate image suggestions relevant to the ad campaign's objective and content.
-   **Data Persistence**: Saves the generated ad copy and image URLs to the Supabase database.

## Technologies

-   Node.js
-   Express.js
-   TypeScript
-   `amqplib` for RabbitMQ integration
-   `puppeteer` for web scraping
-   `@google/generative-ai` for Gemini API integration
-   `axios` for Straico API integration
-   Supabase Client (`@supabase/supabase-js`)
-   `dotenv` for environment variable management

## Message Queue Interaction (RabbitMQ)

-   **Consumes from**: `ad_generation_queue`
-   **Message Format**: Expected message content is a JSON object with `url` (the URL to scrape), `objective` (the campaign objective), and `campaignId` (the ID of the campaign to associate the generated content with).
    ```json
    {
      "url": "https://example.com/product",
      "objective": "BRAND_AWARENESS",
      "campaignId": "uuid-of-campaign"
    }
    ```

## API Endpoints

-   `GET /`: A simple health check endpoint to confirm the service is running.

## Database Interaction

This service interacts with Supabase to store the generated content:

-   **`ad_creatives` table**: Inserts suggested image URLs.
-   **`ad_copies` table**: Inserts generated ad copy variations.

These tables have Row Level Security (RLS) enabled.

## Setup

1.  **Environment Variables**: Ensure the following are set in your `backend/.env` file:
    ```
    RABBITMQ_URL=amqp://rabbitmq # Or your RabbitMQ instance URL
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    STRAICO_API_KEY=YOUR_STRAICO_API_KEY
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
2.  **Supabase Schema**: Ensure the `ad_creatives` and `ad_copies` tables exist in your Supabase project with RLS enabled and appropriate policies. Refer to `supabase/migrations` for schema details.
3.  **Install Dependencies**:
    ```bash
    cd backend/generation-service
    npm install
    ```
4.  **Run**:
    ```bash
    npm run dev # For development with hot-reloading
    # or
    npm start # To run compiled JavaScript
    ```

## Development Notes

-   The `startConsumer` function establishes the connection to RabbitMQ and sets up the message consumer. It includes retry logic for connection failures.
-   The `scrapeContent` function uses Puppeteer to extract paragraphs and image URLs from the target webpage.
-   The `generateAdCopy` function sends a prompt to the Gemini API to get ad copy.
-   The `generateImageSuggestion` function calls the Straico API to get image URLs based on a text prompt.
-   Error handling is implemented for API calls and database operations.
