# BreastAware

Static site (`public/`) + one Pages Function (`functions/api/submit.js`) + Cloudflare D1 database.
Triage rules live in `public/logic.js`, shared by the browser and the API. Test: `node test.mjs`.

## Deploy to Cloudflare (Node 22+ for latest wrangler, or use `npx wrangler@3` on Node 20)

```bash
npx wrangler login
npx wrangler d1 create breastaware-db          # copy the database_id into wrangler.toml
npx wrangler d1 execute breastaware-db --remote --file=schema.sql
npx wrangler pages project create breastaware --production-branch main
npx wrangler pages deploy                      # → https://breastaware.pages.dev
```

The D1 binding (`DB`) is read from `wrangler.toml` on deploy.

## Local dev

```bash
npx wrangler d1 execute breastaware-db --local --file=schema.sql
npx wrangler pages dev                         # http://localhost:8788
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
