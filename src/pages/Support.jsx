import { Link } from "react-router-dom";
import "./hub.css";

// TODO: replace with the real Ko-fi page URL once it exists
const KOFI_URL = "https://ko-fi.com/daymodegames";

export default function Support() {
  return (
    <main className="home">
      <section className="hero">
        <h1>Keep Daymode in daylight.</h1>
        <p className="hero-sub">
          Daymode is free. The games, the site, all of it. If a puzzle made
          your morning better, a tip keeps the lights on, the API key fed,
          and more games coming.
        </p>
        <div className="share-row">
          <a className="share-btn" href={KOFI_URL} target="_blank" rel="noreferrer">
            Leave a tip on Ko-fi
          </a>
        </div>
        <p className="fine-print">
          Tips, not donations. Daymode isn't a charity, just a game studio
          that likes giving things away.
        </p>
      </section>

      <div className="back-row">
        <Link className="back-link" to="/">← Back to the games</Link>
      </div>
    </main>
  );
}
