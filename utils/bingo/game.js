const { randomIntFromInterval } = require("..");

const generateGameSequence = (min = 1, max = 75) => {
  console.log(1 + (max - min));
  const sequence = new Array(1 + (max - min));

  for (let index = 0; index < sequence.length; index++) {
    let generatedNumber = randomIntFromInterval(min, max);

    while (sequence.includes(generatedNumber)) {
      generatedNumber = randomIntFromInterval(min, max);
    }

    sequence[index] = generatedNumber;
  }

  return sequence;
};

module.exports = { generateGameSequence };
