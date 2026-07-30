<!-- Ported from rebuild/ Gen-1; to be reworked against replica specs. -->
<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import UiButton from "./UiButton.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

const props = withDefaults(defineProps<{
  modelValue: boolean;
  title?: string;
  width?: string;
  minHeight?: string;
  hasChanges?: boolean;
  contentPadding?: boolean;
}>(), {
  width: "max-w-lg",
  minHeight: "min-h-[24rem]",
  contentPadding: true,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
}>();

const modalRef = ref<HTMLElement | null>(null);
const showUnsavedConfirm = ref(false);

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function onCloseClick() {
  if (props.hasChanges) {
    showUnsavedConfirm.value = true;
  } else {
    close();
  }
}

function onBackdropClick() {
  close();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.modelValue) {
    close();
  }
}

watch(() => props.modelValue, (open) => {
  if (open) {
    document.addEventListener("keydown", onKeydown);
  } else {
    document.removeEventListener("keydown", onKeydown);
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm dark:text-white" @click="onBackdropClick">
        <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="modelValue" class="w-full max-h-[85vh] flex flex-col" :class="width">
            <div ref="modalRef" class="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg flex flex-col max-h-[85vh] shadow-xl" :class="minHeight">
              <div class="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                <h2 class="text-xl font-bold">{{ title }}</h2>
                <UiButton variant="ghost" size="xs" aria-label="Close modal" @click="onCloseClick">&times;</UiButton>
              </div>
              <div class="flex-1 min-h-0" :class="contentPadding ? 'overflow-y-auto p-6' : 'overflow-hidden flex flex-col'">
                <slot />
              </div>
              <div v-if="$slots.footer" class="p-6 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                <slot name="footer" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
    <ConfirmDialog v-model="showUnsavedConfirm" title="Unsaved Changes" message="You have unsaved changes that will be lost. Are you sure you want to close?" confirm-text="Close Anyway" cancel-text="Keep Editing" @confirm="close" @cancel="showUnsavedConfirm = false" />
  </Teleport>
</template>
