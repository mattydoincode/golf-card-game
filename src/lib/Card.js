/**
 * Card class representing a playing card
 */
class Card {
  /**
   * Create a new card
   * @param {string} cardString - The value of the card (e.g., 'A', 2, 'K')
   * @param {boolean} isFaceUp - Whether the card is face up (visible) or face down
   */
  constructor(cardString, isFaceUp = false) {
    if (cardString.length != 2) {
      throw new Error("Card string must be 2 characters long");
    }
    this.suit = cardString[1];
    this.value = cardString[0];
    this.isFaceUp = isFaceUp;
  }
  /**
   * Get string representation of the card
   * @returns {string} - String representation (e.g., "Ace of Spades")
   */
  toString() {
    return this.isFaceUp ? `${this.value}${this.suit}` : "??";
  }

  imgVal() {
    return this.isFaceUp ? `${this.value}${this.suit}` : "RED_BACK";
  }

  /**
   * Flip the card over
   * @returns {Card} - Returns this card for chaining
   */
  flip() {
    this.isFaceUp = !this.isFaceUp;
    return this;
  }

  /**
   * Turn the card face up if it isn't already
   * @returns {Card} - Returns this card for chaining
   */
  turnFaceUp() {
    this.isFaceUp = true;
    return this;
  }

  /**
   * Turn the card face down if it isn't already
   * @returns {Card} - Returns this card for chaining
   */
  turnFaceDown() {
    this.isFaceUp = false;
    return this;
  }

  golfScore() {
    const valueDict = {
      2: -2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      T: 10,
      J: 10,
      Q: 10,
      K: 0,
      A: 1,
    };
    return valueDict[this.value];
  }

  /**
   * Check if this card equals another card
   * @param {Card} otherCard - The card to compare with
   * @returns {boolean} - True if cards have same suit and value
   */
  equals(otherCard) {
    return this.suit === otherCard.suit && this.value === otherCard.value;
  }
}

// Change from CommonJS to ES Module export
export default Card;
