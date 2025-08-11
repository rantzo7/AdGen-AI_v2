# Auth Service

The Auth Service is a core backend microservice responsible for user authentication and managing the linking of user Meta Business Accounts within the AdGen-AI platform.

## Functionality

-   **User Registration**: Allows new users to sign up with email and password.
-   **User Login**: Authenticates existing users.
-   **Meta Account Linking**: Provides an endpoint to securely store and associate Meta Access Tokens and Ad Account IDs with a user's profile in Supabase.
-   **Token Retrieval**: Enhances the sign-in response to include linked Meta account details, if available.

## Technologies

-   Node.js
-   Express.js
-   TypeScript
-   Supabase Client (`@supabase/supabase-js`)
-   `dotenv` for environment variable management

## API Endpoints

-   `POST /signup`: Registers a new user.
    -   **Request Body**: `{ "email": "user@example.com", "password": "yourpassword" }`
    -   **Response**: User session data.
-   `POST /signin`: Authenticates an existing user.
    -   **Request Body**: `{ "email": "user@example.com", "password": "yourpassword" }`
    -   **Response**: User session data, including `meta_access_token` and `meta_ad_account_id` if linked.
-   `POST /link-meta-account`: Links a Meta Business Account to the authenticated user.
    -   **Request Body**: `{ "userId": "uuid-of-user", "metaAccessToken": "your-meta-token", "metaAdAccountId": "your-ad-account-id" }`
    -   **Response**: Success message or error.

## Database Interaction

This service interacts with Supabase:

-   **`auth.users` table**: For standard user authentication.
-   **`user_meta_accounts` table**: A custom table to store `meta_access_token` and `meta_ad_account_id` for each user. This table has Row Level Security (RLS) enabled to ensure users can only manage their own linked accounts.

## Setup

1.  **Environment Variables**: Ensure the following are set in your `backend/.env` file:
    ```
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
2.  **Supabase Schema**: Ensure the `user_meta_accounts` table exists in your Supabase project with RLS enabled and appropriate policies. Refer to `supabase/migrations/create_user_meta_accounts.sql` for the schema.
3.  **Install Dependencies**:
    ```bash
    cd backend/auth-service
    npm install
    ```
4.  **Run**:
    ```bash
    npm run dev # For development with hot-reloading
    # or
    npm start # To run compiled JavaScript
    ```

## Development Notes

-   The `/link-meta-account` endpoint performs an `upsert` operation, meaning it will insert a new record if one doesn't exist for the `user_id` or update an existing one.
-   The `/signin` endpoint is modified to fetch and include the `meta_access_token` and `meta_ad_account_id` from the `user_meta_accounts` table in the response, allowing the frontend to access these credentials for Meta API calls.
