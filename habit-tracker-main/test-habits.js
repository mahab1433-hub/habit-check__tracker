// Test script to verify habits are working
console.log('Testing habit functionality...');

// Check if habits are in localStorage
const data = localStorage.getItem('habit-tracker-data');
if (data) {
  const habits = JSON.parse(data).habits;
  console.log('Found habits in localStorage:', habits);
  console.log('Number of habits:', habits.length);
} else {
  console.log('No habits found in localStorage');
}

// Check if the habit page elements exist
setTimeout(() => {
  const habitList = document.querySelector('.habit-list');
  const habitItems = document.querySelectorAll('.habit-item');
  const emptyState = document.querySelector('.empty-state');
  
  console.log('Habit list element:', habitList);
  console.log('Habit items found:', habitItems.length);
  console.log('Empty state element:', emptyState);
  
  if (habitItems.length > 0) {
    console.log('SUCCESS: Habits are being displayed!');
    habitItems.forEach((item, index) => {
      console.log(`Habit ${index + 1}:`, item.textContent);
    });
  } else if (emptyState) {
    console.log('INFO: Showing empty state - no habits to display');
  } else {
    console.log('ERROR: Neither habits nor empty state found');
  }
}, 2000);
