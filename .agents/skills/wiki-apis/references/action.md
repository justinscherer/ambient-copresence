# Action API reference

Base URL: `https://{lang}.wikipedia.org/w/api.php`. Pass `action=…` in
the query string. Pass `format=json` for JSON output and `formatversion=2`
for the modern shape. Pass `origin=*` to opt into CORS for browser
fetches.

Canonical docs: <https://www.mediawiki.org/wiki/API:Main_page>.

## Common actions

| `action` | Use |
| --- | --- |
| `opensearch` | typeahead search — returns `[query, titles[], descriptions[], links[]]` |
| `query` | the workhorse: ask for properties, list, meta info, generators |
| `parse` | render wikitext / a section / a page to HTML |
| `expandtemplates` | render a template-only fragment |
| `login` / `logout` / `clientlogin` | authentication (don't ship in browser code) |
| `edit` | create / modify a page (don't ship in browser code) |
| `watch` | add / remove a page from watchlist |
| `compare` | diff between two revisions |
| `rollback` | revert edits |

## opensearch

The simplest typeahead:

```
?action=opensearch&search=alb&limit=10&format=json&origin=*
```

Returns:

```json
[
  "alb",
  ["Albania", "Albert Einstein", …],
  ["", "German-born theoretical physicist…", …],
  ["https://en.wikipedia.org/wiki/Albania", …]
]
```

This is the standard endpoint for a typeahead search bar.

## query

The general-purpose endpoint. Pass `prop=` for page properties,
`list=` for lists, `meta=` for meta info, and `generator=` to feed one
of those into another.

Common shapes:

| Need | Params |
| --- | --- |
| Article extracts | `action=query&prop=extracts&exintro&explaintext&titles=Albert+Einstein` |
| Page images / thumbnails | `action=query&prop=pageimages&pithumbsize=200&titles=…` |
| Categories of a page | `action=query&prop=categories&titles=…` |
| Pages in a category | `action=query&list=categorymembers&cmtitle=Category:Living_people` |
| Random pages | `action=query&list=random&rnnamespace=0&rnlimit=5` |
| Recent changes | `action=query&list=recentchanges&rclimit=10` |
| Backlinks (incoming) | `action=query&list=backlinks&bltitle=…` |
| Outgoing links | `action=query&prop=links&titles=…&pllimit=max` |
| Watchers count | `action=query&prop=info&inprop=watchers&titles=…` |
| Page revisions | `action=query&prop=revisions&rvprop=timestamp\|user\|comment&titles=…` |
| Search (full-text) | `action=query&list=search&srsearch=…` |
| Site info | `action=query&meta=siteinfo&siprop=general\|namespaces` |
| User info | `action=query&meta=userinfo` |

Always pass `format=json&formatversion=2&origin=*` for browser use.

Example — search results with snippets:

```
?action=query&list=search&srsearch=climate&srlimit=5&srprop=snippet&format=json&formatversion=2&origin=*
```

## parse

Render wikitext or a page section to HTML.

```
?action=parse&page=Albert_Einstein&format=json&formatversion=2&prop=text&origin=*
?action=parse&text={{Infobox+person|name=…}}&contentmodel=wikitext&format=json&origin=*
```

## generators

Feed a list/meta query as input to a `prop` query — useful for "give me
the thumbnail of every article in Category:Living people":

```
?action=query&generator=categorymembers&gcmtitle=Category:Living_people&gcmlimit=10&prop=pageimages&pithumbsize=160&format=json&origin=*
```

## Pagination

Action API uses `continue` tokens. The response includes a `continue`
object — pass its keys back on the next request to fetch the next page:

```ts
async function* paginate(initialUrl: string) {
  let url = initialUrl
  while (true) {
    const res = await fetch(url)
    const data = await res.json()
    yield data
    if (!data.continue) return
    const u = new URL(url)
    for (const [k, v] of Object.entries(data.continue)) u.searchParams.set(k, String(v))
    url = u.toString()
  }
}
```

## Error shape

Errors come back as:

```json
{ "error": { "code": "…", "info": "…" } }
```

Always check for `error` even on a 200 response.
