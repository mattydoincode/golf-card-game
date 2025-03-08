import PlayingCard from "./PlayingCard";
import styles from "./GolfHand.module.css";

export default function GolfHand({ cards = [] }) {
  if (cards.length != 6) {
    return <div>Not 6 cards...</div>;
  }
  return (
    <div className={styles.hand}>
      <div className={styles.row}>
        <PlayingCard className={styles.card} card={cards[0]} />
        <PlayingCard className={styles.card} card={cards[1]} />
        <PlayingCard className={styles.card} card={cards[2]} />
      </div>
      <div className={styles.row}>
        <PlayingCard className={styles.card} card={cards[3]} />
        <PlayingCard className={styles.card} card={cards[4]} />
        <PlayingCard className={styles.card} card={cards[5]} />
      </div>
    </div>
  );
}
