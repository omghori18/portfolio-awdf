// ====================================================
// PRACTICAL 10 - Event-Driven Architecture
// events.js - Dedicated EventEmitter Module
// ====================================================
//
// What's happening here:
// 1. Node.js has a built-in 'events' module that provides EventEmitter
// 2. We extend EventEmitter to create a custom TaskEvents class
// 3. We export a SINGLE shared instance (singleton pattern)
//    so both the routes (emitter) and listeners (subscriber) use the same object
//
// Why extend instead of using EventEmitter directly?
// - Gives us a named class for clarity (TaskEvents vs generic EventEmitter)
// - Easy to add task-specific helper methods later
// - Follows good OOP patterns

const EventEmitter = require('events');

// Create a custom class that extends EventEmitter
class TaskEvents extends EventEmitter {}

// Export a single shared instance (Singleton Pattern)
// Every file that requires('./events') gets the SAME object
// This is essential - emitter and listener MUST share the same instance
module.exports = new TaskEvents();
