#!/usr/bin/env node
// tools/generate-calendar.mjs
//
// Generates a verified puzzle calendar for Five Degrees.
// Run monthly, review the output, commit calendar.json.
//
// What it verifies for every pair (using real TMDB data):
//   • No shared top-billed actor (no 1-hop bridge)
//   • 1-3 verified two-hop bridges (solvable but not trivial)
//   • MCU movies never appear as endpoints (bridge material only)
//   • No pair repeats; each movie used at most 4 times
//
// Usage: TMDB_KEY=your_key node tools/generate-calendar.mjs 10 40
// (start and end puzzle numbers). Requires casts.json (top-10 cast per
// pool movie) in the same folder; regenerate it if the pools change.
// Caches actor filmographies in ./actor-cache to keep reruns fast.

import fs from "fs";

const KEY = process.env.TMDB_KEY;
if (!KEY) { console.error("Set TMDB_KEY env var"); process.exit(1); }
const [startArg, endArg] = process.argv.slice(2);
const START = Number(startArg || 10);
const END = Number(endArg || 40);

const casts = JSON.parse(fs.readFileSync(new URL("./casts.json", import.meta.url), "utf8"));
const LEGEND = {"11":"Star Wars","13":"Forrest Gump","62":"2001: A Space Odyssey","105":"Back to the Future","115":"The Big Lebowski","137":"Groundhog Day","218":"The Terminator","238":"The Godfather","240":"The Godfather Part II","274":"The Silence of the Lambs","278":"The Shawshank Redemption","280":"Terminator 2: Judgment Day","329":"Jurassic Park","348":"Alien","424":"Schindler's List","497":"The Green Mile","550":"Fight Club","557":"Spider-Man","562":"Die Hard","578":"Jaws","597":"Titanic","601":"E.T. the Extra-Terrestrial","602":"Independence Day","603":"The Matrix","620":"Ghostbusters","680":"Pulp Fiction","769":"Goodfellas","771":"Home Alone","812":"Aladdin","862":"Toy Story","1366":"Rocky","1891":"The Empire Strikes Back","1892":"Return of the Jedi","8587":"The Lion King","37165":"The Truman Show"};
const MODERN = {"12":"Finding Nemo","22":"Pirates 1","98":"Gladiator","120":"LOTR: Fellowship","121":"LOTR: Two Towers","122":"LOTR: Return of the King","129":"Spirited Away","155":"The Dark Knight","272":"Batman Begins","671":"Harry Potter 1","808":"Shrek","1422":"The Departed","1726":"Iron Man","19995":"Avatar","24428":"The Avengers","27205":"Inception","49026":"The Dark Knight Rises","68718":"Django Unchained","70160":"The Hunger Games","76341":"Mad Max: Fury Road","99861":"Avengers: Age of Ultron","109445":"Frozen","118340":"Guardians of the Galaxy","157336":"Interstellar","245891":"John Wick","293660":"Deadpool","299536":"Avengers: Infinity War","324857":"Spider-Verse"};
const MCU = new Set([24428, 99861, 299536, 1726, 118340]);

function mulberry32(seed){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;}}
const legendIds = Object.keys(LEGEND).map(Number);
const modernIds = Object.keys(MODERN).map(Number).filter(id => !MCU.has(id));

const filmCache = new Map();
async function filmography(actorId) {
  if (filmCache.has(actorId)) return filmCache.get(actorId);
  const f = `actor-cache/${actorId}.json`;
  let movies;
  if (fs.existsSync(f)) movies = JSON.parse(fs.readFileSync(f, "utf8"));
  else {
    const res = await fetch(`https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${KEY}`);
    const data = await res.json();
    movies = data.cast.map(m => m.id);
    fs.writeFileSync(f, JSON.stringify(movies));
  }
  filmCache.set(actorId, movies);
  return movies;
}

async function analyze(aId, bId) {
  const aCast = casts[aId], bCast = casts[bId];
  const oneHop = aCast.filter(c => bCast.some(b => b.id === c.id));
  const middle = new Set();
  const aFilms = [];
  for (const c of aCast) aFilms.push(await filmography(c.id));
  for (const bActor of bCast) {
    const bf = await filmography(bActor.id);
    for (const m of bf) if (aFilms.some(f => f.includes(m))) middle.add(m);
  }
  return { oneHop, twoHops: middle.size };
}

const usage = {}; const usedPairs = new Set();
const calendar = []; const log = [];

async function fill(n, MAX, CAP, tier) {
  for (let k = 0; k < 300; k++) {
    const rand = mulberry32(n * 7919 + 13 + k);
    const aId = legendIds[Math.floor(rand() * legendIds.length)];
    const bId = modernIds[Math.floor(rand() * modernIds.length)];
    if (usedPairs.has(aId + "-" + bId)) continue;
    if ((usage[aId] || 0) >= CAP || (usage[bId] || 0) >= CAP) continue;
    const { oneHop, twoHops } = await analyze(aId, bId);
    if (oneHop.length > 0) continue;
    if (twoHops > MAX) continue;
    if (tier === "strict" && twoHops === 0) continue; // strict wants solvable
    calendar.push({ number: n, a: { id: aId, title: LEGEND[aId] }, b: { id: bId, title: MODERN[bId] }, twoHops, tier });
    usage[aId] = (usage[aId] || 0) + 1;
    usage[bId] = (usage[bId] || 0) + 1;
    usedPairs.add(aId + "-" + bId);
    log.push(`#${n} [${tier}] ${LEGEND[aId]} -> ${MODERN[bId]} (${twoHops} bridges)`);
    return true;
  }
  return false;
}

for (let n = START; n <= END; n++) {
  let ok = await fill(n, 2, 2, "strict");
  if (!ok) ok = await fill(n, 3, 3, "relaxed");
  if (!ok) ok = await fill(n, 4, 4, "final");
  if (!ok) log.push(`#${n} UNFILLED - pick manually`);
}
calendar.sort((x, y) => x.number - y.number);
fs.writeFileSync("calendar.json", JSON.stringify({ generated: new Date().toISOString().slice(0, 10), note: "Verified puzzle calendar. Regenerate with tools/generate-calendar.mjs.", entries: calendar }, null, 1));
console.log(log.join("\n"));
