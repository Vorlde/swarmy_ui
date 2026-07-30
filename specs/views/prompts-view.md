# View Spec: PromptsView

## Route

- Path: `/prompts`
- Name: `prompts`
- Auth: requires authenticated session

## Purpose

The prompt library. Lists all prompts with their description, bound model and creation date, and provides entry points to create a prompt (via `PromptModal`) or open the full editor at `/prompts/:name`.

## Layout

App shell with `Sidebar`. Content area is a page header (title + count + subtitle + primary action), a filter row, and a `DataTable` card. Row click routes to `/prompts/:name`, which renders the **Edit Prompt modal** as a fixed overlay on top of this view (see `views/prompt-edit-view.md`) - it is not a separate full-page screen.

Measured from `prompts-1512-light.png` (viewport 1512, CSS px):

| Element | Measured |
|---|---|
| Content column | x `272.5` -> `1462`, i.e. `32px` page gutter inside `main` (main border-left at x `240`) |
| Title | `Prompts` bold ~`24px` + count `(5)` in `--color-neutral-400` |
| Subtitle | `Define and manage prompt templates for your agents.` |
| Primary action | `+ Create Prompt`, `159x36`, radius `8px`, fill `#000` (dark: white/black inverted), label `14px/500` |
| Filter row | search field `448x38`, gap `12px`, model select `220x38` |
| Table card | `1189px` wide, `bg #ffffff` (dark `#0a0a0a`), `1px solid #d4d4d4` (dark `#404040`), radius `12px` |
| Header row | height `40px`, `bg #fafafa` (dark `#181818`), bottom border `1px #d4d4d4` |
| Header label | `11px`, **uppercase**, letter-spacing ~`0.05em`, `#737373` (`--color-neutral-500`) |
| Data row | height `60px`, divider `1px #e5e5e5` (dark `#262626`), body text `#404040` (`--color-neutral-700`) |

Note: this header style is the `DataTable` style and is **different** from the agents-composition grid header (`11px/600`, no tracking, not uppercase). Do not conflate them.

## Wireframe

```
+--------+--------------------------------------------------------------+
|        |  Prompts (5)                            [ + Create Prompt ]   |
|        |  Define and manage prompt templates for your agents.          |
| Side   |  [ (o) Search prompts...        ]  [ All Models        v ]    |
| bar    | +----------------------------------------------------------+ |
|        | | NAME  ^v | DESCRIPTION        | MODEL ^v | CREATED ^v |ACTIONS|
|        | |----------+--------------------+----------+-----------+-----| |
|        | | customer_advocate | Argues the customer... | default | 7/30/2026 | [/] [x] |
|        | | inventory_reviewer| Verifies inventory ... | default | 7/30/2026 | [/] [x] |
|        | +----------------------------------------------------------+ |
+--------+--------------------------------------------------------------+
```

Column set as captured: `NAME` (sortable) | `DESCRIPTION` | `MODEL` (sortable) | `CREATED` (sortable) | `ACTIONS`.
Approximate column offsets from the card's content edge: NAME `+16`, DESCRIPTION `+296`, MODEL `+725`, CREATED `+946`, ACTIONS right-aligned with `16px` right padding. Row actions are two icon-only buttons (pencil = edit, trash = delete) in `--color-neutral-400`.

## Components used

- `DataTable` - prompt list
- `PromptModal` - quick create/edit of prompt metadata
- `ConfirmDialog` - delete confirmation
- `UiButton`, `UiAlertBox`, `SearchInputWrapper`

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/prompts` | List prompts |
| GET | `/api/prompts/:name` | Detail (used by editor view and modal prefill) |
| GET | `/api/prompts/:name/tenvs` | Prompt-scoped env/variable names |
| GET | `/api/variables/prompts/:name` | Variables referenced by the prompt template |

## Interactions

1. On mount: fetch `/api/prompts`.
2. Search filters by name/description; the `All Models` select filters by bound model.
3. Row click routes to `/prompts/:name`, which mounts the Edit Prompt modal over this view.
4. "+ Create Prompt" opens `PromptModal`; on save, route to the new prompt's `/prompts/:name`.
5. Row pencil action routes to `/prompts/:name` (same modal); row trash action uses `ConfirmDialog`.
6. Column header click toggles sort on `NAME`, `MODEL`, `CREATED` (the chevron pair glyph marks sortable headers).

## States

- Loading, empty (`DataTable` empty block: circular neutral badge + inbox glyph + muted message), error with retry.
- Modal: idle, saving, server-error.

## Theming

Fully token-driven: card surface `--color-background` over the `bg-neutral-50/80` page, border `--color-border` (`#d4d4d4` / `#404040`), header row `--color-neutral-50` / `--color-neutral-900`, row divider `--color-neutral-200` / `--color-neutral-800`, header label `--color-neutral-500`, body text `--color-neutral-700`.

The primary action is the app's **inverted** primary: `#000` on white in light, white on black in dark - it is *not* accent-tinted. Row hover and selection use the accent-derived agents surfaces (`--agents-accent-surface-hover` `#f8f2ff` / `#1c1525`, selected `#efe3ff` / `#302043`); never a flat `#a855f7`.

Depth is **not** `box-shadow`: the card is a flat 1px-bordered surface. Only overlays (the Edit Prompt modal, popovers) get depth, and they get it from the shared `DropShadow` canvas (see `components/drop-shadow.md`). No hardcoded colors anywhere; dark mode via the `.dark` class.
