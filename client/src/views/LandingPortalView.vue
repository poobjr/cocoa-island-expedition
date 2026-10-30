<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/gameStore';
import QrcodeVue from 'qrcode.vue';

const store = useGameStore();

const participantUrl = computed(() => {
  return `${window.location.origin}/#participant`;
});

function goToParticipant() {
  window.location.hash = 'participant';
}

function copyLink() {
  navigator.clipboard.writeText(participantUrl.value);
  alert('คัดลอกลิงก์สำหรับผู้เล่นเรียบร้อยแล้ว:\n' + participantUrl.value);
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 select-none relative overflow-hidden">
    <!-- Subtle Background Ambient Glow -->
    <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 right-10 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Top Server Status Pill -->
    <div class="relative z-10 max-w-xl mx-auto w-full flex items-center justify-between text-xs py-2 px-4 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md">
      <div class="flex items-center gap-2">
        <span class="text-base">🧭</span>
        <span class="font-bold text-amber-300">The Island Adventure</span>
        <span class="text-slate-500">|</span>
        <span class="text-slate-400">Cocoa Island Expedition</span>
      </div>

      <div class="flex items-center gap-1.5 font-mono text-[11px]">
        <span 
          class="w-2 h-2 rounded-full inline-block"
          :class="store.isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-red-400 animate-pulse'"
        ></span>
        <span :class="store.isConnected ? 'text-emerald-400' : 'text-red-400'">
          {{ store.isConnected ? 'เซิร์ฟเวอร์พร้อมใช้งาน' : 'กำลังเชื่อมต่อ...' }}
        </span>
      </div>
    </div>

    <!-- Main QR Card Container -->
    <main class="relative z-10 max-w-lg mx-auto w-full my-auto py-6">
      <div class="p-6 md:p-8 parchment-card rounded-3xl border border-amber-600/50 shadow-2xl space-y-6 text-center backdrop-blur-md">
        <!-- Logo & Title -->
        <div class="space-y-2">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-4xl shadow-lg transform hover:scale-105 transition-transform">
            ⛵
          </div>
          <h1 class="text-2xl md:text-3xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-wide">
            Cocoa Island Expedition
          </h1>
          <p class="text-xs md:text-sm text-slate-300 leading-relaxed font-sans max-w-sm mx-auto">
            มหากาพย์การเดินเรือสำรวจเกาะโกโก้ 15 วัน<br/>
            <span class="text-amber-300 font-semibold">เกมจำลองสถานการณ์และการบริหารทรัพยากรแบบเรียลไทม์</span>
          </p>
        </div>

        <!-- Large QR Code Frame -->
        <div class="p-4 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-inner inline-block space-y-2">
          <div class="p-3 bg-white rounded-xl shadow-lg inline-block">
            <qrcode-vue :value="participantUrl" :size="200" level="H" />
          </div>
          <div class="flex items-center justify-center gap-1.5 text-xs text-amber-300 font-bold">
            <span>📷 สแกนด้วยกล้องมือถือเพื่อเข้าเล่น</span>
          </div>
        </div>

        <!-- Direct Link / Clickable Button Section -->
        <div class="space-y-2 pt-1">
          <button
            type="button"
            @click="goToParticipant"
            class="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>📱 คลิกที่นี่เพื่อเข้าเล่นบนอุปกรณ์นี้</span>
            <span class="group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button
            type="button"
            @click="copyLink"
            class="text-[11px] text-slate-400 hover:text-amber-300 underline transition-colors cursor-pointer"
          >
            📋 หรือคลิกเพื่อคัดลอกลิงก์ส่งให้เพื่อนในกลุ่ม
          </button>
        </div>

        <!-- Role Badges Preview -->
        <div class="pt-4 border-t border-slate-800/80 text-left space-y-2">
          <div class="text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center">
            7 บทบาทประจำเรือ (เลือกได้เรือละ 1 คน ยกเว้นลูกเรือ):
          </div>
          <div class="flex flex-wrap items-center justify-center gap-1.5 text-[10px]">
            <span class="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/40">👑 กัปตัน</span>
            <span class="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-600/40">⚓ ต้นหน</span>
            <span class="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">💰 เสบียง</span>
            <span class="px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-600/40">🧭 ภูมิศาสตร์</span>
            <span class="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-600/40">⚔️ สรั่งเรือ</span>
            <span class="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-600/40">🕵️ สายลับ</span>
            <span class="px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-600/40">👥 ลูกเรือ</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Facilitator Controls Footer -->
    <footer class="relative z-10 max-w-xl mx-auto w-full text-center text-xs text-slate-500 py-2 flex items-center justify-between border-t border-slate-900">
      <span>The Island Adventure &copy; Cocoa Island Expedition</span>
      <div class="flex items-center gap-3">
        <a href="/#projector" class="hover:text-amber-400 transition-colors">📽️ จอโปรเจกเตอร์</a>
        <span>•</span>
        <a href="/#instructor" class="hover:text-amber-400 transition-colors">💻 แผงควบคุมผู้สอน</a>
      </div>
    </footer>
  </div>
</template>
