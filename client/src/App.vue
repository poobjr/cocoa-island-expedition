<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameStore } from './stores/gameStore';
import LandingPortalView from './views/LandingPortalView.vue';
import ParticipantView from './views/ParticipantView.vue';
import InstructorView from './views/InstructorView.vue';
import ProjectorView from './views/ProjectorView.vue';

const store = useGameStore();

type ViewMode = 'portal' | 'participant' | 'instructor' | 'projector';
const currentView = ref<ViewMode>('portal');

// Check URL hash for direct routing, e.g. #participant, #instructor, #projector
function updateViewFromHash() {
  const hash = window.location.hash.replace('#', '') as ViewMode;
  if (['participant', 'instructor', 'projector'].includes(hash)) {
    currentView.value = hash;
  } else {
    // Default to QR Landing Portal on front page
    currentView.value = 'portal';
  }
}

onMounted(() => {
  updateViewFromHash();
  window.addEventListener('hashchange', updateViewFromHash);
  store.initSocketListeners();
});
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
    <!-- Main View Display:
         - Default (/) or (#portal): QR Landing Portal
         - (/#participant): Mobile Participant View
         - (/#projector): Big Screen 1080p Broadcast
         - (/#instructor): PIN-protected Instructor Console
    -->
    <main class="flex-1">
      <LandingPortalView v-if="currentView === 'portal'" />
      <ParticipantView v-else-if="currentView === 'participant'" />
      <ProjectorView v-else-if="currentView === 'projector'" />
      <InstructorView v-else-if="currentView === 'instructor'" />
      <LandingPortalView v-else />
    </main>
  </div>
</template>
