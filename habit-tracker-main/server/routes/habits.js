const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all habits
// @route   GET /api/habits
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.user.id });
        res.status(200).json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a habit
// @route   POST /api/habits
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const habit = await Habit.create({
            ...req.body,
            user: req.user.id
        });
        res.status(200).json(habit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update a habit
// @route   PUT /api/habits/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        // Check for user
        if (habit.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedHabit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json(updatedHabit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        // Check for user
        if (habit.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await habit.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
