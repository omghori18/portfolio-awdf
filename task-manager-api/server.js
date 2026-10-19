// ====== STEP 1: LOAD ENVIRONMENT VARIABLES ======
// This MUST be at the very top before anything else
// dotenv loads variables from .env file into process.env
require('dotenv').config();

// ====== STEP 2: IMPORT DEPENDENCIES ======
const express = require('express');
const mongoose = require('mongoose');
const Task = require('./models/Task');
const NodeCache = require('node-cache');

// ====== PRACTICAL 10: Event-Driven Architecture ======
// Import our custom TaskEvents singleton (extends Node's built-in EventEmitter)
const taskEvents = require('./events');
// Require listeners.js ONCE at startup to register all event listeners
// IMPORTANT: Must be required before any events are emitted so listeners are active
require('./listeners');

// Initialize cache with 60 seconds TTL
const cache = new NodeCache({ stdTTL: 60 });
let cacheStats = { hits: 0, misses: 0 };

// Initialize Express app
const app = express();
// PORT: reads from env so Docker Compose can inject PORT=5000
// Falls back to 3000 for local development without Docker
const PORT = process.env.PORT || 3000;

// ====== STEP 3: EXPRESS SETUP ======
// JSON middleware - must be first to parse request bodies
app.use(express.json());

// CORS middleware - allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files
app.use(express.static(__dirname));

// ====== STEP 4: MONGODB CONNECTION ======
// What's happening here:
// 1. mongoose.connect() connects to MongoDB using URI from .env
// 2. Connection happens BEFORE routes so routes can use the connection

console.log('Attempting to connect to MongoDB...');
const mongoUri = process.env.MONGO_URI || 'mongodb://mongodb:27017/task-manager';
mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log(`📍 Connected to: ${mongoUri}`);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:');
    console.error(error.message);
  });

// ====== STEP 5: LOGGING MIDDLEWARE ======
// Global logging middleware - logs HTTP method, URL, and timestamp
// This runs for EVERY request
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ====== STEP 6: CRUD ROUTES (Using Mongoose) ======

// GET / - Serve the HTML client
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// ========================================
// GET /tasks - Retrieve ALL tasks from MongoDB
// ========================================
// What's happening:
// 1. try block: Attempt to fetch tasks
// 2. Task.find() = Mongoose method that queries MongoDB collection
//    - No arguments = get ALL documents
//    - Returns array of all tasks
// 3. res.status(200) = Success
// 4. catch block: If error occurs, pass to error handler with next(err)
app.get('/tasks', async (req, res, next) => {
  try {
    const cachedTasks = cache.get('all_tasks');
    if (cachedTasks) {
      cacheStats.hits++;
      return res.status(200).json(cachedTasks);
    }
    
    cacheStats.misses++;
    // Query MongoDB for all tasks
    // await = wait for database to respond before continuing
    const tasks = await Task.find();
    
    cache.set('all_tasks', tasks);
    res.status(200).json(tasks);
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
});

// ========================================
// GET /tasks/:id - Retrieve a SINGLE task (Supplementary)
// ========================================
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `task_${id}`;
    
    const cachedTask = cache.get(cacheKey);
    if (cachedTask) {
      cacheStats.hits++;
      return res.status(200).json(cachedTask);
    }
    
    cacheStats.misses++;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    cache.set(cacheKey, task);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

// ========================================
// GET /cache-stats - Debug endpoint (Supplementary)
// ========================================
app.get('/cache-stats', (req, res) => {
  res.status(200).json({
    ...cacheStats,
    keys: cache.keys()
  });
});

// ========================================
// POST /tasks - CREATE a new task in MongoDB
// ========================================
// What's happening:
// 1. req.body contains the task data from client
// 2. Task.create() = Mongoose method that:
//    a. Validates against schema (title required, etc.)
//    b. Creates new document in MongoDB
//    c. Returns the created document with auto-generated _id
// 3. Status 201 = Created (not 200)
// 4. If validation fails, Mongoose throws error caught by catch
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, description } = req.body;

    // Create new task in MongoDB
    // Mongoose will validate: title is required
    // If validation fails, it throws error -> catch block
    const newTask = await Task.create({
      title,
      description: description || '',
      completed: false
    });

    // Invalidate cache on write
    cache.del('all_tasks');

    // ====== PRACTICAL 10: Asynchronous Event Emission ======
    // STEP 1: Log the API response timestamp FIRST
    const responseTime = new Date().toISOString();
    console.log(`[API] Response sent at ${responseTime}`);

    // STEP 2: Send the response to client IMMEDIATELY
    res.status(201).json(newTask);

    // STEP 3: Emit 'task-created' event AFTER response is sent
    // The listener in listeners.js will handle this asynchronously
    // KEY PROOF: The listener's console.log (with 2s delay) will appear
    //            AFTER this response timestamp in the console output
    taskEvents.emit('task-created', newTask);

  } catch (error) {
    // If it's validation error, catch will handle it
    next(error);
  }
});

