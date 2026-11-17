import { Link } from "react-router-dom";
import "./hub.css";

export default function MiniMurder() {
  return (
    <div className="stub">
      <p className="kicker">🕵️ CASE FILE № 001</p>
      <h1 className="game-title">Mini Murder</h1>
      <p className="subtitle">
        A bite-sized murder mystery. One case, every day.
      </p>
      <div className="coming">COMING SOON</div>
      <Link className="back-link" to="/">← Back to Daymode Games</Link>
    </div>
  );
}
