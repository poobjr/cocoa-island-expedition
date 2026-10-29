<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '../../stores/gameStore';

const store = useGameStore();

const useCannonReady = ref(true);
const myTeam = computed(() => store.myTeam);
const hullIntegrity = computed(() => myTeam.value?.hullIntegrity || 100);
const cannonCount = computed(() => myTeam.value?.inventory.cannon || 0);

function handleToggleCannon() {
  store.updateDailyOrder({
    useCannon: useCannonReady.value
  });
}

function sendCombatAlert(status: 'READY' | 'LOW_AMMO' | 'CRITICAL_HULL') {
  let note = '';
  if (status === 'READY') {
    note = `💣 ปืนใหญ่พร้อมยิง 100% (เหลือ ${cannonCount.value} นัด) รับมือโจรสลัดได้เต็มกำลัง!`;
  } else if (status === 'LOW_AMMO') {
    note = `⚠️ กระสุนปืนใหญ่หมด! แนะนำหลีกเลี่ยงน่านน้ำอันตราย หรือแวะซื้อที่ Black Market Atoll ด่วน`;
  } else {
    note = `🚨 ตัวเรือเสียหายเหลือ ${hullIntegrity.value}%! ต้องรีบเข้าอู่ซ่อมที่ Grand Port หรือ Fisherman ด่วนที่สุด`;
  }
  store.submitAdvisoryVote('ANCHOR', undefined, note);
  alert('ส่งรายงานสภาพความพร้อมรบขึ้นสะพานเดินเรือ (Captain Bridge) แล้ว!');
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="p-3 bg-gradient-to-r from-red-950/60 to-slate-900 border border-red-500/40 rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl">⚔️</span>
        <div>
          <h3 class="font-bold text-red-200">ห้องสรั่งเรือ & พลปืนใหญ่ (First Mate & Gunner)</h3>
          <p class="text-xs text-slate-400">ควบคุมปืนใหญ่ ความทนทานของเรือ และการป้องกันตัวจากการปล้น</p>
        </div>
      </div>
      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/60 text-red-200 border border-red-500/30">
        ผู้พิทักษ์เรือ
      </span>
    </div>

    <!-- Hull Integrity Bar -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-1.5">
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-300 font-medium">ความทนทานของตัวเรือ (Hull Integrity):</span>
        <span class="font-mono font-bold" :class="hullIntegrity <= 30 ? 'text-red-400 animate-pulse' : 'text-emerald-400'">
          {{ hullIntegrity }}%
        </span>
      </div>
      <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
        <div 
          class="h-full rounded-full transition-all"
          :class="hullIntegrity <= 30 ? 'bg-red-500' : hullIntegrity <= 60 ? 'bg-amber-500' : 'bg-emerald-500'"
          :style="{ width: `${hullIntegrity}%` }"
        ></div>
      </div>
      <div v-if="hullIntegrity <= 50" class="flex items-center justify-between pt-1">
        <p class="text-[11px] text-red-400 font-medium">
          ⚠️ เรือชำรุดเสียหายหนัก! เสี่ยงอับปางหากเจอคลื่นพายุหรือการปะทะ
        </p>
        <button
          type="button"
          @click="sendCombatAlert('CRITICAL_HULL')"
          class="px-2 py-1 bg-red-800 hover:bg-red-700 text-white text-[10px] rounded font-bold transition-all active:scale-95"
        >
          ส่งสัญญาณเตือนกัปตัน 🚨
        </button>
      </div>
    </div>

    <!-- Cannon Control -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-3">
      <div class="flex justify-between items-center">
        <h4 class="text-xs font-semibold text-amber-300 uppercase tracking-wider">💣 ระบบปืนใหญ่ป้องกันตัว</h4>
        <span class="text-xs font-bold font-mono text-slate-200">โควตากระสุน: {{ cannonCount }} / 3 ครั้ง</span>
      </div>

      <div class="p-2.5 bg-slate-800/80 rounded border border-slate-700/50 flex items-center justify-between">
        <div>
          <span class="text-xs font-bold text-slate-200">เปิดระบบพร้อมยิงตอบโต้ (Combat Stance)</span>
          <p class="text-[10px] text-slate-400">หากพบโจรสลัด จะยิงปืนใหญ่ขับไล่ทันทีและชิงเงินรางวัล +500 Gold</p>
        </div>
        <input 
          v-model="useCannonReady"
          @change="handleToggleCannon"
          type="checkbox"
          :disabled="cannonCount <= 0"
          class="w-5 h-5 accent-red-500 cursor-pointer"
        />
      </div>

      <div v-if="cannonCount <= 0" class="text-xs text-red-400 italic text-center p-2 bg-red-950/40 rounded border border-red-500/30">
        กระสุนปืนใหญ่หมด! ติดต่อต้นหน/ฝ่ายเสบียงเพื่อแวะซื้อที่ Port หรือ Black Market Atoll ด่วน
      </div>
    </div>

    <!-- Combat Tactical Matrix -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
      <h4 class="text-xs font-semibold text-slate-300 uppercase tracking-wider">🎯 การประเมินสถานการณ์รบ (Tactical Matrix)</h4>
      <div class="grid grid-cols-2 gap-2 text-[11px]">
        <div class="p-2 bg-emerald-950/30 border border-emerald-500/30 rounded">
          <div class="font-bold text-emerald-400">✅ หากเปิดปืนใหญ่ + มีกระสุน:</div>
          <div class="text-slate-300 mt-1">ยิงสกัดโจรสลัดสำเร็จ ชิงค่าหัว <strong class="text-amber-300">+500 Gold</strong> และตัวเรือปลอดภัย 0% เสียหาย</div>
        </div>
        <div class="p-2 bg-red-950/30 border border-red-500/30 rounded">
          <div class="font-bold text-red-400">❌ หากปิดปืนใหญ่ หรือกระสุนหมด:</div>
          <div class="text-slate-300 mt-1">ถูกโจรสลัดขึ้นปล้น สูญเสีย <strong class="text-amber-300">-200 Gold</strong> และตัวเรือพัง <strong class="text-red-400">-25% Hull</strong></div>
        </div>
      </div>

      <button
        type="button"
        @click="sendCombatAlert(cannonCount > 0 ? 'READY' : 'LOW_AMMO')"
        class="w-full mt-2 py-2 bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-white font-bold text-xs rounded-lg transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5"
      >
        <span>📡 ส่งรายงานความพร้อมรบขึ้นสะพานเดินเรือ (Combat Readiness Alert)</span>
      </button>
    </div>
  </div>
</template>
