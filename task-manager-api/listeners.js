// ====================================================
// PRACTICAL 10 - Event-Driven Architecture
// listeners.js - Event Listeners Registration File
// ====================================================
//
// What's happening here:
// 1. We import the SAME taskEvents singleton from events.js
// 2. We register listeners using .on('eventName', handler)
// 3. This file MUST be required once in server.js at startup
//    so the listeners are registered before any events are emitted
//
// KEY CONCEPT:
// The listener runs AFTER the HTTP response has already been sent.
// This proves asynchronous, non-blocking event handling:
// - API response goes out FIRST (fast)
// - Notification/side-effects happen AFTER (background)

const taskEvents = require('./events');

// ====================================================
// LISTENER 1: task-created event
// ====================================================
// Triggered when: POST /tasks creates a new task
// Logs: Task title, timestamp, and assigned user
// Artificial delay: setTimeout(2000ms) to VISIBLY prove async behavior
//   - The API response timestamp will appear in console BEFORE this log
//   - This is the core learning objective of Practical 10

taskEvents.on('task-created', (task) => {
  // Simulate a slow notification handler (e.g., sending email, calling external API)
  // The 2000ms delay makes the async behavior CLEARLY visible in console output
  setTimeout(() => {
    const notificationTime = new Date().toISOString();
    console.log('----------------------------------------------');
    console.log('[Notification] 🔔 Task Created Event Handled!');
    console.log(`  Task Title    : "${task.title}"`);
    console.log(`  Task ID       : ${task._id}`);
    console.log(`  Assigned User : ${task.assignedUser || 'Unassigned'}`);
    console.log(`  Handler Time  : ${notificationTime}`);
    console.log('  ✅ Notification sent asynchronously (2s after response)');
    console.log('----------------------------------------------');
  }, 2000); // 2 second artificial delay - proves async execution
});

// ====================================================
// LISTENER 2: task-deleted event (Supplementary Task)
// ====================================================
// Triggered when: DELETE /tasks/:id deletes a task
// Logs: A distinct cleanup/archival notification message

taskEvents.on('task-deleted', (task) => {
  setTimeout(() => {
    const deletionTime = new Date().toISOString();
    console.log('----------------------------------------------');
    console.log('[Notification] 🗑️  Task Deleted Event Handled!');
    console.log(`  Task Title   : "${task.title}"`);
    console.log(`  Task ID      : ${task._id}`);
    console.log(`  Deleted At   : ${deletionTime}`);
    console.log('  ✅ Cleanup/archival notification sent asynchronously');
    console.log('----------------------------------------------');
  }, 1500); // 1.5 second delay
});

// ====================================================
// LISTENER 3: error event on task-created (Supplementary Task)
// ====================================================
// Catches and logs any error thrown inside the task-created handler
// NOTE: EventEmitter has a special rule - an 'error' event with no listener
//       will throw and crash the server! Always register an error listener.

taskEvents.on('error', (err) => {
  console.error('----------------------------------------------');
  console.error('[EventEmitter Error] ❌ An error occurred in an event handler!');
  console.error(`  Error Message: ${err.message}`);
  console.error('----------------------------------------------');
});

console.log('✅ [Practical 10] Event listeners registered successfully!');
console.log('   Listening for: task-created, task-deleted, error events');
