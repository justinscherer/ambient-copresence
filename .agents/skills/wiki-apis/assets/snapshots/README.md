# Wiki API schema snapshots

These files are committed snapshots of Wikimedia API schemas. They're
here so AI agents (and humans) can answer "does the API have an endpoint
for X?" without hitting the network.

## REST API — multiple OpenAPI (`?spec`) bundles

MediaWiki serves `/api/rest_v1/?spec` on each wiki host, but **each
deployment publishes a different route set**. One file is not enough:
for example `en.wikipedia.org` exposes article-focused routes;
`www.wikidata.org` adds entity-aware paths; `commons.wikimedia.org` is a
minimal surface; `wikimedia.org` is a separate deployment (analytics and
shared infrastructure share this host).

| File | Source |
| --- | --- |
| `rest-api-spec.wikipedia.json` | `https://en.wikipedia.org/api/rest_v1/?spec` |
| `rest-api-spec.wikimedia-org.json` | `https://wikimedia.org/api/rest_v1/?spec` |
| `rest-api-spec.commons.json` | `https://commons.wikimedia.org/api/rest_v1/?spec` |
| `rest-api-spec.wikidata.json` | `https://www.wikidata.org/api/rest_v1/?spec` |

**Analytics / pageviews caveat:** Production serves metrics under
`https://wikimedia.org/api/rest_v1/metrics/…`, but the **root**
`wikimedia.org/api/rest_v1/?spec` bundle often does **not** list those
paths (they are documented separately as the [Wikimedia Analytics
API](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/documentation/getting-started.html)).
Do not assume `rest-api-spec.wikimedia-org.json` is exhaustive for
metrics.

## Action API

| File | What it is |
| --- | --- |
| `action-api-paraminfo.json` | Action API `paraminfo` for a curated module list. Source: `https://en.wikipedia.org/w/api.php?action=paraminfo&modules=…&format=json`. |

## Refreshing

```bash
bash ../fetch_schemas.sh
```

(See `../../references/schemas.md` for navigating the files.)
