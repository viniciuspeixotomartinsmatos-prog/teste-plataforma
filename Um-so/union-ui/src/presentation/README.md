# Nítido presentation

Standalone GSAP presentation page and deterministic 48-second, 1920 × 1080, 30 fps film. This is a separate presentation artifact; it does not replace the authenticated application or enable payments.

The film uses actual captures from the current checkout in an isolated local demonstration account, with a loaded interactive preview, playground, successful prompt-copy state, a section added to the builder, and a saved favorite. It does not claim to be a capture of the deployed production account.

Required local media in `NITIDO_VIDEO_DIR/assets`: `logo.png` (unchanged original Nítido bitmap), `cabinet-400.woff2`, `cabinet-700.woff2`, `cabinet-800.woff2`, `gsap.min.js`, `ScrollTrigger.min.js`, `heros.png`, `fundos.png`, `previa.png`, `playground.png`, `prompt.png`, `montador.png`, `favoritos.png`, `ferramentas.png`, `narracao.mp3`, `narracao.vtt`, `trilha.wav`. Cabinet Grotesk is obtained from the official Fontshare CDN; GSAP uses the project's installed distribution.

Set `NITIDO_VIDEO_DIR` to the media/output folder and run `node scripts/render-nitido-film.mjs` for the standalone page at `http://127.0.0.1:4188`. Add `--render` with `FFMPEG_PATH` set to a local FFmpeg executable to export the MP4. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` optionally selects an installed Chromium executable.

The voice is Microsoft Edge TTS `pt-BR-AntonioNeural`, rate `-2%`. Captions follow the returned sentence timing. The synthetic instrumental bed and transition effects are locally authored. Captures, exported media, local database, cookies, and temporary recording sessions are not committed. Keep any distributed package restricted to the finished media, local font/GSAP assets, and presentation files; never include the capture tooling directory or session state.

The page supports keyboard navigation, a working three-image carousel, user-initiated video playback, responsive layout, and reduced-motion preferences. On desktop the demo copy pins during scrolling and its words reveal progressively. The original wordmark remains unmodified and static; motion is applied to the surrounding composition and screenshots.
