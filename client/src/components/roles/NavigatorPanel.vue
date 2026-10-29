<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '../../stores/gameStore';

const store = useGameStore();

const suggestedAction = ref<'ADVANCE' | 'RETREAT' | 'ANCHOR'>('ADVANCE');
const suggestedNodeId = ref<string>('');
const advisoryNote = ref<string>('');

const myTeam = computed(() => store.myTeam);
const currentNode = computed(() => store.currentNode);

const availableTargetNodes = computed(() => {
  if (!currentNode.value) return [];
  return currentNode.value.connectedTo.map(id => store.mapNodes[id]).filter(Boolean);
});

function handleSendAdvice() {
  if (suggestedAction.value !== 'ANCHOR' && !suggestedNodeId.value && availableTargetNodes.value.length > 0) {
    suggestedNodeId.value = availableTargetNodes.value[0].id;
  }
  store.submitAdvisoryVote(suggestedAction.value, suggestedNodeId.value, advisoryNote.value);
  alert('ส่งคำแนะนำไปยังกัปตันเรียบร้อยแล้ว!');
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="p-3 bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/40 rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl">⚓</span>
        <div>
          <h3 class="font-bold text-blue-200">โต๊ะต้นหน & คุมหางเสือ (Pilot & Navigator)</h3>
          <p class="text-xs text-slate-400">วางแผนเส้นทางเดินเรือ คำนวณเชื้อเพลิง และเสนอทางเลือกให้กัปตัน</p>
        </div>
      </div>
    </div>

    <!-- Wind & Currents Gauge -->
    <div class="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl space-y-2">
      <div class="flex items-center justify-between text-xs">
        <span class="font-bold text-sky-300 flex items-center gap-1.5">
          <span>💨</span>
          <span>กระแสน้ำและทิศทางลมวันนี้:</span>
        </span>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/60 text-blue-200">
          ลมส่งท้ายปานกลาง
        </span>
      </div>
      <p class="text-xs text-slate-300">
        กระแสน้ำเปิดสู่ทิศตะวันออก เหมาะแก่การกางใบแล่นเรือเต็มกำลัง หากมีเข็มทิศจะเดินทางฝ่าหมอกได้โดยไม่หลงทิศ!
      </p>
      <div class="flex items-center justify-between text-[11px] pt-1 border-t border-blue-900/40">
        <span class="text-slate-400">อุปกรณ์เข็มทิศประจำเรือ:</span>
        <span class="font-mono font-bold" :class="(myTeam?.inventory.compass || 0) > 0 ? 'text-emerald-400' : 'text-amber-400'">
          {{ (myTeam?.inventory.compass || 0) > 0 ? '🧭 มีเข็มทิศ (พิกัดแม่นยำ 100%)' : '❌ ไม่มีเข็มทิศ (เสี่ยงหลงในหมอก)' }}
        </span>
      </div>
    </div>

    <!-- Fuel Gauge & Analysis -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-400">เชื้อเพลิงคงเหลือ:</span>
        <span class="font-bold text-amber-300 font-mono">{{ myTeam?.inventory.fuel }} ถัง</span>
      </div>
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-400">ระยะเดินเรือที่เหลือ:</span>
        <span class="font-semibold text-emerald-400">{{ myTeam?.inventory.fuel }} วัน (หากแล่นเรือทุกวัน)</span>
      </div>
    </div>

    <!-- Suggestion Form -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-3">
      <h4 class="text-xs font-semibold text-blue-300 uppercase tracking-wider">🧭 เสนอทางเลือกให้กัปตัน</h4>

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

      <div v-if="suggestedAction !== 'ANCHOR'" class="space-y-1">
        <label class="text-xs text-slate-300">เสนอให้แล่นไปที่:</label>
        <select 
          v-model="suggestedNodeId"
          class="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-slate-200"
        >
          <option value="" disabled>-- เลือกโหนดเป้าหมาย --</option>
          <option v-for="node in availableTargetNodes" :key="node.id" :value="node.id">
            [{{ node.code }}] {{ node.nameTh }}
          </option>
        </select>
      </div>

      <div class="space-y-1">
        <label class="text-xs text-slate-300">ข้อความเตือน/เหตุผลสั้นๆ ถึงกัปตัน:</label>
        <input 
          v-model="advisoryNote"
          type="text"
          placeholder="เช่น น้ำมันเหลือน้อย ควรทิ้งสมอรอเก็บของลอยน้ำ"
          class="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-slate-200"
        />
      </div>

      <button
        type="button"
        @click="handleSendAdvice"
        class="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-transform active:scale-95"
      >
        ส่งข้อเสนอแนะขึ้นสะพานเดินเรือ
      </button>
    </div>
  </div>
</template>
