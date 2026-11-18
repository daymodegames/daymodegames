import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./hub.css";

// Every .md file in src/devlog/ is one devlog entry.
// Publish a new one by adding "001-some-title.md" to that folder on GitHub.
const modules = import.meta.glob("../devlog/*.md", { query: "?raw", import: "default" });

// Tiny markdown renderer (headings, bold, italic, lists, paragraphs)
function renderMarkdown(md) {
  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

  const html = [];
  let inList = false;
  for (const raw of md.split("\n")) {
    const line = raw.trimEnd();
    if (line.startsWith("- ")) {
      if (!inList) { html.push("<ul>"); inList = true; }
      html.push("<li>" + inline(line.slice(2)) + "</li>");
    } else {
      if (inList) { html.push("</ul>"); inList = false; }
      if (line.startsWith("### ")) html.push("<h4>" + inline(line.slice(4)) + "</h4>");
      else if (line.startsWith("## ")) html.push("<h3>" + inline(line.slice(3)) + "</h3>");
      else if (line.startsWith("# ")) continue;
      else if (line.trim() === "") continue;
      else html.push("<p>" + inline(line) + "</p>");
    }
  }
  if (inList) html.push("</ul>");
  return html.join("");
}

export default function Rpg() {
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    async function loadAll() {
      const loaded = await Promise.all(
        Object.entries(modules)
          .map(([path, load]) => ({
            num: (path.match(/(\d{3})/) || [])[0] || "000",
            load,
          }))
          .sort((a, b) => b.num.localeCompare(a.num))
          .map(async (e) => {
            const md = await e.load();
            const title = (md.match(/^# (.+)$/m) || [])[1] || "Untitled entry";
            return { num: e.num, title, body: renderMarkdown(md) };
          })
      );
      setEntries(loaded);
    }
    loadAll();
  }, []);

  return (
    <main className="home dark-page">
      <section className="hero">
        <p className="kicker-dark">THE BIG ONE</p>
        <h1>Working title: none yet.</h1>
        <p className="hero-sub">
          We make two-minute daily games. So naturally, we're also making an RPG.
          This is the devlog: what we're building, why, and how it's going.
          Warts, wins, and rewrites included. Story teasers when they're ready.
        </p>
      </section>

      <section className="lineup">
        <h2>Entries</h2>
        {entries === null && (
          <article className="entry">
            <span className="entry-num">···</span>
            <p>Loading entries…</p>
          </article>
        )}
        {entries !== null && entries.map((e) => (
          <article key={e.num} className="entry">
            <span className="entry-num">ENTRY {e.num}</span>
            <h3>{e.title}</h3>
            <div className="entry-body" dangerouslySetInnerHTML={{ __html: e.body }} />
          </article>
        ))}
        {entries !== null && entries.length === 0 && (
          <article className="entry">
            <span className="entry-num">000</span>
            <h3>No entries yet</h3>
            <p>The devlog starts the moment the first entry lands.</p>
          </article>
        )}
      </section>

      <div className="back-row">
        <Link className="back-link" to="/">← Back to the games</Link>
      </div>
    </main>
  );
}
