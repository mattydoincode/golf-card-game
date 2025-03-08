import BasicAlg from "./algorithms/BasicAlg";
import Deck from "./Deck";
import Player from "./Player";

class Game {
  /**
   * Note: cards[0] is the top of a face-down deck, cards[cards.length - 1] is the bottom of a face-down deck
   */
  constructor(numPlayers) {
    console.log("started here!");
    this.drawDeck = new Deck();
    this.discardDeck = new Deck();
    this.players = [];
    for (let i = 0; i < numPlayers; i++) {
      this.players.push(new Player(new BasicAlg()));
    }
    this.drawDeck.setupStandardDeck();
    this.gameEnding = false; // Set to true when someone has all cards face up
    this.finalTurnsTaken = new Set(); // Track which players have taken their final turn
    this.currentPlayerIndex = 0; // Track whose turn it is
    this.isGameOver = false; // Track if the game has ended
    this.turnPhase = "draw"; // Track which phase of the turn we're in: 'draw' or 'play'
    this.lastDrawSource = null; // Track where the last card was drawn from: 'draw' or 'discard'
    console.log("got here!");
  }

  /**
   * Initialize the game by dealing hands
   * @returns {Object} Initial game state
   */
  initialize() {
    this.dealHands();

    // Add an initial face-up card to the discard pile
    if (this.drawDeck.cards.length > 0) {
      const initialDiscard = this.drawDeck.drawFromTopOfFaceDownDeck();
      initialDiscard.turnFaceUp();
      this.discardDeck.add(initialDiscard);
    }

    // Reset turn phase and lastDrawSource
    this.turnPhase = "draw";
    this.lastDrawSource = null;

    return this.getGameState();
  }

  /**
   * Get the current state of the game
   * @returns {Object} Current game state
   */
  getGameState() {
    const currentPlayer = this.players[this.currentPlayerIndex];

    return {
      players: this.players.map((player, index) => {
        const visibleScoreInfo = player.scoreVisibleHand();
        return {
          hand: player.hand,
          playerNum: index + 1,
          isCurrentPlayer: index === this.currentPlayerIndex,
          score: player.scoreHand(), // Full score (for end game)
          visibleScore: visibleScoreInfo.visibleScore, // Only face-up cards
          faceDownCount: visibleScoreInfo.faceDownCount, // Number of face-down cards
          currentlyDrawnCard:
            index === this.currentPlayerIndex
              ? player.currentlyDrawnCard
              : null,
        };
      }),
      drawDeckCount: this.drawDeck.cards.length,
      discardDeckCount: this.discardDeck.cards.length,
      topDiscard:
        this.discardDeck.cards.length > 0
          ? this.discardDeck.cards[this.discardDeck.cards.length - 1]
          : null,
      gameEnding: this.gameEnding,
      isGameOver: this.isGameOver,
      currentPlayerIndex: this.currentPlayerIndex,
      turnPhase: this.turnPhase,
      lastDrawSource: this.lastDrawSource,
      currentlyDrawnCard: currentPlayer
        ? currentPlayer.currentlyDrawnCard
        : null,
    };
  }

  dealHands() {
    for (let player of this.players) {
      player.hand = this.drawDeck.drawGolfHand();
      // Let the algorithm decide which two cards to flip
      player.algorithm.flipStartingCards(player);
    }
  }

  /**
   * Check if we need to reshuffle the discard deck into the draw deck
   */
  checkAndReshuffle() {
    if (this.drawDeck.cards.length === 0 && this.discardDeck.cards.length > 0) {
      // Create a new array with the discard deck cards
      this.drawDeck.cards = [...this.discardDeck.cards];
      this.discardDeck.cards = [];
      this.drawDeck.shuffle();
    }
  }

  /**
   * Check if a player has all cards face up
   * @param {Player} player - The player to check
   * @returns {boolean} - True if all cards are face up
   */
  checkAllCardsUp(player) {
    return player.hand.every((card) => card.isFaceUp);
  }

  /**
   * Advance the game by one phase of a turn
   * @returns {Object} The updated game state
   */
  nextTurn() {
    if (this.isGameOver) {
      return this.getGameState();
    }

    const player = this.players[this.currentPlayerIndex];

    // If game is ending and player has taken final turn, skip to next player
    if (this.gameEnding && this.finalTurnsTaken.has(this.currentPlayerIndex)) {
      this.advanceToNextPlayer();
      this.turnPhase = "draw"; // Reset to draw phase for next player
      return this.getGameState();
    }

    // Check if we need to reshuffle before the turn
    this.checkAndReshuffle();

    // If no cards left to draw, end the game
    if (this.drawDeck.cards.length === 0) {
      this.endGame();
      return this.getGameState();
    }

    if (this.turnPhase === "draw") {
      // Step 1: Let player draw a card
      player.drawCard(this);
      this.turnPhase = "play";
    } else {
      // Step 2: Let player decide what to do with the drawn card
      const discarded = player.playCard(this);

      // Add the discarded card to the discard deck
      if (discarded) {
        discarded.turnFaceUp(); // Ensure the discarded card is face-up
        this.discardDeck.add(discarded);
      }

      // Check if this triggers game end condition
      if (!this.gameEnding && this.checkAllCardsUp(player)) {
        this.gameEnding = true;
      }

      // If game is ending, mark this player's final turn as taken
      if (this.gameEnding) {
        this.finalTurnsTaken.add(this.currentPlayerIndex);
      }

      // Check if game should end
      if (
        this.gameEnding &&
        this.finalTurnsTaken.size === this.players.length
      ) {
        this.endGame();
      } else {
        this.advanceToNextPlayer();
      }

      // Reset to draw phase for next player
      this.turnPhase = "draw";
      // Reset lastDrawSource when moving to the next player
      this.lastDrawSource = null;
    }

    return this.getGameState();
  }

  /**
   * Advance to the next player's turn
   */
  advanceToNextPlayer() {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;
  }

  /**
   * End the game, reveal all cards, and calculate final scores
   */
  endGame() {
    // Reveal all cards
    this.players.forEach((player) => {
      player.algorithm.finalTurn(player);
    });

    // Calculate final scores
    const playerScores = this.players.map((player, index) => ({
      playerNum: index + 1,
      score: player.scoreHand(),
    }));

    // Sort by score (lowest to highest since that's better in golf)
    playerScores.sort((a, b) => a.score - b.score);

    this.isGameOver = true;
    this.finalScores = playerScores;
  }
}

// Change from CommonJS to ES Module export
export default Game;
