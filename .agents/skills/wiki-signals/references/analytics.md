# Analytics signals

## 1) Article views

This endpoint returns a time series of page view counts for a specific article.

### Documentation

- [Wikimedia Analytics API: page view analytics reference](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/page-views.html)
- [Wikimedia Analytics API: page metrics examples](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/examples/page-metrics.html)

### Endpoint

`https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/{project}/{access}/{agent}/{article}/{granularity}/{start}/{end}`

### Method

`GET`

### Request shape

Path parameters:

- `project` (example: `en.wikipedia.org`)
- `access` (example: `all-access`)
- `agent` (example: `all-agents`)
- `article` (example: `Jupiter`)
- `granularity` (`daily` or `monthly`)
- `start` (example: `20260415`)
- `end` (example: `20260421`)

### Example

#### Request

```bash
curl -sS "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/all-agents/Jupiter/daily/20260415/20260420" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"items": [
		{
			"project": "en.wikipedia",
			"article": "Jupiter",
			"granularity": "daily",
			"timestamp": "2026041500",
			"access": "all-access",
			"agent": "all-agents",
			"views": 7289
		},
		{
			"project": "en.wikipedia",
			"article": "Jupiter",
			"granularity": "daily",
			"timestamp": "2026041600",
			"access": "all-access",
			"agent": "all-agents",
			"views": 7377
		},
		{
			"project": "en.wikipedia",
			"article": "Jupiter",
			"granularity": "daily",
			"timestamp": "2026041700",
			"access": "all-access",
			"agent": "all-agents",
			"views": 6939
		},
		{
			"project": "en.wikipedia",
			"article": "Jupiter",
			"granularity": "daily",
			"timestamp": "2026041800",
			"access": "all-access",
			"agent": "all-agents",
			"views": 7268
		},
		{
			"project": "en.wikipedia",
			"article": "Jupiter",
			"granularity": "daily",
			"timestamp": "2026041900",
			"access": "all-access",
			"agent": "all-agents",
			"views": 7304
		},
		{
			"project": "en.wikipedia",
			"article": "Jupiter",
			"granularity": "daily",
			"timestamp": "2026042000",
			"access": "all-access",
			"agent": "all-agents",
			"views": 7719
		}
	]
}
```

### Availability

Publicly available via Wikimedia's Analytics API in production.

Broad Wikimedia project coverage through AQS project identifiers (for example `en.wikipedia.org`).

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 2) Most viewed articles

This endpoint returns ranked most-viewed pages for a project on a specific day (the **full** AQS daily leaderboard on `wikimedia.org`). For the **shorter, app-oriented “most read” list** (same day’s view numbers where rows overlap, but with some high-traffic special pages omitted), see **section 6** (`mostread` inside `feed/featured` on a wiki).

### Documentation

- [Wikimedia Analytics API: page view analytics reference](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/page-views.html)

### Endpoint

`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/{project}/{access}/{year}/{month}/{day}`

### Method

`GET`

### Request shape

Path parameters:

- `project` (example: `en.wikipedia.org`)
- `access` (example: `all-access`)
- `year` (example: `2024`)
- `month` (example: `12`)
- `day` (example: `15`)

### Example

#### Request

```bash
curl -sS "https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/2024/12/15" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"items": [
		{
			"project": "en.wikipedia",
			"access": "all-access",
			"year": "2024",
			"month": "12",
			"day": "15",
			"articles": [
				{
					"article": "Main_Page",
					"views": 4286084,
					"rank": 1
				},
				{
					"article": "Special:Search",
					"views": 1020306,
					"rank": 2
				},
				{
					"article": "Wikipedia:Featured_pictures",
					"views": 560816,
					"rank": 3
				},
				{
					"article": "Pushpa_2:_The_Rule",
					"views": 430265,
					"rank": 4
				},
				{
					"article": "Travis_Hunter",
					"views": 313291,
					"rank": 5
				},
				{
					"article": "Zakir_Hussain_(musician)",
					"views": 240823,
					"rank": 6
				},
				{
					"article": "Carry-On",
					"views": 229481,
					"rank": 7
				},
				{
					"article": "List_of_highest-grossing_Indian_films",
					"views": 211987,
					"rank": 8
				}
				// etc...
			]
		}
	]
}
```

### Availability

Publicly available via Wikimedia's Analytics API in production.

Broad Wikimedia project coverage through AQS project identifiers.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 3) Most edited articles

This endpoint returns the top content pages by **number of edits** in a given **month** on a project. It answers “what got edited a lot” in aggregate (not the same as pageviews).

