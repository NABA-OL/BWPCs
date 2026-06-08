<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: B & W — Tu PC Master Race a buen precio
description: Colombian PC assembly brand — restrained monochrome authority with one deliberate accent
---

# Design System: B & W

## 1. Overview

**Creative North Star: "El Maestro Ensamblador"**

B & W is the knowledgeable builder who has done this a thousand times. The site communicates with the authority of someone who knows the exact cable routing, the right thermal paste spread, the price to the peso. Nothing in the interface is decorative. Every pixel either conveys information or earns trust.

The visual system is built on the Colombian small-business reality: most customers arrive via WhatsApp on a mid-range Android, already skeptical of smooth corporate websites. This interface does not try to look expensive. It tries to look *right*. The vanilla surface is not warmth by default — it is the clean surface of a workbench under good light. The black is ink and structure, not drama. The gray is the PCB chassis, quiet and load-bearing.

One accent color exists. It appears only where it must: the primary call to action, the active state, the one price the customer needs to see. Its rarity is the point. Everything else stays monochrome so the accent always means something.

Rejected explicitly: the overcrowded RGB neon aesthetic of Thermaltake and iBUYPOWER — every pixel in a different color, violence as visual language. Rejected: the classifieds-board layout of MercadoLibre — no brand identity, just product grids and peso amounts. Rejected: the obviously-templated feel of a Wix or Squarespace storefront — off-the-shelf personality. B & W is a name, a panda, a craft, and a specific city. It should feel like exactly that.

**Key Characteristics:**
- Monochrome foundation with a single disciplined accent
- Weight contrast as the primary hierarchy tool (800 display vs. 400 body, same typeface)
- Content-first density — no decorative padding, no empty hero gestures
- Panda mascot used sparingly as a character moment, not a repeating motif
- Geometric motifs (triangles, circles) carried from the PDF brand identity

## 2. Colors

A neutral foundation that earns meaning through contrast. The crimson accent is the only color that speaks.

### Primary
- **Panda Black** (`#0A0A0A`): The primary text color, CTA backgrounds, nav background. True near-black — not charcoal, not warm. The ink of authority.

### Secondary
- **Warm Crimson** (`#c83c2a` / `oklch(0.614 0.234 28)`): The single accent. Used at ≤10% of any screen surface. Appears on: primary button hover, active nav indicator, the geometric corner motif (hero), and the bottom-section CTA button. White text on filled crimson (`#faf8f3`). Deep hover variant: `#9e2e1f`.

### Neutral
- **Vanilla Surface** (`#FAF8F3`): Page background. A near-white with the faintest warm tint — the workbench surface. Not cream, not paper. Chroma is low; it reads almost as white in natural light, which is the intent.
- **Component Gray** (`#6B6B6B`): Secondary text, metadata, price footnotes, dividers. Body text should never use this — reserve for genuinely secondary information (dates, SKU labels, "precio aproximado" disclaimers).
- **Hairline Gray** (`#E5E5E5`): Borders, table rows, card edges. Never as a background fill.

### Named Rules

**The One Accent Rule.** The accent color appears on ≤10% of any screen. It is not a brand color in the traditional sense — it is a pointing finger. When everything is monochrome, a single colored element commands attention without effort. Adding a second accent destroys this. Never use the accent on more than one interactive element per viewport.

**The No-Warm-Default Rule.** The vanilla surface is not a warm palette. It happens to be slightly warm, but warmth is not the message. If a layout starts to read "cozy" or "rustic," reduce background elements and increase black ink weight. The brand is precision, not comfort.

## 3. Typography

**Display / Body Font:** Geist Variable (system fallback: `ui-sans-serif, system-ui, sans-serif`)
**Price / Spec Mono:** JetBrains Mono (system fallback: `ui-monospace, Menlo, monospace`) — used selectively for price displays, component specs, and technical values.

**Character:** A single weight-variable sans elevated through extreme contrast (weight 800 at 0 to weight 400 body) reads as a complete typographic system without a second typeface. Geist is developer-native and carries technical authority without coldness. Prices in JetBrains Mono feel exact — like a terminal output, not a marketing claim.

### Hierarchy
- **Display** (weight 800, `clamp(3rem, 8vw, 6rem)`, line-height 0.95, letter-spacing -0.04em): Hero heading only. "B & W" wordmark; page hero claim. Used once per page.
- **Headline** (weight 700, `clamp(1.75rem, 4vw, 2.75rem)`, line-height 1.1, letter-spacing -0.02em): Section headings. "Servicios", "Cómo cotizar", component category headers.
- **Title** (weight 600, `clamp(1.1rem, 2.5vw, 1.4rem)`, line-height 1.25): Card headings, subsection labels. Price summary titles.
- **Body** (weight 400, `1rem/1.125rem`, line-height 1.65): All prose. Descriptions, service explanations. Max line length 65–75ch. Never gray — always Panda Black or close to it.
- **Label** (weight 500, `0.75rem`, letter-spacing 0.02em, no uppercase): Component metadata, form labels, navigation items. Not all-caps; not tracked to the point of decoration.
- **Price / Spec** (JetBrains Mono, weight 500, `1rem–1.5rem`): Prices, USD values, TRM figures, totals. The monospace rendering makes amounts feel computed, not estimated.

