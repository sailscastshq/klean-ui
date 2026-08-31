<script setup>
import { computed } from "vue";
import { useFrame } from "pellicule";
import metadata from "../../icons/metadata.json";

defineVideoConfig({
  durationInSeconds: 10,
  fps: 60,
  width: 1920,
  height: 1080,
});

const frame = useFrame();
const iconModules = import.meta.glob("../../src/vue/icons/*.vue", {
  eager: true,
  import: "default",
});

const icons = metadata.icons.map((icon) => ({
  ...icon,
  component: iconModules[`../../src/vue/icons/${icon.name}.vue`],
}));

const iconByName = Object.fromEntries(icons.map((icon) => [icon.name, icon]));

const clusters = [
  {
    label: "Navigate",
    color: "#93a1b2",
    names: ["ArrowRight", "ChevronDown", "Menu", "Search", "ExternalLink"],
  },
  {
    label: "Communicate",
    color: "#ff8c2a",
    names: ["Bell", "Chat", "Envelope", "Share", "Users"],
  },
  {
    label: "Create",
    color: "#f2efe7",
    names: ["Edit", "DocumentText", "Image", "Calendar", "Tag"],
  },
  {
    label: "Ship",
    color: "#2398ea",
    names: ["Server", "Database", "CloudUpload", "Terminal", "Rocket"],
  },
].map((cluster) => ({
  ...cluster,
  icons: cluster.names.map((name) => iconByName[name]),
}));

const hagfishIcons = icons.filter((icon) =>
  icon.applications.includes("hagfish"),
);
const slipwayIcons = icons.filter((icon) =>
  icon.applications.includes("slipway"),
);

