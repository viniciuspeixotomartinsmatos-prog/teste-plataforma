(() => {

  if (window.shadcnStudioTheme) return;

  const MESSAGE_TYPES = {
    SCRIPT_LOADED: 'SHADCN_STUDIO_SCRIPT_LOADED',
    CHECK_SUPPORT: 'SHADCN_STUDIO_CHECK_SUPPORT',
    SUPPORT_STATUS: 'SHADCN_STUDIO_SUPPORT_STATUS',
    THEME_UPDATE: 'SHADCN_STUDIO_THEME_UPDATE',
    THEME_APPLIED: 'SHADCN_STUDIO_THEME_APPLIED',
    RESET_THEME: 'SHADCN_STUDIO_RESET_THEME',
    THEME_RESET: 'SHADCN_STUDIO_THEME_RESET',
    MODE_CHANGED: 'SHADCN_STUDIO_MODE_CHANGED'
  };

  const REQUIRED_SHADCN_VARS = [
    "--background", "--foreground", "--card", "--card-foreground",
    "--popover", "--popover-foreground", "--primary", "--primary-foreground",
    "--secondary", "--secondary-foreground", "--muted", "--muted-foreground",
    "--accent", "--accent-foreground", "--destructive", "--border",
    "--input", "--ring", "--radius"
  ];

  function checkShadcnSupport() {
    const rootStyles = getComputedStyle(document.documentElement);

    return REQUIRED_SHADCN_VARS.some(v => rootStyles.getPropertyValue(v).trim() !== "");
  }

  function loadAllGoogleFonts() {
    const fontUrl = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fira+Code:wght@300..700&family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400..700;1,400..700&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Roboto:ital,wght@0,100..900;1,100..900&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&family=Space+Grotesk:wght@300..700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Nunito:ital,wght@0,200..1000;1,200..1000&family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Noto+Serif+Georgian:wght@100..900&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Orbitron:wght@400..900&family=Creepster&family=Bebas+Neue&family=Figtree:ital,wght@0,300..900;1,300..900&family=Raleway:ital,wght@0,100..900;1,100..900&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Public+Sans:ital,wght@0,100..900;1,100..900&family=Hind:wght@300;400;500;600;700&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Manrope:wght@200..800&family=Oxanium:wght@200..800&family=Roboto+Slab:wght@100..900&family=Bitter:ital,wght@0,100..900;1,100..900&family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Delius+Swash+Caps&family=Gabriela&display=swap';

    if (document.querySelector(`link[href*="fonts.googleapis.com"][href*="DM+Sans"]`)) return;

    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href = fontUrl;
    document.head.appendChild(link);
  }

  function colorFormatter(value) {
    if (typeof value === 'string' && value.includes('oklch')) return value;

    return value;
  }

  function overrideFontClasses(fonts) {
    const styleId = "shadcn-studio-font-override";
    let existingStyle = document.getElementById(styleId);

    if (!existingStyle) {
      existingStyle = document.createElement("style");
      existingStyle.id = styleId;
      document.head.appendChild(existingStyle);
    }

    let cssRules = "";

    if (fonts.sans) cssRules += `.font-sans, body { font-family: ${fonts.sans} !important; }\n`;
    if (fonts.serif) cssRules += `.font-serif { font-family: ${fonts.serif} !important; }\n`;
    if (fonts.mono) cssRules += `.font-mono, code, pre { font-family: ${fonts.mono} !important; }\n`;

    existingStyle.textContent = cssRules;
  }

  const RADIUS_MAP = {
    default: '0.625rem',
    none: '0',
    small: '0.45rem',
    medium: '0.625rem',
    large: '0.875rem'
  };

  function resolveRadius(radius) {
    if (!radius) return RADIUS_MAP.default;
    return RADIUS_MAP[radius] !== undefined ? RADIUS_MAP[radius] : radius;
  }

  function applyThemeStyles(root, themeStyles, mode) {
    // themeStyles is a ThemeStyles object: { styles: { light, dark, radius, style, menuColor, menuAccent, fonts, ... } }
    const stylesConfig = themeStyles.styles || {};
    const lightStyles = stylesConfig.light || {};
    const darkStyles = stylesConfig.dark || {};

    let styleString = '';

    for (const [key, value] of Object.entries(lightStyles)) {
      if (typeof value === "string" && value.trim()) {
        styleString += `--${key}: ${colorFormatter(value)}; `;
      }
    }

    if (mode === "dark") {
      for (const [key, value] of Object.entries(darkStyles)) {
        if (typeof value === "string" && value.trim()) {
          styleString += `--${key}: ${colorFormatter(value)}; `;
        }
      }
    }

    // Apply radius — lives at styles.radius (named value), NOT inside light/dark
    const radiusCss = resolveRadius(stylesConfig.radius);

    styleString += `--radius: ${radiusCss}; `;

    styleString += `color-scheme: ${mode}; `;

    root.setAttribute('style', styleString.trim());
    root.setAttribute('data-theme', mode);
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    const modeStyles = mode === "dark" ? (darkStyles || {}) : lightStyles;
    const shadowColor = modeStyles["shadow-color"] || "oklch(0.00 0 0)";
    const shadowOpacity = parseFloat(modeStyles["shadow-opacity"] || "0.1");
    const shadowBlur = modeStyles["shadow-blur"] || "2px";
    const shadowSpread = modeStyles["shadow-spread"] || "0px";
    const shadowOffsetX = modeStyles["shadow-offset-x"] || "0px";
    const shadowOffsetY = modeStyles["shadow-offset-y"] || "1px";

    const createColorWithOpacity = (baseOpacity) => {
      const finalOpacity = (shadowOpacity * baseOpacity).toFixed(2);
      const colorMatch = shadowColor.match(/oklch\((.*?)\)/)?.[1] || "0 0 0";
      const colorValues = colorMatch.split(" / ")[0];

      return `oklch(${colorValues} / ${finalOpacity})`;
    };

    const secondLayer = (fixedOffsetY, fixedBlur) => {
      const spread2 = `${parseFloat(shadowSpread.replace("px", "") || "0") - 1}px`;
      const color2 = createColorWithOpacity(1.0);

      return `${shadowOffsetX} ${fixedOffsetY} ${fixedBlur} ${spread2} ${color2}`;
    };

    root.style.setProperty("--shadow-2xs", `${shadowOffsetX} ${shadowOffsetY} ${shadowBlur} ${shadowSpread} ${createColorWithOpacity(0.5)}`);
    root.style.setProperty("--shadow-xs", `${shadowOffsetX} ${shadowOffsetY} ${shadowBlur} ${shadowSpread} ${createColorWithOpacity(0.5)}`);
    root.style.setProperty("--shadow-2xl", `${shadowOffsetX} ${shadowOffsetY} ${shadowBlur} ${shadowSpread} ${createColorWithOpacity(2.5)}`);
    const shadowSm = `${shadowOffsetX} ${shadowOffsetY} ${shadowBlur} ${shadowSpread} ${createColorWithOpacity(1.0)}, ${secondLayer("1px", "2px")}`;

    root.style.setProperty("--shadow-sm", shadowSm);
    root.style.setProperty("--shadow", shadowSm);
    root.style.setProperty("--shadow-md", `${shadowOffsetX} ${shadowOffsetY} ${shadowBlur} ${shadowSpread} ${createColorWithOpacity(1.0)}, ${secondLayer("2px", "4px")}`);
    root.style.setProperty("--shadow-lg", `${shadowOffsetX} ${shadowOffsetY} ${shadowBlur} ${shadowSpread} ${createColorWithOpacity(1.0)}, ${secondLayer("4px", "6px")}`);
    root.style.setProperty("--shadow-xl", `${shadowOffsetX} ${shadowOffsetY} ${shadowBlur} ${shadowSpread} ${createColorWithOpacity(1.0)}, ${secondLayer("8px", "10px")}`);

    const currentFonts = {
      sans: stylesConfig.fonts?.sans,
      serif: stylesConfig.fonts?.serif,
      mono: stylesConfig.fonts?.mono
    };

    Object.entries(currentFonts).forEach(([type, fontValue]) => {
      if (fontValue && typeof fontValue === "string") {
        root.style.setProperty(`--font-${type}`, fontValue);
      }
    });

    overrideFontClasses(currentFonts);
  }

  function applyTheme(themeState) {
    const root = document.documentElement;

    if (!root || !themeState || !themeState.styles) return;

    const { currentMode: mode, styles: themeStyles } = themeState;

    applyThemeStyles(root, themeStyles, mode);
  }

  function sendMessageToParent(message) {
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage(message, "*");
      } catch (error) {
        console.warn("Shadcn Studio: Failed to send message to parent:", error);
      }
    }
  }

  const handleMessage = (event) => {
    if (!event.data || typeof event.data.type !== "string") return;
    if (event.source !== window.parent) return;

    const { type, payload } = event.data;

    switch (type) {
      case MESSAGE_TYPES.CHECK_SUPPORT:
        // Check support synchronously when requested (on-demand)
        const isSupported = checkShadcnSupport();
        sendMessageToParent({
          type: MESSAGE_TYPES.SUPPORT_STATUS,
          payload: { supported: isSupported }
        });
        break;

      case MESSAGE_TYPES.THEME_UPDATE:
        if (payload && payload.themeState) {
          applyTheme(payload.themeState);
          sendMessageToParent({ type: MESSAGE_TYPES.THEME_APPLIED });
        }

        break;

      case MESSAGE_TYPES.RESET_THEME:
        const root = document.documentElement;

        root.removeAttribute('style');
        root.removeAttribute('data-theme');

        const fontOverrideStyle = document.getElementById("shadcn-studio-font-override");

        if (fontOverrideStyle) fontOverrideStyle.remove();

        sendMessageToParent({ type: MESSAGE_TYPES.THEME_RESET });
        break;

      default:
        break;
    }
  };

  window.addEventListener("message", handleMessage);

  window.shadcnStudioTheme = {
    initialized: true,
    version: "1.0.0",
    observer: null,
    destroy: () => {
      if (window.shadcnStudioTheme.observer) {
        window.shadcnStudioTheme.observer.disconnect();
      }

      window.removeEventListener("message", handleMessage);
      delete window.shadcnStudioTheme;
    }
  };

  loadAllGoogleFonts();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const root = document.documentElement;
        const mode = root.classList.contains('dark') ? 'dark' : 'light';

        sendMessageToParent({
          type: MESSAGE_TYPES.MODE_CHANGED,
          payload: { mode }
        });
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  window.shadcnStudioTheme.observer = observer;

  sendMessageToParent({
    type: MESSAGE_TYPES.SCRIPT_LOADED
  });
})();
