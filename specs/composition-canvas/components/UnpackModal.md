# UnpackModal

Project: **swarmy_ui**. Modal for installing a package into the workspace.

## Purpose

Looks up a package by id, shows its contents via UnpackTree with shared-item detection (skip vs overwrite), and executes the unpack.

## Props

```ts
interface Props {
  open: boolean;
  initialPackageId?: string;
}
```

## Emitted events

| Event | Payload | When |
|---|---|---|
| `close` | - | cancel / backdrop / Escape |
| `unpacked` | `{ packageId: string }` | unpack succeeds (parent refreshes catalog) |

## Slots

| Slot | Purpose |
|---|---|
| `content-row` | override UnpackTree row rendering |

## API calls

| Endpoint | When |
|---|---|
| `GET /api/unpack/{packageId}/analyze` | Go button / on open when `initialPackageId` is set |
| `GET /api/pack/{packageId}/packed-info` | after analyze, for the package summary header |
| `POST /api/unpack/{packageId}` | Unpack button; body includes per-item skip/overwrite decisions |

## Visual behavior

Package id input + Go button at top. After analyze, the contents tree lists each item with a status chip (`new`, `shared - will skip`, `shared - overwrite` via toggle). Unpack button disabled until analysis succeeds. Progress spinner during POST; success closes and emits `unpacked`.

## States

- **Loading**: analyze spinner in the tree area.
- **Empty**: package with no items (invalid id shape) shows guidance text.
- **Error**: unknown package id or unpack failure shows inline server message; input preserved.

## Theming

Modal chrome and status chips are token-driven (`chip.new`, `chip.shared`, `chip.overwrite` color tokens). Tree appearance inherits UnpackTree theming.
