# Practical 10: Asynchronous Processing with Event-Driven Architecture

## ✅ Status: COMPLETED

**CO/PO:** CO4 / PO3, PO5  
**Date Completed:** 2026-10-19

---

## 🎯 Objective

Implemented asynchronous background processing using Node.js native **EventEmitter** without external dependencies. The Task Management API now emits events after creating/deleting tasks, with notification handlers running *after* the HTTP response — proving non-blocking, event-driven execution.

---

## 📁 Files Created / Modified

| File | Action | Purpose |
|------|--------|---------|
| `events.js` | **Created** | Dedicated EventEmitter module — `TaskEvents` class extending Node's built-in EventEmitter; exports singleton |
| `listeners.js` | **Created** | Registers all event listeners: `task-created`, `task-deleted`, and `error` |
| `server.js` | **Modified** | Requires `events.js` + `listeners.js` at startup; emits events in POST/DELETE routes after response |

---

## 🏗️ Architecture

```
POST /tasks request
       │
       ▼
 Save task to MongoDB
       │
       ▼
[API] Response sent at T+0ms  ──► Client receives 201 immediately
       │
       ▼
taskEvents.emit('task-created', taskData)
       │
       ▼
 (Handled asynchronously, ~2000ms after response)
 Notification Listener
    └─ logs: Task title, timestamp, assigned user
```

---

## 🔑 Key Code

### events.js — EventEmitter Module
```js
const EventEmitter = require('events');

class TaskEvents extends EventEmitter {}

// Singleton export — same instance shared by emitters and listeners
module.exports = new TaskEvents();
```

### listeners.js — Event Listener Registration
```js
const taskEvents = require('./events');

taskEvents.on('task-created', (task) => {
  setTimeout(() => {
    console.log(`[Notification] Task "${task.title}" created at ${new Date().toISOString()}`);
  }, 2000); // Artificial delay to prove async execution
});

taskEvents.on('task-deleted', (task) => {
  setTimeout(() => {
    console.log(`[Notification] Task "${task.title}" deleted at ${new Date().toISOString()}`);
  }, 1500);
});

taskEvents.on('error', (err) => {
  console.error(`[EventEmitter Error] ${err.message}`);
});
```

### server.js — Emit After Response (POST /tasks)
```js
const responseTime = new Date().toISOString();
console.log(`[API] Response sent at ${responseTime}`);

res.status(201).json(newTask);              // ← Response sent FIRST

taskEvents.emit('task-created', newTask);   // ← Event emitted AFTER
```

---

## ✅ Console Output Proof — Timestamp Ordering

### Task Created (POST /tasks):
```
[2026-10-19T05:43:43.727Z] POST /tasks
[API] Response sent at 2026-10-19T05:43:43.734Z          ← T+0ms (response)
----------------------------------------------
[Notification] 🔔 Task Created Event Handled!
  Task Title    : "Practical 10 EventEmitter Task"
  Task ID       : 6ad5ae0faf9eee670fe17878
  Handler Time  : 2026-10-19T05:43:45.738Z              ← T+2004ms (async handler)
  ✅ Notification sent asynchronously (2s after response)
----------------------------------------------
```

> **Key Evidence:** API response at `:43.734Z`, handler fires at `:45.738Z` — **exactly 2 seconds later**, proving non-blocking async behavior.

### Task Deleted (DELETE /tasks/:id):
```
[API] Response sent at 2026-10-19T05:44:13.698Z          ← T+0ms
----------------------------------------------
[Notification] 🗑️  Task Deleted Event Handled!
  Task ID      : 6ad5ae2b9700c69b6e1a2019
  Deleted At   : 2026-10-19T05:44:15.200Z               ← T+1502ms (async handler)
  ✅ Cleanup/archival notification sent asynchronously
----------------------------------------------
```

---

## 📝 Supplementary Tasks Completed

| Task | Status |
|------|--------|
| `task-created` event with listener | ✅ Done |
| `task-deleted` event with distinct log | ✅ Done (Supplementary) |
| `error` event listener registered | ✅ Done (Supplementary) |
| Artificial delay to make async timing visible | ✅ Done (2s for created, 1.5s for deleted) |
| Listeners registered at startup via `require('./listeners')` in `server.js` | ✅ Done |

---

## 🔑 Key Learning Outcomes

1. **EventEmitter is synchronous by default** — `emit()` calls handlers synchronously, but handlers can schedule async work via `setTimeout`, I/O callbacks, etc.
2. **Response-before-handler ordering** — emitting events *after* `res.json()` guarantees the client always gets a fast response while side effects happen in the background.
3. **Singleton pattern** — exporting `new TaskEvents()` ensures all modules share the same event bus.
4. **Listeners must be registered before events fire** — `require('./listeners')` in `server.js` at startup ensures this.
5. **EventEmitter replaces message queues** for lightweight in-process async work (not production-scale messaging, but solid for course scope).

---

## ❓ Key Questions Answered

**Q: Why does emitting an event not delay the API response?**  
A: `taskEvents.emit()` is called *after* `res.json()`. By the time the emit line runs, the HTTP response is already dispatched. Even though `.emit()` itself is synchronous, the `setTimeout` inside the listener schedules work for *later* in the event loop.

**Q: What would happen to API response time if notification logic were inside the POST route?**  
A: The client would have to wait for all notification logic to complete before receiving the response — turning a fast API into a slow one. Event-driven decoupling solves this.

**Q: Why is EventEmitter reasonable for this scale, but not for millions of events/day?**  
A: EventEmitter is in-process only. If the server restarts, queued events are lost. Production systems use durable message brokers (RabbitMQ, Redis Pub/Sub) that persist events across restarts and scale across multiple processes.
