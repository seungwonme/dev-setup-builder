# Dev Setup Builder

Static checklist app that generates macOS `.command` and Windows `.bat` setup scripts from selected tools.

## Deploy

This repo is intentionally buildless. Serve `index.html` from GitHub Pages.

## Local check

Open `index.html` directly, or run a local static server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Generated scripts

The app only emits selected tools plus required dependencies. It does not write editor settings unless the generated script explicitly includes that selected step in the future.

macOS downloads may not keep executable permissions. Run the generated file with `bash setup-mac.command`, or run `chmod +x setup-mac.command` before double-clicking it in Finder.
