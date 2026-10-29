<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '../../stores/gameStore';

const store = useGameStore();

const fakeLocationId = ref('node-1');
const fakeGold = ref(500);
const fakeTreasures = ref(0);
const rumorMessage = ref('');

const scoutTargetTeamId = ref('');
const scoutSuspectedNodeId = ref('');
const scoutNotes = ref('');

const myTeam = computed(() => store.myTeam);
const otherTeams = computed(() => store.teams.filter(t => t.id !== store.currentTeamId));
const nodesList = computed(() => Object.values(store.mapNodes));

function handleSaveCounterfeit() {
  store.updateSpyIntel({
    fakeLocationNodeId: fakeLocationId.value,
    fakeGold: fakeGold.value,
    fakeTreasures: fakeTreasures.value,
    rumorMessage: rumorMessage.value,
  });
  alert('บันทึกรายงานปลอม (Counterfeit Report) สำเร็จ! ข้อมูลเท็จพร้อมใช้ปล่อยลวงเรือลำอื่น');
}

function handleAddScoutingLog() {
  if (!scoutTargetTeamId.value) return;

  const currentScouted = myTeam.value?.spyData?.scoutedTeams || [];
  const updatedScouted = [
    ...currentScouted,
    {
      targetTeamId: scoutTargetTeamId.value,
      suspectedNodeId: scoutSuspectedNodeId.value,
      notes: scoutNotes.value
    }
  ];

  store.updateSpyIntel({
    scoutedTeams: updatedScouted
  });

  scoutNotes.value = '';
  alert('บันทึกเบาะแสสายลับเข้าแฟ้มสืบราชการลับแล้ว!');
}

