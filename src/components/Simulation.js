"use client";
import { useState, useEffect } from "react";
import Game from "@/lib/Game";
import BasicAlg from "@/lib/algorithms/BasicAlg";
import ImprovedAlg from "@/lib/algorithms/BasicAlg2";
import styles from "./Simulation.module.css";

// Available algorithms
const ALGORITHMS = {
  BasicAlg: BasicAlg,
  ImprovedAlg: ImprovedAlg,
};

// Algorithm descriptions with rich text formatting
const ALGORITHM_DESCRIPTIONS = {
  BasicAlg: {
    name: "Basic Algorithm",
    description: `
      <h4>Strategy Overview</h4>
      <p>A straightforward algorithm that follows a fixed decision hierarchy when playing Golf. It makes decisions in a predetermined order without adapting to the game state.</p>
      
      <h4>Card Drawing Strategy</h4>
      <ul>
        <li>Takes from discard pile only if it's a low-value card (≤ 4 points)</li>
        <li>Takes from discard if it can make a pair with a visible card</li>
        <li>Otherwise draws from the face-down deck</li>
      </ul>
      
      <h4>Card Playing Strategy</h4>
      <ol>
        <li><strong>Make Pairs:</strong> First priority is to create pairs in columns</li>
        <li><strong>Replace High-Value Cards:</strong> Replaces the highest scoring visible card if drawn card is better</li>
        <li><strong>Flip Face-Down Cards:</strong> Replaces any face-down card if drawn card is decent (≤ 7 points)</li>
        <li><strong>Discard:</strong> If none of the above apply, discards the drawn card</li>
      </ol>
      
      <h4>Starting Strategy</h4>
      <p>Flips the first two cards (positions 0 and 1) at the beginning of the game, which are adjacent in the top row.</p>
      
      <h4>Limitations</h4>
      <ul>
        <li>No strategic position-based decision making</li>
        <li>Doesn't consider column-based strategy when flipping initial cards</li>
        <li>No endgame adaptation</li>
        <li>Doesn't avoid breaking existing pairs</li>
        <li>Doesn't evaluate the true value of the discard pile</li>
      </ul>
    `,
  },
  ImprovedAlg: {
    name: "Improved Algorithm",
    description: `
      <h4>Strategy Overview</h4>
      <p>A sophisticated algorithm that implements strategic card placement, pair formation, and adapts its strategy based on the game state.</p>
      
      <h4>Card Drawing Strategy</h4>
      <ul>
        <li><strong>Pair Formation:</strong> First checks if discard can make a pair with any visible card</li>
        <li><strong>High-Value Cards:</strong> Takes Kings (0 pts), 2s (-2 pts), and Aces (1 pt) from discard</li>
        <li><strong>Card Improvement:</strong> Takes discard if better than worst visible card</li>
        <li><strong>Risk Assessment:</strong> Considers face-down card count when taking discard</li>
      </ul>
      
      <h4>Card Playing Strategy</h4>
      <ol>
        <li><strong>Pair Protection:</strong> Avoids breaking existing pairs when making replacements</li>
        <li><strong>Strategic Replacement:</strong> Calculates actual score improvement when replacing cards</li>
        <li><strong>Position-Based Strategy:</strong> Places good cards in optimal positions</li>
        <li><strong>Endgame Adaptation:</strong> Changes strategy when few cards remain or few face-down cards left</li>
      </ol>
      
      <h4>Card Evaluation System</h4>
      <p>Uses a weighted value system for different card ranks:</p>
      <ul>
        <li>Kings (0 pts): Weight 10</li>
        <li>2s (-2 pts): Weight 9</li>
        <li>Aces (1 pt): Weight 8</li>
        <li>Low cards (3-7): Weights 5-1</li>
        <li>High cards (8-Q): Weights 0 to -2</li>
      </ul>
      
      <h4>Starting Strategy</h4>
      <p>Flips cards in opposite corners (positions 0 and 5) to maximize information about the hand structure.</p>
      
      <h4>Helper Methods</h4>
      <ul>
        <li><strong>findWorstVisibleCardIndex:</strong> Identifies worst card that isn't part of a pair</li>
        <li><strong>isCardInPair:</strong> Checks if a card is already part of a pair</li>
        <li><strong>wouldCreatePair:</strong> Predicts if a replacement would create a new pair</li>
        <li><strong>findBestPositionForFaceDown:</strong> Determines optimal position for replacement</li>
      </ul>
    `,
  },
};

