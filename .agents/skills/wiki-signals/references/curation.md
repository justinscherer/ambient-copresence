# Curation signals

## 1) Daily featured feed (aggregated)

This endpoint returns one JSON object for a calendar day, aggregating the same “curated of the day” data used in the official apps’ Explore feed (for example: today’s featured article, picture of the day, previous day’s most read, in the news, DYK, and a short on-this-day list when available); for a given date and project, the payload can also surface keys such as **`tfa`**, **`image`**, **`mostread`**, **`dyk`** (Did you know), embedded **`onthisday`**, and **`news`**, but the exact set depends on the wiki, language, and what the service can assemble—see the [Wikifeeds](https://www.mediawiki.org/wiki/Wikifeeds) page for documented core fields and support notes. For the full on-this-day data instead of the short list embedded in `feed/featured`, use **`feed/onthisday/…`** (for example **`all`** for every bucket, or **`selected`** for the curated short list).

### Documentation

- [Wikifeeds: feed/featured](https://www.mediawiki.org/wiki/Wikifeeds#%E2%80%A6%2Ffeed%2Ffeatured%2F%7Byyyy%7D%2F%7Bmm%7D%2F%7Bdd%7D)
- [Wikifeeds API](https://www.mediawiki.org/wiki/Wikifeeds_API) (see **Quick start** for an alternate **host** that serves the same featured payload by language: `https://api.wikimedia.org/feed/v1/wikipedia/{lang}/featured/…`).

### Endpoint

`https://en.wikipedia.org/api/rest_v1/feed/featured/{yyyy}/{mm}/{dd}`

(Same data path, different **service URL**: `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/{yyyy}/{mm}/{dd}`.)

### Method

`GET`

### Request shape

Path parameters:

- `yyyy` (four digits, earliest year supported: **2016**)
- `mm` (month, two digits, zero-padded)
- `dd` (day, two digits, zero-padded)

Optionally use another project host instead of `en.wikipedia.org` (for example `de.wikipedia.org`) if that wiki exposes the route.

### Example

#### Request

```bash
curl -sS "https://en.wikipedia.org/api/rest_v1/feed/featured/2026/04/24" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"tfa": {
		"type": "standard",
		"title": "Ornithoprion",
		"pageid": 48807661,
		"extract": "Ornithoprion is an extinct genus of cartilaginous fish. The only known species, O. hertwigi, lived during the Moscovian stage of the Pennsylvanian subperiod, which spanned from 315 to 307 million year"
	},
	"mostread": {
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
			}
		]
	},
	"image": {
		"title": "File:Rapanui Rock during sunset, Sumner, Christchurch, New Zealand.jpg",
		"file_page": "https://commons.wikimedia.org/wiki/File:Rapanui_Rock_during_sunset,_Sumner,_Christchurch,_New_Zealand.jpg"
	},
	"dyk": [
		{
			"text": "... that a 4th-century set of Roman glassware was highly valued by Silla royalty in Korea, and is considered a National Treasure?"
		},
		{
			"text": "... that the Tabaru River hosts the westernmost mangroves in Japan?"
		}
	],
	"onthisday": [
		{
			"text": "A building in the Savar Upazila of Dhaka, Bangladesh, collapsed, killing 1,134 people, making it the deadliest accidental structural failure in modern history.",
			"pages": [
				{
					"type": "standard",
					"title": "Savar_Upazila",
					"pageid": 9495766
				},
				{
					"type": "standard",
					"title": "Greater_Dhaka",
					"pageid": 24027047
				}
			]
		}
	]
}
```

### Availability

Publicly available on wikis that surface Wikifeeds over the [MediaWiki REST API](https://www.mediawiki.org/wiki/Wikifeeds_API). Treated as **unstable** in some upstream documentation; not every key is present for every language or every day. Some keys (for example `news`, `dyk`, or embedded `onthisday`) may be missing depending on the project.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 2) On this day

This endpoint returns events tied to a month and day (anniversaries, births, deaths, holidays, and related article metadata). The path segment **`all`** returns every bucket in one response (keys such as `selected`, `events`, `births`, `deaths`, `holidays`). Other `type` values return a single key matching that name (for example `…/onthisday/events/04/24` has top-level `events` only). The **`selected`** type highlights a smaller, editorially chosen set of anniversaries when the wiki provides them.

### Documentation

- [Wikifeeds: feed/onthisday](https://www.mediawiki.org/wiki/Wikifeeds#%E2%80%A6%2Ffeed%2Fonthisday%2F%7Btype%7D%2F%7Bmm%7D%2F%7Bdd%7D)

### Endpoint

`https://en.wikipedia.org/api/rest_v1/feed/onthisday/{type}/{mm}/{dd}`

### Method

`GET`

### Request shape

Path parameters:

- `type`: `all` | `selected` | `events` | `births` | `deaths` | `holidays`
- `mm` (month, two digits, zero-padded)
- `dd` (day, two digits, zero-padded)

### Example

#### Request

```bash
curl -sS "https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/04/24" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"selected": [
		{
			"text": "A building in the Savar Upazila of Dhaka, Bangladesh, collapsed, killing 1,134 people, making it the deadliest accidental structural failure in modern history.",
			"year": 2013,
			"pages": [
				{
					"type": "standard",
					"title": "Savar_Upazila",
					"pageid": 9495766
				},
				{
					"type": "standard",
					"title": "Greater_Dhaka",
					"pageid": 24027047
				}
			]
		}
	],
	"events": [
		{
			"text": "A mass stabbing at a school in Nantes, France, leaves one person dead and three others wounded.",
			"pages": [
				{
					"type": "standard",
					"title": "2025_Nantes_school_stabbing",
					"pageid": 79801582
				}
			]
		}
	],
	"births": [
		{
			"text": "Olivia Gadecki, Australian tennis player",
			"year": 2002,
			"pages": [
				{
					"type": "standard",
					"title": "Olivia_Gadecki",
					"pageid": 66556420
				}
			]
		}
	],
	"holidays": [
		{
			"text": "Armenian Genocide Remembrance Day (Armenia, California, France)",
			"pages": [
				{
					"type": "standard",
					"title": "Armenian_Genocide_Remembrance_Day",
					"pageid": 4575104
				}
			]
		}
	],
	"deaths": [
		{
			"text": "Roy Phillips, British musician (born 1941)",
			"year": 2025,
			"pages": [
				{
					"type": "standard",
					"title": "Roy_Phillips",
					"pageid": 11256854
				}
			]
		}
	]
}
```

(Trimmed: each page object in the **live** response includes more fields. Most items in each **array** are omitted; a single entry is shown per bucket when one exists for that day.)

### Availability

Publicly available on wikis that surface Wikifeeds. Coverage of languages and the richness of each bucket vary; the **`all`** request may be large. Not all types return data for all dates.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 3) App announcements

This endpoint returns structured notices meant for the **Wikipedia iOS and Android** apps (surveys, campaigns, limited-time messaging). The payload is service-defined, not mainspace wikitext; it may be **empty** when nothing is active.

### Documentation

- [Wikifeeds: feed/announcements](https://www.mediawiki.org/wiki/Wikifeeds#%E2%80%A6%2Ffeed%2Fannouncements)
- [Wikimedia Apps: feed announcement config spec](https://www.mediawiki.org/wiki/Wikimedia_Apps/Team/RESTBase_services_for_apps/Feed_announcement_config_spec)

### Endpoint

`https://en.wikipedia.org/api/rest_v1/feed/announcements`

### Method

`GET`

### Request shape

No path or query parameters. Use a normal project host (`en.wikipedia.org`, etc.) if that wiki exposes the route.

### Example

#### Request

```bash
curl -sS "https://en.wikipedia.org/api/rest_v1/feed/announcements" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"announce": []
}
```

(Live response as returned when there are no active announcements. When campaigns exist, `announce` is a non-empty array; shape follows the [announcement config spec](https://www.mediawiki.org/wiki/Wikimedia_Apps/Team/RESTBase_services_for_apps/Feed_announcement_config_spec).)

### Availability

Publicly available where deployed; [Wikifeeds](https://www.mediawiki.org/wiki/Wikifeeds#%E2%80%A6%2Ffeed%2Fannouncements) describes the endpoint as **experimental** and more likely to change or disappear than the featured or on-this-day routes. Not appropriate as a stand-in for editorial or community “featured content.”

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 4) Random page

This endpoint is served by the same [Wikifeeds](https://www.mediawiki.org/wiki/Wikifeeds) / REST stack: it does **not** return a flat uniform random mainspace title; the service **prefers** pages with a lead image, a Wikidata description, and a longer lead extract, so the draw is “interesting” in the same spirit as the Explore experience. The **`title`** sub-route is owned by Wikifeeds; **`summary`** and **`html`** are handled by the broader REST content API after a redirect. Requests often receive **303** with a `Location` to a concrete `page/…` URL; when following redirects, **`curl -L`** returns JSON.

### Documentation

- [Wikifeeds: page/random](https://www.mediawiki.org/wiki/Wikifeeds#%E2%80%A6%2Fpage%2Frandom%2F%7Bformat%7D)
- [Wikitech: Wikifeeds](https://wikitech.wikimedia.org/wiki/Wikifeeds) (list of public routes)
- [REST: get random page in format](https://en.wikipedia.org/api/rest_v1/#/Page%20content/get_page_random__format_) (English Wikipedia; same path pattern on other wikis)

### Endpoint

`https://en.wikipedia.org/api/rest_v1/page/random/{format}`

Path segment **`format`**: `title` (metadata batch) | `summary` (one page summary) | `html` (one page in HTML; heavier payload than `summary`).

### Method

`GET`

### Request shape

- `format` (path): `title` | `summary` | `html`
- For JSON clients, follow redirects: **303** to `…/api/rest_v1/page/title/{title}` (for `title`) or `…/page/summary/{title}` (for `summary`) or the corresponding HTML path.

### Example 1: `summary`

`summary` (one random article summary after redirect; response trimmed):

#### Request

```bash
curl -sSL "https://en.wikipedia.org/api/rest_v1/page/random/summary" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"type": "standard",
	"title": "Peter Vela",
	"namespace": { "id": 0, "text": "" },
	"pageid": 67732039,
	"description": "New Zealand racehorse breeder",
	"lang": "en",
	"dir": "ltr",
	"timestamp": "2024-04-15T16:12:53Z",
	"content_urls": {
		"desktop": {
			"page": "https://en.wikipedia.org/wiki/Peter_Vela"
		}
	},
	"extract": "Sir Peter James Vela is a New Zealand businessman and Thoroughbred breeder and owner. With his brother Philip he founded Vela Fishing and Pencarrow Stud. He is most notably associated with the mare Ethereal, winner of the 2001 Melbourne Cup."
}
```

(Trimmed: many live fields omitted, including `displaytitle`, `wikibase_item`, `thumbnail`, `extract_html`, and full `content_urls` / `originalimage` / `revision`.)

`title` (batch metadata; again after `curl -L`):

### Example 2: `title`

#### Request

```bash
curl -sSL "https://en.wikipedia.org/api/rest_v1/page/random/title" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"items": [
		{
			"title": "Volkswagen_Transporter_(T6)",
			"page_id": 52601761,
			"rev": 1345857964,
			"namespace": 0,
			"redirect": false
		}
	]
}
```

(Trimmed: the live `title` example includes more keys per item, such as `user_id` and `tags`. The server may return a different page title for each call.)

### Availability

Publicly available on wikis that expose these routes. Response shape and redirect behavior are documented in the REST specification for each wiki. Not a **dated** or **community “featured of the day”** feed, but a practical complement for prototypes that need a plausible, reader-facing article in one request.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)
