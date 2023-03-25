const { randomIntFromInterval } = require("..");

const generateGameSequence = (min = 1, max = 75) => {
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

const markNumberOnCard = (
  number = 1,
  card = [
    [1, 2, 3, 4, 5],
    [16, 17, 18, 19, 20],
    [31, 32, 33, 34, 35],
    [46, 47, 48, 49, 50],
    [61, 62, 63, 64, 65],
  ]
) => {
  let newCard = card;
  let found = false;

  for (let index = 0; index < newCard.length; index++) {
    let bingoColumn = newCard[index];
    let matchIndex = bingoColumn.findIndex(number);

    if (matchIndex !== -1) {
      bingoColumn[matchIndex] = -1;
      newCard[index] = bingoColumn;
      found = true;
      break;
    }
  }

  return { card: newCard, found };
};

const checkForWin = (
  card = [
    [1, 2, 3, 4, 5],
    [16, 17, 18, 19, 20],
    [31, 32, 33, 34, 35],
    [46, 47, 48, 49, 50],
    [61, 62, 63, 64, 65],
  ]
) => {
  let columnFull = false;
  let rowFull = false;
  let diagonalFull = false;
  let cardFull = true;

  for (let index = 0; index < card.length; index++) {
    const column = [
      card[0][index],
      card[1][index],
      card[2][index],
      card[3][index],
      card[4][index],
    ];

    if (column.every((item) => item === -1)) {
      columnFull = true;
      break;
    }
  }

  for (let index = 0; index < card.length; index++) {
    const row = card[index];

    if (row.every((item) => item === -1)) {
      rowFull = true;
      break;
    }
  }

  const firstDiagonal = [
    card[0][0],
    card[1][1],
    card[2][2],
    card[3][3],
    card[4][4],
  ];

  const secondDiagonal = [
    card[4][0],
    card[3][1],
    card[2][2],
    card[1][3],
    card[0][4],
  ];

  if (firstDiagonal.every((item) => item === -1)) {
    diagonalFull = true;
  }

  if (secondDiagonal.every((item) => item === -1)) {
    diagonalFull = true;
  }

  for (let index = 0; index < card.length; index++) {
    const row = card[index];

    if (!row.every((item) => item === -1)) {
      cardFull = false;
      break;
    }
  }

  return {
    columnFull,
    rowFull,
    diagonalFull,
    cardFull,
  };
};

module.exports = { generateGameSequence, markNumberOnCard, checkForWin };
