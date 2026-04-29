---
name: Cosmic Cinematic
colors:
  surface: '#10131b'
  surface-dim: '#10131b'
  surface-bright: '#353942'
  surface-container-lowest: '#0a0e16'
  surface-container-low: '#181c24'
  surface-container: '#1c2028'
  surface-container-high: '#262a33'
  surface-container-highest: '#31353e'
  on-surface: '#e0e2ee'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e0e2ee'
  inverse-on-surface: '#2d3039'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#ebb2ff'
  on-secondary: '#520072'
  secondary-container: '#b600f8'
  on-secondary-container: '#fff6fc'
  tertiary: '#fbf3ff'
  on-tertiary: '#392756'
  tertiary-container: '#e4d1ff'
  on-tertiary-container: '#685587'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#f8d8ff'
  secondary-fixed-dim: '#ebb2ff'
  on-secondary-fixed: '#320047'
  on-secondary-fixed-variant: '#74009f'
  tertiary-fixed: '#ecdcff'
  tertiary-fixed-dim: '#d3bcf6'
  on-tertiary-fixed: '#231140'
  on-tertiary-fixed-variant: '#503e6e'
  background: '#10131b'
  on-background: '#e0e2ee'
  surface-variant: '#31353e'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.2em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-page: 40px
  stack-sm: 16px
  stack-md: 32px
  stack-lg: 64px
---

## Brand & Style

The design system is engineered to evoke the vastness of the cosmos through a high-fidelity, immersive interface. It targets premium events, exclusive galas, and futuristic product launches where the invitation serves as the first touchpoint of an "experience" rather than just information.

The aesthetic blends **Glassmorphism** with **Minimalism**. It utilizes deep layered depth and atmospheric gradients to simulate nebulae, while maintaining a strict, clean structural grid. The emotional response is one of awe, sophistication, and anticipation—mirroring the visual language of high-end science fiction cinema.

## Colors

This design system utilizes a "Deep Space" palette. The background is not a flat black, but a rich composition of `#02040A` (Obsidian) and `#12002F` (Deep Midnight). 

- **Primary (Electric Cyan):** Reserved for high-priority calls to action and critical interactive states. It should feel like a light-source emitting from the screen.
- **Secondary (Neon Violet):** Used for secondary interactions, accents, and decorative glow effects.
- **Surface Tints:** Deep purples and blues are used in semi-transparent layers to create a sense of atmospheric haze.
- **Gradients:** Use linear gradients (45deg) transitioning from Cyan to Violet for special "hero" moments or active progress indicators.

## Typography

The typography strategy balances technical precision with human readability. **Space Grotesk** is used for headings and labels to provide a futuristic, geometric edge that feels calculated and modern. **Manrope** is used for body copy to ensure that even within a cinematic environment, information remains clear and grounded.

Headings should often be paired with subtle text-shadows in the primary or secondary color to simulate a "glow" effect, especially on larger display sizes. High letter-spacing on uppercase labels is encouraged to enhance the premium, editorial feel.

## Layout & Spacing

This design system employs a **Fixed Grid** for desktop and a **Fluid Grid** for mobile devices. The layout is centered and symmetrical to emphasize the "invitation" aspect. 

A 12-column grid is used with generous gutters to allow the cosmic backgrounds to breathe. Padding within components is expansive; avoid cramped elements. Use "Stack" spacing (multiples of 8px) to maintain a vertical rhythm that feels intentional and airy.

## Elevation & Depth

Depth is the cornerstone of this design system. Rather than traditional drop shadows, use **Glassmorphism** and **Backdrop Blurs**.

- **Z-Index 1 (Deep):** Background gradients and star-field patterns.
- **Z-Index 2 (Plates):** Semi-transparent surfaces (approx. 10-20% opacity) with a `blur(20px)` effect. These should have a 1px solid border at 15% white to define the edges.
- **Z-Index 3 (Active):** Elements that "float" above the glass, using a soft, outer glow (diffused shadow) tinted with the primary or secondary color instead of black.

## Shapes

The shape language is "Soft-Tech." While the theme is futuristic, sharp corners are avoided to keep the invitation feeling welcoming and elegant. 

Standard components use a 0.25rem radius. Larger containers or "hero" cards utilize the `rounded-xl` (0.75rem) setting. Interactive elements like buttons should maintain the consistent soft radius rather than being fully pill-shaped, preserving a structured, architectural look.

## Components

### Buttons
Primary buttons are solid fills of the Primary Color with black text. Secondary buttons are "ghost" style with a 1px Primary Color border and a subtle hover glow. All buttons should have a slight `transition: all 0.3s ease` to emphasize the interactive nature.

### Cards
Cards are the primary content vessels. They must use the glassmorphic style: a dark, semi-transparent background, a 1px subtle top-down gradient border, and a significant backdrop-blur to ensure legibility over the cosmic background.

### Input Fields
Inputs should be dark and recessed, with a bottom-border only or a very faint outline. Upon focus, the border should glow with the Primary Color.

### Interactive Accents
- **Chips:** Use for tags (e.g., "VIP", "Black Tie"). These should have a very subtle secondary color tint.
- **Lists:** Bullet points should be replaced with small, glowing diamond shapes or "+" symbols in the primary color.
- **Countdown Timer:** A custom component for invitations, featuring large, thin-weight Space Grotesk numbers with a faint neon flicker effect.