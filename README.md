# BreastAware

Cloudflare Worker (`worker.js`, serves `public/` as static assets + `/api/submit`) + Cloudflare D1 database.
Triage rules live in `public/logic.js`, shared by the browser and the API. Test: `node test.mjs`.

## Deploy to Cloudflare (Node 22+ for latest wrangler, or use `npx wrangler@3` on Node 20)

```bash
npx wrangler login
npx wrangler d1 create breastaware-db          # copy the database_id into wrangler.toml
npx wrangler d1 execute breastaware-db --remote --file=schema.sql
npx wrangler deploy                            # → https://breastaware.<account>.workers.dev
```

Or connect the GitHub repo in Workers & Pages → every push auto-deploys (deploy command: `npx wrangler deploy`).

## Local dev

```bash
npx wrangler d1 execute breastaware-db --local --file=schema.sql
npx wrangler dev                               # http://localhost:8787
```

## Read the data

```bash
npx wrangler d1 execute breastaware-db --remote --command \
  "SELECT pathway, COUNT(*) n FROM submissions GROUP BY pathway"
npx wrangler d1 execute breastaware-db --remote --command \
  "SELECT json_extract(answers,'$.q1') age, pathway, COUNT(*) n FROM submissions GROUP BY 1,2"
```

Or the Cloudflare dashboard → Storage & Databases → D1 → breastaware-db → Console.

## Pathway rules (`assess` in `public/logic.js`)

- 🔴 red: any "Yes" to a symptom question (Q3–Q9)
- 🟡 yellow: "Not sure" on a symptom, any "Yes" risk factor (Q10–Q13), age 40+ with screening never / >2 years ago, or previous diagnosis (Q2)
- 🟢 green: otherwise
