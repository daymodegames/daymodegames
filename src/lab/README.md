# The Lab 🧪

Prototypes live here. Nothing here is finished. Everything here can break.

## Rules (they keep the sandbox safe)

1. **One experiment = one folder** inside `src/lab/experiments/`, named like `02-my-idea` (number, then kebab-case name).
2. Each folder contains exactly one `Experiment.jsx` file. The Lab index page finds it automatically.
3. **localStorage keys must be prefixed** `lab:<experiment-name>:` so experiments can never touch the real games' data.
4. Fetching is allowed only with public VITE_* environment variables (the TMDB key is already public in the client bundle). NEVER paste secret keys into lab code. No importing files outside src/lab/.
5. Nothing on the public site links here. Experiments are unlisted, reachable only by URL.
6. When an experiment is ready to become a real game, it graduates: a top-level folder, a route, a card on the homepage. Out of the lab, into production.
7. THE DRIFT RULE: the sandboxed Five Degrees copy is independent of the live game. Changes proven in the sandbox must be applied to the real src/games/five-degrees/ in a separate, reviewed commit before they go live.

## How to add your own experiment

1. In VS Code, duplicate `experiments/01-coin-streak` and rename it `02-your-idea`.
2. Open `Experiment.jsx`, delete the coin logic, keep the skeleton (the LAB RULES comments, the default export, the `<main className="lab">` wrapper).
3. Build the thing. Save.
4. Add a friendly name in `src/lab/Lab.jsx`, inside the `TITLES` object.
5. Commit & push. Visit `https://daymodegames.com/lab/02-your-idea`.

If you break an experiment, you break only that URL. The live games never notice.
