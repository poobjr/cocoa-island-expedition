<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '../../stores/gameStore';

const store = useGameStore();

const suggestedAction = ref<'ADVANCE' | 'RETREAT' | 'ANCHOR'>('ADVANCE');
const adviceNote = ref('');

const myTeam = computed(() => store.myTeam);
const currentDay = computed(() => store.currentDay);

function handleSendAdvice() {
  store.submitAdvisoryVote(suggestedAction.value, undefined, adviceNote.value);
  adviceNote.value = '';
  alert('ส่งเสียงโหวตชี้แนะไปยังกัปตันแล้ว!');
}

function handleCheer(emoji: string, msg: string) {
  store.submitAdvisoryVote('ANCHOR', undefined, `${emoji} ${msg}`);
  alert(`ส่งสัญญาณเชียร์: ${msg}`);
}

function handleLookoutScan() {
  const currentLoc = store.currentNode?.nameTh.split(' ')[0] || 'น่านน้ำเปิด';
  store.submitAdvisoryVote('ADVANCE', undefined, `🔭 รายงานจากยอดเสากระโดง: ตรวจน่านน้ำรอบ ${currentLoc} ปลอดภัย ไม่มีสิ่งกีดขวาง!`);
  alert('ส่องกล้องส่องทางไกลและส่งรายงานสังเกตการณ์ขึ้นสะพานเดินเรือแล้ว!');
}

