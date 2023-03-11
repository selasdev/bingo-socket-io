//Generates a random number between two values
const randomIntFromInterval = (min, max) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

module.exports = { randomIntFromInterval };
