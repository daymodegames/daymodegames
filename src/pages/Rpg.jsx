import { Link } from "react-router-dom";
import "./hub.css";

export default function Rpg() {
  return (
    <main className="home dark-page">
      <section className="hero">
        <p className="kicker-dark">THE BIG ONE</p>
        <h1>Working title: none yet.</h1>
        <p className="hero-sub">
          We make two-minute daily games. So naturally, we're also making an RPG.
          This is the devlog: what we're building, why, and how it's going —
          warts, wins, and rewrites included. Story teasers too, when they're ready.
        </p>
      </section>

      <section className="lineup">
        <h2>Entries</h2>
        <article className="entry">
          <span className="entry-num">001</span>
          <h3>Why make an RPG when you make daily games?</h3>
          <p>The answer involves a spreadsheet, a bad idea, and a worse idea.</p>
          <span className="status soon">Coming soon</span>
        </article>
      </section>

      <div className="back-row">
        <Link className="back-link" to="/">← Back to the games</Link>
      </div>
    </main>
  );
}
