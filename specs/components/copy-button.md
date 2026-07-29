# Component Spec: CopyButton

## Purpose

Copy-to-clipboard button with transient success feedback. Used next to curl commands, API keys, JSON payloads, and code blocks.

## Props

```ts
defineProps<{
  content: string;                 // text to copy
  variant?: "solid" | "ghost";     // default "ghost"
  size?: "xs" | "sm";              // default "sm"
  disabled?: boolean;
}>();
```

## Emits

- `copied(content: string)` - after a successful write
- `error(message: string)` - clipboard write failed

## Slots

- default - replaces the default copy/check icon content

## Behavior

- Click writes `content` via `navigator.clipboard.writeText`.
- On success the icon swaps to a check for 2000ms, then reverts.
- On failure the button title shows the error message.
- Disabled when `disabled`, when `content` is empty, or while a copy is in flight.
- Title tooltip reflects state: "Copy to clipboard" / "Copied!" / "Copy failed: ..." / "No content to copy".

## States

Idle, copying, copied (2s), error, disabled.

## Theming / Swappability

Variants are token-mapped: `solid` uses inverted surface tokens (black on white / white on black), `ghost` uses `--color-background`, `--color-border`, and muted text tokens. Success icon color uses the emerald semantic token. Hover is an opacity transition so it inherits whatever colors the variant resolves to. Size classes (`p-1 text-xs`, `px-2 py-1 text-xs`) follow the spacing scale and can be extended by the caller via `class` fallthrough.
