const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// @desc    Get all habits
// @route   GET /api/habits
// @access  Public
router.get('/', async (req, res) => {
    try {
        const habits = await Habit.find();
        res.status(200).json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a habit
// @route   POST /api/habits
// @access  Public
router.post('/', async (req, res) => {
    try {
        const habit = await Habit.create(req.body);
        res.status(200).json(habit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update a habit
// @route   PUT /api/habits/:id
// @access  Public
router.put('/:id', async (req, res) => {
    try {
        const habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true, // Validate data against schema
        });

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        res.status(200).json(habit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        await habit.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
