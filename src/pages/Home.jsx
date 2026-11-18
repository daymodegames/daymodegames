import { Link } from "react-router-dom";
import "./hub.css";

const GAMES = [
  {
    slug: "/five-degrees",
    emoji: "🎬",
    title: "Five Degrees",
    desc: "Two famous movies. Connect them through the actors they share. New pair every day.",
    status: "live",
  },
  {
    slug: "/mini-murder",
    emoji: "🕵️",
    title: "Mini Murder",
    desc: "A bite-sized murder mystery with your morning coffee. One case a day.",
    status: "soon",
  },
];

export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <h1>Two minutes.<br />One puzzle.<br />Every day.</h1>
        <p className="hero-sub">
          Free browser games you can finish before your coffee gets cold.
          No logins. No downloads. No ads in your face.
        </p>
      </section>

      <section className="lineup">
        <h2>Today's lineup</h2>
        <div className="game-grid">
          {GAMES.map((g) => (
            <Link key={g.slug} to={g.slug} className="game-card">
              <div className="tile">{g.emoji}</div>
              <h3>{g.title}</h3>
              <p>{g.desc}</p>
              <span className={`status ${g.status}`}>
                {g.status === "live" ? "▶ Play today's puzzle" : "Coming soon"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="band dark">
        <h2>There's also a big one.</h2>
        <p>
          Between the daily games, we're building an RPG. A proper one.
          No name yet — that's your first hint it's early days.
        </p>
        <Link className="band-cta" to="/rpg">Follow the devlog →</Link>
      </section>

      <section className="band">
        <h2>Daymode runs on tips, not ads.</h2>
        <p>
          If a puzzle made your morning better, a tip keeps the lights on
          and the games coming. Totally optional, always appreciated.
        </p>
        <Link className="band-cta" to="/support">Support the studio →</Link>
      </section>
    </main>
  );
}
