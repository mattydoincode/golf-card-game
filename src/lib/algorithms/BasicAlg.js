class BasicAlg {
  /**
   * Note: cards[0] is the top of a face-down deck, cards[cards.length - 1] is the bottom of a face-down deck
   */

  constructor() {
    // Use this as estimated score for face-down cards (roughly middle value)
    this.UNKNOWN_CARD_ESTIMATE = 7;
  }

  /**
   * First step of a turn: Choose which card to draw
   * @param {Game} game - The current game state
   * @param {Player} player - The player whose turn it is
   * @returns {Card} The card that was drawn
   */
  chooseCardToDraw(game, player) {
    // Check if there's a card in the discard pile
    if (game.discardDeck.cards.length > 0) {
      const topDiscard =
        game.discardDeck.cards[game.discardDeck.cards.length - 1];

      // Take the discard if it's a low-value card (0-4 points)
      if (topDiscard.golfScore() <= 4) {
        return game.discardDeck.drawFromTopOfFaceUpDeck();
      }

      // Take the discard if it can make a pair with a visible card
      for (let col = 0; col < 3; col++) {
        const topCard = player.hand[col];
        const bottomCard = player.hand[col + 3];

        if (
          (topCard.isFaceUp && topDiscard.value === topCard.value) ||
          (bottomCard.isFaceUp && topDiscard.value === bottomCard.value)
        ) {
          return game.discardDeck.drawFromTopOfFaceUpDeck();
        }
      }
    }

    // Otherwise draw from the face-down deck
    const drawnCard = game.drawDeck.drawFromTopOfFaceDownDeck();
    drawnCard.turnFaceUp(); // Make sure drawn card is visible
    return drawnCard;
  }

  /**
   * Second step of a turn: Decide what to do with the drawn card
   * @param {Game} game - The current game state
   * @param {Player} player - The player whose turn it is
   * @returns {Card} The card to discard
   */
  playCard(game, player) {
    const drawnCard = player.currentlyDrawnCard;

    // Find the best move:
    // 1. Check if we can make a pair with visible cards
    for (let col = 0; col < 3; col++) {
      const topCard = player.hand[col];
      const bottomCard = player.hand[col + 3];

      // Skip if both cards are face down
      if (!topCard.isFaceUp && !bottomCard.isFaceUp) continue;

      // If we can make a pair with either visible card in this column
      if (topCard.isFaceUp && drawnCard.value === topCard.value) {
        const discarded = bottomCard;
        player.hand[col + 3] = drawnCard;
        return discarded;
      }
      if (bottomCard.isFaceUp && drawnCard.value === bottomCard.value) {
        const discarded = topCard;
        player.hand[col] = drawnCard;
        return discarded;
      }
    }

    // 2. If we can't make a pair, try to replace highest value visible card
    let highestScore = -Infinity;
    let highestScoreIndex = -1;

    // Find the highest scoring visible card in hand
    for (let i = 0; i < 6; i++) {
      if (!player.hand[i].isFaceUp) continue; // Skip face-down cards
      const cardScore = player.hand[i].golfScore();
      if (cardScore > highestScore) {
        highestScore = cardScore;
        highestScoreIndex = i;
      }
    }

    // If drawn card has lower score than our highest visible card, replace it
    if (highestScoreIndex !== -1 && drawnCard.golfScore() < highestScore) {
      const discarded = player.hand[highestScoreIndex];
      player.hand[highestScoreIndex] = drawnCard;
      return discarded;
    }

    // 3. If we have any face-down cards, replace the first one we find
    // (unless drawn card is really bad)
    if (drawnCard.golfScore() <= this.UNKNOWN_CARD_ESTIMATE) {
      for (let i = 0; i < 6; i++) {
        if (!player.hand[i].isFaceUp) {
          const discarded = player.hand[i];
          player.hand[i] = drawnCard;
          return discarded;
        }
      }
    }

    // 4. Otherwise, discard the drawn card
    return drawnCard;
  }

  /**
   * Legacy method for backward compatibility
   * @param {Game} game - The current game state
   * @param {Player} player - The player whose turn it is
   * @returns {Card} The card to discard
   */
  playTurn(game, player) {
    // Draw a card from either deck (for now, always draw from face-down)
    const drawnCard = game.drawDeck.drawFromTopOfFaceDownDeck();
    drawnCard.turnFaceUp(); // Make sure drawn card is visible
    player.currentlyDrawnCard = drawnCard;

    return this.playCard(game, player);
  }

  // you get to flip two cards at the beginning
  flipStartingCards(player) {
    player.hand[0].turnFaceUp();
    player.hand[1].turnFaceUp();
  }

  /**
   * Called on the final turn to turn any remaining cards face up
   * @param {Player} player - The player whose cards need to be revealed
   */
  finalTurn(player) {
    for (let i = 0; i < 6; i++) {
      if (!player.hand[i].isFaceUp) {
        player.hand[i].turnFaceUp();
      }
    }
  }
}

// Change from CommonJS to ES Module export
export default BasicAlg;
