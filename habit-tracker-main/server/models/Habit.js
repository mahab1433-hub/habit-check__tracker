const mongoose = require('mongoose');

const habitSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Please add a habit name']
    },
    type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily'
    },
    category: {
        type: String,
        enum: ['health', 'study', 'work', 'fitness', 'personal', 'other'],
        default: 'other'
    },
    color: {
        type: String,
        default: '#4F46E5'
    },
    icon: {
        type: String,
        default: '📝'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    archived: {
        type: Boolean,
        default: false
    },
    // We store completed dates as an array of date strings "YYYY-MM-DD"
    completedDates: {
        type: [String],
        default: []
    },
    frequency: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly'],
        default: 'Daily'
    },
    reminderTime: String,
    reminder: {
        enabled: Boolean,
        time: String,
        days: [Number]
    },
    goal: {
        target: Number,
        unit: String,
        frequency: {
            type: String,
            enum: ['day', 'week', 'month']
        }
    },
    streak: {
        type: Number,
        default: 0
    },
    bestStreak: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Habit', habitSchema);
