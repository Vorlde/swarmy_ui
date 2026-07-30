<!-- Ported from rebuild/ Gen-1; to be reworked against replica specs. -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  inline?: boolean;
}>(), {
  inline: true,
});
</script>

<template>
  <component :is="inline ? 'code' : 'pre'" class="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 rounded" :class="inline ? 'px-1.5 py-0.5' : 'px-3 py-2 overflow-x-auto'">
    <slot />
  </component>
</template>
