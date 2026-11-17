import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import FiveDegrees from "./games/five-degrees/Game.jsx";
import MiniMurder from "./pages/MiniMurder.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/five-degrees" element={<FiveDegrees />} />
      <Route path="/mini-murder" element={<MiniMurder />} />
    </Routes>
  );
}
