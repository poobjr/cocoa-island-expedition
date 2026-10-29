<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '../stores/gameStore';
import CountdownClock from '../components/common/CountdownClock.vue';
import QrcodeVue from 'qrcode.vue';

const store = useGameStore();

const joinUrl = computed(() => {
  return `${window.location.origin}/#participant`;
});

const currentEvent = computed(() => store.currentEvent);
const isSpyPhase = computed(() => store.phase === 'SPY_FREEZE');

// Dynamic Ship Creation
const newShipName = ref('');
const newShipColor = ref('#06b6d4');
const newShipIsBot = ref(false);

const quickNamePresets = [
  { name: 'เรือไทรเดนท์ (Trident)', color: '#06b6d4' },
  { name: 'เรือกัลเลียน (Galleon)', color: '#e11d48' },
  { name: 'เรือเนปจูน (Neptune)', color: '#84cc16' },
  { name: 'เรือคราเคน (Kraken)', color: '#a855f7' },
  { name: 'เรือแอดเวนเจอร์ (Adventure)', color: '#f97316' },
  { name: 'เรือโกลเด้นฮินด์ (Golden Hind)', color: '#fbbf24' },
];

function handleAddShip() {
  if (!newShipName.value.trim()) {
    alert('กรุณาระบุชื่อเรือ');
    return;
  }
  store.instructorAddShip(newShipName.value.trim(), newShipColor.value, newShipIsBot.value);
  newShipName.value = '';
}

function handleApplyPreset(preset: { name: string; color: string }) {
  newShipName.value = preset.name;
  newShipColor.value = preset.color;
}

function handleRemoveShip(teamId: string, teamName: string) {
  if (confirm(`คุณต้องการลบเรือ "${teamName}" ออกจากเกมใช่หรือไม่?`)) {
    store.instructorRemoveShip(teamId);
  }
}

