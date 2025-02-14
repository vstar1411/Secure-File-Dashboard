# Secure-File-Dashboard

This project is a Vite + React application integrated with `shadcn` for the frontend and a secure backend built with Express. It handles secure file uploads with chunking, token-based authentication, and integrity checks.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or above)
- [npm](https://www.npmjs.com/) (v7 or above)

## Setup

### 1. Install Dependencies

First, install the necessary dependencies for both the frontend and backend.

Run the following command in the root directory of the project: 


```bash
cd secure-file-dashboard
npm install
```

### 2. Run the Backend Server

The backend server (Express) is used to handle file uploads, token validation, and API requests. To start the backend server, run under secure-file-dashboard directory :

```bash
cd src\server
node server.js
```

This should run the backend service on Port : 5000

### 3. Run the Frontend Server

To run the frontend (Vite + React), which includes the UI for file uploads and integration with shadcn, run the following :

Go to secure-file-dashboard directory

```bash
npm run dev
```
This should start the frontend server on http://localhost:5173

## Directory Structure

secure-file-dashboard/src/ - Contains the React app powered by Vite and shadcn
secure-file-dashboard/src/server -  Contains the Mock Express server handling API requests, file uploads, and token authentication.

## For Backend strategy Documentation please refer the Security.md in the root directory. 

## API Endpoints
POST /api/upload-chunk
This endpoint handles secure file chunk uploads.

GET /api/file/:id/metadata
This endpoint fetches metadata about the uploaded file for progress tracking.

GET /api/file/:id/checksum
This endpoint returns a mock checksum for the uploaded file, ensuring its integrity.

DELETE /api/file/:id
This endpoint deletes a file from the backend. It's protected by token-based authentication.