const clamp = (value, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const easeOutCubic = (value) => 1 - Math.pow(1 - clamp(value), 3);
const easeInOutCubic = (value) => {
  const progress = clamp(value);
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
};

const progress = (start, end) => clamp((frame.value - start) / (end - start));
const tween = (start, end, from, to, easing = easeOutCubic) =>
  from + (to - from) * easing(progress(start, end));
const windowOpacity = (enterStart, enterEnd, exitStart, exitEnd) =>
  Math.min(progress(enterStart, enterEnd), 1 - progress(exitStart, exitEnd));

const openingOpacity = computed(() => windowOpacity(0, 18, 82, 104));
const rocketDraw = computed(() => tween(4, 58, 80, 0));
const rocketScale = computed(() => tween(0, 60, 0.72, 1));
const wordmarkStyle = computed(() => ({
  opacity: progress(38, 62),
  transform: `translateY(${tween(38, 62, 32, 0)}px)`,
  letterSpacing: `${tween(38, 80, 0.34, 0.2)}em`,
}));

const clusterOpacity = computed(() => windowOpacity(72, 94, 188, 216));
const clusterGridStyle = computed(() => ({
  transform: `translateY(${tween(72, 104, 54, 0)}px) scale(${tween(72, 112, 0.95, 1)})`,
}));

function clusterItemStyle(clusterIndex, itemIndex) {
  const start = 82 + clusterIndex * 8 + itemIndex * 3;
  const itemProgress = easeOutCubic(progress(start, start + 16));
  return {
    opacity: itemProgress,
    transform: `translateY(${(1 - itemProgress) * 28}px) scale(${0.82 + itemProgress * 0.18})`,
  };
}

const fieldOpacity = computed(() => windowOpacity(176, 210, 342, 370));
const fieldStyle = computed(() => {
  const camera = easeInOutCubic(progress(184, 336));
  const scale = 3.4 - camera * 2.36;
  const x = 390 - camera * 390;
  const y = 210 - camera * 210;
  return {
    transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
  };
});

function fieldItemStyle(index) {
  const column = index % 14;
  const row = Math.floor(index / 14);
  const delay = 182 + ((column * 5 + row * 9) % 34);
  const itemProgress = easeOutCubic(progress(delay, delay + 12));
  return {
    opacity: itemProgress,
    transform: `scale(${0.72 + itemProgress * 0.28})`,
  };
}

const splitOpacity = computed(() => windowOpacity(326, 352, 412, 438));
const hagfishPanelStyle = computed(() => ({
  transform: `translateX(${tween(326, 362, -180, 0)}px)`,
}));
const slipwayPanelStyle = computed(() => ({
  transform: `translateX(${tween(326, 362, 180, 0)}px)`,
}));

const paperReveal = computed(() => easeInOutCubic(progress(414, 456)));
const posterOpacity = computed(() => progress(428, 454));
const posterHeaderStyle = computed(() => ({
  opacity: progress(440, 470),
  transform: `translateY(${tween(440, 474, 34, 0)}px)`,
}));

function posterItemStyle(index) {
  const column = index % 10;
  const row = Math.floor(index / 10);
  const start = 438 + row * 4 + column * 1.35;
  const itemProgress = easeOutCubic(progress(start, start + 18));
  const x = (4.5 - column) * 58 * (1 - itemProgress);
  const y = (4.5 - row) * 32 * (1 - itemProgress);
  return {
    opacity: itemProgress,
    transform: `translate3d(${x}px, ${y}px, 0) scale(${0.58 + itemProgress * 0.42})`,
  };
}

function applicationClass(icon) {
  if (icon.applications.length === 2) return "is-shared";
  if (icon.applications.includes("hagfish")) return "is-hagfish";
  if (icon.applications.includes("slipway")) return "is-slipway";
  return "is-klean";
}
</script>

<template>
  <main class="film">
    <div class="grain" aria-hidden="true" />

    <section class="opening scene" :style="{ opacity: openingOpacity }">
      <div
        class="rocket-mark"
        :style="{
          '--rocket-draw': rocketDraw,
          transform: `scale(${rocketScale})`,
        }"
      >
        <component :is="iconByName.Rocket.component" />
      </div>
      <div class="opening-copy" :style="wordmarkStyle">
        <p>KELVIN’S LEAN UI</p>
        <h1>KLEAN</h1>
      </div>
    </section>

    <section class="cluster-scene scene" :style="{ opacity: clusterOpacity }">
      <header class="scene-heading">
        <span>One visual language.</span>
        <strong>Built from real application work.</strong>
      </header>
      <div class="cluster-grid" :style="clusterGridStyle">
        <article
          v-for="(cluster, clusterIndex) in clusters"
          :key="cluster.label"
          class="cluster"
        >
          <p :style="{ color: cluster.color }">{{ cluster.label }}</p>
          <div class="cluster-icons">
            <div
              v-for="(icon, itemIndex) in cluster.icons"
              :key="icon.name"
              class="cluster-icon"
              :style="clusterItemStyle(clusterIndex, itemIndex)"
            >
              <component :is="icon.component" />
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="field-scene scene" :style="{ opacity: fieldOpacity }">
      <div class="icon-field" :style="fieldStyle">
        <div
          v-for="(icon, index) in icons"
          :key="icon.name"
          class="field-icon"
          :class="applicationClass(icon)"
          :style="fieldItemStyle(index)"
        >
          <component :is="icon.component" />
        </div>
      </div>
      <p class="field-count"><strong>98</strong> original SVGs</p>
    </section>

    <section class="split-scene scene" :style="{ opacity: splitOpacity }">
      <article class="app-panel hagfish-panel" :style="hagfishPanelStyle">
        <div class="app-panel-copy">
          <p>Hagfish</p>
          <strong>{{ hagfishIcons.length }}</strong>
          <span>expressive product moments</span>
        </div>
        <div class="app-icons">
          <component
            :is="icon.component"
            v-for="icon in hagfishIcons.slice(0, 18)"
            :key="icon.name"
          />
        </div>
      </article>
      <article class="app-panel slipway-panel" :style="slipwayPanelStyle">
        <div class="app-panel-copy">
          <p>Slipway</p>
          <strong>{{ slipwayIcons.length }}</strong>
          <span>operational product work</span>
        </div>
        <div class="app-icons">
          <component
            :is="icon.component"
            v-for="icon in slipwayIcons.slice(0, 18)"
            :key="icon.name"
          />
        </div>
      </article>
      <div class="shared-mark">
        <span>ONE</span>
        <strong>SOURCE FAMILY</strong>
      </div>
    </section>

    <section
      class="poster scene"
      :style="{
        opacity: posterOpacity,
        clipPath: `inset(0 ${(1 - paperReveal) * 100}% 0 0)`,
      }"
    >
      <header class="poster-heading" :style="posterHeaderStyle">
        <div>
          <p>KELVIN’S LEAN UI</p>
          <h2>KLEAN ICONS</h2>
        </div>
        <div class="poster-facts">
          <strong>98 original SVGs</strong>
          <span>Vue · React · Svelte</span>
        </div>
      </header>

      <div class="poster-grid">
        <div
          v-for="(icon, index) in icons"
          :key="icon.name"
          class="poster-icon"
          :class="applicationClass(icon)"
          :style="posterItemStyle(index)"
        >
          <component :is="icon.component" />
          <span>{{ icon.name }}</span>
        </div>
      </div>

      <footer class="poster-footer">
        <span>24PX CANVAS · 1.5PX STROKE · ROUNDED JOINS</span>
        <strong>Own the source.</strong>
      </footer>
    </section>
  </main>
