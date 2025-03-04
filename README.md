# MVOTE - Voting Application

MVOTE is an Electron-based desktop application for managing and conducting voting sessions. It utilizes a modern stack including React, Node.js, Express, PostgreSQL, and Drizzle ORM.

## Project Structure

The project is organized into the following main directories:

*   **`client/`**: Contains the frontend code, built with React and Vite.
*   **`server/`**: Contains the backend code, built with Node.js and Express.
*   **`shared/`**: Contains shared code and data models used by both the client and server (e.g., database schema).
*   **`electron/`**: Contains the Electron-specific code for building the desktop application.
*   **`migrations/`**: Contains the Drizzle ORM database migrations.

## Technologies Used

*   **Frontend:**
    *   React
    *   Vite
    *   Tailwind CSS
    *   Radix UI
    *   React Query
*   **Backend:**
    *   Node.js
    *   Express
    *   Drizzle ORM
    *   PostgreSQL
    *   Passport.js (for authentication)
    *   express-session
*   **Desktop Application:**
    *   Electron
*   **Database:**
    *  PostgreSQL

## Getting Started

### Prerequisites

1.  **Node.js and npm:**  Make sure you have Node.js (version 20 or later) and npm installed. You can download them from the official website: [https://nodejs.org/](https://nodejs.org/)

2.  **PostgreSQL:** You need a PostgreSQL database server running.  You can install it from [https://www.postgresql.org/download/](https://www.postgresql.org/download/).  After installation:
    *   Create a database named `mvotedb`.
    *   Create a user named `postgres` with the password `root`.  (Note: Using `postgres` as the username and `root` as the password is for local development convenience and is **not recommended for production**.)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/mrfarhan786/MVOTE.git
    cd MVOTE
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

### Database Setup

1.  **Create the database:** (if you haven't already)
    You may need to use a tool like `psql` or `createdb` (if available in your PATH) from the command line, or a PostgreSQL client like pgAdmin. The following commands assume `psql` is available.

     ```bash
     psql -U postgres -c "CREATE DATABASE mvotedb;"
     ```
     If the above command doesn't work, you may need to use the full path to psql.

2.  **Run migrations:**

    ```bash
    npm run db:push
    ```

    This command will apply the Drizzle ORM migrations to create the necessary tables in your `mvotedb` database.

### Running the Application

1.  **Start the development server:**

    ```bash
    npm run dev
    ```

    This will start the backend server on port 5001.

2.  **Start the Electron app (in a separate terminal):**

    ```bash
    npm run electron:dev
    ```

    This command will launch the Electron desktop application.  It will connect to the development server running on port 5001.

### Building for Production
To build the application for production, you can use:
```
npm run build
```
Then to run the built app, you can use:
```
npm run start
```
To build the electron app for production, use:
```
npm run electron:build
