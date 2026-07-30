<!-- Ported from rebuild/ Gen-1; to be reworked against replica specs. -->
<script setup lang="ts">
import { computed } from "vue";
import CopyButton from "./CopyButton.vue";

const props = defineProps<{
  json?: unknown;
  threadId?: string;
  showCopyButton?: boolean;
}>();

const pretty = computed(() => {
  if (!props.json) return "";
  if (typeof props.json === "string") {
    try {
      return JSON.stringify(JSON.parse(props.json), null, 2);
    } catch {
      return props.json;
    }
  }
  return JSON.stringify(props.json, null, 2);
});

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function render(value: unknown, indent = 0): string {
  const space = "  ".repeat(indent);
  const punct = (s: string) => `<span class="json-punct">${s}</span>`;

  if (value === null) return '<span class="json-null">null</span>';
  if (typeof value === "boolean") return `<span class="json-boolean">${value}</span>`;
  if (typeof value === "number") return `<span class="json-number">${value}</span>`;
  if (typeof value === "string") {
    return `${punct('"')}<span class="json-string">${escapeHtml(value)}</span>${punct('"')}`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return `${punct("[")}${punct("]")}`;
    const items = value.map((v, i) => `${space}  ${render(v, indent + 1)}${i < value.length - 1 ? "," : ""}`);
    return `${punct("[")}
${items.join("\n")}
${space}${punct("]")}`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return `${punct("{")}${punct("}")}`;
    const items = entries.map(([k, v], i) => {
      const key = `${punct('"')}<span class="json-key">${escapeHtml(k)}</span>${punct('"')}`;
      return `${space}  ${key}${punct(":")} ${render(v, indent + 1)}${i < entries.length - 1 ? "," : ""}`;
    });
    return `${punct("{")}
${items.join("\n")}
${space}${punct("}")}`;
  }
  return String(value);
}

const rendered = computed(() => {
  if (!props.json) return '<span class="json-null">null</span>';
  let value: unknown;
  if (typeof props.json === "string") {
    try {
      value = JSON.parse(props.json);
    } catch {
      return escapeHtml(props.json);
    }
  } else {
    value = props.json;
  }
  return render(value);
});
</script>

<template>
  <div class="json-viewer relative bg-white dark:bg-neutral-900">
    <div v-if="showCopyButton" class="absolute top-[5px] right-[5px] z-10">
      <CopyButton :content="pretty" variant="ghost" size="xs" />
    </div>
    <pre class="text-xs font-mono p-3 overflow-x-auto" v-html="rendered" />
  </div>
</template>
