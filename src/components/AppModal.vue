<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLDialogElement | null>(null)

function onCancel() {
  emit('close')
}

function onBackdrop(e: MouseEvent) {
  const el = dialogRef.value
  if (el && e.target === el) emit('close')
}

watch(
  () => props.open,
  async (open) => {
    await nextTick()
    const el = dialogRef.value
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
    } else if (el.open) {
      el.close()
    }
  },
)
</script>

<template>
  <dialog
    ref="dialogRef"
    aria-labelledby="app-modal-title"
    class="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/40"
    @click="onBackdrop"
    @cancel.prevent="onCancel"
  >
    <form
      method="dialog"
      class="flex max-h-[85vh] flex-col"
      @submit.prevent
    >
      <div class="border-b border-slate-100 px-5 py-4">
        <h2
          id="app-modal-title"
          class="text-base font-semibold"
        >
          {{ title }}
        </h2>
      </div>
      <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <slot />
      </div>
      <div
        class="flex justify-end gap-2 border-t border-slate-100 px-5 py-4"
      >
        <slot name="footer">
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="onCancel"
          >
            Cancel
          </button>
        </slot>
      </div>
    </form>
  </dialog>
</template>