</template>

<style>
:root {
  color-scheme: dark;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
}

body {
  background: #060912;
}

.film {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 30%, rgb(38 48 65 / 0.42), transparent 46%),
    #060912;
  color: #f7f4ec;
  font-family:
    Inter,
    ui-sans-serif,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  -webkit-font-smoothing: antialiased;
}

.grain {
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  opacity: 0.15;
  background-image: radial-gradient(
    rgb(255 255 255 / 0.28) 0.75px,
    transparent 0.8px
  );
  background-size: 8px 8px;
  mix-blend-mode: soft-light;
}

.scene {
  position: absolute;
  inset: 0;
}

.opening {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 76px;
}

.rocket-mark {
  width: 238px;
  height: 238px;
  color: #f7f4ec;
}

.rocket-mark svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.rocket-mark svg path,
.rocket-mark svg circle {
  stroke-dasharray: 80;
  stroke-dashoffset: var(--rocket-draw);
}

.opening-copy p,
.poster-heading p {
  margin: 0 0 12px;
  color: #93a1b2;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.24em;
}

.opening-copy h1 {
  margin: 0;
  font-size: 156px;
  font-weight: 780;
  line-height: 0.86;
}

.cluster-scene {
  padding: 98px 126px;
}

.scene-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 54px;
  font-size: 24px;
}

.scene-heading span {
  color: #93a1b2;
}

.scene-heading strong {
  font-size: 38px;
  letter-spacing: -0.035em;
}

.cluster-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}

.cluster {
  height: 332px;
  padding: 38px;
  border: 1px solid rgb(255 255 255 / 0.12);
  border-radius: 34px;
  background: rgb(16 22 33 / 0.84);
  box-shadow: 0 34px 90px rgb(0 0 0 / 0.28);
}

