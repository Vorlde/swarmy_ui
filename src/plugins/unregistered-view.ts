// Rendered when a route's view id has no plug registered yet. It exists so the
// route table can be complete and typechecked before the views are built, and
// so a missing plug fails loudly in one obvious place instead of at import time.
import { defineComponent, h } from "vue";

export function unregisteredView(viewId: string) {
  return defineComponent({
    name: "UnregisteredView",
    setup() {
      return () =>
        h(
          "div",
          { class: "flex h-full items-center justify-center p-8 text-sm text-neutral-500" },
          `No view plug is registered for "${viewId}".`,
        );
    },
  });
}
