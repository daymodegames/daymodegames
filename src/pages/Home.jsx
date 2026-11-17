import { Link } from "react-router-dom";
import "./hub.css";

const GAMES = [
  {
    slug: "/five-degrees",
    emoji: "🎬",
    title: "Five Degrees",
    desc: "Connect two movies through the actors they share. A new pair of famous films every day.",
    status: "live",
  },
  {
    slug: "/mini-murder",
    emoji: "🕵️",
    title: "Mini Murder",
    desc: "A bite-sized murder mystery to solve with your morning coffee. One case per day.",
    status: "soon",
  },
];

export default function Home() {
  return (
    <div className="hub">
      <header>
        <p className="kicker">☀ DAILY GAMES · NEW EVERY DAY</p>
        <h1>Daymode Games</h1>
        <p className="tagline">Quick daily games, played in daylight.</p>
      </header>

      <section className="lineup">
        <h2>Today's lineup</h2>
        <div className="game-grid">
          {GAMES.map((g) => (
            <Link key={g.slug} to={g.slug} className="game-card">
              <div className="tile">{g.emoji}</div>
              <h3>{g.title}</h3>
              <p>{g.desc}</p>
              <span className={`status ${g.status}`}>
                {g.status === "live" ? "▶ LIVE" : "COMING SOON"}
              </span>
            </Link>
          ))}
          <div className="ghost-card">
            <span className="plus">+</span>
            <span>More games brewing…</span>
          </div>
        </div>
      </section>

      <footer className="hub-footer">☀ DAYMODE GAMES ☀</footer>
    </div>
  );
}
