# i18n Multilingual Design Spec

## Overview

Add Chinese + English bilingual support to Bela Lee's portfolio site (Astro 4 + TailwindCSS + DaisyUI, deployed on Vercel). Includes automatic language detection via Vercel Edge Middleware and manual language switching.

## Languages

- Chinese (zh) — current content
- English (en) — new, casual/conversational tone

## Architecture: Shared Pages + Dynamic `[lang]` Route

All languages share one set of page templates. Language is determined by `Astro.params.lang`. No page duplication.

### Route Structure

```
src/pages/
├── index.astro              → root, middleware redirects to /zh/ or /en/
├── [lang]/
│   ├── index.astro
│   ├── projects.astro
│   ├── skills.astro
│   ├── cv.astro
│   ├── contact.astro
│   ├── ai-lab/
│   │   ├── index.astro
│   │   └── personal-site.astro
│   └── blog/
│       ├── [...page].astro
│       ├── [slug].astro
│       └── tag/[tag]/[...page].astro
```

All URLs are prefixed: `/zh/projects`, `/en/projects`.

## Build Mode Change

- Change Astro output from `static` to `hybrid`
- Required for Vercel Edge Middleware support
- Most pages remain statically generated (default), only middleware runs at edge

### astro.config.mjs changes

```js
export default defineConfig({
  site: 'https://liwenhui.vercel.app',
  output: 'hybrid',
  adapter: vercel(),
  integrations: [mdx(), tailwind()],
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
```

## Translation System

### File Structure

```
src/i18n/
├── index.ts        → t() helper, getLangFromUrl(), type definitions
├── zh.ts           → Chinese UI strings (extracted from current pages)
├── en.ts           → English UI strings (casual tone)
```

### Translation Helper

```ts
// src/i18n/index.ts
import { zh } from './zh';
import { en } from './en';

const translations = { zh, en } as const;
export type Lang = keyof typeof translations;
export const languages = { zh: '中文', en: 'English' };

export function t(lang: Lang, key: string): string {
  // dot-notation key lookup: t('en', 'nav.home') → 'Home'
}

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in translations) return lang as Lang;
  return 'zh';
}
```

### Translation File Shape

Organized by page/component namespace:

```ts
// src/i18n/en.ts
export const en = {
  nav: {
    home: 'Home',
    projects: 'Projects',
    blog: 'Insights',
    skills: 'Skills',
    aiLab: 'AI Lab',
    cv: 'Resume',
    contact: 'Contact',
  },
  home: {
    name: 'Bela Lee',
    title: 'AI Product Manager',
    subtitle: '6 years of consumer growth + monetization, now bringing that playbook to AI.',
    viewResume: 'View Resume',
    contactMe: 'Get in Touch',
    latestInsights: 'Latest Insights',
  },
  // ... more namespaces per page
};
```

## Component Changes

### All components receive `lang` prop

```astro
---
// Example: SideBarMenu.astro
import { t, type Lang } from '../i18n';
interface Props { lang: Lang; }
const { lang } = Astro.props;
---
<li><a href={`/${lang}/`}>{t(lang, 'nav.home')}</a></li>
```

### Layout chain

`BaseLayout.astro` → extracts `lang` from URL → passes to `Header`, `SideBar`, `Footer`.

### Language Switcher

- Location: sidebar bottom
- Shows current language flag/label, click to switch
- Switching writes `lang` cookie (max-age 1 year) and navigates to equivalent path in other language
- Example: `/zh/projects` → click → set cookie `lang=en` → navigate `/en/projects`

## Blog Content

### Directory Structure

```
src/content/blog/
├── zh/
│   ├── post-1.mdx
│   ├── post-2.mdx
│   ├── post-3.mdx
│   ├── post-4.mdx
│   └── post-5.mdx
├── en/
│   ├── post-1.mdx
│   ├── post-2.mdx
│   ├── post-3.mdx
│   ├── post-4.mdx
│   └── post-5.mdx
```

### Collection Querying

```ts
// Filter blog posts by language
const allPosts = await getCollection('blog');
const langPosts = allPosts.filter(post => post.id.startsWith(`${lang}/`));
```

Slug extraction: strip the `zh/` or `en/` prefix for URL generation.

## Language Detection — Vercel Edge Middleware

### File: `middleware.ts` (project root)

### Priority Logic

1. **Cookie `lang`** — user manually switched before → respect their choice
2. **`Accept-Language` header** — browser/system language preference
3. **`x-vercel-ip-country` header** — IP geolocation (CN/TW/HK/MO → zh, else → en)
4. **Default: zh**

When IP country and system language conflict, **system language wins** (priority 2 > priority 3).

### Behavior

- Request to `/` → 302 redirect to `/zh/` or `/en/` based on detection
- Request to `/zh/...` or `/en/...` → pass through, no redirect
- Cookie present → always use cookie value, skip detection

### Implementation

```ts
// middleware.ts
import { next } from '@vercel/edge';

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Already on a language path — pass through
  if (pathname.startsWith('/zh') || pathname.startsWith('/en')) {
    return next();
  }

  // Only redirect root and non-asset paths
  if (pathname !== '/' && !pathname.startsWith('/api')) {
    return next();
  }

  // 1. Check cookie
  const cookieLang = getCookieLang(request);
  if (cookieLang) {
    return redirect(url, cookieLang);
  }

  // 2. Check Accept-Language (system language)
  const acceptLang = getAcceptLanguage(request);

  // 3. Check IP country
  const country = request.headers.get('x-vercel-ip-country') || '';
  const ipLang = ['CN', 'TW', 'HK', 'MO'].includes(country) ? 'zh' : 'en';

  // System language wins over IP
  const lang = acceptLang || ipLang;

  return redirect(url, lang);
}

export const config = { matcher: '/' };
```

## Name Handling

| Context | Display |
|---------|---------|
| Chinese pages | 李文慧 |
| English pages | Bela Lee |

## English Writing Style Guide

- **Tone**: Casual, personal blog style — like talking to a friend in tech
- **Person**: First person ("I shipped...", "I built...")
- **Sentences**: Short, direct, active voice
- **Avoid**: Corporate jargon, passive voice, "responsible for", "leveraged", "utilized", "spearheaded"
- **Good**: "I helped grow TEMU from zero to millions of users"
- **Bad**: "Was responsible for user acquisition strategy implementation and optimization"
- **Vibe**: Confident but not boastful, specific but not dry

## Scope Summary

| Item | Action |
|------|--------|
| astro.config.mjs | Add i18n config, change to hybrid |
| src/i18n/ | New — translation files + helper |
| src/pages/ | Move all pages into [lang]/ dynamic route |
| src/components/ | Add lang prop, use t() for all text |
| src/content/blog/ | Reorganize into zh/ and en/ subdirs |
| middleware.ts | New — language detection + redirect |
| Language switcher | New component in sidebar |
| Blog posts (5) | Translate to English |

## Out of Scope

- SEO meta tags per language (can add later)
- RSS feed per language (can add later)
- Additional languages beyond zh/en
