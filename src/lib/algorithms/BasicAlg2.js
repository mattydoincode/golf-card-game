/**
 * ImprovedAlg - A smarter algorithm for playing Golf
 * Improvements over BasicAlg:
 * 1. Better card evaluation based on actual Golf scoring
 * 2. Smarter discard pile evaluation
 * 3. Strategic face-down card selection
 * 4. Column-based pair strategy
 * 5. Endgame optimization
 */
class ImprovedAlg {
  constructor() {
    // Use this as estimated score for face-down cards (roughly middle value)
    this.UNKNOWN_CARD_ESTIMATE = 6;

    // Card value weights - how much we prefer certain cards
    // Higher is better (more likely to keep/draw)
    this.valueWeights = {
      K: 10, // Kings are great (0 points)
      2: 9, // 2s are great (-2 points)
      A: 8, // Aces are good (1 point)
      3: 5, // Low cards are decent
      4: 4,
      5: 3,
      6: 2,
      7: 1,
      8: 0,
      9: -1,
      T: -2, // 10s, Jacks, Queens are bad (10 points each)
      J: -2,
      Q: -2,
    };
  }

  /**
   * First step of a turn: Choose which card to draw
   * Smarter evaluation of the discard pile
   */
  chooseCardToDraw(game, player) {
    // Check if there's a card in the discard pile
    if (game.discardDeck.cards.length > 0) {
      const topDiscard =
        game.discardDeck.cards[game.discardDeck.cards.length - 1];

      // 1. Check if the discard can make a pair in any column
      for (let col = 0; col < 3; col++) {
        const topCard = player.hand[col];
        const bottomCard = player.hand[col + 3];

        // If we can make a pair with a visible card in this column
        if (
          (topCard.isFaceUp && topDiscard.value === topCard.value) ||
          (bottomCard.isFaceUp && topDiscard.value === bottomCard.value)
        ) {
          return game.discardDeck.drawFromTopOfFaceUpDeck();
        }
      }

      // 2. Take the discard if it's a high-value card (Kings, 2s, Aces)
      if (
        topDiscard.value === "K" ||
        topDiscard.value === "2" ||
        topDiscard.value === "A"
      ) {
        return game.discardDeck.drawFromTopOfFaceUpDeck();
      }

      // 3. Take the discard if it's better than our worst visible card
      const worstVisibleCardIndex = this.findWorstVisibleCardIndex(player.hand);
      if (worstVisibleCardIndex !== -1) {
        const worstCard = player.hand[worstVisibleCardIndex];
        if (topDiscard.golfScore() < worstCard.golfScore()) {
          return game.discardDeck.drawFromTopOfFaceUpDeck();
        }
      }

      // 4. Take the discard if it's a low-value card and we have face-down cards
      // and we don't have too many face-down cards (strategic risk assessment)
      const faceDownCount = player.hand.filter((card) => !card.isFaceUp).length;
      if (
        topDiscard.golfScore() <= 4 &&
        faceDownCount > 0 &&
        faceDownCount <= 3
      ) {
        return game.discardDeck.drawFromTopOfFaceUpDeck();
      }
    }

    // Otherwise draw from the face-down deck
    const drawnCard = game.drawDeck.drawFromTopOfFaceDownDeck();
    drawnCard.turnFaceUp(); // Make sure drawn card is visible
    return drawnCard;
  }

  /**
   * Second step of a turn: Decide what to do with the drawn card
   * Smarter card placement and replacement strategy
   */
  playCard(game, player) {
    const drawnCard = player.currentlyDrawnCard;

    // 1. Check if we can make a pair in any column
    for (let col = 0; col < 3; col++) {
      const topCard = player.hand[col];
      const bottomCard = player.hand[col + 3];

      // If we can make a pair with a visible card in this column
      if (topCard.isFaceUp && drawnCard.value === topCard.value) {
        // Replace the bottom card (if it's not already part of a pair)
        if (!(bottomCard.isFaceUp && bottomCard.value === topCard.value)) {
          const discarded = bottomCard;
          player.hand[col + 3] = drawnCard;
          return discarded;
        }
      }

      if (bottomCard.isFaceUp && drawnCard.value === bottomCard.value) {
        // Replace the top card (if it's not already part of a pair)
        if (!(topCard.isFaceUp && topCard.value === bottomCard.value)) {
          const discarded = topCard;
          player.hand[col] = drawnCard;
          return discarded;
        }
      }
    }

    // 2. Check if we can improve an existing column by replacing a high-value card
    const replacementInfo = this.findBestCardToReplace(drawnCard, player.hand);
    if (replacementInfo.index !== -1 && replacementInfo.improvement > 0) {
      const discarded = player.hand[replacementInfo.index];
      player.hand[replacementInfo.index] = drawnCard;
      return discarded;
    }

    // 3. If we have face-down cards, strategically replace one
    if (player.hand.some((card) => !card.isFaceUp)) {
      // If drawn card is good (low score), replace a face-down card
      if (this.isGoodCard(drawnCard)) {
        // Choose the best position to place this card
        const bestPosition = this.findBestPositionForFaceDown(
          drawnCard,
          player.hand
        );
        if (bestPosition !== -1) {
          const discarded = player.hand[bestPosition];
          player.hand[bestPosition] = drawnCard;
          return discarded;
        }
      }

      // If we're in the endgame or the card is decent, replace any face-down card
      const isEndgame =
        game.drawDeck.cards.length < 10 ||
        player.hand.filter((card) => !card.isFaceUp).length <= 2;

      if (isEndgame || drawnCard.golfScore() <= this.UNKNOWN_CARD_ESTIMATE) {
        // In endgame, prioritize replacing face-down cards
        for (let i = 0; i < 6; i++) {
          if (!player.hand[i].isFaceUp) {
            const discarded = player.hand[i];
            player.hand[i] = drawnCard;
            return discarded;
          }
        }
      }
    }

    // 4. Otherwise, discard the drawn card
    return drawnCard;
  }

