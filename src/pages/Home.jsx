import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./hub.css";
import { getDailyPuzzle } from "../games/five-degrees/puzzles";

const API_KEY = import.meta.env.VITE_TMDB_CONNECTION;
const API_URL = "https://api.themoviedb.org/3/movie/";
const IMG_URL = "https://image.tmdb.org/t/p/w342";

// Today's puzzle pair — same for every player, changes at midnight UTC
const DAILY = getDailyPuzzle();

export default function Home() {
  const [posters, setPosters] = useState([null, null]);

  useEffect(() => {
    async function loadPosters() {
      const paths = await Promise.all(
        [DAILY.movieA, DAILY.movieB].map(async (movie) => {
          const res = await fetch(API_URL + movie.id + "?api_key=" + API_KEY);
          const data = await res.json();
          return data.poster_path;
        })
      );
      setPosters(paths);
    }
    loadPosters().catch(() => {});
  }, []);

  return (
    <main className="home">
      <section className="hero">
        <h1>Two minutes.<br />One puzzle.<br />Every day.</h1>
        <p className="hero-sub">
          You're two clicks into a puzzle before most sites finish loading
          their cookie banner. Free browser games, no logins, no tricks.
        </p>
      </section>

      <section className="lineup">
        <h2>Today's lineup</h2>

        <Link to="/five-degrees" className="fd-card">
          <div className="posters">
            {posters[0] ? (
              <img className="poster" src={IMG_URL + posters[0]} alt={DAILY.movieA.title} />
            ) : (
              <div className="poster ph" />
            )}
            <div className="hopdots">
              {Array.from({ length: 10 }).map((_, i) => (
                <i key={i} className={i === 0 ? "on" : ""} />
              ))}
            </div>
            {posters[1] ? (
              <img className="poster" src={IMG_URL + posters[1]} alt={DAILY.movieB.title} />
            ) : (
              <div className="poster ph" />
            )}
          </div>
          <div className="fd-copy">
            <h3>Five Degrees</h3>
            <div className="pair">TODAY: {DAILY.movieA.title} → {DAILY.movieB.title}</div>
            <p>Connect the two movies through the actors they share. Fresh pair every day.</p>
            <span className="play">▶ Play today's puzzle</span>
          </div>
        </Link>

        <Link to="/mini-murder" className="mm-row">
          <span>
            <b>Mini Murder</b> — one small crime, solved over coffee, daily.{" "}
            <i>In the case file now…</i>
          </span>
          <span className="soon">COMING SOON</span>
        </Link>
      </section>

      <section className="band dark">
        <h2>There's also <span className="sun-word">a big one.</span></h2>
        <p>An RPG. A proper one. No name yet. That's your first hint it's early days.</p>
        <Link className="band-cta" to="/rpg">Follow the devlog →</Link>
      </section>

      <div className="support-line">
        Daymode is free, and tips keep it that way.
        <Link to="/support">Support the studio →</Link>
      </div>
    </main>
  );
}
