import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../lab.css";

// ── LAB EXPERIMENT: Coin Streak ──────────────────────────────
// The simplest possible experiment: flip a coin, count a streak.
// Exists so future experiments have a pattern to copy.
//
// LAB RULES (they keep the sandbox safe):
// 1. Everything this experiment does stays inside this folder.
// 2. localStorage keys MUST start with "lab:coin-streak:"
// 3. No fetching, no keys, no touching other games' state.
// ──────────────────────────────────────────────────────────────

const LS_KEY = "lab:coin-streak:best";

export default function Experiment() {
  const [face, setFace] = useState(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem(LS_KEY) || 0));

  useEffect(() => {
    if (streak > best) {
      setBest(streak);
      localStorage.setItem(LS_KEY, String(streak));
    }
  }, [streak, best]);

  function flip() {
    const heads = Math.random() < 0.5;
    setFace(heads ? "HEADS" : "TAILS");
    setStreak((s) => (heads ? s + 1 : 0));
  }

  return (
    <main className="lab">
      <p className="kicker">🧪 EXPERIMENT 01</p>
      <h1>Coin Streak</h1>
      <p className="lab-sub">
        Flip heads, build a streak. Flip tails, lose it. That's it.
        This is the lab's hello world.
      </p>

      <div className="coin" onClick={flip}>
        {face ?? "TAP"}
      </div>

      <p className="lab-sub">
        Streak: <strong>{streak}</strong> · Best: <strong>{best}</strong>
      </p>

      <Link className="back-link" to="/lab">← Back to the lab</Link>
    </main>
  );
}
