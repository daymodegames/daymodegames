import { Link } from "react-router-dom";
import "./lab.css";

// Every experiment is one folder inside src/lab/experiments/
// with an Experiment.jsx file. This page finds them automatically.
const TITLES = {
  // folder name (as written in the filesystem) -> friendly name
  "01-coin-streak": "Coin Streak",
};

const experiments = import.meta.glob("./experiments/*/Experiment.jsx");

export default function Lab() {
  const slugs = Object.keys(experiments).map((path) =>
    path.replace("./experiments/", "").replace("/Experiment.jsx", "")
  );

  return (
    <main className="lab">
      <p className="kicker">🧪 THE LAB</p>
      <h1>Experiments only. May explode.</h1>
      <p className="lab-sub">
        Prototypes live here before they earn a real spot on the site.
        Nothing is finished. Everything might break. That's the point.
      </p>

      <div className="lab-list">
        {slugs.map((slug) => (
          <Link key={slug} to={`/lab/${slug}`} className="lab-card">
            <span className="lab-num">{slug.split("-")[0]}</span>
            <span className="lab-name">{TITLES[slug] || slug}</span>
            <span className="lab-open">→</span>
          </Link>
        ))}
      </div>

      <Link className="back-link" to="/">← Back to the games</Link>
    </main>
  );
}
