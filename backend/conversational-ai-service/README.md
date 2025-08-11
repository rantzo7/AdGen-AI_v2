# Conversational AI Service

The Conversational AI Service is a backend microservice that provides the AI chatbot functionality for the AdGen-AI platform. It manages conversation history, interacts with the Google Gemini API for generating responses, and sends ad generation requests to RabbitMQ.

## Functionality

-   **Chat Interface**: Provides an endpoint for users to send messages to the AI chatbot.
-   **Conversation Context Management**: Uses Redis to store and retrieve conversation history, allowing the chatbot to maintain context across turns.
-   **AI Response Generation**: Leverages the Google Gemini API to generate intelligent and relevant responses based on user input and conversation history.
-   **Ad Generation Request Orchestration**: Sends messages to the `ad_generation_queue` in RabbitMQ when the conversation indicates a need for ad content generation.
-   **Conversation History Clearing**: Provides an endpoint to clear a user's conversation history.
-   **Safety Settings**: Applies safety settings to Gemini API calls to filter harmful content.

## Technologies

-   Node.js
-   Express.js
-   TypeScript
-   `ioredis` for Redis client
-   `amqplib` for RabbitMQ integration
-   `@google/generative-ai` for Gemini API integration
-   `dotenv` for environment variable management

## API Endpoints

-   `POST /chat`: Sends a message to the AI chatbot and receives a response.
    -   **Request Body**: `{ "userId": "uuid-of-user", "message": "Your message here" }`
    -   **Response**: `{ "response": "AI chatbot's reply" }`
-   `POST /clear-history`: Clears the conversation history for a specific user.
    -   **Request Body**: `{ "userId": "uuid-of-user" }`
    -   **Response**: Success message.

## Message Queue Interaction (RabbitMQ)

-   **Publishes to**: `ad_generation_queue`
-   **Purpose**: When the chatbot determines that the user wants to generate ad content (e.g., after collecting campaign details), it publishes a message to this queue. The `Generation Service` consumes these messages.
-   **Message Format**:
    ```json
    {
      "url": "https://example.com/product",
      "objective": "LEAD_GENERATION",
      "campaignId": "uuid-of-campaign"
    }
    ```

## Data Storage (Redis)

-   **Key**: `chat_history:[userId]`
-   **Value**: JSON string representing an array of chat messages (e.g., `[{ "role": "user", "text": "Hello" }, { "role": "model", "text": "Hi there!" }]`)
-   **Purpose**: Stores the conversation history for each user, allowing the Gemini model to maintain context.

## Setup

1.  **Environment Variables**: Ensure the following are set in your `backend/.env` file:
    ```
    REDIS_URL=redis://redis:6379 # Or your Redis instance URL
    RABBITMQ_URL=amqp://rabbitmq # Or your RabbitMQ instance URL
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```
2.  **Install Dependencies**:
    ```bash
    cd backend/conversational-ai-service
    npm install
    ```
3.  **Run**:
    ```bash
    npm run dev # For development with hot-reloading
    # or
    npm start # To run compiled JavaScript
    ```

## Development Notes

-   The `chat` endpoint retrieves the user's conversation history from Redis, appends the new message, sends the full history to Gemini, and then stores the updated history (including Gemini's response) back into Redis.
-   Placeholder logic for publishing to RabbitMQ is included. This logic needs to be enhanced to intelligently detect when an ad generation request should be triggered based on the conversation flow.
-   Gemini safety settings are applied to filter potentially harmful content.
-   Error handling is implemented for Redis, RabbitMQ, and Gemini API interactions.
