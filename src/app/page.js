import styles from "./page.module.css";
import GameOfGolf from "@/components/GameOfGolf";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Six Card Golf</h1>
        <GameOfGolf />
      </main>
    </div>
  );
}
