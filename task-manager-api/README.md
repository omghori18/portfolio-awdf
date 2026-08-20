# Task Management API

A RESTful backend API for managing tasks, built with Node.js and Express.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

   The server will run on `http://localhost:5000`

## Architecture

- **Express Setup**: JSON middleware for parsing request bodies
- **Logging Middleware**: Global middleware logs HTTP method, URL, and timestamp for all requests
- **CRUD Routes**: Four endpoints for task management using in-memory storage
- **Error Handling**: Global error handler catches all errors, logs them server-side, and responds with clean JSON messages

## API Endpoints

### Get All Tasks
- **Endpoint:** `GET /tasks`
- **Response:** Array of all tasks
- **Status Code:** 200 OK

**Example Request:**
```bash
curl http://localhost:5000/tasks
```

**Example Response:**
```json
[
  {
    "id": 1,
    "title": "Build API",
    "description": "Create RESTful API",
    "completed": false,
    "createdAt": "2026-08-13T07:12:00.000Z"
  }
]
```

### Create a Task
- **Endpoint:** `POST /tasks`
- **Request Body:** `{ "title": string (required), "description": string (optional) }`
- **Response:** Created task object
- **Status Code:** 201 Created

**Example Request:**
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Express", "description": "Study Express.js framework"}'
```

**Example Response:**
```json
{
  "id": 1,
  "title": "Learn Express",
  "description": "Study Express.js framework",
  "completed": false,
  "createdAt": "2026-08-13T07:12:00.000Z"
}
```

### Update a Task
- **Endpoint:** `PUT /tasks/:id`
- **Request Body:** `{ "title": string, "description": string, "completed": boolean }` (all optional)
- **Response:** Updated task object
- **Status Code:** 200 OK

**Example Request:**
```bash
curl -X PUT http://localhost:5000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

**Example Response:**
```json
{
  "id": 1,
  "title": "Learn Express",
  "description": "Study Express.js framework",
  "completed": true,
  "createdAt": "2026-08-13T07:12:00.000Z"
}
```

### Delete a Task
- **Endpoint:** `DELETE /tasks/:id`
- **Response:** Confirmation message and deleted task object
- **Status Code:** 200 OK

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/tasks/1
```

**Example Response:**
```json
{
  "message": "Task deleted successfully",
  "task": {
    "id": 1,
    "title": "Learn Express",
    "description": "Study Express.js framework",
    "completed": true,
    "createdAt": "2026-08-13T07:12:00.000Z"
  }
}
```

## Error Responses

- **400 Bad Request:** Missing required fields
  ```json
  { "error": "Title is required" }
  ```

- **404 Not Found:** Task with specified ID does not exist
  ```json
  { "error": "Task not found" }
  ```

- **500 Internal Server Error:** Unexpected server error
  ```json
  {
    "error": "Internal Server Error",
    "message": "An unexpected error occurred. Please try again later."
  }
  ```

## Middleware Overview

### JSON Middleware
Parses incoming JSON request bodies for POST and PUT requests.

### Logging Middleware
Logs every request with:
- **Timestamp:** ISO 8601 format
- **HTTP Method:** GET, POST, PUT, DELETE, etc.
- **URL:** Request path

Example log output:
```
[2026-08-13T07:12:00.000Z] GET /tasks
[2026-08-13T07:12:01.000Z] POST /tasks
[2026-08-13T07:12:02.000Z] PUT /tasks/1
[2026-08-13T07:12:03.000Z] DELETE /tasks/1
```

### Global Error Handler
Catches all errors, logs the stack trace server-side, and responds with a clean JSON error message (without exposing the stack trace to the client).

## Storage

Tasks are stored in an in-memory array (`tasks = []`). The data will be reset each time the server restarts. For persistent storage, consider integrating a database like MongoDB or PostgreSQL.

## Testing

You can test the API using curl, Postman, or any HTTP client. Refer to the endpoint examples above for detailed request/response formats.
