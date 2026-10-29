<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '../../stores/gameStore';

const store = useGameStore();

const selectedAction = ref<'ADVANCE' | 'RETREAT' | 'ANCHOR'>('ANCHOR');
const selectedTargetNodeId = ref<string>('');

const myTeam = computed(() => store.myTeam);
const currentNode = computed(() => store.currentNode);

const availableTargetNodes = computed(() => {
  if (!currentNode.value) return [];
  return currentNode.value.connectedTo.map(id => store.mapNodes[id]).filter(Boolean);
});

// Advisory votes from crew members
const advisoryVotes = computed(() => myTeam.value?.advisoryVotes || []);

function handleAdoptVote(vote: any) {
  if (vote.suggestedAction) {
    selectedAction.value = vote.suggestedAction;
  }
  if (vote.suggestedTargetNodeId) {
    selectedTargetNodeId.value = vote.suggestedTargetNodeId;
  }
  alert(`กัปตันรับข้อเสนอแนะของ ${vote.playerName} (${vote.role}) เรียบร้อย! ฟอร์มคำสั่งถูกกรอกตามที่แนะนำ`);
}

function handleInspiration() {
  alert('👑 กัปตันเป่านกหวีดรวมพล: "มุ่งหน้าสู่เกาะโกโก้ เพื่อทองคำและเกียรติยศของเรือเรา!" ขวัญกำลังใจลูกเรือเต็มเปี่ยม ⚓');
}

