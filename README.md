# M. Mursaleen — portfolio

Content-dense, motion-rich portfolio built with Astro 7, Three.js, GSAP and Lenis. Static output, deployed to GitHub Pages.

**Look:** off-white paper (`#f7f7f7`), deep forest-green ink (`#022016`), acid-yellow highlighter accent (`#f6e016`), warm peach surfaces (`#eed6c8`). Uppercase Archivo display type at weight ~640 and 0.9 line-height; Geist for text; JetBrains Mono for labels. Sections with the `ink` class invert to dark green. Tokens live in `src/styles/tokens.css`; the WebGL palette reads the `--gl-*` tokens at runtime.

## Single source of truth

- `knowledgebase/mursaleen-knowledge-base.md` is the editorial source. Every fact on the site traces back to it.
- `src/data/*.ts` is the machine source. The homepage, the case-study pages, and every agent-facing file (`/resume.json`, `/work.json`, `/llms.txt`, `/llms-full.txt`, `/AGENTS.md`, `/openapi.json`) are generated from these modules, so numbers cannot drift between the human and machine views.
- `src/content/work/*.mdx` holds long-form case-study prose. Each file's `slug` must match an entry in `src/data/caseStudies.ts` (enforced at build).
- `src/content/blog/*.mdx` holds posts.

## Structure

```
src/data/         facts: profile, timeline, caseStudies, chapters, stats, clients, stack, aiSystem, evidence, impact, services, faq, books, sources
src/components/   home/* homepage sections: Hero → Drop → IntroFacts → Marquee → Orchestrator (how I deliver, incl. stack and offers) → Journey (work and journey, incl. impact thread) → Volunteering → Contact → AgentReady → Faq → Writing → Reading · ui/* shared pieces · gl/GlHost.astro WebGL host
src/layouts/      Base (shell, fonts, SEO, canvas, motion bootstrap) · CaseStudy · Article · Page
src/lib/motion/   GSAP + Lenis: declarative data-reveal / data-counter / data-scramble / data-parallax / data-draw / data-tilt
src/lib/gl/       one shared WebGLRenderer drawing into [data-gl] hosts via scissor viewports; scenes: globe, satellites, field
src/lib/gl/drop/  "The Drop": full-viewport scroll-driven descent (own renderer + EffectComposer bloom/vignette, procedural rocks, Reflector water); mounted by components/home/Drop.astro
src/pages/        routes plus static endpoints (*.ts exporting GET)
public/           favicon, robots.txt, .well-known/agent-card.json, textures/land-512.jpg (NASA Blue Marble, downsampled), og/
```

## The Drop section

`src/components/home/Drop.astro` is a 600vh scroll container with a sticky canvas. `src/lib/gl/drop/scene.ts` rebuilds the drop.peachworlds.com scene from its scene state using the original Peach Worlds assets in `public/drop/` (rock, hand, ring and animated sphere GLBs with Draco compression, studio EXR environment, looping gradient video), used with permission from Peach Worlds. Water normal maps are from the three.js examples (MIT); Draco decoders are in `public/draco/`. Timeline: camera descends y 11.4 → −0.4, the sphere shrinks, ignites into an animated gradient between 27.7% and 32.3%, a glowing ring rotates between 19% and 35%, rubble and a reflective floor wait at the bottom. Text beats are `[data-beat="start-end"]` overlays faded by scroll progress. The Drop sits inside the introduction, right after the first-person hero copy: the opening beat announces the three pillars, three beats carry them, the closing beat points to the delivery section. Under reduced motion or without WebGL the section collapses to normal flow with all beats visible.

## orgnzm.studio pieces (used with permission)

- `src/components/home/Journey.astro` + `src/lib/motion/sections/rockSequence.ts`: the pinned stone (under the globe/satellite scene) that turns from ice to bloom to bare rock as the timeline and its nested case-study cards scroll past. The original is a 361-frame Lottie image sequence; the even frames are unpacked to `public/org/rock/NNN.webp` (181 files, 6.5 MB) and drawn on a canvas by scroll progress, loaded coarse-to-fine.

## Satellite scene and section rail

- `src/lib/gl/scenes/satellites.ts` (orbit chapter and the Eutelsat case study): a modeled spacecraft (gold bus, gridded solar wings, parabolic dish, mast) in an inclined orbit around a land-dotted Earth, holding a signal beam on the Paris ground station while in view, with two small companions, the OneWeb-style LEO shell and the GEO ring. Camera orbit is steered by scroll progress.
- `src/components/ui/SectionNav.astro`: fixed left rail on the homepage (≥1100px). CSS-only motion: scroll-driven progress line via `animation-timeline: scroll()`, staggered entrance, swelling dots with a pinging ring on the active section, labels on hover. A small script toggles the active item and flips contrast over dark sections.

## Motion tiers

`<html data-motion-tier>` is set inline before first paint:

- `full`: Lenis smooth scroll, SplitText reveals, WebGL scenes at DPR ≤ 2.
- `lite` (coarse pointer, low memory, save-data): reveals and counters, globe only, DPR ≤ 1.25, no Lenis.
- `static` (prefers-reduced-motion): no JS motion, no WebGL download, all content visible as rendered.

All content is server-rendered and visible without JavaScript. Motion only adds emphasis.

## Commands

```sh
npm install
npm run dev       # localhost:4321
npm run build     # dist/
npm run preview
npm run check     # astro check (types)
```

## Deploy

`.github/workflows/deploy.yml` builds on push to `main` and publishes to GitHub Pages. The site URL is configured in `astro.config.mjs` (`site`). To serve at the root of `1mursaleen.github.io`, the repository must be named `1mursaleen.github.io`; the old `resume` and `books` project repos should be archived or redirected so only one public timeline exists.

## Honesty guardrails (do not edit away)

- NHCC: platforms *integrated into* the National Health Command Center, not the NHCC itself.
- ISN: *Tribally-governed, federally-partnered*.
- Eutelsat: *contract*, overlapping Tanbits.
- Coverage: *near-total, CI-enforced*.
- AI gains: cited studies with counterweights, never a flat "10x".
- Legacy percentage metrics marked `[VERIFY]` in the knowledge base are not published.

## Abbreviations

`src/integrations/abbr.ts` runs after the build and rewrites every HTML page so the first use of each abbreviation in `src/data/abbr.ts` reads `Full form (ABBR)` and later uses are `<abbr title>`; headings only ever get the `<abbr>` form. Text endpoints use `expandText` from `src/lib/abbr.ts`. `node scripts/check-abbr.mjs` verifies `dist/`.