function handleResetGame() {
  if (confirm('คุณต้องการรีเซ็ตเกมและกระดานคะแนนเพื่อเริ่มรอบใหม่ใช่หรือไม่? (ข้อมูลรอบปัจจุบันจะถูกล้างทิ้งทันที)')) {
    store.instructorResetGame();
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
    <!-- Header -->
    <div class="p-4 bg-slate-900/90 border border-amber-600/50 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
      <div class="flex items-center gap-3">
        <span class="text-3xl">💻</span>
        <div>
          <h1 class="text-lg md:text-xl font-bold font-serif text-amber-300">แผงควบคุมวิทยากร (Instructor Master Dashboard)</h1>
          <p class="text-xs text-slate-400">ควบคุมสถานะเกม ซิงค์เวลา และจัดการสงครามข้อมูลของสัมมนา</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-right">
          <div class="text-xs text-slate-400">สถานะรอบ / วันที่:</div>
          <div class="text-sm font-bold font-mono text-amber-300">Day {{ store.currentDay }}/{{ store.maxDays }} ({{ store.phase }})</div>
        </div>
        <CountdownClock :seconds="store.turnSecondsRemaining" :is-urgent="store.turnSecondsRemaining <= 30" />
      </div>
    </div>

    <!-- Master Controls Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 1. Turn & Time Controller -->
      <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <h3 class="text-xs font-semibold text-amber-300 uppercase tracking-wider">⏱️ ควบคุมเวลาและรอบประจำวัน</h3>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="store.instructorStartGame"
            class="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-transform active:scale-95"
          >
            ▶️ เริ่มต้นเกม (Day 1)
          </button>

          <button
            @click="handleResetGame"
            class="py-2.5 px-3 bg-rose-700/80 hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition-transform active:scale-95 border border-rose-500/40"
          >
            🔄 รีเซ็ตรอบใหม่ (Reset)
          </button>

          <button
            v-if="store.isTimerRunning"
            @click="store.instructorPauseTimer"
            class="py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-transform active:scale-95"
          >
            ⏸️ พักเวลา (Pause)
          </button>
          <button
            v-else
            @click="store.instructorResumeTimer"
            class="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-transform active:scale-95"
          >
            ▶️ จับเวลาต่อ (Resume)
          </button>

          <button
            @click="store.instructorSkipDay"
            class="col-span-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-lg transition-transform active:scale-95"
          >
            ⏭️ ตัดจบวันทันที (Skip to End of Day)
          </button>
        </div>
      </div>

      <!-- 2. Spy Phase & Intelligence Warfare Trigger -->
      <div class="p-4 bg-purple-950/40 border border-purple-500/40 rounded-xl space-y-3">
        <div class="flex justify-between items-center">
          <h3 class="text-xs font-semibold text-purple-300 uppercase tracking-wider">🕵️ ระบบสงครามข้อมูล (Spy Phase)</h3>
          <span v-if="isSpyPhase" class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white animate-pulse">
            Active
          </span>
        </div>
        <button
          @click="store.instructorTriggerSpyPhase"
          class="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-transform active:scale-95"
        >
          🚨 สั่งเปิด Spy Phase ทันที (5-7 นาที)
        </button>

        <div class="space-y-1.5 pt-1">
          <label class="text-[11px] text-slate-400 font-medium">กดปล่อยข่าวรั่วบนจอ Projector:</label>
          <div class="grid grid-cols-2 gap-1.5">
            <button
              @click="store.instructorTriggerLeak('REVEAL_2_TEAMS')"
              class="py-2 px-2 bg-slate-800 hover:bg-slate-700 border border-purple-500/30 text-purple-200 text-[11px] font-semibold rounded"
            >
              📡 สุ่มเปิดเผย 2 ทีม
            </button>
            <button
              @click="store.instructorTriggerLeak('BERMUDA_TRAP')"
              class="py-2 px-2 bg-slate-800 hover:bg-slate-700 border border-purple-500/30 text-purple-200 text-[11px] font-semibold rounded"
            >
              ⚡ พายุแฉเรือเบอร์มิวดา
            </button>
          </div>
        </div>
      </div>

      <!-- 3. QR Code for Participants -->
      <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-4">
        <div class="p-2 bg-white rounded-xl shadow-md">
          <qrcode-vue :value="joinUrl" :size="80" level="H" />
        </div>
        <div class="space-y-1 text-xs">
          <h4 class="font-bold text-amber-300">QR สำหรับผู้เล่นสแกนเข้าห้อง</h4>
          <p class="text-[11px] text-slate-400">สแกนผ่านกล้องมือถือได้ทันที ไม่ต้องลงแอป</p>
          <div class="font-mono text-[10px] text-sky-400 truncate max-w-[150px]">{{ joinUrl }}</div>
        </div>
      </div>
    </div>

    <!-- Add New Custom Ship Section -->
    <div class="p-4 bg-slate-900/90 border border-amber-600/40 rounded-2xl space-y-3 parchment-card">
      <div class="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 class="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <span>➕ เพิ่มเรือใหม่เข้าสู่น่านน้ำ (Add New Ship to Fleet)</span>
          </h3>
          <p class="text-xs text-slate-400">รองรับจำนวนผู้เข้าสัมมนาจำนวนมาก สามารถเพิ่มเรือเปล่ารอผู้เล่น หรือเรือบอทเพิ่มได้ตลอดเวลา</p>
        </div>
      </div>

      <!-- Quick Preset Buttons -->
      <div class="flex flex-wrap items-center gap-1.5 text-xs">
        <span class="text-slate-400 text-[11px]">ชื่อสำเร็จรูป:</span>
        <button
          v-for="preset in quickNamePresets"
          :key="preset.name"
          type="button"
          @click="handleApplyPreset(preset)"
          class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] flex items-center gap-1.5 transition-all active:scale-95"
        >
          <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: preset.color }"></span>
          <span>{{ preset.name.split(' ')[0] }}</span>
        </button>
      </div>

      <!-- Add Ship Form -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end pt-1">
        <div class="sm:col-span-2">
          <label class="text-[11px] text-slate-300">ชื่อเรือ (Ship Name):</label>
          <input
            v-model="newShipName"
            type="text"
            placeholder="เช่น เรือเนปจูน (Neptune)"
            class="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label class="text-[11px] text-slate-300">สีธงประจำเรือ:</label>
          <div class="flex items-center gap-2 mt-1">
            <input
              v-model="newShipColor"
              type="color"
              class="w-8 h-8 rounded border border-slate-600 bg-slate-800 cursor-pointer p-0.5"
            />
            <span class="text-xs font-mono text-slate-300">{{ newShipColor }}</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            @click="handleAddShip"
            class="w-full py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs rounded-lg shadow transition-transform active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>⛵</span>
            <span>+ สร้างเรือลงน่านน้ำ</span>
          </button>
        </div>
      </div>
    </div>

    <!-- AI Bot Simulator Section -->
    <div class="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
      <div class="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 class="text-sm font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2">
            <span>🤖 จัดการเรือบอทจำลอง (AI Bot Fleet Simulator)</span>
          </h3>
          <p class="text-xs text-slate-400">จำลองการเล่นสำหรับเรือที่สมาชิกไม่ครบ บอทจะตัดสินใจเดินเรือ ช้อปเสบียง และปล่อยข่าวลืออัตโนมัติ</p>
        </div>

        <button
          @click="store.instructorAutofillBots"
          class="py-2 px-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
        >
          <span>🤖</span>
          <span>เติมบอทลงเรือที่ว่างทั้งหมดอัตโนมัติ (Auto-fill)</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div
          v-for="team in store.teams"
          :key="team.id"
          class="p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all"
          :class="team.isBot ? 'bg-sky-950/30 border-sky-500/50' : 'bg-slate-800/60 border-slate-700/60'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: team.color }"></span>
              <span class="text-xs font-bold text-slate-100">{{ team.name }}</span>
            </div>
            <span 
              class="px-2 py-0.5 rounded text-[10px] font-bold"
              :class="team.isBot ? 'bg-sky-500 text-slate-950' : 'bg-slate-700 text-slate-300'"
            >
              {{ team.isBot ? '🤖 AI BOT' : '👤 ผู้เล่นจริง' }}
            </span>
          </div>

          <div class="text-[11px] text-slate-400 flex justify-between">
            <span>สมาชิกมนุษย์: {{ team.members.length }} คน</span>
            <span class="text-amber-400 font-mono">{{ team.gold }} G</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="store.instructorToggleBot(team.id, !team.isBot)"
              class="flex-1 py-1.5 rounded text-xs font-semibold transition-all"
              :class="team.isBot 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600' 
                : 'bg-sky-600/80 hover:bg-sky-500 text-white'"
            >
              {{ team.isBot ? '🔄 สลับเป็นเรือผู้เล่นจริง' : '🤖 เปิดโหมด AI Bot' }}
            </button>

            <button
              v-if="team.members.length === 0"
              type="button"
              @click="handleRemoveShip(team.id, team.name)"
              class="px-2 py-1.5 rounded text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/30 transition-all"
              title="ลบเรือที่ไม่มีสมาชิก"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Status: Real vs Counterfeit Table (Instructor Super-Vision) -->
    <div class="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <span>👁️ ตารางตรวจจับความจริง: Real Location vs Fake Report</span>
          </h3>
          <p class="text-xs text-slate-400">วิทยากรสามารถตรวจดูว่าทีมใดกำลังบลัฟ หรือสร้างข่าวลวงหลอกเพื่อน</p>
        </div>
        <span class="text-xs text-slate-400 font-mono">{{ store.teams.length }} ทีมในน่านน้ำ</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-800 text-slate-300 uppercase font-mono text-[11px]">
            <tr>
              <th class="p-2.5">ชื่อเรือ / กลุ่ม</th>
              <th class="p-2.5">พิกัดจริง (Real Location)</th>
              <th class="p-2.5">พิกัดปลอม (Fake Report)</th>
              <th class="p-2.5">ทอง / สมบัติจริง</th>
              <th class="p-2.5">น้ำหนัก / สภาพเรือ</th>
              <th class="p-2.5">ข่าวลือที่ปล่อย (Rumor)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800 text-slate-200">
            <tr v-for="team in store.teams" :key="team.id" class="hover:bg-slate-800/40">
              <td class="p-2.5 font-bold flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: team.color }"></span>
                <span>{{ team.name }}</span>
                <span v-if="team.isBot" class="text-[10px] px-1 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-500/40">BOT</span>
                <span v-if="team.isSunk" class="text-red-400">(อับปาง)</span>
              </td>
              <td class="p-2.5">
                <span class="px-2 py-0.5 rounded font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  {{ store.mapNodes[team.currentLocationId]?.nameTh.split(' ')[0] }}
                </span>
              </td>
              <td class="p-2.5">
                <span class="px-2 py-0.5 rounded font-semibold bg-purple-950 text-purple-300 border border-purple-500/40">
                  {{ store.mapNodes[team.spyData?.fakeLocationNodeId || 'node-1']?.nameTh.split(' ')[0] }}
                </span>
              </td>
              <td class="p-2.5 font-mono text-amber-300">
                {{ team.gold }} G / {{ team.inventory.treasureBoxes }} หีบ
              </td>
              <td class="p-2.5 font-mono">
                {{ team.hullIntegrity }}% ({{ store.currentShipWeight }} lbs)
              </td>
              <td class="p-2.5 text-slate-400 italic">
                "{{ team.spyData?.rumorMessage || 'ไม่มีข่าวลือ' }}"
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
