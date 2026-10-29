<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  seconds: number;
  label?: string;
  isUrgent?: boolean;
}>();

const formattedTime = computed(() => {
  const m = Math.floor(props.seconds / 60);
  const s = props.seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

const isVeryUrgent = computed(() => props.seconds <= 30 && props.seconds > 0);
</script>

<template>
  <div class="flex items-center gap-2">
    <div 
      class="px-3 py-1.5 rounded-lg border font-mono font-bold tracking-wider text-sm md:text-base flex items-center gap-1.5 transition-all shadow-inner"
      :class="[
        isVeryUrgent 
          ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse ring-2 ring-red-500/50' 
          : 'bg-slate-900/80 border-amber-500/40 text-amber-300'
      ]"
    >
      <span class="text-xs text-slate-400 uppercase font-sans font-medium" v-if="label">{{ label }}:</span>
      <span class="text-base md:text-lg">{{ formattedTime }}</span>
    </div>
  </div>
</template>
