# Campaign Service

The Campaign Service is a backend microservice responsible for managing ad campaigns within the AdGen-AI platform. It integrates directly with the Meta Marketing API to create, retrieve, update, and delete ad campaigns on Meta platforms (Facebook, Instagram).

## Functionality

-   **Campaign CRUD**: Provides endpoints for creating, reading, updating, and deleting ad campaigns.
-   **Meta Marketing API Integration**: Uses the `facebook-nodejs-business-sdk` to interact with Meta's advertising platform.
-   **Data Persistence**: Stores campaign details in the PostgreSQL database (via Supabase).

## Technologies

-   Node.js
-   Express.js
-   TypeScript
-   Supabase Client (`@supabase/supabase-js`)
-   `facebook-nodejs-business-sdk`
-   `dotenv` for environment variable management

## API Endpoints

-   `POST /campaigns`: Creates a new ad campaign.
    -   **Request Body**: `{ "name": "My New Campaign", "objective": "LEAD_GENERATION", "status": "PAUSED", "userId": "uuid-of-user", ... }`
    -   **Response**: Details of the created campaign.
-   `GET /campaigns/:userId`: Retrieves all campaigns for a specific user.
    -   **Response**: Array of campaign objects.
-   `GET /campaigns/:userId/:campaignId`: Retrieves a specific campaign by ID for a user.
    -   **Response**: Campaign object.
-   `PUT /campaigns/:userId/:campaignId`: Updates an existing ad campaign.
    -   **Request Body**: `{ "name": "Updated Campaign Name", "status": "ACTIVE", ... }`
    -   **Response**: Updated campaign object.
-   `DELETE /campaigns/:userId/:campaignId`: Deletes an ad campaign.
    -   **Response**: Success message.

## Database Interaction

This service interacts with Supabase:

-   **`campaigns` table**: Stores core campaign details.
-   **`ad_creatives` table**: Stores information about ad creatives associated with campaigns.
-   **`ad_copies` table**: Stores generated ad copy variations linked to creatives.

All these tables have Row Level Security (RLS) enabled to ensure users can only access their own campaign data.

## Meta Marketing API Integration

The service initializes the Meta Business SDK using the `META_ACCESS_TOKEN` and `META_AD_ACCOUNT_ID` provided in the environment variables. These tokens are expected to be managed by the `Auth Service` and passed to the frontend, which then sends them with relevant requests to this service.

## Setup

1.  **Environment Variables**: Ensure the following are set in your `backend/.env` file:
    ```
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    META_ACCESS_TOKEN=YOUR_META_ACCESS_TOKEN # This will eventually come from Auth Service
    META_AD_ACCOUNT_ID=YOUR_META_AD_ACCOUNT_ID # This will eventually come from Auth Service
    ```
2.  **Supabase Schema**: Ensure the `campaigns`, `ad_creatives`, and `ad_copies` tables exist in your Supabase project with RLS enabled and appropriate policies. Refer to `supabase/migrations` for schema details.
3.  **Install Dependencies**:
    ```bash
    cd backend/campaign-service
    npm install
    ```
4.  **Run**:
    ```bash
    npm run dev # For development with hot-reloading
    # or
    npm start # To run compiled JavaScript
    ```

## Development Notes

-   Placeholder functions for Meta API calls are integrated into the CRUD endpoints. These need to be fully implemented to interact with the Meta Marketing API.
-   The `META_ACCESS_TOKEN` and `META_AD_ACCOUNT_ID` are currently read from environment variables for initial testing but will eventually be retrieved dynamically from the `Auth Service` based on the authenticated user.
