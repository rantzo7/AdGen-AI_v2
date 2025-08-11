# AdGen-AI Backend Services

This directory contains the backend microservices for the AdGen-AI platform. These services are designed to be independently deployable and communicate with each other via REST APIs and RabbitMQ.

## Services Overview

-   **Auth Service (`auth-service`)**: Handles user authentication (sign-up, sign-in) and manages the linking of user Meta Business Accounts, storing access tokens securely.
-   **Campaign Service (`campaign-service`)**: Manages ad campaigns, interacting with the Meta Marketing API to create, update, and retrieve campaign data.
-   **Generation Service (`generation-service`)**: Responsible for AI-powered ad copy generation (using Gemini) and image suggestions (using Straico). It consumes ad generation requests from RabbitMQ.
-   **Conversational AI Service (`conversational-ai-service`)**: Provides the AI chatbot interface, maintains conversation context using Redis, and sends ad generation requests to RabbitMQ.

## Technologies Used

-   **Node.js**: Runtime environment for all services.
-   **Express.js**: Web framework for building REST APIs.
-   **TypeScript**: For type-safe development.
-   **Docker & Docker Compose**: For containerization and orchestration of services.
-   **PostgreSQL**: Primary database for storing campaign data, user metadata, etc.
-   **Redis**: Used by the Conversational AI Service for caching conversation history.
-   **RabbitMQ**: Message broker for asynchronous communication between services (e.g., ad generation requests).
-   **Supabase**: Used for user authentication and database management.
-   **Google Gemini API**: For advanced natural language generation (ad copy, chatbot responses).
-   **Straico API**: For AI-powered image suggestions.
-   **Meta Marketing API (via `facebook-nodejs-business-sdk`)**: For managing ad campaigns on Meta platforms.
-   **Puppeteer**: For web scraping (used in Generation Service).

## Setup and Running

Refer to the main `README.md` in the project root for comprehensive setup instructions, including environment variables and Docker Compose commands.

### Individual Service Development

Each service can be developed and run independently.

1.  **Navigate to the service directory:**
    ```bash
    cd backend/[service-name]
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run in development mode (with `ts-node-dev` for hot-reloading):**
    ```bash
    npm run dev
    ```
4.  **Build for production:**
    ```bash
    npm run build
    ```
5.  **Run built production code:**
    ```bash
    npm start
    ```

## API Endpoints

Refer to the individual service READMEs for detailed API endpoint documentation.

## Database Schema

The database schema is managed via Supabase migrations. Key tables include:

-   `users`: Supabase's built-in authentication table.
-   `user_meta_accounts`: Stores Meta access tokens and ad account IDs linked by users.
-   `campaigns`: Stores details of ad campaigns.
-   `ad_creatives`: Stores information about ad creatives (e.g., image URLs).
-   `ad_copies`: Stores generated ad copy variations.

All custom tables have Row Level Security (RLS) enabled with appropriate policies to ensure data isolation and security.

## Message Queues (RabbitMQ)

-   **`ad_generation_queue`**: Used by the `conversational-ai-service` to send requests for ad copy and image generation to the `generation-service`.

## Environment Variables

Each service relies on environment variables for configuration. Ensure your `backend/.env` file is correctly populated.

## Contributing

Please follow the coding standards and best practices outlined in the main project `README.md`.