// ========================================
// PUT /tasks/:id - UPDATE a task in MongoDB
// ========================================
// What's happening:
// 1. req.params.id = the ID from URL (e.g., /tasks/123)
// 2. Task.findByIdAndUpdate() = Mongoose method that:
//    a. Finds document by MongoDB _id
//    b. Updates only the fields provided
//    c. Validates the updated fields (runValidators: true)
//    d. Returns the updated document (new: true)
// 3. If document not found, returns null -> we return 404
// 4. Options:
//    - new: true = return updated document (not old one)
//    - runValidators: true = validate after update
app.put('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (completed !== undefined) updateData.completed = completed;

    // Update task in MongoDB
    // new: true = return updated document
    // runValidators: true = validate changes
    const task = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // If task not found (ID doesn't exist)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    cache.del('all_tasks'); // Invalidate cache on write
    cache.del(`task_${id}`); // Invalidate specific task cache
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

// ========================================
// DELETE /tasks/:id - DELETE a task from MongoDB
// ========================================
// What's happening:
// 1. Task.findByIdAndDelete() = Mongoose method that:
//    a. Finds document by _id
//    b. Deletes it from MongoDB
//    c. Returns the deleted document (or null if not found)
// 2. If returns null, ID doesn't exist -> 404
// 3. If successful, return the deleted document
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete task from MongoDB
    const deletedTask = await Task.findByIdAndDelete(id);

    // If task not found (ID doesn't exist)
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    cache.del('all_tasks'); // Invalidate cache on write
    cache.del(`task_${id}`); // Invalidate specific task cache

    // ====== PRACTICAL 10: Asynchronous Event Emission ======
    // Log API response timestamp, send response, THEN emit event
    const responseTime = new Date().toISOString();
    console.log(`[API] Response sent at ${responseTime}`);

    res.status(200).json({ 
      message: 'Task deleted successfully', 
      task: deletedTask 
    });

    // Emit 'task-deleted' event AFTER response is sent (non-blocking)
    taskEvents.emit('task-deleted', deletedTask);

  } catch (error) {
    next(error);
  }
});

// ====== STEP 7: GLOBAL ERROR HANDLING MIDDLEWARE ======
// This MUST be the LAST middleware in the pipeline
// Catches all errors from routes and formats them as clean JSON
// 
// What's happening:
// 1. Catches errors thrown by routes or passed via next(err)
// 2. Logs error stack to server console (for debugging)
// 3. Returns clean JSON to client (NO stack trace exposed)
// 4. Handles different error types:
//    - Validation errors (missing required fields)
//    - Cast errors (invalid MongoDB ID format)
//    - Generic errors
app.use((err, req, res, next) => {
  // Log error details to server console (for debugging)
  console.error('❌ Error occurred:');
  console.error(err.stack);

  // Default error response
  let statusCode = 500;
  let errorMessage = 'Internal Server Error';
  let details = 'An unexpected error occurred. Please try again later.';

  // Handle Mongoose validation errors
  // ValidationError has "errors" property with field-specific errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'Validation Error';
    // Extract field names that failed validation
    const fields = Object.keys(err.errors).join(', ');
    details = `Invalid fields: ${fields}`;
  }

  // Handle Mongoose cast errors (invalid ID format)
  // CastError occurs when ID is not a valid MongoDB ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    errorMessage = 'Invalid ID Format';
    details = 'The provided ID is not a valid MongoDB ID';
  }

  // Send clean error response (never expose stack trace to client)
  res.status(statusCode).json({
    error: errorMessage,
    message: details,
    status: statusCode
  });
});

// ====== EXPORT APP FOR TESTING & CI PIPELINE ======
module.exports = app;

// ====== START SERVER ======
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log('📝 API is ready to receive requests\n');
  });
}
