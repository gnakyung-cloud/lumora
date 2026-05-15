# Lumora Design System

## Brand Identity
**Name:** Lumora (루모라)
**Tagline:** AI가 만드는 나의 화보
**Vibe:** Premium AI photo studio. Fashion editorial meets Korean beauty aesthetic.

## Typography
- **Display/Hero:** "Playfair Display" — elegant serif for headlines
- **Body:** "DM Sans" — clean, modern sans-serif
- **Accent/Labels:** "DM Sans" uppercase tracking-widest for categories

## Colors
```
--color-ink: #0a0a0a        /* near black text */
--color-stone: #f5f3f0      /* warm off-white bg */
--color-white: #ffffff
--color-gold: #c9a96e       /* premium accent */
--color-muted: #8a8480      /* secondary text */
--color-border: #e8e4e0     /* dividers */
--color-overlay: rgba(10,10,10,0.55)
```

## Layout Principles
- Full-bleed images, no borders
- Asymmetric editorial grid (not uniform card grids)
- Generous negative space
- Large typography over imagery (magazine editorial style)
- Mobile-first: portrait images dominate

## Motion
- Fade-up reveals on scroll (Intersection Observer)
- Smooth parallax on hero
- Hover: slow zoom on images (scale 1.05, 0.6s ease)
- Letter-by-letter or word-by-word headline animations

## Anti-patterns
- No purple gradients
- No neon / cyberpunk
- No generic SaaS card grids
- No dark background (except hero overlay)
- No Inter or Roboto
