import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import FiveDegrees from "./games/five-degrees/Game.jsx";
import MiniMurder from "./pages/MiniMurder.jsx";
import Rpg from "./pages/Rpg.jsx";
import Support from "./pages/Support.jsx";

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
      </Routes>
    </>
  );
}
