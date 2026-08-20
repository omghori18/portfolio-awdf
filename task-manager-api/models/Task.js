const mongoose = require('mongoose');

// Define the Task Schema
// This is the blueprint for how tasks will look in MongoDB
const taskSchema = new mongoose.Schema({
  // title: Required string field
  // If someone tries to create a task without title, Mongoose will throw validation error
  title: {
    type: String,
    required: true
  },

  // description: Optional string field
  // It's okay if this is missing or undefined
  description: {
    type: String
  },

  // completed: Boolean field with default false
  // New tasks will automatically have completed: false unless specified otherwise
  completed: {
    type: Boolean,
    default: false
  },

  // createdAt: Date field that auto-timestamps
  // Automatically set to current time when document is created
  // Default: Date.now (the current time)
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Task Model
// Model is the actual interface we use to interact with MongoDB
// It has methods like .find(), .create(), .findByIdAndUpdate(), .findByIdAndDelete()
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
