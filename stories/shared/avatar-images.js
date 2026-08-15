function portrait({ background, shirt, skin, hair, accent }) {
  const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <rect width="160" height="160" fill="${background}"/>
    <circle cx="80" cy="69" r="35" fill="${skin}"/>
    <path d="M35 160c4-34 20-53 45-53s41 19 45 53" fill="${shirt}"/>
    <path d="M47 66c0-31 15-47 34-47 24 0 36 17 34 49-8-3-15-9-20-18-13 12-28 18-48 16Z" fill="${hair}"/>
    <circle cx="68" cy="72" r="3" fill="#111827"/>
    <circle cx="93" cy="72" r="3" fill="#111827"/>
    <path d="M70 89c8 6 16 6 23 0" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(source)}`;
}

export const avatarImages = {
  ada: portrait({
    background: "#e7e5e4",
    shirt: "#111827",
    skin: "#8f543d",
    hair: "#171717",
    accent: "#5f2e21",
  }),
  kelvin: portrait({
    background: "#dbeafe",
    shirt: "#172554",
    skin: "#70412f",
    hair: "#0a0a0a",
    accent: "#4c291f",
  }),
  maya: portrait({
    background: "#ede9fe",
    shirt: "#4c1d95",
    skin: "#c47e5e",
    hair: "#292524",
    accent: "#854d3a",
  }),
};
