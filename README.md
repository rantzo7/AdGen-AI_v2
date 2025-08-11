# AdGen-AI

AdGen-AI is an AI-powered platform designed to streamline the process of generating and managing ad campaigns. It leverages advanced AI models (Gemini, Straico) for ad copy and image suggestions, integrates with the Meta Marketing API for campaign management, and uses a microservices architecture for scalability and maintainability.

## Features

- **AI-Powered Ad Generation**: Generate compelling ad copy and image suggestions using Gemini and Straico APIs.
- **Campaign Management**: Create, manage, and track ad campaigns through integration with the Meta Marketing API.
- **Conversational AI**: Interact with a chatbot to guide you through the ad creation process.
- **User Authentication**: Secure user authentication and management.
- **Microservices Architecture**: Scalable and modular backend built with Node.js services, Docker, PostgreSQL, Redis, and RabbitMQ.

## Project Structure

- `frontend/`: React application for the user interface.
- `backend/`: Contains all backend microservices.
  - `auth-service/`: Handles user authentication and Meta account linking.
  - `campaign-service/`: Manages ad campaigns and interacts with the Meta Marketing API.
  - `generation-service/`: Responsible for AI-powered ad copy and image generation.
  - `conversational-ai-service/`: Provides the AI chatbot functionality.
- `supabase/`: Supabase migration files.

## Getting Started

### Prerequisites

- Node.js (LTS)
- Docker and Docker Compose
- Supabase Project (URL and Anon Key)
- Google Gemini API Key
- Straico API Key
- Meta Access Token and Ad Account ID

### Setup

1.  **Clone the repository:**
    ```bash
    git clone [repository-url]
    cd AdGen-AI
    ```

2.  **Environment Variables:**
    Create a `.env` file in the root directory and in the `backend/` directory based on the `.env.example` files provided in each respective directory. Fill in your API keys and Supabase credentials.

    **Root `.env` (for frontend):**
    ```
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

    **`backend/.env` (for backend services):**
    ```
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    STRAICO_API_KEY=YOUR_STRAICO_API_KEY
    META_ACCESS_TOKEN=YOUR_META_ACCESS_TOKEN
    META_AD_ACCOUNT_ID=YOUR_META_AD_ACCOUNT_ID
    DB_USER=postgres
    DB_PASSWORD=postgres
    DB_NAME=adgen_db
    ```

3.  **Supabase Database Setup:**
    Ensure your Supabase project is set up and the necessary tables (`users`, `user_meta_accounts`, `campaigns`, `ad_creatives`, `ad_copies`) are created with Row Level Security (RLS) enabled and appropriate policies. Refer to the `supabase/migrations` directory for schema details.

4.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

5.  **Build and Run Backend Services with Docker Compose:**
    Navigate to the `backend` directory and run:
    ```bash
    cd backend
    docker-compose up --build
    ```
    This will build and start all backend services (Auth, Campaign, Generation, Conversational AI), PostgreSQL, Redis, and RabbitMQ.

6.  **Start Frontend Development Server:**
    Navigate back to the root directory and run:
    ```bash
    npm run dev
    ```

    The frontend application will be accessible at `http://localhost:5173`.

## Usage

-   **Sign Up/Sign In**: Register or log in to the platform.
-   **Link Meta Account**: Connect your Meta Business Account to enable campaign management.
-   **Create Campaign**: Use the visual wizard or conversational AI to define your ad campaign objectives, audience, and budget.
-   **Generate Ads**: Leverage AI to generate ad copy and image suggestions.
-   **Launch Campaign**: Publish your campaigns to Meta.

## Contributing

Contributions are welcome! Please refer to the individual service READMEs for more specific development guidelines.

## License

[Specify your license here]
