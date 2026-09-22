# Arrange Mode changes

This build adds a protected Arrange Mode for repositioning existing sky creations.

## Passcode

Set this in your real `.env` file (do not commit `.env`):

```env
VITE_ARRANGE_PASSCODE=your-private-passcode
```

If the variable is absent, the app falls back to `sky-arrange-2026`. Change it before deploying if you want a different code.

## Behavior

- Moon remains fixed at its existing position.
- Secret stars use the coordinates in `src/config/secretStars.ts` and no longer randomize.
- Arrange Mode is off by default and must be unlocked with the passcode.
- Arrange Mode does not grant deletion rights. Existing creator-only deletion checks remain in place.
- Wishes, stories, and voice probes can be repositioned while Arrange Mode is on.
- Position changes are saved through the existing database record system.
- The existing records and wish/constellation payloads are not migrated or rewritten automatically.
- Existing overlapping objects are preserved. Strict collision checking applies when moving an object to a new position.
- The moon, secret stars, nebula, and black hole are treated as fixed collision targets.

## Important security note

The passcode is a frontend Vite environment value, so it is a convenience lock against accidental dragging, not a strong security boundary. Someone with browser developer tools can inspect the built JavaScript. A server-side authentication/permission layer would be required for a secret that cannot be bypassed by visitors.

## Safe replacement

Keep your existing `.env` and database unchanged. Replace source/project files from this archive, but do not overwrite `.env`. Commit the result to Git before deploying.
