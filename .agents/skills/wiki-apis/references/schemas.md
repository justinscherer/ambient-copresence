# API schemas — REST + Action

Both Wikimedia API surfaces publish machine-readable descriptions of
themselves. This skill ships snapshots of those (alongside the script
that fetches them) under `assets/snapshots/`, so you (and AI agents
using this skill) can look up endpoints, parameters, and return shapes
offline.

## What's snapshotted

### REST API — multiple OpenAPI bundles

MediaWiki exposes **`GET /api/rest_v1/?spec`** on each wiki host, but
**each deployment publishes a different path set**. There is no single
“the REST API” document — compare path counts across hosts.

The default snapshotter run pulls **four** OpenAPI 2.0 files (Swagger):

| File | Source URL |
| --- | --- |
| `rest-api-spec.wikipedia.json` | `https://en.wikipedia.org/api/rest_v1/?spec` |
| `rest-api-spec.wikimedia-org.json` | `https://wikimedia.org/api/rest_v1/?spec` |
| `rest-api-spec.commons.json` | `https://commons.wikimedia.org/api/rest_v1/?spec` |
| `rest-api-spec.wikidata.json` | `https://www.wikidata.org/api/rest_v1/?spec` |

**Analytics / pageviews:** Metrics live under
`https://wikimedia.org/api/rest_v1/metrics/…`, but the **root**
`wikimedia.org/api/rest_v1/?spec` document often **does not enumerate**
`/metrics/*` routes (upstream bundles them separately — see the
[Wikimedia Analytics API](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/documentation/getting-started.html)).
Treat `rest-api-spec.wikimedia-org.json` as describing what that host's
OpenAPI exposes at `?spec`, not as a guarantee that every production
route appears there.

**MediaWiki Core REST (`/w/rest.php/`):** If you need extension-mounted routes or
Core REST transforms/editing flows, they are documented separately from the
bundles above. OpenAPI discovery often starts from `https://en.wikipedia.org/w/rest.php/specs/v0/module/-`
(vendor-specific — not snapshotted here by default). See [`references/rest.md`](rest.md).

### Action API — curated `paraminfo`

| File | Source URL | Format |
| --- | --- | --- |
| `action-api-paraminfo.json` | `https://en.wikipedia.org/w/api.php?action=paraminfo&modules=…&format=json` | Action API `paraminfo` for a curated module list |

The Action API snapshot is **scoped** to a curated list of modules — the
full module list is enormous (200+ modules) and most of them aren't
relevant to a frontend. The currently-snapshotted modules:

- Top-level: `main`, `query`, `opensearch`, `parse`, `edit`, `login`.
- `query` submodules (qualified as `query+<name>`): `info`, `extracts`,
  `pageprops`, `pageimages`, `imageinfo`, `search`, `categorymembers`,
  `allpages`, `geosearch`, `languagelinks`, `tokens`, `siteinfo`.

If you need a module that isn't in the list, edit
`assets/fetch_schemas.sh` and add it to the `MODULES` variable. Submodules
of `query` (props, lists, generators) need the qualified `query+<name>`
form, not just `<name>`.

## How to refresh

```bash
bash .agents/skills/wiki-apis/assets/fetch_schemas.sh
```

This writes the four REST OpenAPI files plus `action-api-paraminfo.json`
into `.agents/skills/wiki-apis/assets/snapshots/`. Re-run the script when:

- An endpoint you're using changed shape (the Wikimedia REST API is
  versioned, but minor field changes happen).
- You added a new Action API module to the script's `modules=` list.
- A few months have passed and you want a fresh snapshot.

## Reading the REST specs

Use the Wikipedia bundle for typical article endpoints (`/page/html`,
`/page/summary`, …); use the Wikidata bundle when working with entity IDs
and Wikibase-shaped routes; use Commons when your prototype touches that
minimal surface.

```bash
SPEC=.agents/skills/wiki-apis/assets/snapshots/rest-api-spec.wikipedia.json

# Top-level info
jq '{ basePath, host, info: .info }' "$SPEC"

# All endpoint paths (note: path keys include leading slash)
jq '.paths | keys' "$SPEC"

# The shape of a single endpoint
jq '.paths."/page/summary/{title}"' "$SPEC"
```

Compare path lists across deployments:

```bash
for f in rest-api-spec.wikipedia.json rest-api-spec.wikimedia-org.json \
         rest-api-spec.commons.json rest-api-spec.wikidata.json; do
  echo "=== $f"
  jq '.paths | keys | length' ".agents/skills/wiki-apis/assets/snapshots/$f"
done
```

The OpenAPI spec contains parameters, response codes, and example
responses for every **listed** REST endpoint — use `jq` (or any OpenAPI
viewer) to navigate it.

## Reading the Action API `paraminfo`

```bash
# Names of the modules in the snapshot
jq '.paraminfo.modules[].name' .agents/skills/wiki-apis/assets/snapshots/action-api-paraminfo.json

# Parameters of the `opensearch` module
jq '.paraminfo.modules[] | select(.name == "opensearch") | .parameters' \
  .agents/skills/wiki-apis/assets/snapshots/action-api-paraminfo.json

# All `query` submodules (props, lists, generators)
jq '.paraminfo.modules[] | select(.name == "query") | .parameters[] | select(.name == "prop")' \
  .agents/skills/wiki-apis/assets/snapshots/action-api-paraminfo.json
```

`paraminfo` includes parameter names, types, defaults, allowed values,
deprecation flags, and (often) example values. It's the canonical
description of the Action API surface.

## Why snapshots, not live lookups?

- **Offline / sandboxed agents.** Some coding agents can't reach the
  network. The committed snapshots let them still answer "does the
  REST API have an endpoint for X?" without a fetch (subject to what's
  actually listed in each bundle — see analytics caveat above).
- **Reproducibility.** Two contributors who clone the repo see the same
  API description.
- **Speed.** `jq` over a local file is instant; the live `paraminfo`
  endpoint is a few hundred KB and requires a round-trip.

The tradeoff is staleness: re-run the script if you suspect the live API
has moved on.

## Wiki-specific Action API snapshots

The default run uses **English Wikipedia** for Action API `paraminfo`
(the module list matches most content wikis). If you need **paraminfo for
another host's modules** (e.g. Wikidata-only actions), pass host and a
subdirectory name; this writes **one** REST `?spec` plus **one**
`action-api-paraminfo.json` under that subdirectory (it does not replace
the four-file default bundle):

```bash
bash .agents/skills/wiki-apis/assets/fetch_schemas.sh www.wikidata.org wikidata
# → assets/snapshots/wikidata/rest-api-spec.json
#    assets/snapshots/wikidata/action-api-paraminfo.json
```

Note: the default snapshot set **already includes**
`rest-api-spec.wikidata.json` at the top level; the subdirectory run is
for Action API shapes that differ by wiki, not for duplicating the REST
OpenAPI unless you want an isolated pair of files.

## See also

- [`references/rest.md`](rest.md) — curated, prose-form reference for
  the most-used REST endpoints.
- [`references/action.md`](action.md) — same for Action API.
- [`references/etiquette.md`](etiquette.md) — read before any fetch.
- [`references/protowiki-integration.md`](protowiki-integration.md) — how
  these snapshots and the script plug into the ProtoWiki repo.
