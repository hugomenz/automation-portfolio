# Reproducible asset production

The checked-in screenshots were captured from a clean local `dist/` build at 1440×1000 and 390×844. Exception screenshots select the third scenario and execute it before capture. All screenshots use synthetic data.

The three silent MP4s use six 1280×720 browser frames: business problem, selected input, processing, exception, human review and approved local draft with zero external writes. Frames live under each top-three content pack in `assets/video-frames/`.

They are encoded at five seconds per frame with local ffmpeg:

```powershell
ffmpeg -f concat -safe 0 -i concat.txt -vf "fps=30,format=yuv420p" -c:v libx264 -movflags +faststart demo-30s.mp4
```

The resulting duration is 35 seconds because the final concat frame is repeated to preserve its duration. Voice-over text and picture direction live in each `VIDEO_SCRIPT_DE.md`.
