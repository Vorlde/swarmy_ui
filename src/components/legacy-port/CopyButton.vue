<!-- Ported from rebuild/ Gen-1; to be reworked against replica specs. -->
<script setup lang="ts">
import { ref, computed } from "vue";
import { Copy, Check } from "lucide-vue-next";

const props = defineProps<{
  content: string;
  variant?: "solid" | "ghost";
  size?: "xs" | "sm";
  disabled?: boolean;
}>();

const copying = ref(false);
const copied = ref(false);
const error = ref<string | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;

async function onClick() {
  if (!props.content || copying.value) return;
  copying.value = true;
  error.value = null;
  if (timer) clearTimeout(timer);
  try {
    await navigator.clipboard.writeText(props.content);
    copied.value = true;
    timer = setTimeout(() => {
      copied.value = false;
      timer = null;
    }, 2000);
  } catch (err) {
    copied.value = false;
    error.value = err instanceof Error ? err.message : "Failed to copy";
  } finally {
    copying.value = false;
  }
}

const sizeClasses = {
  xs: "p-1 text-xs",
  sm: "px-2 py-1 text-xs",
};

const variantClasses = {
  solid: "bg-black text-white dark:bg-white dark:text-black",
  ghost: "bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900",
};

const title = computed(() => {
  if (props.disabled) return "No content to copy";
  if (error.value) return `Copy failed: ${error.value}`;
  if (copied.value) return "Copied!";
  return "Copy to clipboard";
});

</script>

<template>
  <button
    @click="onClick"
    :disabled="copying || disabled || !content"
    class="font-medium rounded hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    :class="[sizeClasses[size || 'sm'], variantClasses[variant || 'solid']]"
    :title="title"
    :aria-label="title"
  >
    <span v-if="copying" class="w-3.5 h-3.5 inline-block border-2 border-current border-t-transparent rounded-full animate-spin" />
    <Copy v-else-if="variant === 'ghost' && !copied" class="h-3.5 w-3.5" />
    <Check v-else-if="variant === 'ghost' && copied" class="h-3.5 w-3.5" />
    <span v-else>{{ copied ? "Copied!" : "Copy" }}</span>
  </button>
</template>