.cluster > p {
  margin: 0 0 38px;
  font-size: 20px;
  font-weight: 760;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.cluster-icons {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
}

.cluster-icon {
  display: grid;
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 24px;
  background: #f7f4ec;
  color: #080c14;
  box-shadow: 0 16px 38px rgb(0 0 0 / 0.24);
}

.cluster-icon svg {
  width: 52%;
  height: 52%;
}

.field-scene {
  display: grid;
  place-items: center;
  overflow: hidden;
}

.icon-field {
  display: grid;
  width: 1610px;
  grid-template-columns: repeat(14, 1fr);
  gap: 14px;
  transform-origin: 37% 42%;
}

.field-icon {
  display: grid;
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 22px;
  background: rgb(255 255 255 / 0.07);
  color: #e9edf3;
}

.field-icon svg {
  width: 46%;
  height: 46%;
}

.field-icon.is-hagfish {
  color: #ff922f;
}

.field-icon.is-slipway {
  color: #36a8f5;
}

.field-icon.is-klean {
  background: #f7f4ec;
  color: #080c14;
}

.field-count {
  position: absolute;
  right: 110px;
  bottom: 76px;
  margin: 0;
  color: #93a1b2;
  font-size: 25px;
  letter-spacing: -0.02em;
}

.field-count strong {
  color: #f7f4ec;
  font-size: 78px;
  font-weight: 780;
}

.split-scene {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  padding: 84px;
}

.app-panel {
  position: relative;
  display: grid;
  overflow: hidden;
  align-items: end;
  padding: 58px;
  border-radius: 46px;
  color: white;
}

.hagfish-panel {
  background: #f47d20;
}

.slipway-panel {
  background: #168fdf;
}

.app-panel-copy {
  position: relative;
  z-index: 2;
  display: grid;
}

.app-panel-copy p {
  margin: 0;
  font-size: 28px;
  font-weight: 740;
  text-transform: uppercase;
}

.app-panel-copy strong {
  font-size: 168px;
  line-height: 0.95;
  letter-spacing: -0.07em;
}

.app-panel-copy span {
  margin-top: 10px;
  font-size: 25px;
}

.app-icons {
  position: absolute;
  top: 42px;
  right: 42px;
  display: grid;
  width: 430px;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  opacity: 0.78;
}

.app-icons svg {
  width: 56px;
  height: 56px;
  padding: 13px;
  border-radius: 16px;
  background: rgb(255 255 255 / 0.13);
}

.shared-mark {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 4;
  display: grid;
  min-width: 254px;
  padding: 24px 28px;
  border: 2px solid rgb(255 255 255 / 0.5);
  border-radius: 999px;
  background: #070b13;
  color: white;
  text-align: center;
  transform: translate(-50%, -50%);
}

.shared-mark span {
  color: #98a5b5;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.28em;
}

.shared-mark strong {
  margin-top: 2px;
  font-size: 21px;
}

.poster {
  z-index: 10;
  padding: 68px 116px 52px;
  background:
    radial-gradient(
      circle at 1px 1px,
      rgb(14 21 32 / 0.11) 1px,
      transparent 1.2px
    ),
    #f3efe6;
  background-size: 24px 24px;
  color: #0b1019;
}

.poster-heading {
  display: flex;
  height: 174px;
  align-items: flex-start;
  justify-content: space-between;
}

.poster-heading p {
  color: #667384;
}

.poster-heading h2 {
  margin: 0;
  font-size: 78px;
  font-weight: 800;
  letter-spacing: -0.055em;
  line-height: 0.95;
}

.poster-facts {
  display: grid;
  justify-items: end;
  padding-top: 18px;
}

.poster-facts strong {
  font-size: 33px;
  letter-spacing: -0.03em;
}

.poster-facts span {
  margin-top: 8px;
  color: #667384;
  font-size: 23px;
}

.poster-grid {
  display: grid;
  height: 680px;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  grid-template-rows: repeat(10, minmax(0, 1fr));
  gap: 7px;
}

.poster-icon {
  display: grid;
  min-width: 0;
  grid-template-columns: 28px minmax(0, 1fr);
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  border: 1px solid rgb(17 25 38 / 0.1);
  border-radius: 15px;
  background: rgb(255 255 255 / 0.92);
  box-shadow: 0 7px 18px rgb(27 32 40 / 0.07);
}

.poster-icon svg {
  width: 26px;
  height: 26px;
}

.poster-icon span {
  overflow: hidden;
  font-size: 11px;
  font-weight: 680;
  letter-spacing: -0.025em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.poster-icon.is-hagfish {
  border-top-color: #f47d20;
  border-top-width: 3px;
}

.poster-icon.is-slipway {
  border-top-color: #168fdf;
  border-top-width: 3px;
}

.poster-icon.is-shared {
  border-top-color: #172235;
  border-top-width: 3px;
}

.poster-icon.is-klean {
  background: #0a101b;
  color: #f7f4ec;
}

.poster-footer {
  display: flex;
  height: 104px;
  align-items: flex-end;
  justify-content: space-between;
  color: #667384;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.13em;
}

.poster-footer strong {
  color: #0b1019;
  font-size: 27px;
  letter-spacing: -0.02em;
}
</style>