function sendSpyAlertToCaptain(action: 'ADVANCE' | 'ANCHOR' | 'RETREAT', intelMsg: string) {
  store.submitAdvisoryVote(action, undefined, `🕵️ ข้อมูลสายลับ: ${intelMsg}`);
  alert('ส่งรายงานสายลับและข้อเสนอแนะขึ้นสะพานเดินเรือ (Captain Bridge) แล้ว!');
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="p-3 bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/40 rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🕵️</span>
        <div>
          <h3 class="font-bold text-purple-200">ศูนย์ข่าวกรองสายลับ (Spy & Intelligence HQ)</h3>
          <p class="text-xs text-slate-400">สงครามข้อมูลและเงาลวง สืบพิกัดคู่แข่ง ปล่อยข่าวลือ และสร้างรายงานเท็จ</p>
        </div>
      </div>
      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/65 text-purple-200 border border-purple-500/30">
        ชั้นความลับสูงสุด
      </span>
    </div>

    <!-- Spy Phase Calendar Alert -->
    <div class="p-2.5 bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        <span class="text-base">⏳</span>
        <div>
          <span class="font-bold text-purple-200">รอบเจรจาสายลับ (Spy Negotiation Windows):</span>
          <p class="text-[10px] text-purple-300">หยุดเวลาเจรจาลวง วันที่ <strong>5</strong> และ <strong>10</strong> (3 นาที)</p>
        </div>
      </div>
      <span 
        class="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
        :class="store.isSpyPhase ? 'bg-amber-500 text-slate-950 animate-bounce' : 'bg-slate-800 text-slate-300'"
      >
        {{ store.isSpyPhase ? '🔥 อยู่ในช่วงสายลับ!' : `วันที่ปัจจุบัน: ${store.currentDay}/15` }}
      </span>
    </div>

    <!-- 1. Real Status (For Spy's Eyes Only) -->
    <div class="p-3 bg-slate-900/90 border border-slate-700/60 rounded-xl space-y-1.5">
      <h4 class="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
        <span>🔒 ข้อมูลจริงของทีมเรา (Verified Real Status)</span>
      </h4>
      <div class="grid grid-cols-3 gap-2 text-xs pt-1">
        <div class="p-1.5 bg-slate-800 rounded">
          <div class="text-[10px] text-slate-400">พิกัดจริง:</div>
          <div class="font-bold text-emerald-300">{{ store.currentNode?.nameTh.split(' ')[0] }}</div>
        </div>
        <div class="p-1.5 bg-slate-800 rounded">
          <div class="text-[10px] text-slate-400">ทองจริง:</div>
          <div class="font-bold text-amber-300 font-mono">{{ myTeam?.gold }} G</div>
        </div>
        <div class="p-1.5 bg-slate-800 rounded">
          <div class="text-[10px] text-slate-400">หีบสมบัติจริง:</div>
          <div class="font-bold text-yellow-300 font-mono">{{ myTeam?.inventory.treasureBoxes }} กล่อง</div>
        </div>
      </div>
    </div>

    <!-- 2. Counterfeit Report Form (Bluffing Engine) -->
    <div class="p-3 bg-purple-950/30 border border-purple-500/40 rounded-xl space-y-2.5">
      <h4 class="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center justify-between">
        <span>🎭 สร้างรายงานปลอมเพื่อลวงทีมอื่น (Counterfeit Report)</span>
      </h4>
      <p class="text-[11px] text-slate-300">
        เมื่อคุณเดินไปพูดคุยหรือเจรจากับสายลับทีมอื่น จงเปิดหน้านี้เพื่อแกล้งโชว์ข้อมูลลวง!
      </p>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label class="text-[11px] text-slate-300">พิกัดปลอมที่ต้องการอ้าง:</label>
          <select v-model="fakeLocationId" class="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-slate-200">
            <option v-for="node in nodesList" :key="node.id" :value="node.id">
              {{ node.nameTh.split(' ')[0] }}
            </option>
          </select>
        </div>
        <div>
          <label class="text-[11px] text-slate-300">ยอดทองปลอม:</label>
          <input v-model.number="fakeGold" type="number" class="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-slate-200" />
        </div>
      </div>

      <div>
        <label class="text-[11px] text-slate-300">ข่าวลือลวงที่ปล่อยไป (Fake Rumor):</label>
        <input 
          v-model="rumorMessage" 
          type="text" 
          placeholder="เช่น เรือเราติดพายุเบอร์มิวดาน้ำมันหมดแล้ว อย่าตามมานะ" 
          class="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-slate-200"
        />
      </div>

      <!-- Live Preview of Warfare Board Token -->
      <div class="p-2 bg-slate-900/90 rounded border border-purple-500/30 space-y-1">
        <div class="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
          🖥️ พรีวิวบนบอร์ดโปรเจกเตอร์ใหญ่ (Projector Warfare Preview):
        </div>
        <div class="text-[11px] font-mono text-amber-300 flex items-center gap-1.5">
          <span>👻 [ลือ] {{ store.mapNodes[fakeLocationId]?.nameTh.split(' ')[0] }}</span>
          <span class="text-slate-400">|</span>
          <span>💰 ~{{ fakeGold }} G</span>
        </div>
        <p class="text-[10px] text-slate-400 italic">
          เรือลำอื่นจะเห็นเฉพาะพิกัดลือนี้บนจอรวม แต่จะไม่รู้ว่าจริงหรือปลอม!
        </p>
      </div>

      <button
        type="button"
        @click="handleSaveCounterfeit"
        class="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-transform active:scale-95"
      >
        บันทึกรายงานปลอม (พร้อมนำไปใช้ลวง)
      </button>
    </div>

    <!-- 3. Scouting Log (Input clues gathered from peers) -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
      <h4 class="text-xs font-semibold text-amber-300 uppercase tracking-wider">
        📝 บันทึกข้อมูลที่แอบสืบมาได้ (Scouting Log)
      </h4>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label class="text-[11px] text-slate-300">ทีมเป้าหมาย:</label>
          <select v-model="scoutTargetTeamId" class="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-slate-200">
            <option value="" disabled>-- เลือกทีมคู่แข่ง --</option>
            <option v-for="team in otherTeams" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="text-[11px] text-slate-300">คาดว่าอยู่ที่โหนด:</label>
          <select v-model="scoutSuspectedNodeId" class="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-slate-200">
            <option value="" disabled>-- เลือกโหนด --</option>
            <option v-for="node in nodesList" :key="node.id" :value="node.id">
              {{ node.nameTh.split(' ')[0] }}
            </option>
          </select>
        </div>
      </div>

      <input 
        v-model="scoutNotes" 
        type="text" 
        placeholder="เบาะแสที่ได้มา เช่น อ้างว่ามีเข็มทิศแต่หน้าตาดูมีพิรุธ" 
        class="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-slate-200"
      />

      <button
        type="button"
        @click="handleAddScoutingLog"
        class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-lg transition-transform active:scale-95"
      >
        + เพิ่มเบาะแสลงแฟ้มข่าวกรอง
      </button>

      <!-- Display logged intel -->
      <div v-if="myTeam?.spyData?.scoutedTeams?.length" class="mt-2 space-y-1 max-h-24 overflow-y-auto">
        <div 
          v-for="(log, idx) in myTeam.spyData.scoutedTeams" 
          :key="idx"
          class="text-[11px] p-1.5 bg-slate-800/60 rounded border border-slate-700/40 text-slate-300 flex justify-between"
        >
          <span>🎯 {{ otherTeams.find(t => t.id === log.targetTeamId)?.name }}: {{ log.notes }}</span>
          <span class="text-amber-400 font-mono">[{{ store.mapNodes[log.suspectedNodeId]?.nameTh.split(' ')[0] || '?' }}]</span>
        </div>
      </div>
    </div>

    <!-- 4. Spy Advisory to Captain -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
      <h4 class="text-xs font-semibold text-purple-300 uppercase tracking-wider">
        📡 ส่งสรุปเบาะแสขึ้นสะพานเดินเรือ (Spy Advisory to Captain)
      </h4>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          @click="sendSpyAlertToCaptain('ADVANCE', 'คู่แข่งกำลังมุ่งหน้าไปเกาะโกโก้! รีบชิงตัดหน้าด่วน')"
          class="p-2 bg-blue-900/40 hover:bg-blue-800/50 border border-blue-500/40 text-blue-200 text-xs rounded font-bold transition-all active:scale-95 text-left"
        >
          ⏩ เร่งเดินหน้าชิงตัดหน้า
        </button>
        <button
          type="button"
          @click="sendSpyAlertToCaptain('RETREAT', 'มีข่าวกรองว่าโจรสลัดดักซุ่มอยู่ข้างหน้า แนะนำเลี่ยงหรือถอย!')"
          class="p-2 bg-amber-900/40 hover:bg-amber-800/50 border border-amber-500/40 text-amber-200 text-xs rounded font-bold transition-all active:scale-95 text-left"
        >
          ⏪ เตือนให้เลี่ยง/ถอยหลัง
        </button>
      </div>
    </div>
  </div>
</template>
