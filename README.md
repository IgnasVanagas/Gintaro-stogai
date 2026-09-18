# Gintaro stogai

A responsive Lithuanian landing page for MB „Gintaro stogai“. Built with semantic HTML, TypeScript and CSS, served by Vite. No runtime framework, backend, analytics, trackers or third-party font requests.

## Run locally

```sh
npm install
npm run dev
```

## Build and preview

```sh
npm run build
npm run preview
```

Deploy the generated `dist/` directory to a static host. Once a real domain is chosen, add its canonical URL and use an absolute `og:image` URL in `index.html`.

## Features

- Direct telephone links, persistent mobile call action and a service-specific SMS composer.
- Selecting a service card also selects that service in the contact section.
- Phone-number copying with accessible feedback and a manual fallback.
- Keyboard-operable mobile navigation and native FAQ accordions.
- Responsive layout, locally hosted fonts and optimized responsive WebP images.
- Reduced-motion support, progressive enhancement, Lithuanian metadata and factual business structured data.

SMS links open the visitor's messaging application; they do not send automatically. Desktop visitors can call using a configured calling application or copy the phone number. There is no form that pretends to send an enquiry.

## Validation

```sh
npx playwright install chromium
npm run test:e2e
```

The browser suite checks assets and runtime errors, contact destinations, service-to-SMS behavior, clipboard success and rejection, FAQ keyboard operation, mobile navigation, eight viewport widths, no-JavaScript access and automated WCAG AA accessibility.

Verified on 2026-09-17: production build passed; all 8 browser tests passed; automated WCAG AA scans found no violations at desktop and mobile sizes; dependency audit reported 0 vulnerabilities. Screenshots are saved in `docs/screenshots/` (desktop and mobile, full page and first screen).

## Content and imagery

See [content sources](docs/content-sources.md) for the verified business facts and editorial boundaries. The house is an AI-generated architectural illustration, not a company project photograph; the page discloses this in the footer. Source image and generation details are in `assets/source/` and [image-generation.md](docs/image-generation.md).

Public assets are already prepared. To regenerate image sizes and re-download the fonts, run `node scripts/prepare-assets.mjs`. Font licenses are included in `public/fonts/`.
