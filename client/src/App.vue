<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameStore } from './stores/gameStore';
import ParticipantView from './views/ParticipantView.vue';
import InstructorView from './views/InstructorView.vue';
import ProjectorView from './views/ProjectorView.vue';

const store = useGameStore();

type ViewMode = 'participant' | 'instructor' | 'projector';
const currentView = ref<ViewMode>('participant');

// Check URL hash for direct routing, e.g. #instructor or #projector
function updateViewFromHash() {
  const hash = window.location.hash.replace('#', '') as ViewMode;
  if (['participant', 'instructor', 'projector'].includes(hash)) {
    currentView.value = hash;
  }
}

function switchView(mode: ViewMode) {
  currentView.value = mode;
  window.location.hash = mode;
}

onMounted(() => {
  updateViewFromHash();
  window.addEventListener('hashchange', updateViewFromHash);
  store.initSocketListeners();
});
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
    <!-- View Selector Bar (Floating at top or bottom for quick demonstration) -->
    <header class="bg-slate-900/90 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-xs z-50">
      <div class="flex items-center gap-2">
        <span class="text-base">🧭</span>
        <span class="font-bold text-amber-300 hidden sm:inline">Cocoa Island Expedition</span>
        <span 
          class="w-2 h-2 rounded-full inline-block"
          :class="store.isConnected ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'"
          :title="store.isConnected ? 'เชื่อมต่อเซิร์ฟเวอร์สำเร็จ' : 'กำลังเชื่อมต่อเซิร์ฟเวอร์...'"
        ></span>
      </div>

      <!-- Quick switcher for demonstration -->
      <nav aria-label="โหมดการแสดงผล" class="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
        <button
          type="button"
          @click="switchView('participant')"
          class="px-2.5 py-1 rounded transition-all font-medium text-[11px]"
          :class="currentView === 'participant' ? 'bg-amber-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'"
        >
          📱 ผู้เล่น (Mobile)
        </button>
        <button
          type="button"
          @click="switchView('projector')"
          class="px-2.5 py-1 rounded transition-all font-medium text-[11px]"
          :class="currentView === 'projector' ? 'bg-amber-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'"
        >
          📽️ จอโปรเจกเตอร์
        </button>
        <button
          type="button"
          @click="switchView('instructor')"
          class="px-2.5 py-1 rounded transition-all font-medium text-[11px]"
          :class="currentView === 'instructor' ? 'bg-amber-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'"
        >
          💻 วิทยากร (PC)
        </button>
      </nav>
    </header>

    <!-- Main View Display -->
    <main class="flex-1">
      <ParticipantView v-if="currentView === 'participant'" />
      <ProjectorView v-else-if="currentView === 'projector'" />
      <InstructorView v-else />
    </main>
  </div>
</template>
