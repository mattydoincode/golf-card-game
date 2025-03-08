"use client";
import { useState, useEffect, useRef } from "react";
import Game from "@/lib/Game";
import PlayingCard from "./PlayingCard";
import GolfHand from "./GolfHand";
import styles from "./GameOfGolf.module.css";

export default function GameOfGolf() {
  const [numPlayers, setNumPlayers] = useState(2);
  const [turnSpeed, setTurnSpeed] = useState(1000); // milliseconds
  const [game, setGame] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);

  // Initialize or reset the game
  const initializeGame = () => {
    const newGame = new Game(numPlayers);
    const initialState = newGame.initialize();
    setGame(newGame);
    setGameState(initialState);
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Start/resume the game
  const startGame = () => {
    setIsPlaying(true);
  };

  // Pause the game
  const pauseGame = () => {
    setIsPlaying(false);
  };

  // Reset the game
  const resetGame = () => {
    initializeGame();
  };

  // Handle game turns
  useEffect(() => {
    if (isPlaying && game && !gameState?.isGameOver) {
      timerRef.current = setInterval(() => {
        const newState = game.nextTurn();
        setGameState(newState);

        if (newState.isGameOver) {
          setIsPlaying(false);
          clearInterval(timerRef.current);
        }
      }, turnSpeed);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, game, turnSpeed]);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <h2>Game Controls</h2>
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="numPlayers">Number of Players:</label>
            <input
              type="number"
              id="numPlayers"
              min="2"
              max="6"
              value={numPlayers}
              onChange={(e) => setNumPlayers(parseInt(e.target.value))}
              disabled={game !== null}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="turnSpeed">Turn Speed (ms):</label>
            <input
              type="number"
              id="turnSpeed"
              min="100"
              max="5000"
              step="100"
              value={turnSpeed}
              onChange={(e) => setTurnSpeed(parseInt(e.target.value))}
            />
          </div>
          <div className={styles.buttons}>
            {!game && <button onClick={initializeGame}>Initialize Game</button>}
            {game && !isPlaying && !gameState?.isGameOver && (
              <button onClick={startGame}>Start Game</button>
            )}
            {game && isPlaying && (
              <button onClick={pauseGame}>Pause Game</button>
            )}
            {game && <button onClick={resetGame}>Reset Game</button>}
          </div>
        </div>
      </div>

      <div className={styles.gameDisplay}>
        {gameState && (
          <>
            <div className={styles.gameInfo}>
              <div className={styles.gameStats}>
                <p>Draw Deck: {gameState.drawDeckCount} cards</p>
                <p>Discard Deck: {gameState.discardDeckCount} cards</p>
                <p>
                  Turn Phase:{" "}
                  {gameState.turnPhase === "draw"
                    ? "Drawing Card"
                    : "Playing Card"}
                </p>
              </div>

              <div className={styles.cardDisplays}>
                {/* Draw Deck */}
                <div className={styles.cardDisplayContainer}>
                  <div className={styles.deckContainer}>
                    <p>Draw Deck:</p>
                    {gameState.drawDeckCount > 0 ? (
                      <div
                        className={`${styles.drawDeck} ${
                          gameState.turnPhase === "play" &&
                          gameState.lastDrawSource === "draw"
                            ? styles.highlightedDeck
                            : ""
                        }`}
                      >
                        <PlayingCard card={{ imgVal: () => "RED_BACK" }} />
                        <span className={styles.cardCount}>
                          {gameState.drawDeckCount}
                        </span>
                      </div>
                    ) : (
                      <div className={styles.emptyDeck}>
                        <p>Empty</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Discard Pile */}
                <div className={styles.cardDisplayContainer}>
                  <div className={styles.deckContainer}>
                    <p>Discard Pile:</p>
                    {gameState.topDiscard ? (
                      <div
                        className={`${styles.discardPile} ${
                          gameState.turnPhase === "play" &&
                          gameState.lastDrawSource === "discard"
                            ? styles.highlightedDeck
                            : ""
                        }`}
                      >
                        <PlayingCard card={gameState.topDiscard} />
                        <span className={styles.cardCount}>
                          {gameState.discardDeckCount}
                        </span>
                      </div>
                    ) : (
                      <div className={styles.emptyDeck}>
                        <p>Empty</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Currently Drawn Card */}
                <div className={styles.cardDisplayContainer}>
                  {gameState.turnPhase === "play" &&
                  gameState.currentlyDrawnCard ? (
                    <div className={styles.currentlyDrawnCard}>
                      <h4>Currently Drawn Card:</h4>
                      <PlayingCard card={gameState.currentlyDrawnCard} />
                    </div>
                  ) : (
                    <div className={styles.emptyDrawnCard}>
                      {gameState.turnPhase === "draw" ? (
                        <p>Waiting to draw...</p>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.players}>
              {gameState.players.map((player, index) => (
                <div
                  key={index}
                  className={`${styles.player} ${
                    player.isCurrentPlayer ? styles.currentPlayer : ""
                  }`}
                >
                  <h3>Player {player.playerNum}</h3>
                  <GolfHand cards={player.hand} />
                  <div className={styles.scoreInfo}>
                    <p className={styles.visibleScore}>
                      Visible Score: <span>{player.visibleScore}</span>
                    </p>
                    {player.faceDownCount > 0 && (
                      <p className={styles.faceDownInfo}>
                        <span className={styles.faceDownCount}>
                          {player.faceDownCount}
                        </span>{" "}
                        face-down{" "}
                        {player.faceDownCount === 1 ? "card" : "cards"}{" "}
                        remaining
                      </p>
                    )}
                    {gameState.isGameOver && (
                      <p className={styles.finalScore}>
                        Final Score: <span>{player.score}</span>
                      </p>
                    )}
                  </div>
                  <div className={styles.drawnCardContainer}>
                    {player.isCurrentPlayer && player.currentlyDrawnCard ? (
                      <div className={styles.playerDrawnCard}>
                        <p>Drawn Card:</p>
                        <PlayingCard card={player.currentlyDrawnCard} />
                      </div>
                    ) : (
                      <div className={styles.emptyDrawnCard}></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {gameState.isGameOver && (
              <div className={styles.gameOver}>
                <h2>Game Over!</h2>
                <div className={styles.finalScores}>
                  {game.finalScores.map((score, index) => (
                    <div
                      key={index}
                      className={`${styles.finalScoreCard} ${
                        index === 0 ? styles.winner : ""
                      }`}
                    >
                      <div className={styles.playerRank}>
                        {index === 0 ? "🏆" : `#${index + 1}`}
                      </div>
                      <div className={styles.playerInfo}>
                        <h3>Player {score.playerNum}</h3>
                        <p className={styles.finalScoreValue}>
                          {score.score} points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
