import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./game.css";
import "./share.css";
import { getDailyPuzzle } from "./puzzles";

// SANDBOX COPY of the live Five Degrees game. Changes go here first.
// Anything proven here gets applied to src/games/five-degrees/ in a
// separate reviewed commit (the drift rule, see src/lab/README.md).

const API_KEY = import.meta.env.VITE_TMDB_CONNECTION;
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w300";

// Today's puzzle — same pair for every player, changes at midnight UTC
const DAILY_PUZZLE = getDailyPuzzle();

const MAX_HOPS = 10;
const PREVIEW_COUNT = 20; // how many to show before the player searches

async function fetchMovieCredits(movieId) {
  const res = await fetch(
    `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`
  );
  const data = await res.json();
  return data.cast.slice(0, 100); // the full billed cast, top-billed first
}

async function fetchActorMovies(actorId) {
  const res = await fetch(
    `${BASE_URL}/person/${actorId}/movie_credits?api_key=${API_KEY}`
  );
  const data = await res.json();
  return data.cast
    .filter((m) => m.poster_path)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 200); // the full filmography, not just the famous ones
}

async function fetchMoviePoster(movieId) {
  const res = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
  );
  const data = await res.json();
  return data.poster_path;
}

// ─── Share result (Wordle-style) ─────────────────────────────────────
function buildShareText(chain, hops, didWin) {
  const steps = chain
    .map((step) => (step.type === "movie" ? "🎬" : "👤"))
    .join("");
  const result = didWin ? `${hops}/${MAX_HOPS} hops` : `X/${MAX_HOPS} hops`;
  return [
    `Five Degrees #${DAILY_PUZZLE.number} — ${result}`,
    steps,
    `Can you connect them? ${DAILY_PUZZLE.siteUrl}`,
  ].join("\n");
}

function ShareButtons({ text }) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — do nothing
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ text });
    } catch {
      // user cancelled — do nothing
    }
  }

  return (
    <div className="share-row">
      {canNativeShare && (
        <button className="share-btn" onClick={nativeShare}>
          Share
        </button>
      )}
      <button className="share-btn" onClick={copyResult}>
        {copied ? "Copied!" : "Copy result"}
      </button>
    </div>
  );
}