function handleRowingBoost() {
  store.submitAdvisoryVote('ADVANCE', undefined, '⚡ ลูกเรือช่วยกันจ้วงพายสุดแรง! พร้อมบุกตะลุยเกาะต่อไป!');
  alert('ส่งพลังจ้วงพายให้กัปตันแล้ว! ⚡');
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="p-3 bg-gradient-to-r from-sky-950/60 to-slate-900 border border-sky-500/40 rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl">👥</span>
        <div>
          <h3 class="font-bold text-sky-200">ห้องลูกเรือทั่วไป (Deckhand & Lookout)</h3>
          <p class="text-xs text-slate-400">สมาชิกคนสำคัญของทีม สังเกตการณ์ ออกความเห็น และเป็นที่ปรึกษาให้กัปตัน</p>
        </div>
      </div>
      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-900/60 text-sky-200 border border-sky-500/30">
        ที่ปรึกษาเรือ
      </span>
    </div>

    <!-- Deckhand Capacity Synergy Banner -->
    <div class="p-2.5 bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/40 rounded-xl flex items-center gap-3">
      <span class="text-2xl">💪</span>
      <div class="text-xs">
        <span class="font-bold text-emerald-300">สิทธิพิเศษประจำตำแหน่ง (Deckhand Synergy):</span>
        <p class="text-[11px] text-slate-300 mt-0.5">
          ลูกเรือทุกคนมอบโบนัสความจุน้ำหนัก <strong class="text-emerald-400 font-mono">+15 lbs</strong> ทำให้เรือสามารถขนหีบสมบัติได้มากขึ้นโดยไม่เสี่ยงเรือจม!
        </p>
      </div>
    </div>

    <!-- Active Deckhand Duties -->
    <div class="grid grid-cols-2 gap-2">
      <button
        type="button"
        @click="handleLookoutScan"
        class="p-2.5 bg-slate-900 hover:bg-slate-800 border border-sky-500/40 rounded-xl text-left transition-all active:scale-95 group shadow-sm"
      >
        <div class="flex items-center gap-1.5 font-bold text-sky-300 text-xs">
          <span>🔭 ส่องกล้องสังเกตการณ์</span>
        </div>
        <p class="text-[10px] text-slate-400 mt-1">ส่องหาสิ่งกีดขวาง/เกาะ แล้วส่งเบาะแสให้กัปตัน</p>
      </button>

      <button
        type="button"
        @click="handleRowingBoost"
        class="p-2.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 rounded-xl text-left transition-all active:scale-95 group shadow-sm"
      >
        <div class="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
          <span>⚡ ช่วยจ้วงพายเสริมกำลัง</span>
        </div>
        <p class="text-[10px] text-slate-400 mt-1">ส่งพลังใจและเร่งจังหวะพายเรือเดินหน้า</p>
      </button>
    </div>

    <!-- Live Ship Companion Cards -->
    <div class="grid grid-cols-2 gap-2 text-xs">
      <div class="p-2 bg-slate-900/80 border border-slate-700 rounded-lg">
        <span class="text-[10px] text-slate-400">💧 น้ำดื่มในสต็อก:</span>
        <div class="font-bold text-sky-300 font-mono text-sm">{{ myTeam?.inventory.water }} ถัง</div>
      </div>
      <div class="p-2 bg-slate-900/80 border border-slate-700 rounded-lg">
        <span class="text-[10px] text-slate-400">⛽ เชื้อเพลิงคงเหลือ:</span>
        <div class="font-bold text-amber-300 font-mono text-sm">{{ myTeam?.inventory.fuel }} ถัง</div>
      </div>
      <div class="p-2 bg-slate-900/80 border border-slate-700 rounded-lg">
        <span class="text-[10px] text-slate-400">📦 หีบสมบัติขุดได้:</span>
        <div class="font-bold text-yellow-300 font-mono text-sm">{{ myTeam?.inventory.treasureBoxes }} กล่อง</div>
      </div>
      <div class="p-2 bg-slate-900/80 border border-slate-700 rounded-lg">
        <span class="text-[10px] text-slate-400">🛡️ สภาพความทนทานเรือ:</span>
        <div class="font-bold text-emerald-300 font-mono text-sm">{{ myTeam?.hullIntegrity }}%</div>
      </div>
    </div>

    <!-- Advisory Voting for Deckhand -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-3">
      <h4 class="text-xs font-semibold text-sky-300 uppercase tracking-wider">
        🗳️ โหวตเสนอแนะทิศทางเดินเรือให้กัปตัน
      </h4>

      <div class="grid grid-cols-3 gap-2">
        <button
          type="button"
          @click="suggestedAction = 'ADVANCE'"
          class="p-2 rounded border text-xs font-bold transition-all text-center"
          :class="suggestedAction === 'ADVANCE' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'"
        >
          ⏩ เดินหน้า
        </button>
        <button
          type="button"
          @click="suggestedAction = 'ANCHOR'"
          class="p-2 rounded border text-xs font-bold transition-all text-center"
          :class="suggestedAction === 'ANCHOR' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'"
        >
          ⚓ จอดพัก
        </button>
        <button
          type="button"
          @click="suggestedAction = 'RETREAT'"
          class="p-2 rounded border text-xs font-bold transition-all text-center"
          :class="suggestedAction === 'RETREAT' ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'"
        >
          ⏪ ถอยหลัง
        </button>
      </div>

      <input
        v-model="adviceNote"
        type="text"
        placeholder="ส่งข้อความเตือนเพื่อน เช่น ระวังพายุนะ! หรือ รีบกดส่งคำสั่งเร็ว!"
        class="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-slate-200"
      />

      <button
        type="button"
        @click="handleSendAdvice"
        class="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition-transform active:scale-95"
      >
        ส่งเสียงโหวตขึ้นสะพานเดินเรือ
      </button>
    </div>

    <!-- Quick Morale / Cheer Buttons -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
      <h4 class="text-xs font-semibold text-amber-300 uppercase tracking-wider">
        📣 ส่งสัญญาณเชียร์ให้กำลังใจทีม
      </h4>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <button 
          @click="handleCheer('🔥', 'สู้เว้ยทุกคน! เราต้องรวย!')"
          class="p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-left text-slate-200 transition-all active:scale-95"
        >
          🔥 สู้เว้ยทุกคน! เราต้องรวย!
        </button>
        <button 
          @click="handleCheer('⏰', 'เหลือเวลาอีกนิดเดียว รีบตัดสินใจ!')"
          class="p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-left text-slate-200 transition-all active:scale-95"
        >
          ⏰ ใกล้หมดเวลาแล้ว รีบส่งคำสั่ง!
        </button>
        <button 
          @click="handleCheer('💧', 'อย่าลืมเช็กน้ำดื่มกับน้ำหนักนะ!')"
          class="p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-left text-slate-200 transition-all active:scale-95"
        >
          💧 อย่าลืมเช็กน้ำดื่มกับน้ำหนัก!
        </button>
        <button 
          @click="handleCheer('👑', 'กัปตันฟันธงเลย พวกเราเชื่อมั่น!')"
          class="p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-left text-slate-200 transition-all active:scale-95"
        >
          👑 กัปตันฟันธงเลย พวกเราเชื่อมั่น!
        </button>
      </div>
    </div>
  </div>
</template>
