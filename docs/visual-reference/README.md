# Visual reference

The pixel reference for the replica rebuild is a screenshot set captured
outside this repository, at:

    ../../visual-reference/

(relative to this file, i.e. `<workspace-root>/visual-reference/`, a sibling
of the `swarmy_ui-replica` worktree).

Those screenshots are the ground truth for layout, spacing, type scale, and
color when implementing anything under `specs/views/` and
`specs/components/`. They are captured and refreshed by a separate process
and are deliberately **not** committed here: they are large binaries, they
change often, and they carry original-product branding that must not land in
this repository.

## How to use them

1. Open the screenshot for the view you are implementing.
2. Read the matching spec in `specs/views/<view>.md`.
3. Build against the spec; use the screenshot only to resolve visual detail
   the spec leaves open (exact spacing, alignment, state styling).
4. Never copy strings, logos, or product names out of a screenshot into
   code or docs. See the naming rule in `AGENTS.md`.

## Related

- `docs/design/design-system.md` - tokens, scale, and primitives
- `docs/design/wireframe-gallery.md` - structural wireframes
- `docs/proposals/` - the four candidate visual directions
