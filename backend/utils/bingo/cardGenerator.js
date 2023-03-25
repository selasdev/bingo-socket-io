const { randomIntFromInterval } = require("..");

/*
 * Generates an array that represent a column from a bingo board
 * The range of numbers on the board must be given
 * default is 1-15
 */
const generateColumn = (range = [1, 15]) => {
  const newColumn = new Array(5);

  for (let index = 0; index < newColumn.length; index++) {
    let generatedNumber = randomIntFromInterval(range[0], range[1]);

    while (newColumn.includes(generatedNumber)) {
      generatedNumber = randomIntFromInterval(range[0], range[1]);
    }

    newColumn[index] = generatedNumber;
  }

  return newColumn;
};

/*
 * Generates a matrix that represents  new Bingo card
 * It receives the number range of each column
 * This are the following default values for the number ranges
 * B 1-15
 * I 16-30
 * N 31-45
 * G 46-60
 * O 61-75
 */
const generateBingoCard = (
  bRange = [1, 15],
  iRange = [16, 30],
  nRange = [31, 45],
  gRange = [46, 60],
  oRange = [61, 75]
) => {
  const bColumn = generateColumn(bRange);
  const iColumn = generateColumn(iRange);
  const nColumn = generateColumn(nRange);
  const gColumn = generateColumn(gRange);
  const oColumn = generateColumn(oRange);

  return [bColumn, iColumn, nColumn, gColumn, oColumn];
};

module.exports = { generateBingoCard };
