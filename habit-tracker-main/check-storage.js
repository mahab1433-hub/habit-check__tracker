// Check localStorage in browser context
console.log('Checking localStorage for habit-tracker-data...');
const data = localStorage.getItem('habit-tracker-data');
if (data) {
  console.log('Found data:', JSON.parse(data));
} else {
  console.log('No data found in localStorage');
}
