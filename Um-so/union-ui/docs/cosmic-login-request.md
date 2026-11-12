# Cosmic Interactive Experience — specification and validation, 2026-11-10

## Priority and source

The latest user-supplied request is attachment `9bbe4186-5911-4290-abed-71b3000758ab`, accompanied by `Login Neon com Astronauta em Partículas.png`. Section 14 explicitly preserves the priority of existing work and adds this request to the queue. This document preserves the specification; the Status section records implementation and outstanding verification. Continue the full earlier delivery ledger before this screen. No new paid service is authorized.

## Visual invariants

Use the supplied neon cosmic login screenshot as the screen-specific reference: actual editable Portuguese form, left glass panel, original astronaut/planet/yellow rays/purple nebula composition on the right, supplied company identity, existing privacy/terms/cookies and language actions. Preserve authentication, confirmation, recovery, resend, safe errors and keyboard controls. Do not apply the cosmic illustration to the whole app or discard the approved glass library system. Inputs and submit remain actual controls, never pixels from a screenshot. Natural vertical scrolling must preserve every field at short heights and browser zoom; do not scale or zoom the whole page.

## Asset preflight

At the original preflight, `src/AuthIllustration.jsx` contained a quote only; `src/account.css` uses the composite `/assets/auth/cosmic-login.png`. Later Apple shell overrides hide that art. There is no isolated astronaut mesh/sprite in this component and no supplied 3D model. The new attachment is also a composite raster reference. It cannot directly supply independently moving astronaut, planet, fixed yellow rays and background layers.

Before implementing localized disintegration, obtain a faithful transparent astronaut layer and matching clean background/planet layers while retaining the supplied originals. Prefer layered original assets if available. Generated separation would be an approximation requiring visual comparison; do not claim exact original geometry or a recovered 3D model. Do not animate the entire raster, apply a global glitch, or retain a second baked astronaut behind dissolving particles. Do not invent an Ollo implementation: that source was not attached here.

## Interaction acceptance

- Assemble around the recognizable silhouette during an approximately two-second entrance; calm idle afterward, subtle occasional edge light.
- Actual sampled silhouette particles, each with rest/current position, velocity, acceleration, spring-return force, cursor repulsion, damping and individual variation.
- Local repulsion follows actual cursor coordinates and bounded cursor speed. Fast movement produces local separation, short trails and controlled chromatic/glitch slices; return begins approximately 0.8–1.5 seconds later, with damped overshoot. No teleportation or unrelated random spray.
- Click/tap pulse originates at the hit point and produces a reversible 1.5–2.5-second radial reaction. Bound repeat clicks and preserve a recognizable figure throughout.
- Subtle depth: astronaut maximum 6–10px, intermediate layers <=5px, planet <=3px, distant backdrop <=2px. Fixed base composition and yellow-ray geometry. Float 4–7px on a 5–7-second cycle, reduced during disintegration.
- Ambient stars/nebula and near-cursor glow remain restrained and confined to the art region. Particles cannot cover inputs or intercept their pointer/keyboard events.
- Reuse actual Star Border for the submit control; approximately 200ms input focus transitions, visible accessible focus, restrained glass hover/press states. No fake or disabled working authentication action.

## Runtime architecture and fallback

Use the existing React stack, requestAnimationFrame with bounded delta time and typed/batched particles. Canvas 2D is acceptable if the actual image-sampled simulation meets the visual/performance budget; use an existing GPU stack only where profiling justifies it. Do not add multiple rendering libraries. Cap DPR and adapt particle count to area, measured frame time and pointer capabilities. No per-particle DOM nodes or per-frame React state/layout updates.

Pause for document visibility, offscreen intersection and reduced motion. Dispose listeners, observers, RAF, image loads, buffers and GPU resources on unmount. Static isolated astronaut remains the fallback for initialization failure/context loss. Reduced motion presents a static recognizable scene without disintegration, parallax or ongoing simulation. Mobile prioritizes login and bounded touch feedback. Aim for 60fps on capable devices, but report measured device/viewport results rather than guaranteeing it universally.

## Required verification before completion

Capture baseline and final screen. Verify idle/entrance, slow/fast localized hover, cursor leave, spring reconstruction, click and repeated click, scroll/resize coordinate mapping, input focus/tab/submit/errors, signup/resend/recovery/confirmation, visibility pause/resume, offscreen cleanup, reduced motion and rendering failure. Desktop, short notebook, phone, browser zoom 100/125/150%, touch/virtual-keyboard behavior and measured performance need explicit evidence. A screenshot, mounted canvas or successful build does not prove presented frames or particle physics. Preserve technical source/asset notices and all original reference files.

## Status

Implemented using the retained transparent seated astronaut artwork and sampled spring particles. The form remains functional in both languages. Physics and form regression tests pass. Browser validation, screenshot comparison and device performance measurements are still pending.

The final revision renders only the right art region of the supplied original neon reference (retained unchanged) rather than the earlier lower-resolution transparent illustration. The form remains real application controls. Bright body-region tiles move over a cleared raster region; the background is not a recovered independent scene/model. Reference fidelity, crop boundaries and device performance remain browser acceptance items.

November 11 authorized browser acceptance: the exact reference crop is reassembled at rest with zero differing pixel channels; localized click response changes the sampled astronaut region. Reduced motion presents the static art. Corrected the dark wordmark under the light preference and decorative canvas bleed that widened the mobile viewport. Mobile form width now equals the 390px content viewport. Login controls, language switch, password visibility and local synthetic sign-in passed. A single 89-interval desktop sample averaged 10.61ms per animation frame (p95 14ms); this does not validate every device, zoom level or virtual keyboard. The independently layered astronaut/depth/scene specification remains beyond the composite raster asset. See design-qa.md for screenshots and precise remaining acceptance.

November 11 follow-through: cursor repulsion now uses time-normalized speed, zero entry impulse and explicit leave/cancel cleanup. Original composite and exact-rest behavior remain. Independent neon body and matching clean backdrop are still absent; do not claim those layers were recovered.
