const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a task title']
    },
    description: {
        type: String,
        default: ''
    },
    dueDate: {
        type: String, // Storing as YYYY-MM-DD
        required: [true, 'Please add a due date']
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
