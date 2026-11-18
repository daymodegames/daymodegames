import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="logo-link">
        <img src="/Daymode logo.png" alt="Daymode Games" className="logo-img" />
      </Link>
      <nav className="site-nav">
        <Link to="/">Games</Link>
        <Link to="/rpg">The Big One</Link>
        <Link to="/support">Support</Link>
      </nav>
    </header>
  );
}
