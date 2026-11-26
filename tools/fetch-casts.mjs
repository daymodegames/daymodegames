#!/usr/bin/env node
// tools/fetch-casts.mjs
//
// Fetches the top-10 billed cast for every movie in the Five Degrees
// pools and writes casts.json (input data for generate-calendar.mjs).
// Rerun this if the movie pools change.
//
// Usage: TMDB_KEY=your_key node tools/fetch-casts.mjs

import fs from "fs";
const KEY = process.env.TMDB_KEY;
if (!KEY) { console.error("Set TMDB_KEY env var"); process.exit(1); }

const movies = [
  // LEGENDS (pre-2000)
  238,240,278,13,680,769,603,550,11,1891,1892,597,862,424,329,812,62,562,218,280,105,8587,771,497,578,348,620,557,274,1366,601,602,137,115,37165,
  // MODERN (2000+)
  155,272,49026,24428,99861,299536,1726,118340,120,121,122,27205,68718,12,808,129,324857,109445,98,19995,157336,293660,245891,1422,671,70160,22,76341
];

const casts = {};
async function fetchOne(id) {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${KEY}`);
  if (!res.ok) throw new Error(`movie ${id}: HTTP ${res.status}`);
  const data = await res.json();
  casts[id] = data.cast.slice(0, 10).map(c => ({ id: c.id, name: c.name }));
}
const queue = [...movies];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) { const id = queue.shift(); await fetchOne(id); }
}));
fs.writeFileSync("casts.json", JSON.stringify(casts, null, 1));
console.log("fetched", Object.keys(casts).length, "movies -> casts.json");