function handleConfirmOrder() {
  if (!myTeam.value) return;

  if (selectedAction.value !== 'ANCHOR' && !selectedTargetNodeId.value) {
    alert('กรุณาเลือกเกาะเป้าหมายที่ต้องการเดินทางไป');
    return;
  }

  const order = {
    action: selectedAction.value,
    targetNodeId: selectedAction.value === 'ANCHOR' ? myTeam.value.currentLocationId : selectedTargetNodeId.value,
    submittedBy: store.currentPlayer?.id
  };

  store.updateDailyOrder(order);
  alert('กัปตันยืนยันคำสั่งเดินเรือประจำวันเรียบร้อยแล้ว!');
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="p-3 bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40 rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl">👑</span>
        <div>
          <h3 class="font-bold text-amber-200">สะพานเดินเรือกัปตัน (Captain's Bridge)</h3>
          <p class="text-xs text-slate-400">ผู้นำสูงสุด รับฟังข้อเสนอแนะของลูกเรือ และเคาะคำสั่งเดินเรือ</p>
        </div>
      </div>
      <button 
        @click="handleInspiration"
        class="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 rounded-lg text-amber-300 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
      >
        <span>📣 ปลุกใจ</span>
      </button>
    </div>

    <!-- Quick Bridge Metrics -->
    <div class="grid grid-cols-4 gap-2 text-center text-xs">
      <div class="p-2 bg-slate-900/80 border border-slate-700/60 rounded-lg">
        <div class="text-[10px] text-slate-400">💧 น้ำดื่ม</div>
        <div class="font-mono font-bold text-sky-300">{{ myTeam?.inventory.water }} ถัง</div>
      </div>
      <div class="p-2 bg-slate-900/80 border border-slate-700/60 rounded-lg">
        <div class="text-[10px] text-slate-400">⛽ เชื้อเพลิง</div>
        <div class="font-mono font-bold text-amber-300">{{ myTeam?.inventory.fuel }} ถัง</div>
      </div>
      <div class="p-2 bg-slate-900/80 border border-slate-700/60 rounded-lg">
        <div class="text-[10px] text-slate-400">🛡️ ความทนทาน</div>
        <div class="font-mono font-bold text-emerald-300">{{ myTeam?.hullIntegrity }}%</div>
      </div>
      <div class="p-2 bg-slate-900/80 border border-slate-700/60 rounded-lg">
        <div class="text-[10px] text-slate-400">📦 หีบสมบัติ</div>
        <div class="font-mono font-bold text-yellow-300">{{ myTeam?.inventory.treasureBoxes }} กล่อง</div>
      </div>
    </div>

    <!-- Crew Advisory Consensus Bar -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl">
      <h4 class="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2 flex items-center justify-between">
        <span>🗣️ เสียงแนะนำจากลูกเรือ (Crew Advisory)</span>
        <span class="text-[11px] text-slate-400">{{ advisoryVotes.length }} คนออกความเห็น</span>
      </h4>

      <div v-if="advisoryVotes.length === 0" class="text-xs text-slate-500 italic py-2 text-center">
        ยังไม่มีลูกเรือคนใดส่งข้อเสนอแนะในรอบนี้ (รอลูกเรือส่งข้อมูลเข้ามา)
      </div>

      <div v-else class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
        <div 
          v-for="vote in advisoryVotes" 
          :key="vote.playerId"
          class="text-xs p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between gap-2"
        >
          <div class="flex-1">
            <div class="flex items-center gap-1.5">
              <span class="font-semibold text-slate-200">{{ vote.playerName }}</span>
              <span class="text-[10px] px-1 rounded bg-slate-900 text-amber-300 border border-amber-500/30">{{ vote.role }}</span>
            </div>
            <p v-if="vote.note" class="text-[11px] text-slate-300 mt-1 italic">"{{ vote.note }}"</p>
          </div>

          <div class="flex items-center gap-2">
            <span 
              class="px-2 py-0.5 text-[10px] font-bold rounded"
              :class="{
                'bg-blue-900/60 text-blue-300 border border-blue-500/40': vote.suggestedAction === 'ADVANCE',
                'bg-amber-900/60 text-amber-300 border border-amber-500/40': vote.suggestedAction === 'RETREAT',
                'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40': vote.suggestedAction === 'ANCHOR',
              }"
            >
              {{ vote.suggestedAction === 'ADVANCE' ? '⏩ เดินหน้า' : vote.suggestedAction === 'RETREAT' ? '⏪ ถอยหลัง' : '⚓ จอดพัก' }}
            </span>
            <button
              @click="handleAdoptVote(vote)"
              class="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded transition-transform active:scale-95 shadow"
              title="รับข้อเสนอนี้และกรอกคำสั่งทันที"
            >
              ยอมรับข้อเสนอ ✍️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Selection -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-3">
      <h4 class="text-xs font-semibold text-amber-300 uppercase tracking-wider">🎯 เลือกคำสั่งเดินเรือประจำวัน</h4>
      
      <div class="grid grid-cols-3 gap-2">
        <button
          type="button"
          @click="selectedAction = 'ADVANCE'"
          class="p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1"
          :class="selectedAction === 'ADVANCE' ? 'bg-blue-600/30 border-blue-400 text-blue-200 ring-2 ring-blue-500/50' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'"
        >
          <span class="text-lg">⏩</span>
          <span class="text-xs font-bold">เดินหน้า</span>
          <span class="text-[9px] text-slate-400">-1 น้ำมัน, -1 น้ำ</span>
        </button>

        <button
          type="button"
          @click="selectedAction = 'ANCHOR'"
          class="p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1"
          :class="selectedAction === 'ANCHOR' ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/50' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'"
        >
          <span class="text-lg">⚓</span>
          <span class="text-xs font-bold">ทิ้งสมอจอด</span>
          <span class="text-[9px] text-slate-400">ฟรีน้ำมัน, -1 น้ำ</span>
        </button>

        <button
          type="button"
          @click="selectedAction = 'RETREAT'"
          class="p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1"
          :class="selectedAction === 'RETREAT' ? 'bg-amber-600/30 border-amber-400 text-amber-200 ring-2 ring-amber-500/50' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'"
        >
          <span class="text-lg">⏪</span>
          <span class="text-xs font-bold">ถอยหลัง</span>
          <span class="text-[9px] text-slate-400">-1 น้ำมัน, -1 น้ำ</span>
        </button>
      </div>

      <!-- Target Node Select if moving -->
      <div v-if="selectedAction !== 'ANCHOR'" class="space-y-1 pt-1">
        <label class="text-xs text-slate-300 font-medium">เลือกจุดหมายปลายทางถัดไป:</label>
        <select 
          v-model="selectedTargetNodeId"
          class="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="" disabled>-- เลือกโหนดที่เชื่อมต่อได้ --</option>
          <option v-for="node in availableTargetNodes" :key="node.id" :value="node.id">
            [{{ node.code }}] {{ node.nameTh }} ({{ node.type }})
          </option>
        </select>
      </div>

      <!-- Final Submit Button -->
      <button
        type="button"
        @click="handleConfirmOrder"
        class="w-full mt-2 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
      >
        <span>⚔️</span>
        <span>ฟันธงและยืนยันคำสั่งประจำวัน (Confirm Orders)</span>
      </button>
    </div>
  </div>
</template>
