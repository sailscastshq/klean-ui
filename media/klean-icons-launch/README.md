# Klean Icons launch film

This deterministic 10-second Pellicule composition renders the real Klean Vue
icon sources. It does not keep Pellicule in Klean UI's production dependency
graph.

Render the silent 1920×1080, 60fps master from the repository root:

```bash
npx --package=pellicule@0.3.0 pellicule \
  media/klean-icons-launch/KleanIconsLaunch.vue \
  --bundler vite \
  --quality high \
  --output klean-icons-launch.mp4
```

Pass `--audio path/to/audio.wav` when producing a version with sound design.
