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
    <!-- Main View Display (Isolated per URL: /#participant, /#projector, /#instructor) -->
    <main class="flex-1">
      <ParticipantView v-if="currentView === 'participant'" />
      <ProjectorView v-else-if="currentView === 'projector'" />
      <InstructorView v-else-if="currentView === 'instructor'" />
      <ParticipantView v-else />
    </main>
  </div>
</template>
