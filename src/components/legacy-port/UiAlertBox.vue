<!-- Ported from rebuild/ Gen-1; to be reworked against replica specs. -->
<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-vue-next";

defineProps<{
  variant?: "info" | "success" | "warning" | "error";
}>();

const variants = {
  info: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800",
  success: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800",
  warning: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800",
  error: "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800",
};

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};
</script>

<template>
  <div class="rounded-lg border px-4 py-3 text-sm" :class="variants[variant || 'info']">
    <div class="flex items-start gap-3">
      <component :is="icons[variant || 'info']" class="w-5 h-5 shrink-0 mt-0.5" />
      <div><slot /></div>
    </div>
  </div>
</template>
