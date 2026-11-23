import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import FiveDegrees from "./games/five-degrees/Game.jsx";
import MiniMurder from "./pages/MiniMurder.jsx";
import Rpg from "./pages/Rpg.jsx";
import Support from "./pages/Support.jsx";
import Lab from "./lab/Lab.jsx";

// One experiment = one folder inside src/lab/experiments/ with an Experiment.jsx
const experimentModules = import.meta.glob("./lab/experiments/*/Experiment.jsx");

const lazyExperiments = Object.fromEntries(
  Object.entries(experimentModules).map(([path, load]) => [
    path.replace("./lab/experiments/", "").replace("/Experiment.jsx", ""),
    lazy(load),
  ])
);

function LabExperiment({ children }) {
  return <Suspense fallback={<div className="loading">Loading experiment…</div>}>{children}</Suspense>;
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/five-degrees" element={<FiveDegrees />} />
        <Route path="/mini-murder" element={<MiniMurder />} />
        <Route path="/rpg" element={<Rpg />} />
        <Route path="/support" element={<Support />} />
        <Route path="/lab" element={<Lab />} />
        {Object.entries(lazyExperiments).map(([slug, Experiment]) => (
          <Route
            key={slug}
            path={`/lab/${slug}`}
            element={
              <LabExperiment>
                <Experiment />
              </LabExperiment>
            }
          />
        ))}
      </Routes>
    </>
  );
}