export default function Simulation() {
  const [config, setConfig] = useState({
    numGames: 100,
    players: [{ algorithm: "BasicAlg" }, { algorithm: "ImprovedAlg" }],
  });
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentReport, setCurrentReport] = useState(null);
  const [simulationHistory, setSimulationHistory] = useState([]);

  // Helper function to find winner indices (handles ties)
  const getWinnerIndices = (wins) => {
    const maxWins = Math.max(...wins);
    return wins
      .map((win, index) => (win === maxWins ? index : -1))
      .filter((index) => index !== -1);
  };

  // Helper function to find indices with lowest score (best in golf)
  const getLowestScoreIndices = (scores) => {
    const minScore = Math.min(...scores);
    return scores
      .map((score, index) => (score === minScore ? index : -1))
      .filter((index) => index !== -1);
  };

  // Format winner text for display
  const formatWinnerText = (report) => {
    // In Golf, lowest score wins
    const lowestScoreIndices = getLowestScoreIndices(report.totalScores);

    if (lowestScoreIndices.length === 0) return "No winners";

    if (lowestScoreIndices.length === 1) {
      const winnerIndex = lowestScoreIndices[0];
      return `Player ${winnerIndex + 1} (${
        report.config.players[winnerIndex].algorithm
      })`;
    }

    // Handle ties
    return lowestScoreIndices
      .map(
        (index) =>
          `Player ${index + 1} (${report.config.players[index].algorithm})`
      )
      .join(" & ");
  };

  // Load simulation history from local storage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("simulationHistory");
    if (savedHistory) {
      try {
        setSimulationHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse simulation history:", e);
      }
    }
  }, []);

  // Save simulation history to local storage whenever it changes
  useEffect(() => {
    if (simulationHistory.length > 0) {
      localStorage.setItem(
        "simulationHistory",
        JSON.stringify(simulationHistory)
      );
    }
  }, [simulationHistory]);

  const handleConfigChange = (field, value) => {
    setConfig({ ...config, [field]: value });
  };

  const handlePlayerChange = (index, field, value) => {
    const updatedPlayers = [...config.players];
    updatedPlayers[index] = { ...updatedPlayers[index], [field]: value };
    setConfig({ ...config, players: updatedPlayers });
  };

  const addPlayer = () => {
    if (config.players.length < 6) {
      setConfig({
        ...config,
        players: [...config.players, { algorithm: "BasicAlg" }],
      });
    }
  };

  const removePlayer = (index) => {
    if (config.players.length > 2) {
      const updatedPlayers = [...config.players];
      updatedPlayers.splice(index, 1);
      setConfig({ ...config, players: updatedPlayers });
    }
  };

  const runSimulation = async () => {
    setIsRunning(true);
    setProgress(0);

    const results = {
      timestamp: new Date().toISOString(),
      config: { ...config },
      wins: Array(config.players.length).fill(0),
      totalScores: Array(config.players.length).fill(0),
      averageScores: Array(config.players.length).fill(0),
      gamesPlayed: 0,
      tiedGames: 0,
    };

    // Run games in batches to avoid blocking the UI
    const batchSize = 10;
    const totalBatches = Math.ceil(config.numGames / batchSize);

    for (let batch = 0; batch < totalBatches; batch++) {
      const gamesInBatch = Math.min(
        batchSize,
        config.numGames - batch * batchSize
      );

      // Run a batch of games
      await new Promise((resolve) => {
        setTimeout(() => {
          for (let i = 0; i < gamesInBatch; i++) {
            const gameResults = runSingleGame(config.players);

            // Update total scores
            gameResults.scores.forEach((score, index) => {
              results.totalScores[index] += score;
            });

            // Handle wins and ties
            const minScore = Math.min(...gameResults.scores);
            const winnerIndices = gameResults.scores
              .map((score, index) => (score === minScore ? index : -1))
              .filter((index) => index !== -1);

            // If there's a tie, count it
            if (winnerIndices.length > 1) {
              results.tiedGames++;
            }

            // Give a win to each player with the minimum score
            winnerIndices.forEach((index) => {
              results.wins[index]++;
            });

            results.gamesPlayed++;
          }

          // Calculate average scores
          results.averageScores = results.totalScores.map((total) =>
            results.gamesPlayed > 0
              ? (total / results.gamesPlayed).toFixed(2)
              : 0
          );

          // Update progress
          setProgress(
            Math.round((((batch + 1) * batchSize) / config.numGames) * 100)
          );
          setCurrentReport({ ...results });

          resolve();
        }, 0);
      });
    }

    // Finalize results
    const finalReport = {
      ...results,
      progress: 100,
    };

    setCurrentReport(finalReport);
    setSimulationHistory((prev) => [finalReport, ...prev]);
    setIsRunning(false);
    setProgress(100);
  };

  const runSingleGame = (players) => {
    // Create a new game with the specified players
    const game = new Game(players.length);

    // Create a randomized mapping of player positions to algorithms
    // This ensures that player position (who goes first, etc.) doesn't bias the results
    const shuffledIndices = shuffleArray([...Array(players.length).keys()]);

    // Replace the default algorithms with the configured ones in randomized positions
    game.players.forEach((player, index) => {
      const shuffledIndex = shuffledIndices[index];
      const AlgorithmClass = ALGORITHMS[players[shuffledIndex].algorithm];
      player.algorithm = new AlgorithmClass();
      // Store the original player index for tracking results
      player.originalIndex = shuffledIndex;
    });

    // Initialize the game
    game.initialize();

    // Run the game until completion
    while (!game.isGameOver) {
      game.nextTurn();
    }

    // Get the final scores
    const scores = game.players.map((player) => player.scoreHand());

    // Map scores back to original player indices
    const mappedScores = Array(players.length).fill(0);
    game.players.forEach((player, index) => {
      mappedScores[player.originalIndex] = scores[index];
    });

    return {
      scores: mappedScores,
    };
  };

  // Helper function to shuffle an array (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const clearHistory = () => {
    setSimulationHistory([]);
    localStorage.removeItem("simulationHistory");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Golf Simulation</h1>

      <div className={styles.layout}>
        <div className={styles.historyPanel}>
          <div className={styles.historyHeader}>
            <h2>Simulation History</h2>
            <button
              className={styles.clearButton}
              onClick={clearHistory}
              disabled={simulationHistory.length === 0}
            >
              Clear History
            </button>
          </div>

          <div className={styles.historyList}>
            {simulationHistory.length === 0 ? (
              <p className={styles.noHistory}>No simulation history yet.</p>
            ) : (
              simulationHistory.map((report, index) => (
                <div key={index} className={styles.historyItem}>
                  <div className={styles.historyItemHeader}>
                    <span className={styles.historyDate}>
                      {formatDate(report.timestamp)}
                    </span>
                    <span className={styles.historyGames}>
                      {report.gamesPlayed} games
                    </span>
                  </div>

                  {/* Winner Summary */}
                  {report.gamesPlayed > 0 && (
                    <div className={styles.historySummary}>
                      <div className={styles.historyWinner}>
                        <span className={styles.winnerIcon}>🏆</span>
                        <span>
                          {getLowestScoreIndices(report.totalScores).length > 1
                            ? "Tie: "
                            : ""}
                          {formatWinnerText(report)}
                          {" with lowest score: "}
                          {Math.min(...report.totalScores)}
                        </span>
                      </div>
                      {report.tiedGames > 0 && (
                        <div className={styles.historyTies}>
                          {report.tiedGames} tied games (
                          {Math.round(
                            (report.tiedGames / report.gamesPlayed) * 100
                          )}
                          %)
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.historyResults}>
                    {report.config.players.map((player, playerIndex) => {
                      const lowestScoreIndices = getLowestScoreIndices(
                        report.totalScores
                      );
                      const isWinner = lowestScoreIndices.includes(playerIndex);
                      return (
                        <div
                          key={playerIndex}
                          className={`${styles.playerResult} ${
                            isWinner ? styles.winnerResult : ""
                          }`}
                        >
                          <span className={styles.playerAlgorithm}>
                            {isWinner ? "🏆 " : ""} Player {playerIndex + 1} (
                            {player.algorithm})
                          </span>
                          <div className={styles.playerStats}>
                            <span className={styles.playerWins}>
                              Wins: {report.wins[playerIndex]} (
                              {Math.round(
                                (report.wins[playerIndex] /
                                  report.gamesPlayed) *
                                  100
                              )}
                              %)
                            </span>
                            <span className={styles.playerScore}>
                              Cumulative: {report.totalScores[playerIndex]} |
                              Avg: {report.averageScores[playerIndex]}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.configPanel}>
          <h2>Simulation Configuration</h2>

          <div className={styles.configForm}>
            <div className={styles.formGroup}>
              <label htmlFor="numGames">Number of Games:</label>
              <input
                type="number"
                id="numGames"
                min="10"
                max="10000"
                value={config.numGames}
                onChange={(e) =>
                  handleConfigChange("numGames", parseInt(e.target.value))
                }
                disabled={isRunning}
              />
            </div>

            <h3>Players</h3>
            {config.players.map((player, index) => (
              <div key={index} className={styles.playerConfig}>
                <div className={styles.playerHeader}>
                  <h4>Player {index + 1}</h4>
                  {config.players.length > 2 && (
                    <button
                      className={styles.removePlayerButton}
                      onClick={() => removePlayer(index)}
                      disabled={isRunning}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor={`player-${index}-algorithm`}>
                    Algorithm:
                  </label>
                  <select
                    id={`player-${index}-algorithm`}
                    value={player.algorithm}
                    onChange={(e) =>
                      handlePlayerChange(index, "algorithm", e.target.value)
                    }
                    disabled={isRunning}
                  >
                    {Object.keys(ALGORITHMS).map((alg) => (
                      <option key={alg} value={alg}>
                        {ALGORITHM_DESCRIPTIONS[alg].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            {config.players.length < 6 && (
              <button
                className={styles.addPlayerButton}
                onClick={addPlayer}
                disabled={isRunning}
              >
                Add Player
              </button>
            )}

            <button
              className={styles.runButton}
              onClick={runSimulation}
              disabled={isRunning}
            >
              {isRunning ? "Running..." : "Run Simulation"}
            </button>
          </div>

          {isRunning && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className={styles.progressText}>{progress}% Complete</div>
            </div>
          )}

          {currentReport && (
            <div className={styles.currentResults}>
              <h3>Current Simulation Results</h3>

              {/* Winner Highlight */}
              {currentReport.gamesPlayed > 0 && (
                <div className={styles.winnerHighlight}>
                  <div className={styles.trophy}>🏆</div>
                  <div className={styles.winnerInfo}>
                    <h4>
                      Best Performer
                      {getLowestScoreIndices(currentReport.totalScores).length >
                      1
                        ? "s (Tie)"
                        : ""}
                    </h4>
                    <p className={styles.winnerName}>
                      {formatWinnerText(currentReport)}
                    </p>
                    <p className={styles.winnerStats}>
                      Lowest cumulative score:{" "}
                      {Math.min(...currentReport.totalScores)}
                    </p>
                    <p className={styles.winnerStats}>
                      Wins: {Math.max(...currentReport.wins)} of{" "}
                      {currentReport.gamesPlayed} games (
                      {Math.round(
                        (Math.max(...currentReport.wins) /
                          currentReport.gamesPlayed) *
                          100
                      )}
                      %)
                    </p>
                    {currentReport.tiedGames > 0 && (
                      <p className={styles.tieInfo}>
                        {currentReport.tiedGames} tied games (
                        {Math.round(
                          (currentReport.tiedGames /
                            currentReport.gamesPlayed) *
                            100
                        )}
                        %)
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.resultsTable}>
                <div className={styles.resultsHeader}>
                  <div>Player</div>
                  <div>Wins</div>
                  <div>Win %</div>
                  <div>Cumulative Score</div>
                  <div>Avg Score</div>
                </div>
                {currentReport.config.players.map((player, index) => {
                  const lowestScoreIndices = getLowestScoreIndices(
                    currentReport.totalScores
                  );
                  const isWinner = lowestScoreIndices.includes(index);
                  return (
                    <div
                      key={index}
                      className={`${styles.resultsRow} ${
                        isWinner ? styles.winnerRow : ""
                      }`}
                    >
                      <div>
                        {isWinner ? "🏆 " : ""} Player {index + 1} (
                        {player.algorithm})
                      </div>
                      <div>{currentReport.wins[index]}</div>
                      <div>
                        {currentReport.gamesPlayed > 0
                          ? Math.round(
                              (currentReport.wins[index] /
                                currentReport.gamesPlayed) *
                                100
                            )
                          : 0}
                        %
                      </div>
                      <div className={styles.cumulativeScore}>
                        {currentReport.totalScores[index]}
                      </div>
                      <div>{currentReport.averageScores[index]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className={styles.algorithmPanel}>
          <h2>Algorithm Reference</h2>
          <div className={styles.algorithmList}>
            {Object.entries(ALGORITHM_DESCRIPTIONS).map(([key, algorithm]) => (
              <div key={key} className={styles.algorithmItem}>
                <h3 className={styles.algorithmName}>{algorithm.name}</h3>
                <div
                  className={styles.algorithmDescription}
                  dangerouslySetInnerHTML={{ __html: algorithm.description }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