### Named Rules

**The Weight-First Rule.** Hierarchy is established through weight, not color. Do not use the accent color to make text "stand out." A weight-800 heading next to weight-400 body text has more hierarchy than a colored heading in the same weight. Color hierarchy is for interactive elements only.

**The Uppercase Prohibition.** No all-caps body copy, section eyebrows, or labels. Uppercase is reserved for CTA button labels only (≤4 words), where it signals action rather than category. Tracked uppercase kickers above every section heading is the AI scaffold reflex; refuse it.

## 4. Elevation

Flat by default. The B & W visual system communicates structure through borders and background contrast, not shadows. A vanilla surface, a hairline border (`1px solid #E5E5E5`), and a Panda Black header creates all the depth needed.

Shadows appear only as a response to hover state on interactive cards and dropdown menus — never on static surfaces. The presence of a shadow on a static card signals "click me" which is a lie if the card is not interactive.

### Named Rules

**The Flat-By-Default Rule.** Static surfaces have no shadow. Hover and focus states may introduce a single diffuse shadow (`0 4px 24px rgba(0,0,0,0.10)`) to signal interactivity. Never use shadows decoratively. If a layout feels "flat" without shadows, the issue is contrast, not elevation — increase border contrast or background differentiation instead.

## 5. Components

*Seed mode: no components exist yet. Re-run `/impeccable document` once components are built to extract specific HTML/CSS patterns. The principles below guide implementation.*

### Buttons
- **Primary:** Panda Black background (`#0A0A0A`), vanilla text (`#FAF8F3`). Padding `14px 32px`. No border radius (or 2px max — sharp, not rounded). Uppercase label (≤4 words). Hover: accent color background, maintain vanilla text.
- **Secondary / Ghost:** Transparent background, Panda Black border (`1px solid #0A0A0A`), Panda Black text. Hover: fill with Panda Black, flip to vanilla text.
- **No rounded buttons.** Pill shapes read as playful; sharp or minimal-radius reads as technical authority.

### Cards / Containers
- **Background:** Vanilla (`#FAF8F3`) with `1px solid #E5E5E5` border. No shadow at rest.
- **Hover (interactive cards):** Diffuse shadow `0 4px 24px rgba(0,0,0,0.10)`, border shifts to `#0A0A0A`.
- **Internal padding:** `24px` (desktop), `16px` (mobile). Never nest cards.

### Price Display (public quoter)
- JetBrains Mono for all amounts. Weight 600.
- Total line: Display-weight (`2rem+`) in Panda Black.
- "Con Tarjeta" / "Con PSE" sub-totals: Title weight in Component Gray.
- Disclaimer ("Precio aproximado, sujeto a cambios"): Label size, Component Gray, italic.

### Navigation
- Top nav. Panda Black background on desktop; vanilla on mobile (hamburger menu).
- Navigation labels: Label style (weight 500, no uppercase). Active state: accent color underline, not accent color text fill.
- CTA in nav ("Cotiza tu PC"): Primary button style, right-aligned.

## 6. Do's and Don'ts

### Do:

- **Do** use weight 800 at display scale and weight 400 at body scale — the contrast between them *is* the hierarchy. No other emphasis mechanism needed.
- **Do** price amounts in JetBrains Mono. A number in monospace reads as computed and precise; a number in sans reads as estimated.
- **Do** keep the panda mascot to one or two deliberate appearances (loading state, empty state, footer). The mascot is a character moment, not a pattern.
- **Do** build mobile-first at 375px. Most customers arrive via WhatsApp on Android. The desktop design is an enhancement, not the baseline.
- **Do** use `prefers-reduced-motion` for all transition/entrance animations. Provide instant-switch alternatives.
- **Do** ensure WCAG AA contrast on all body text: 4.5:1 minimum. Component Gray (`#6B6B6B`) on Vanilla (`#FAF8F3`) passes; `#6B6B6B` on white does not — verify at implementation.

### Don't:

- **Don't** use RGB neon or multi-color accent systems. No rainbow gradients, no glow effects, no LED-strip aesthetic. The B & W brand is exactly what the name says.
- **Don't** design a layout that reads like a product listing page (MercadoLibre / Amazon). Grid of product cards with prices and no brand context erodes trust. The quoter is a tool, not a catalog.
- **Don't** use a Wix/Squarespace template visual grammar — stock photography heroes, centered-everything layouts, generic "Our Services" section titles in the same font and size as every other site. Every design choice should be deliberate.
- **Don't** use gradient text (`background-clip: text` with a gradient). The accent is solid; text is solid. Gradients read as decoration, not precision.
- **Don't** use all-caps section eyebrows. No "SERVICIOS" or "CONTACTO" in wide-tracked uppercase above every heading. That is the AI scaffold reflex. Use Headline type, no eyebrow.
- **Don't** add a second accent color. If you find yourself reaching for a second color to "differentiate" a section, the problem is layout density or typographic hierarchy — not color.
- **Don't** use side-stripe borders (thick `border-left` accents on cards or callouts). Rewrite with full borders, background tints, or bold leading numbers.
- **Don't** design Component Gray as body text. `#6B6B6B` is metadata and secondary labels only. Body copy must be Panda Black or within 10% of it.