### Documentation

- [Edit analytics (includes “Edited pages” family)](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/edits.html)
- [Wikimedia Analytics API overview](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/)

### Endpoint

`https://wikimedia.org/api/rest_v1/metrics/edited-pages/top-by-edits/{project}/{editor-type}/{page-type}/{year}/{month}/{day}`

### Method

`GET`

### Request shape

Path parameters (see live spec for allowed values):

- `project` (example: `en.wikipedia.org`)
- `editor-type` (example: `all-editor-types`)
- `page-type` (example: `content` for article namespace style content)
- `year` (example: `2016`)
- `month` (example: `08`)
- `day` — use `all-days` for the **entire month**

### Example

#### Request

```bash
curl -sS "https://wikimedia.org/api/rest_v1/metrics/edited-pages/top-by-edits/en.wikipedia.org/all-editor-types/content/2016/08/all-days" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response (excerpt)

```json
{
	"items": [
		{
			"project": "en.wikipedia",
			"editor-type": "all-editor-types",
			"page-type": "content",
			"granularity": "monthly",
			"results": [
				{
					"timestamp": "2016-08-01T00:00:00.000Z",
					"top": [
						{
							"page_title": "Great_Britain_at_the_2016_Summer_Olympics",
							"edits": 1578,
							"rank": 1
						},
						{
							"page_title": "2016_Summer_Olympics_medal_table",
							"edits": 1500,
							"rank": 2
						},
						{
							"page_title": "United_States_at_the_2016_Summer_Olympics",
							"edits": 1444,
							"rank": 3
						}
						// etc...
					]
				}
			]
		}
	]
}
```

### Availability

Publicly available via Wikimedia’s Analytics API. **Edited-pages** metrics **exclude** edits on redirects (per family documentation). Data is **not** real-time; expect **delay** between live editing and published aggregates (often on the order of days—see official notes for this endpoint family).

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 4) Article edit counts

This endpoint returns a **daily** time series of **edit counts** for a **single page title** on a project. **Includes** edits on redirects (per “edits” family documentation—contrast with edited-pages family above).

### Documentation

- [Edit analytics — edits to a page](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/edits.html)

### Endpoint

`https://wikimedia.org/api/rest_v1/metrics/edits/per-page/{project}/{page_title}/{editor-type}/daily/{start}/{end}`

### Method

`GET`

### Request shape

Path parameters:

