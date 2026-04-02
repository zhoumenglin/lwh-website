# i18n Multilingual Design Spec

## Overview

Add Chinese + English bilingual support to Bela Lee's portfolio site (Astro 4 + TailwindCSS + DaisyUI, deployed on Vercel). Includes automatic language detection via Astro middleware and manual language switching.

## Languages

- Chinese (zh) — current content
- English (en) — new, casual/conversational tone

## Architecture: Shared Pages + Dynamic `[lang]` Route

All languages share one set of page templates. Language is determined by `Astro.params.lang`. No page duplication.

### Route Structure

```
src/pages/
├── index.astro              → redirect-only page (detects lang, redirects to /zh/ or /en/)
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
- Required for Astro middleware support (language detection on first visit)
- Most pages remain statically prerendered, only middleware + root redirect run server-side
- Adapter changes from `@astrojs/vercel/static` to `@astrojs/vercel/serverless`

### astro.config.mjs changes

```js
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  site: 'https://liwenhui.vercel.app',
  output: 'hybrid',
  adapter: vercel(),
  integrations: [mdx(), tailwind()],
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
    routing: 'manual',  // we handle routing ourselves via middleware
  },
});
```

Key: `routing: 'manual'` — disables Astro's built-in i18n redirects so our custom middleware has full control.

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

`BaseLayout.astro` → extracts `lang` from URL → sets `<html lang="zh">` or `<html lang="en">` → passes `lang` to `Header`, `SideBar`, `Footer`.

### Language Switcher

- Location: sidebar bottom
- Shows current language flag/label, click to switch
- Switching writes `lang` cookie (`SameSite=Lax; Secure; Path=/; max-age=31536000`) and navigates to equivalent path in other language
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

### Slug Handling

Blog post IDs will be like `zh/post-1`, `en/post-1`. When generating URLs:
- Strip the language prefix from the ID to get the slug
- Use `/${lang}/blog/${slug}` for the URL
- In `[slug].astro`'s `getStaticPaths()`, explicitly map IDs to slugs to avoid double-prefix (`/zh/blog/zh/post-1`)

```ts
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => {
    const [lang, ...slugParts] = post.id.split('/');
    return {
      params: { lang, slug: slugParts.join('/') },
      props: { post },
    };
  });
}
```

## Language Detection — Astro Middleware

### File: `src/middleware.ts`

Uses Astro's built-in middleware system — works both in local dev (`astro dev`) and production (Vercel).

### Priority Logic

1. **Cookie `lang`** — user manually switched before → respect their choice
2. **`Accept-Language` header** — browser/system language preference
3. **`x-vercel-ip-country` header** — IP geolocation (CN/TW/HK/MO → zh, else → en). In local dev, this header is absent, so falls through to default.
4. **Default: zh**

When IP country and system language conflict, **system language wins** (priority 2 > priority 3).

### Behavior

- Request to `/` → 302 redirect to `/zh/` or `/en/` based on detection
- Legacy unprefixed URLs (`/projects`, `/blog`, `/cv`, etc.) → 302 redirect to `/${detectedLang}/path`
- Request to `/zh/...` or `/en/...` → pass through, no redirect
- Cookie present → always use cookie value, skip detection
- Static assets, `_astro/`, `favicon`, etc. → pass through

### Implementation Sketch

```ts
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  // Skip assets and already-prefixed paths
  if (pathname.startsWith('/zh') || pathname.startsWith('/en')
      || pathname.startsWith('/_astro') || pathname.includes('.')) {
    return next();
  }

  // Detect language
  const cookieLang = parseCookie(context.request, 'lang');
  const acceptLang = parseAcceptLanguage(context.request);
  const ipCountry = context.request.headers.get('x-vercel-ip-country') || '';
  const ipLang = ['CN', 'TW', 'HK', 'MO'].includes(ipCountry) ? 'zh' : 'en';

  const lang = cookieLang || acceptLang || ipLang || 'zh';

  // Redirect to prefixed path
  const target = `/${lang}${pathname === '/' ? '/' : pathname}`;
  return context.redirect(target, 302);
});
```

### Root `index.astro`

The root `src/pages/index.astro` is a server-rendered redirect page (not prerendered). It serves as a fallback in case the middleware redirect doesn't fire:

```astro
---
export const prerender = false;
// Redirect handled by middleware; this is a safety net
return Astro.redirect('/zh/');
---
```

## SEO & Accessibility

### `<html lang="">` attribute

`BaseLayout.astro` dynamically sets `<html lang="${lang}">` based on current language.

### Hreflang tags

Each page includes alternate language links in `<head>`:

```html
<link rel="alternate" hreflang="zh" href="https://liwenhui.vercel.app/zh/projects" />
<link rel="alternate" hreflang="en" href="https://liwenhui.vercel.app/en/projects" />
<link rel="alternate" hreflang="x-default" href="https://liwenhui.vercel.app/zh/projects" />
```

### 404 Page

`src/pages/[lang]/404.astro` — language-aware 404 page, shows "Page not found" in current language.

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

## Legacy URL Redirects

Old unprefixed URLs (`/projects`, `/blog/post-1`, `/cv`, etc.) are handled by the middleware — they redirect to `/${detectedLang}/path`. This ensures bookmarks and search engine indexed URLs continue to work.

## Scope Summary

| Item | Action |
|------|--------|
| astro.config.mjs | Add i18n config, change to hybrid, switch to serverless adapter |
| src/i18n/ | New — translation files + helper |
| src/pages/ | Move all pages into [lang]/ dynamic route |
| src/pages/index.astro | Redirect-only page (server-rendered) |
| src/middleware.ts | New — language detection + redirect |
| src/components/ | Add lang prop, use t() for all text, set `<html lang>` |
| src/content/blog/ | Reorganize into zh/ and en/ subdirs |
| Language switcher | New component in sidebar |
| Blog posts (5) | Translate to English |
| SEO | hreflang tags, `<html lang>` attribute |
| 404 page | Language-aware 404 |

## Out of Scope

- RSS feed per language (can add later)
- Additional languages beyond zh/en