export default function Game() {
  const [screen, setScreen] = useState("title"); // title | game | win | lose
  const [posterA, setPosterA] = useState(null);
  const [posterB, setPosterB] = useState(null);

  const [currentMovieId, setCurrentMovieId] = useState(null);
  const [currentMovieTitle, setCurrentMovieTitle] = useState("");
  const [cast, setCast] = useState([]);
  const [actorMovies, setActorMovies] = useState([]);
  const [selectedActor, setSelectedActor] = useState(null);

  const [hops, setHops] = useState(0);
  const [chain, setChain] = useState([]); // [{type: 'movie'|'actor', label}]
  const [usedMovieIds, setUsedMovieIds] = useState(new Set());
  const [usedActorIds, setUsedActorIds] = useState(new Set());
  const [stones, setStones] = useState([]); // poster pebbles for the bridge

  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("cast"); // cast | movies
  const [query, setQuery] = useState(""); // search box

  useEffect(() => {
    // Preload posters for title screen and the bridge
    fetchMoviePoster(DAILY_PUZZLE.movieA.id).then(setPosterA);
    fetchMoviePoster(DAILY_PUZZLE.movieB.id).then(setPosterB);
  }, []);

  async function startGame() {
    setLoading(true);
    const credits = await fetchMovieCredits(DAILY_PUZZLE.movieA.id);
    setCast(credits);
    setCurrentMovieId(DAILY_PUZZLE.movieA.id);
    setCurrentMovieTitle(DAILY_PUZZLE.movieA.title);
    setUsedMovieIds(new Set([DAILY_PUZZLE.movieA.id]));
    setChain([{ type: "movie", label: DAILY_PUZZLE.movieA.title }]);
    setHops(0);
    setStones([]);
    setView("cast");
    setSelectedActor(null);
    setActorMovies([]);
    setQuery("");
    setLoading(false);
    setScreen("game");
  }

  async function pickActor(actor) {
    if (usedActorIds.has(actor.id)) return;
    setLoading(true);
    setSelectedActor(actor);
    const movies = await fetchActorMovies(actor.id);
    setActorMovies(movies);
    setUsedActorIds((prev) => new Set([...prev, actor.id]));
    setChain((prev) => [...prev, { type: "actor", label: actor.name }]);
    setView("movies");
    setQuery("");
    setLoading(false);
  }

  async function pickMovie(movie) {
    if (usedMovieIds.has(movie.id)) return;

    const newHops = hops + 1;
    setHops(newHops);
    setUsedMovieIds((prev) => new Set([...prev, movie.id]));
    setChain((prev) => [...prev, { type: "movie", label: movie.title }]);
    // Drop this movie onto the bridge as a pebble
    setStones((prev) => [...prev, movie.poster_path]);

    // Win condition
    if (movie.id === DAILY_PUZZLE.movieB.id) {
      setScreen("win");
      return;
    }

    // Lose condition
    if (newHops >= MAX_HOPS) {
      setScreen("lose");
      return;
    }

    setLoading(true);
    const credits = await fetchMovieCredits(movie.id);
    setCast(credits);
    setCurrentMovieId(movie.id);
    setCurrentMovieTitle(movie.title);
    setSelectedActor(null);
    setActorMovies([]);
    setView("cast");
    setQuery("");
    setLoading(false);
  }

  function resetGame() {
    setScreen("title");
    setChain([]);
    setHops(0);
    setUsedMovieIds(new Set());
    setUsedActorIds(new Set());
    setStones([]);
    setSelectedActor(null);
    setCast([]);
    setActorMovies([]);
    setQuery("");
  }

  // Search digs through the FULL cast / filmography.
  // Without a search, we preview only the top-billed / most popular.
  const q = query.trim().toLowerCase();
  const castMatches = q
    ? cast.filter((a) => a.name.toLowerCase().includes(q))
    : [];
  const movieMatches = q
    ? actorMovies.filter((m) => m.title.toLowerCase().includes(q))
    : [];
  const castVisible = q ? castMatches : cast.slice(0, PREVIEW_COUNT);
  const moviesVisible = q ? movieMatches : actorMovies.slice(0, PREVIEW_COUNT);

  // Timing for the win reveal: stones pop one by one, then the text rises
  const stoneGap = 0.4; // seconds between stone pops
  const revealDone = 0.4 + stones.length * stoneGap + 0.5;

  // ─── TITLE SCREEN ────────────────────────────────────────────────
  if (screen === "title") {
    return (
      <div className="app title-screen">
        <Link className="back-link" to="/lab">← Back to the lab</Link>
        <h1 className="game-title">Five Degrees</h1>
        <p className="subtitle">Daily Puzzle #{DAILY_PUZZLE.number}</p>

        <div className="movie-pair">
          <div className="movie-card">
            {posterA && (
              <img src={`${IMG_URL}${posterA}`} alt={DAILY_PUZZLE.movieA.title} />
            )}
            <span>{DAILY_PUZZLE.movieA.title}</span>
          </div>

          <div className="connector-dots">
            {Array.from({ length: MAX_HOPS }).map((_, i) => (
              <div key={i} className="dot" />
            ))}
          </div>

          <div className="movie-card">
            {posterB && (
              <img src={`${IMG_URL}${posterB}`} alt={DAILY_PUZZLE.movieB.title} />
            )}
            <span>{DAILY_PUZZLE.movieB.title}</span>
          </div>
        </div>

        <button className="start-btn" onClick={startGame}>
          Start
        </button>
      </div>
    );
  }

  // ─── WIN SCREEN: the bridge replays your journey ─────────────────
  if (screen === "win") {
    return (
      <div className="app result-screen win">
        <div className="reveal-bridge">
          {posterA && (
            <img
              className="stone used reveal end-poster"
              src={`${IMG_URL}${posterA}`}
              alt={DAILY_PUZZLE.movieA.title}
              style={{ animationDelay: "0.1s" }}
            />
          )}
          <div className="bridge-stones reveal-stones">
            {stones.map((s, i) =>
              s ? (
                <img
                  key={i}
                  className={`stone used reveal ${i === stones.length - 1 ? "final-stone" : ""}`}
                  src={`${IMG_URL}${s}`}
                  alt=""
                  style={{ animationDelay: `${0.4 + i * stoneGap}s` }}
                />
              ) : null
            )}
          </div>
        </div>

        <h1 className="reveal-text" style={{ animationDelay: revealDone + "s" }}>
          You did it!
        </h1>
        <p className="result-hops fade-in" style={{ animationDelay: revealDone + 0.2 + "s" }}>
          Connected in <strong>{hops}</strong> hop{hops !== 1 ? "s" : ""}.
        </p>
        <div className="fade-in" style={{ animationDelay: revealDone + 0.4 + "s" }}>
          <ShareButtons text={buildShareText(chain, hops, true)} />
        </div>

        <div className="chain-log fade-in" style={{ animationDelay: revealDone + 0.6 + "s" }}>
          {chain.map((step, i) => (
            <div key={i} className={`chain-step ${step.type}`}>
              {step.type === "actor" ? "👤" : "🎬"} {step.label}
            </div>
          ))}
        </div>
        <button className="start-btn fade-in" style={{ animationDelay: revealDone + 0.8 + "s" }} onClick={resetGame}>
          Play Again
        </button>
      </div>
    );
  }

  // ─── LOSE SCREEN ─────────────────────────────────────────────────
  if (screen === "lose") {
    return (
      <div className="app result-screen lose">
        <h1>So close...</h1>
        <p className="result-hops">You used all {MAX_HOPS} hops.</p>
        <ShareButtons text={buildShareText(chain, hops, false)} />
        <div className="chain-log">
          {chain.map((step, i) => (
            <div key={i} className={`chain-step ${step.type}`}>
              {step.type === "actor" ? "👤" : "🎬"} {step.label}
            </div>
          ))}
        </div>
        <button className="start-btn" onClick={resetGame}>Try Again</button>
      </div>
    );
  }

  // ─── GAME SCREEN ─────────────────────────────────────────────────
  return (
    <div className="app game-screen">
      {/* Header: the Poster Bridge */}
      <div className="game-header">
        <div className="bridge">
          {posterA && (
            <img
              className="bridge-thumb"
              src={`${IMG_URL}${posterA}`}
              alt={DAILY_PUZZLE.movieA.title}
            />
          )}
          <div className="bridge-stones">
            {Array.from({ length: MAX_HOPS }).map((_, i) =>
              stones[i] ? (
                <img
                  key={i}
                  className="stone used"
                  src={`${IMG_URL}${stones[i]}`}
                  alt=""
                />
              ) : (
                <div key={i} className="stone pebble" />
              )
            )}
          </div>
          {posterB && (
            <img
              className="bridge-thumb goal-thumb"
              src={`${IMG_URL}${posterB}`}
              alt={DAILY_PUZZLE.movieB.title}
            />
          )}
        </div>
        <p className="bridge-count">
          <strong>{stones.length}</strong>/{MAX_HOPS} hops · {MAX_HOPS - stones.length} left
        </p>
      </div>

      {/* Current movie */}
      <div className="current-movie">
        <span className="current-label">Now in:</span>
        <strong>{currentMovieTitle}</strong>
      </div>

      {loading && <div className="loading">Loading...</div>}

      {/* Cast list */}
      {!loading && view === "cast" && (
        <div className="list-section">
          <p className="list-hint">
            {q
              ? `${castMatches.length} result${castMatches.length !== 1 ? "s" : ""} in the full cast`
              : `Top ${Math.min(PREVIEW_COUNT, cast.length)} of ${cast.length} cast members — search to find anyone`}
          </p>
          <input
            className="search-box"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the whole cast…"
          />
          {q && castMatches.length === 0 && (
            <p className="list-hint">No one in this cast matches "{query}"</p>
          )}
          <div className="item-list">
            {castVisible.map((actor) => (
              <button
                key={actor.id}
                className={`item-btn ${usedActorIds.has(actor.id) ? "used" : ""}`}
                onClick={() => pickActor(actor)}
                disabled={usedActorIds.has(actor.id)}
              >
                {actor.profile_path ? (
                  <img
                    className="actor-photo"
                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                    alt={actor.name}
                  />
                ) : (
                  <div className="actor-placeholder">
                    {actor.name.charAt(0)}
                  </div>
                )}
                <div className="item-info">
                  <span className="item-name">{actor.name}</span>
                  <span className="item-sub">{actor.character}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Movie list */}
      {!loading && view === "movies" && (
        <div className="list-section">
          <p className="list-hint">
            {q
              ? `${movieMatches.length} result${movieMatches.length !== 1 ? "s" : ""} in ${selectedActor?.name}'s filmography`
              : <>Pick a movie featuring <strong>{selectedActor?.name}</strong></>}
          </p>
          <input
            className="search-box"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search their whole filmography…"
          />
          {q && movieMatches.length === 0 && (
            <p className="list-hint">No movie in this filmography matches "{query}"</p>
          )}
          <div className="item-list">
            {moviesVisible.map((movie) => (
              <button
                key={movie.id}
                className={`item-btn ${usedMovieIds.has(movie.id) ? "used" : ""} ${movie.id === DAILY_PUZZLE.movieB.id ? "target" : ""}`}
                onClick={() => pickMovie(movie)}
                disabled={usedMovieIds.has(movie.id)}
              >
                {movie.poster_path ? (
                  <img
                    className="movie-thumb"
                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                    alt={movie.title}
                  />
                ) : (
                  <div className="movie-thumb-placeholder">🎬</div>
                )}
                <div className="item-info">
                  <span className="item-name">{movie.title}</span>
                  <span className="item-sub">{movie.release_date?.slice(0, 4)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