  /**
   * Find the worst visible card in the hand (highest golf score)
   * @returns {number} Index of the worst card, or -1 if no visible cards
   */
  findWorstVisibleCardIndex(hand) {
    let worstScore = -Infinity;
    let worstIndex = -1;

    // Check each card
    for (let i = 0; i < 6; i++) {
      const card = hand[i];
      if (!card.isFaceUp) continue;

      // Skip cards that are part of a pair
      const isInPair = this.isCardInPair(card, i, hand);
      if (isInPair) continue;

      const score = card.golfScore();
      if (score > worstScore) {
        worstScore = score;
        worstIndex = i;
      }
    }

    return worstIndex;
  }

  /**
   * Check if a card is part of a pair in its column
   */
  isCardInPair(card, index, hand) {
    // Determine if this is a top or bottom card
    const isTopCard = index < 3;
    const colIndex = isTopCard ? index : index - 3;

    // Get the other card in the same column
    const otherCardIndex = isTopCard ? index + 3 : index - 3;
    const otherCard = hand[otherCardIndex];

    // Check if they form a pair
    return otherCard.isFaceUp && card.value === otherCard.value;
  }

  /**
   * Find the best card to replace with the drawn card
   * @returns {Object} {index, improvement} or {index: -1} if no good replacement
   */
  findBestCardToReplace(drawnCard, hand) {
    let bestImprovement = 0;
    let bestIndex = -1;

    // Check each visible card
    for (let i = 0; i < 6; i++) {
      const card = hand[i];
      if (!card.isFaceUp) continue;

      // Skip cards that are part of a pair
      if (this.isCardInPair(card, i, hand)) continue;

      // Calculate improvement in score
      const improvement = card.golfScore() - drawnCard.golfScore();

      // Check if this would create a new pair
      const wouldCreatePair = this.wouldCreatePair(drawnCard, i, hand);
      if (wouldCreatePair) {
        // Huge improvement for creating a pair
        if (improvement + 15 > bestImprovement) {
          bestImprovement = improvement + 15;
          bestIndex = i;
        }
      } else if (improvement > 0 && improvement > bestImprovement) {
        bestImprovement = improvement;
        bestIndex = i;
      }
    }

    return { index: bestIndex, improvement: bestImprovement };
  }

  /**
   * Check if replacing a card would create a new pair
   */
  wouldCreatePair(newCard, index, hand) {
    // Determine if this is a top or bottom card
    const isTopCard = index < 3;
    const colIndex = isTopCard ? index : index - 3;

    // Get the other card in the same column
    const otherCardIndex = isTopCard ? index + 3 : index - 3;
    const otherCard = hand[otherCardIndex];

    // Check if they would form a pair
    return otherCard.isFaceUp && newCard.value === otherCard.value;
  }

  /**
   * Determine if a card is "good" (worth keeping)
   */
  isGoodCard(card) {
    // Kings (0 pts), 2s (-2 pts), and Aces (1 pt) are always good
    if (card.value === "K" || card.value === "2" || card.value === "A") {
      return true;
    }

    // Cards with 4 or fewer points are decent
    return card.golfScore() <= 4;
  }

  /**
   * Find the best position to place a card among face-down cards
   * Returns the index of the best position, or -1 if no face-down cards
   */
  findBestPositionForFaceDown(card, hand) {
    // First, check if we can create a pair with any visible card
    for (let col = 0; col < 3; col++) {
      const topCard = hand[col];
      const bottomCard = hand[col + 3];

      // If top card is visible and matches our card, and bottom card is face-down
      if (
        topCard.isFaceUp &&
        card.value === topCard.value &&
        !bottomCard.isFaceUp
      ) {
        return col + 3; // Replace the bottom card to create a pair
      }

      // If bottom card is visible and matches our card, and top card is face-down
      if (
        bottomCard.isFaceUp &&
        card.value === bottomCard.value &&
        !topCard.isFaceUp
      ) {
        return col; // Replace the top card to create a pair
      }
    }

    // If we can't create a pair, just find any face-down card
    for (let i = 0; i < 6; i++) {
      if (!hand[i].isFaceUp) {
        return i;
      }
    }

    return -1; // No face-down cards
  }

  /**
   * Legacy method for backward compatibility
   */
  playTurn(game, player) {
    // Draw a card from either deck
    const drawnCard = this.chooseCardToDraw(game, player);
    player.currentlyDrawnCard = drawnCard;

    return this.playCard(game, player);
  }

  /**
   * Strategic selection of starting cards to flip
   * Flip cards in different columns to get more information
   */
  flipStartingCards(player) {
    // Flip cards in different columns to get more information
    player.hand[0].turnFaceUp(); // Top-left
    player.hand[5].turnFaceUp(); // Bottom-right
  }

  /**
   * Called on the final turn to turn any remaining cards face up
   */
  finalTurn(player) {
    for (let i = 0; i < 6; i++) {
      if (!player.hand[i].isFaceUp) {
        player.hand[i].turnFaceUp();
      }
    }
  }
}

export default ImprovedAlg;
