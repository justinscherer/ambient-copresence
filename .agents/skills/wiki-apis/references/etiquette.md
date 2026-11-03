# API etiquette — non-optional checklist

Wikimedia runs the world's seventh-most-visited site on a community
budget. The public API policy is non-negotiable.

Canonical policy:
<https://meta.wikimedia.org/wiki/User-Agent_policy>.

## Always

- **Send a descriptive `User-Agent`** if you're making requests from
  outside the browser (server-side proxy, scripted snapshot fetcher,
  etc.). Format:

  ```
  MyProject/0.1 (https://example.org/myproject; <contact-email-or-tag>)
  ```

  Browsers set their own UA — but anonymous, generic UAs (`curl/x.y`,
  `python-requests/2.x`) are rate-limited or blocked outright.
- **Cache responses.** REST API responses include `ETag`s; the CDN
  caches HTML for hours. Re-fetching the same URL within seconds is
  almost always wasteful.
- **Debounce input-driven requests.** No keystroke-per-request typeahead.
  150–250ms debounce + `AbortController` is the standard pattern.
- **Use `AbortController`.** Cancel superseded requests when the user
  types a new query, navigates away, etc.
- **Back off on errors.** Exponential backoff starting at ~500ms for
  `429` and `5xx`, capped at ~30s, with jitter.
- **Respect `Retry-After`.** If a 429 includes `Retry-After: 5`, wait
  5 seconds before retrying.

## Never

- **Never run an unbounded loop pulling pages.** Use a generator or
  `continue` token, plus a max-page guardrail.
- **Never poll faster than 1 req/sec** to a single endpoint without a
  reason. There's no use case for 100+ req/sec from a prototype.
- **Never hammer non-cached endpoints** (Action API write actions, login,
  etc.) — they hit the application servers directly.
- **Never run the same prototype against the API in a load-testing tool.**

## Read vs write

Anything `action=edit`, `action=login`, `action=watch`, etc. is a write
action. Don't ship those in client code without a clear plan for:

- Where the credential / OAuth token lives (NOT `localStorage` for
  shared demos).
- Who's responsible for the edits the prototype creates (probably nobody
  wants 1000 demo edits from a developer's account).

For prototyping editor UX, prefer **mock publish** handlers or fork **[Bárbara Martínez Calvo’s article-template / suggestion-mode repos](../../protowiki-components/references/editors.md)** rather than calling `?action=edit` for real. No real edit gets made; that's the right default for a prototype.

## Snapshot data when you can

If you're demonstrating a fixed page (e.g., "what would Albert
Einstein's article look like with this new infobox?"), prefer
**snapshotting** the article HTML and CSS once and committing it. The
demo works offline, the API isn't hit on every page load, and the
result is reproducible. See
[`wiki-snapshot-data`](../../wiki-snapshot-data/SKILL.md).

## When in doubt

`User-Agent` + `cache` + `debounce` + `backoff` covers almost every
case. If your network panel shows hundreds of requests per minute from
one prototype, something's wrong.