- `project` (example: `en.wikipedia` — format per [REST spec](https://wikimedia.org/api/rest_v1/?doc) for the Wikimedia `metrics` module; this example matches live responses)
- `page_title` (example: `Earth` — must be URL-escaped, e.g. `Barack%2B_Obama` when needed)
- `editor-type` (example: `all-editor-types`)
- `start` / `end` — per spec, often as `YYYYMMDD00` to `YYYYMMDD00` for daily (example: `2024040100` to `2024041000`)

### Example

#### Request

```bash
curl -sS "https://wikimedia.org/api/rest_v1/metrics/edits/per-page/en.wikipedia/Earth/all-editor-types/daily/2024040100/2024041000" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"items": [
		{
			"project": "en.wikipedia",
			"editor-type": "all-editor-types",
			"page-title": "Earth",
			"granularity": "daily",
			"results": [
				{
					"timestamp": "2024-04-02T00:00:00.000Z",
					"edits": 1
				},
				{
					"timestamp": "2024-04-04T00:00:00.000Z",
					"edits": 2
				},
				{
					"timestamp": "2024-04-05T00:00:00.000Z",
					"edits": 4
				},
				{
					"timestamp": "2024-04-06T00:00:00.000Z",
					"edits": 1
				},
				{
					"timestamp": "2024-04-07T00:00:00.000Z",
					"edits": 2
				},
				{
					"timestamp": "2024-04-08T00:00:00.000Z",
					"edits": 1
				}
			]
		}
	]
}
```

_Unmodified live response for the `curl` line above. Days with zero edits in the range may be omitted from `results`._

### Availability

Publicly available via Wikimedia’s Analytics API. Use for **prototyping** “edit activity on this title over a window,” not for low-latency “live” counters.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 5) Global edit counts

This endpoint returns **daily edit counts** for a **whole project** (e.g. all content-namespace edits for English Wikipedia) over a time range. Useful for dashboards or **normalization** (e.g. per-article signal vs wiki-wide busyness), not for ranking individual articles by themselves.

### Documentation

- [Edit analytics — number of edits](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/edits.html)
- [Project metrics examples](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/examples/project-metrics.html)

### Endpoint

`https://wikimedia.org/api/rest_v1/metrics/edits/aggregate/{project}/{editor-type}/{page-type}/daily/{start}/{end}`

### Method

`GET`

### Request shape

Path parameters:

- `project` (example: `en.wikipedia.org`)
- `editor-type` (example: `all-editor-types`)
- `page-type` (example: `content`)
- `start` / `end` (example: `2024040100` to `2024041000`)

### Example

#### Request

```bash
curl -sS "https://wikimedia.org/api/rest_v1/metrics/edits/aggregate/en.wikipedia.org/all-editor-types/content/daily/2024040100/2024041000" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response (excerpt)

Unmodified `results` for the same date range as the request; the array continues through `2024-04-09` for this example.

```json
{
	"items": [
		{
			"project": "en.wikipedia",
			"editor-type": "all-editor-types",
			"page-type": "content",
			"granularity": "daily",
			"results": [
				{
					"timestamp": "2024-04-01T00:00:00.000Z",
					"edits": 128772
				},
				{
					"timestamp": "2024-04-02T00:00:00.000Z",
					"edits": 117261
				},
				{
					"timestamp": "2024-04-03T00:00:00.000Z",
					"edits": 107243
				},
				{
					"timestamp": "2024-04-04T00:00:00.000Z",
					"edits": 114393
				},
				{
					"timestamp": "2024-04-05T00:00:00.000Z",
					"edits": 114424
				},
				{
					"timestamp": "2024-04-06T00:00:00.000Z",
					"edits": 117315
				},
				{
					"timestamp": "2024-04-07T00:00:00.000Z",
					"edits": 120656
				},
				{
					"timestamp": "2024-04-08T00:00:00.000Z",
					"edits": 113465
				},
				{
					"timestamp": "2024-04-09T00:00:00.000Z",
					"edits": 121074
				}
			]
		}
	]
}
```

### Availability

Publicly available. Same **latency** caveats as other AQS metrics; check stability labels in the [REST API documentation](https://wikimedia.org/api/rest_v1/?doc) for the specific path.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 6) Most read articles

To show the same **yesterday’s top read**-style list that powers cards in the official apps’ **Explore** experience, use the aggregated Wikifeeds response and read the **`mostread`** object.

The full `feed/featured` bundle is also documented in [`curation.md`](./curation.md).

### Documentation

- [Wikifeeds](https://www.mediawiki.org/wiki/Wikifeeds) (aggregated `feed/featured` includes the microservice that backs “most read”)
- [Wikitech: Wikifeeds (public paths)](https://wikitech.wikimedia.org/wiki/Wikifeeds#Overview)

### Endpoint

`https://{wiki}/api/rest_v1/feed/featured/{yyyy}/{mm}/{dd}`

(Example host: `en.wikipedia.org`.) The **`mostread`** field sits inside the JSON body; the **`date`** field inside **`mostread`** is the **UTC** day the view figures refer to (typically the **previous** calendar day relative to the `featured` path’s date).

### Method

`GET`

### Request shape

Path parameters: `yyyy`, `mm`, `dd` (zero-padded; earliest supported year is **2016** per [Wikifeeds](https://www.mediawiki.org/wiki/Wikifeeds)). Use the [User-Agent](https://www.mediawiki.org/wiki/API:Etiquette) policy. Response: parse JSON, then `response.mostread` (when present—some wikis or days may omit it).

### Example

#### Request

```bash
curl -sS "https://en.wikipedia.org/api/rest_v1/feed/featured/2026/04/24" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response (excerpt: `mostread` only, trimmed)

```json
{
	"date": "2026-04-23Z",
	"articles": [
		{
			"title": "Nahui_Ollin",
			"views": 1171179,
			"rank": 2
		},
		{
			"title": "2026_Tamil_Nadu_Legislative_Assembly_election",
			"views": 355438,
			"rank": 4
		},
		{
			"title": "2021_Tamil_Nadu_Legislative_Assembly_election",
			"views": 257803,
			"rank": 6
		},
		{
			"title": "2026_West_Bengal_Legislative_Assembly_election",
			"views": 229632,
			"rank": 7
		},
		{
			"title": "Michael_(2026_film)",
			"views": 177083,
			"rank": 8
		}
		// etc...
	]
}
```

### Availability

Public on wikis that expose the [Wikifeeds](https://www.mediawiki.org/wiki/Wikifeeds) REST routes. Stability and field availability follow the `feed/featured` contract (see also [`curation.md`](./curation.md)). Not a substitute for the **AQS** definitions in **sections 1–2** when you need the official metrics API.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)
