export interface ArticleLanguageLink {
  label: string
  href: string
}

/** Demo interlanguage rows — each `href` is that wiki’s main page. */
export const DEFAULT_ARTICLE_LANGUAGE_LINKS: ArticleLanguageLink[] = [
  { label: 'Български', href: 'https://bg.wikipedia.org/wiki/' },
  { label: 'Čeština', href: 'https://cs.wikipedia.org/wiki/' },
  { label: 'Dansk', href: 'https://da.wikipedia.org/wiki/' },
  { label: 'Deutsch', href: 'https://de.wikipedia.org/wiki/' },
  { label: 'English', href: 'https://en.wikipedia.org/wiki/' },
  { label: 'Español', href: 'https://es.wikipedia.org/wiki/' },
  { label: 'Euskara', href: 'https://eu.wikipedia.org/wiki/' },
  { label: 'فارسی', href: 'https://fa.wikipedia.org/wiki/' },
  { label: 'Français', href: 'https://fr.wikipedia.org/wiki/' },
  { label: '한국어', href: 'https://ko.wikipedia.org/wiki/' },
  { label: 'Italiano', href: 'https://it.wikipedia.org/wiki/' },
  { label: 'עברית', href: 'https://he.wikipedia.org/wiki/' },
  { label: 'Magyar', href: 'https://hu.wikipedia.org/wiki/' },
  { label: 'Nederlands', href: 'https://nl.wikipedia.org/wiki/' },
  { label: '日本語', href: 'https://ja.wikipedia.org/wiki/' },
  { label: 'Norsk bokmål', href: 'https://no.wikipedia.org/wiki/' },
  { label: 'Polski', href: 'https://pl.wikipedia.org/wiki/' },
  { label: 'Português', href: 'https://pt.wikipedia.org/wiki/' },
  { label: 'Română', href: 'https://ro.wikipedia.org/wiki/' },
  { label: 'Русский', href: 'https://ru.wikipedia.org/wiki/' },
  { label: 'Simple English', href: 'https://simple.wikipedia.org/wiki/' },
  { label: 'Suomi', href: 'https://fi.wikipedia.org/wiki/' },
  { label: 'Svenska', href: 'https://sv.wikipedia.org/wiki/' },
  { label: 'Tiếng Việt', href: 'https://vi.wikipedia.org/wiki/' },
  { label: 'Türkçe', href: 'https://tr.wikipedia.org/wiki/' },
  { label: 'Українська', href: 'https://uk.wikipedia.org/wiki/' },
  { label: '中文', href: 'https://zh.wikipedia.org/wiki/' },
]
