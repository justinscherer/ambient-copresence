# Links signals

## 1) Outlinks

This endpoint returns pages that a given source page links to.

### Documentation

- [MediaWiki Action API: Links](https://www.mediawiki.org/wiki/API:Links)

### Endpoint

`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=links&titles=Jupiter&pllimit=5`

### Method

`GET`

### Request shape

Query parameters:

- `action=query`
- `prop=links`
- `titles` (required)
- `pllimit` (optional)
- `plcontinue` (optional continuation token)
- `format=json`

### Example

#### Request

```bash
curl -sS "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=links&titles=Jupiter&pllimit=3" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"continue": {
		"plcontinue": "38930|0|Ariane_4",
		"continue": "||"
	},
	"query": {
		"pages": {
			"38930": {
				"pageid": 38930,
				"ns": 0,
				"title": "Jupiter",
				"links": [
					{ "ns": 0, "title": "Ariane 1" },
					{ "ns": 0, "title": "Ariane 2" },
					{ "ns": 0, "title": "Ariane 3" }
				]
			}
		}
	}
}
```

### Availability

Publicly available on each wiki's `api.php`; this is a core production MediaWiki Action API module.

Available on Wikimedia wikis via each wiki's `api.php`.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 2) Backlinks

This endpoint finds pages that link to a specified page title or page id.

### Documentation

- [MediaWiki Action API: Backlinks](https://www.mediawiki.org/wiki/API:Backlinks)

### Endpoint

`https://en.wikipedia.org/w/api.php?action=query&format=json&list=backlinks&bltitle=Jupiter&bllimit=5`

### Method

`GET`

### Request shape

Query parameters:

- `action=query`
- `list=backlinks`
- `bltitle` or `blpageid` (one required)
- `bllimit` (optional)
- `blcontinue` (optional continuation token)
- `format=json`

### Example

#### Request

```bash
curl -sS "https://en.wikipedia.org/w/api.php?action=query&format=json&list=backlinks&bltitle=Jupiter&bllimit=3" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"batchcomplete": "",
	"continue": {
		"blcontinue": "0|1210",
		"continue": "-||"
	},
	"query": {
		"backlinks": [
			{
				"pageid": 639,
				"ns": 0,
				"title": "Alkane"
			},
			{
				"pageid": 666,
				"ns": 0,
				"title": "Alkali metal"
			},
			{
				"pageid": 791,
				"ns": 0,
				"title": "Asteroid"
			}
		]
	}
}
```

### Availability

Publicly available on each wiki's `api.php`; this is a core production MediaWiki Action API module.

Available on Wikimedia wikis via each wiki's `api.php`.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 3) Language links

This endpoint returns interlanguage links from a page to versions of the page in other languages.

### Documentation

- [MediaWiki Action API: Langlinks](https://www.mediawiki.org/wiki/API:Langlinks)

### Endpoint

`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=langlinks&titles=Jupiter&lllimit=5&llprop=url|langname|autonym`

### Method

`GET`

### Request shape

Query parameters:

- `action=query`
- `prop=langlinks`
- `titles` (required)
- `lllimit` (optional)
- `llprop` (optional, examples: `url|langname|autonym`)
- `llcontinue` (optional continuation token)
- `format=json`

### Example

#### Request

```bash
curl -sS "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=langlinks&titles=Jupiter&lllimit=3&llprop=url|langname|autonym" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"continue": {
		"llcontinue": "38930|an",
		"continue": "||"
	},
	"query": {
		"pages": {
			"38930": {
				"pageid": 38930,
				"ns": 0,
				"title": "Jupiter",
				"langlinks": [
					{
						"lang": "af",
						"url": "https://af.wikipedia.org/wiki/Jupiter",
						"langname": "Afrikaans",
						"autonym": "Afrikaans",
						"*": "Jupiter"
					},
					{
						"lang": "gsw",
						"url": "https://als.wikipedia.org/wiki/Jupiter_(Planet)",
						"langname": "Alemannic",
						"autonym": "Alemannisch",
						"*": "Jupiter (Planet)"
					},
					{
						"lang": "am",
						"url": "https://am.wikipedia.org/wiki/%E1%8C%81%E1%8D%92%E1%89%B0%E1%88%AD",
						"langname": "Amharic",
						"autonym": "አማርኛ",
						"*": "ጁፒተር"
					}
				]
			}
		}
	}
}
```

### Availability

Publicly available on each wiki's `api.php`; this is a core production MediaWiki Action API module.

Available on Wikimedia wikis with interlanguage link data.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)
