// src/utils/pinGenerator.js

const generatePin = (length = 6) => {
  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += Math.floor(Math.random() * 10); // Gera um dígito de 0 a 9
  }
  return pin;
};

module.exports = { generatePin };