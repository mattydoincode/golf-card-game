class Player {
  /**
   * Note: cards[0] is the top of a face-down deck, cards[cards.length - 1] is the bottom of a face-down deck
   */
  constructor(algorithm) {
    this.hand = [];
    this.algorithm = algorithm;
    this.currentlyDrawnCard = null; // Store the card drawn during the first step of a turn
  }

  /**
   * First step of a turn: Draw a card from either the draw deck or discard pile
   * @param {Game} game - The current game state
   * @returns {Card} The card that was drawn
   */
  drawCard(game) {
    // Store the current discard deck count before drawing
    const discardCountBefore = game.discardDeck.cards.length;

    this.currentlyDrawnCard = this.algorithm.chooseCardToDraw(game, this);

    // Determine which deck the card was drawn from by comparing discard deck counts
    if (game.discardDeck.cards.length < discardCountBefore) {
      game.lastDrawSource = "discard";
    } else {
      game.lastDrawSource = "draw";
    }

    return this.currentlyDrawnCard;
  }

  /**
   * Second step of a turn: Decide what to do with the drawn card
   * @param {Game} game - The current game state
   * @returns {Card} The card to discard
   */
  playCard(game) {
    const discarded = this.algorithm.playCard(game, this);
    this.currentlyDrawnCard = null; // Reset after playing
    return discarded;
  }

  // Legacy method for backward compatibility
  playTurn(game) {
    return this.algorithm.playTurn(game, this);
  }

  flipStartingCards() {
    this.algorithm.flipStartingCards(this);
  }

  /**
   * Scores a golf hand according to standard rules:
   * - Pairs in same column score 0
   * - Otherwise:
   *   - Aces = 1 point
   *   - 2s = -2 points
   *   - 3-10 = face value
   *   - Jack/Queen = 10 points
   *   - King = 0 points
   * @returns {number} Total score for the hand
   */
  scoreHand() {
    // Golf hands are arranged in 2 rows of 3
    // So we need to check columns for pairs
    let score = 0;

    // Check each column (3 columns total)
    for (let col = 0; col < 3; col++) {
      const topCard = this.hand[col];
      const bottomCard = this.hand[col + 3];

      // If we have a pair in this column, score is 0
      if (topCard.value === bottomCard.value) {
        continue; // Skip to next column since this one scores 0
      }

      // No pair, so add individual card scores
      score += topCard.golfScore();
      score += bottomCard.golfScore();
    }

    return score;
  }

  /**
   * Scores only the face-up cards in a golf hand
   * - Pairs in same column score 0 (only if both cards are face-up)
   * - Face-down cards are not counted in the score
   * @returns {Object} Object containing the visible score and count of face-down cards
   */
  scoreVisibleHand() {
    let visibleScore = 0;
    let faceDownCount = 0;

    // Check each column (3 columns total)
    for (let col = 0; col < 3; col++) {
      const topCard = this.hand[col];
      const bottomCard = this.hand[col + 3];

      // Count face-down cards
      if (!topCard.isFaceUp) faceDownCount++;
      if (!bottomCard.isFaceUp) faceDownCount++;

      // Skip entirely face-down columns
      if (!topCard.isFaceUp && !bottomCard.isFaceUp) {
        continue;
      }

      // If both cards are face-up and form a pair, score is 0
      if (
        topCard.isFaceUp &&
        bottomCard.isFaceUp &&
        topCard.value === bottomCard.value
      ) {
        continue; // Skip to next column since this one scores 0
      }

      // Add scores for face-up cards only
      if (topCard.isFaceUp) {
        visibleScore += topCard.golfScore();
      }

      if (bottomCard.isFaceUp) {
        visibleScore += bottomCard.golfScore();
      }
    }

    return {
      visibleScore,
      faceDownCount,
    };
  }
}

// Change from CommonJS to ES Module export
export default Player;
