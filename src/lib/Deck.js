import Card from "./Card";

/**
 * Deck class representing a deck of cards. Could be full, could be empty!
 */

const suits = ["H", "D", "S", "C"];
const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
];

const numShuffles = 10;

class Deck {
  /**
   * Note: cards[0] is the top of a face-down deck, cards[cards.length - 1] is the bottom of a face-down deck
   */
  constructor() {
    this.cards = [];
  }

  setupStandardDeck() {
    for (let suit of suits) {
      for (let value of values) {
        this.cards.push(new Card(`${value}${suit}`));
      }
    }
    this.shuffle();
  }

  shuffle() {
    for (let i = 0; i < numShuffles; i++) {
      for (let j = this.cards.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [this.cards[j], this.cards[k]] = [this.cards[k], this.cards[j]];
      }
    }
  }

  drawGolfHand() {
    return this.cards.splice(0, 6);
  }

  add(card) {
    this.cards.push(card);
  }

  drawFromTopOfFaceDownDeck() {
    if (this.cards.length === 0) return null;
    return this.cards.shift();
  }

  drawFromTopOfFaceUpDeck() {
    if (this.cards.length === 0) return null;
    const card = this.cards.pop();
    // Ensure the card is face-up when drawn from the discard pile
    if (card) card.turnFaceUp();
    return card;
  }
}

// Export the Card class
export default Deck;
