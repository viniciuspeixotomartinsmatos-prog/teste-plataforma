// Compatibility entry point. The old standalone static server bypassed the
// application's authenticated asset path and could not prove production
// behavior. Generate the protected local harness instead; it is served only by
// the existing application under /tools/runtime-audit/.
import './runtime-audit/build.mjs';
