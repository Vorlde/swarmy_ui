<!-- Ported from rebuild/ Gen-1; to be reworked against replica specs. -->
<script setup lang="ts">
import { watch, onUnmounted } from "vue";
import UiButton from "./UiButton.vue";

const props = withDefaults(defineProps<{
  modelValue: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}>(), {
  title: "Confirm Action",
  message: "Are you sure you want to continue? You will lose any unsaved changes.",
  confirmText: "Continue",
  cancelText: "Cancel",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

function close() {
  emit("update:modelValue", false);
}

function confirm() {
  emit("confirm");
  close();
}

function cancel() {
  emit("cancel");
  close();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.modelValue) {
    cancel();
  }
}

watch(() => props.modelValue, (open) => {
  if (open) {
    document.addEventListener("keydown", onKeydown);
    document.body.style.overflow = "hidden";
  } else {
    document.removeEventListener("keydown", onKeydown);
    document.body.style.overflow = "";
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="modelValue" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm dark:text-white" @click="cancel">
        <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="modelValue" class="w-full max-w-md" @click.stop>
            <div class="bg-white dark:bg-neutral-900 border border-red-400 dark:border-red-500 rounded-lg flex flex-col shadow-xl">
              <div class="flex items-center justify-between p-4 border-b border-red-200 dark:border-red-900 flex-shrink-0">
                <h2 class="text-xl font-bold text-red-600">{{ title }}</h2>
                <button class="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200" aria-label="Close" @click="cancel">&times;</button>
              </div>
              <div class="p-6">
                <p class="text-neutral-700 dark:text-neutral-300 mb-6">{{ message }}</p>
                <div class="flex justify-end gap-3">
                  <UiButton variant="secondary" @click="cancel">{{ cancelText }}</UiButton>
                  <UiButton variant="danger" @click="confirm">{{ confirmText }}</UiButton>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
