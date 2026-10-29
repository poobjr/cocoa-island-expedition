<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore, MapNode } from '../stores/gameStore';
import CountdownClock from '../components/common/CountdownClock.vue';
import SeaChart12Nodes from '../components/map/SeaChart12Nodes.vue';
import EventModal, { EventModalData } from '../components/common/EventModal.vue';
import QrcodeVue from 'qrcode.vue';

const store = useGameStore();

const currentEvent = computed(() => store.currentEvent || {
  id: 'evt-1',
  day: store.currentDay || 1,
  title: 'น่านน้ำเปิดรับสายลม',
  description: 'สภาพอากาศแจ่มใส ทะเลสงบ เหมาะแก่การออกเรือกางใบจาก Grand Port Royal',
  type: 'CALM',
  affectedNodeIds: ['node-1', 'node-2'],
  effect: {}
});
const isSpyPhase = computed(() => store.phase === 'SPY_FREEZE');
const joinUrl = computed(() => `${window.location.origin}/#participant`);

const activeEventModal = ref<EventModalData | null>(null);
const fogOfWar = ref(true);

function getNodeName(nodeId?: string) {
  if (!nodeId) return 'ไม่ระบุพิกัด (ในม่านหมอก)';
  const node = store.mapNodes[nodeId];
  return node ? node.nameTh.split(' ')[0] : 'ไม่ระบุพิกัด';
}

function getTeamSpyData(teamId: string) {
  return store.teams.find(t => t.id === teamId)?.spyData;
}

function handleSelectNode(node: MapNode) {
  const isCocoa = node.id === 'node-12';
  const isPirate = node.id === 'node-11';
  const isFlotsam = node.id === 'node-7';
  const isStorm = node.id === 'node-8';
  const isCalm = node.id === 'node-5';
  const isStart = node.id === 'node-1';

  let eventType: 'PIRATE' | 'STORM' | 'ISLAND_DISCOVERY' | 'TREASURE' | 'FLOTSAM' | 'CALM' | 'START' = 'ISLAND_DISCOVERY';
  let modalImage = '/images/events/cocoa_island.jpg';

  if (isPirate) {
    eventType = 'PIRATE';
    modalImage = '/images/events/pirate_attack.jpg';
  } else if (isCocoa) {
    eventType = 'TREASURE';
    modalImage = '/images/events/cocoa_island.jpg';
  } else if (isFlotsam) {
    eventType = 'FLOTSAM';
    modalImage = '/images/events/flotsam_salvage.jpg';
  } else if (isStorm) {
    eventType = 'STORM';
    modalImage = '/images/events/ocean_storm.jpg';
  } else if (isCalm) {
    eventType = 'CALM';
    modalImage = '/images/events/calm_sea.jpg';
  } else if (isStart) {
    eventType = 'START';
    modalImage = '/images/events/calm_sea.jpg';
  }

  activeEventModal.value = {
    isOpen: true,
    type: eventType,
    title: node.nameTh,
    subtitle: `รหัสพิกัด [Node ${node.code}] - น่านน้ำ: ${node.type}`,
    image: modalImage,
    description: node.description,
    islandInfo: {
      nameTh: node.nameTh,
      type: node.type,
      features: [
        node.shopAvailable ? `🛒 มีตลาดเสบียง: น้ำดื่ม ${node.prices?.water}G, เชื้อเพลิง ${node.prices?.fuel}G` : '🏕️ ไม่มีตลาดเสบียง (ต้องเตรียมเสบียงมาเอง)',
        node.specialRule?.stormImmunity ? '🛡️ มีแนวปะการังกำบัง ปลอดภัยจากพายุ 100%' : '🌊 น่านน้ำเปิด โอกาสเผชิญคลื่นลมตามธรรมชาติ',
        node.specialRule?.radarRevealAll ? '👁️ ประภาคารส่องเรดาร์: เปิดพิกัดเรือทุกลำ' : '',
        node.specialRule?.flotsamChance ? '📦 มีซากเสบียงและลังสินค้าลอยน้ำชุกชุม (Flotsam 100%)' : '',
        isCocoa ? '👑 ขุดหีบสมบัติได้วันละ 1 หีบ (50 lbs)' : ''
      ].filter(Boolean),
      hazards: [
        node.specialRule?.weightLimit ? `⚠️ ร่องน้ำตื้น ห้ามเรือน้ำหนักเกิน ${node.specialRule.weightLimit} lbs ผ่าน!` : '',
        node.specialRule?.pirateChance ? '⚔️ รังโจรสลัดชุกชุม มีโอกาส 80% ที่จะโดนปล้นสะดม!' : '',
        node.id === 'node-8' ? '🌀 พายุหมุนและหมอกหนา หากไม่มีเข็มทิศจะถูกพัดหลงทิศ!' : ''
      ].filter(Boolean)
    }
  };
}

function openEventModal() {
  if (!currentEvent.value) return;

  if (currentEvent.value.type === 'PIRATE') {
    activeEventModal.value = {
      isOpen: true,
      type: 'PIRATE',
      title: currentEvent.value.title,
      subtitle: `รายงานเหตุการณ์สุ่ม Day ${store.currentDay}`,
      image: '/images/events/pirate_attack.jpg',
      description: currentEvent.value.description,
      details: {
        goldChange: -200,
        hullDamage: 25,
        customNote: 'เรือที่มีปืนใหญ่และสั่งยิงตอบโต้ จะได้รับทองคำ +500 Gold!'
      }
    };
  } else if (currentEvent.value.type === 'STORM') {
    activeEventModal.value = {
      isOpen: true,
      type: 'STORM',
      title: currentEvent.value.title,
      subtitle: `รายงานสภาพอากาศ Day ${store.currentDay}`,
      image: '/images/events/ocean_storm.jpg',
      description: currentEvent.value.description,
      details: {
        hullDamage: currentEvent.value.effect?.hullDamage || 15,
        waterChange: currentEvent.value.effect?.waterDrain ? -currentEvent.value.effect.waterDrain : undefined,
        fuelChange: currentEvent.value.effect?.fuelDrain ? -currentEvent.value.effect.fuelDrain : undefined,
        customNote: 'พายุพัดกระหน่ำน่านน้ำ! เรือที่อยู่ในพื้นที่ต้องระมัดระวัง'
      }
    };
  } else if (currentEvent.value.type === 'FLOTSAM') {
    activeEventModal.value = {
      isOpen: true,
      type: 'FLOTSAM',
      title: currentEvent.value.title,
      subtitle: `รายงานสภาพอากาศ Day ${store.currentDay}`,
      image: '/images/events/flotsam_salvage.jpg',
      description: currentEvent.value.description,
      details: {
        waterChange: currentEvent.value.effect?.flotsamWater || 1,
        fuelChange: currentEvent.value.effect?.flotsamFuel || 1,
        customNote: 'พบกล่องเสบียงลอยน้ำ เรือในพื้นที่สามารถเก็บกู้ได้ฟรี!'
      }
    };
  } else if (currentEvent.value.type === 'CALM') {
    activeEventModal.value = {
      isOpen: true,
      type: 'CALM',
      title: currentEvent.value.title,
      subtitle: `รายงานสภาพอากาศ Day ${store.currentDay}`,
      image: '/images/events/calm_sea.jpg',
      description: currentEvent.value.description,
      details: {
        customNote: 'คลื่นลมสงบ แสงแดดอบอุ่น น่านน้ำปลอดภัยสำหรับการเดินเรือ'
      }
    };
  } else {
    activeEventModal.value = {
      isOpen: true,
      type: 'ISLAND_DISCOVERY',
      title: currentEvent.value.title,
      subtitle: `รายงานสภาพอากาศ Day ${store.currentDay}`,
      image: '/images/events/cocoa_island.jpg',
      description: currentEvent.value.description
    };
  }
}
</script>

<template>
  <div class="w-full min-h-screen bg-slate-950 p-4 md:p-6 flex flex-col justify-between space-y-4 select-none">
    <!-- Top Stage Banner -->
    <div class="p-4 bg-slate-900/90 border-2 border-amber-500/60 rounded-2xl flex items-center justify-between shadow-2xl parchment-card">
      <div class="flex items-center gap-4">
        <span class="text-4xl">👑</span>
        <div>
          <h1 class="text-2xl md:text-3xl font-extrabold font-serif text-amber-300 gold-glow tracking-wider">
            THE ISLAND ADVENTURE : COCOA ISLAND EXPEDITION
          </h1>
          <p class="text-sm text-slate-400">การผจญภัยค้นหาขุมทรัพย์เกาะโกโก้ & สงครามข่าวกรองทางทะเล</p>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <div class="text-right">
          <div class="text-xs text-slate-400 uppercase tracking-widest">วันที่จำลอง (VIRTUAL DAY)</div>
          <div class="text-2xl md:text-3xl font-bold font-mono text-amber-300">
            DAY {{ store.currentDay }} <span class="text-base text-slate-500 font-sans">/ {{ store.maxDays }}</span>
          </div>
        </div>
        <CountdownClock :seconds="store.turnSecondsRemaining" :is-urgent="store.turnSecondsRemaining <= 30" />
      </div>
    </div>

    <!-- Spy Phase Takeover Alert Banner -->
    <div 
      v-if="isSpyPhase" 
      class="p-4 bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 border-2 border-purple-400 text-purple-100 rounded-2xl text-center space-y-2 animate-pulse shadow-2xl"
    >
      <div class="text-2xl font-black uppercase tracking-widest text-yellow-300">
        🚨 INFORMATION WARFARE: ส่งตัวแทนสายลับเข้าสู่ศูนย์ข่าวกรองกลางห้อง! 🚨
      </div>
      <p class="text-sm text-purple-200">
        การเดินเรือปกติถูกแช่แข็งชั่วคราว! สายลับมีเวลา 5 นาทีในการเจรจา หลอกล่อ และล้วงข้อมูลพิกัดคู่แข่ง
      </p>
    </div>

    <!-- Main Content: Map + Live Leaderboard -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
      <!-- Left: Interactive 12-Node Map -->
      <div class="lg:col-span-2 space-y-3">
        <SeaChart12Nodes @select-node="handleSelectNode" :fog-of-war="fogOfWar" />

        <!-- Weather / GM Event Banner Below Map -->
        <div 
          @click="openEventModal"
          class="p-3 bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all shadow-md group"
          title="คลิกเพื่อดูรายละเอียดและเอฟเฟกต์สภาพอากาศ"
        >
          <div class="flex items-center gap-2">
            <span class="text-lg group-hover:scale-125 transition-transform">🌊</span>
            <div>
              <span class="font-bold text-amber-300">รายงานสภาพอากาศประจำวัน:</span>
              <span class="text-slate-200 ml-1 font-semibold">{{ currentEvent?.title }}</span>
              <span class="text-slate-400 ml-2">"{{ currentEvent?.description }}"</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-300">{{ currentEvent?.type }}</span>
            <span class="text-[10px] text-amber-400 group-hover:underline">คลิกดูป๊อปอัป 🔍</span>
          </div>
        </div>
      </div>

      <!-- Right: Live Leaderboard & Scores -->
      <div class="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 parchment-card shadow-2xl">
        <h3 class="text-xs md:text-sm font-bold text-amber-300 uppercase tracking-widest flex items-center justify-between border-b border-slate-800 pb-2">
          <span>🏆 กระดานคะแนน & ข่าวกรอง</span>
          <button 
            @click="fogOfWar = !fogOfWar"
            class="text-[10px] px-2 py-0.5 rounded border transition-all flex items-center gap-1 font-sans cursor-pointer"
            :class="fogOfWar ? 'bg-purple-950 text-purple-200 border-purple-500/60 hover:bg-purple-900' : 'bg-amber-950 text-amber-200 border-amber-500/60 hover:bg-amber-900'"
            :title="fogOfWar ? 'คลิกเพื่อเฉลยความจริงทั้งหมด (โหมดวิทยากร)' : 'คลิกเพื่อเปิดหมอกสงครามซ่อนความจริง (โหมดผู้เล่น)'"
          >
            <span>{{ fogOfWar ? '🌫️ หมอกสงคราม (เปิด)' : '👁️ เฉลยความจริง (ปิดหมอก)' }}</span>
          </button>
        </h3>

        <!-- Fog of War Notice Banner -->
        <div v-if="fogOfWar && store.phase !== 'FINAL_SUMMARY'" class="p-2 bg-purple-950/40 border border-purple-500/30 rounded-lg text-[10px] text-purple-200 flex items-center gap-2">
          <span class="text-base">🕵️</span>
          <div>
            <span class="font-bold text-yellow-300">สงครามข้อมูล:</span>
            คะแนนและพิกัดจริงถูกพรางในม่านหมอก ข้อมูลที่แสดงคือ "รายงานและข่าวลือที่สายลับปล่อย"
          </div>
        </div>

        <div class="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          <div
            v-for="(team, index) in store.leaderboard"
            :key="team.id"
            class="p-3 rounded-xl border flex items-center justify-between transition-all"
            :class="[
              team.isSunk 
                ? 'bg-red-950/20 border-red-900/40 opacity-60' 
                : index === 0 
                  ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30' 
                  : 'bg-slate-800/60 border-slate-700/50'
            ]"
          >
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold font-mono w-5 text-center" :class="index === 0 ? 'text-amber-400 text-lg' : 'text-slate-400'">
                {{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}` }}
              </span>
              <div>
                <div class="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full inline-block" :style="{ backgroundColor: team.color }"></span>
                  <span>{{ team.name }}</span>
                  <span v-if="team.isBot" class="text-[9px] px-1 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-500/40">BOT</span>
                </div>

                <!-- Rumored / Fog Information Display -->
                <template v-if="fogOfWar && store.phase !== 'FINAL_SUMMARY'">
                  <div v-if="team.isReturnedSafely" class="text-[11px] text-emerald-400 font-semibold mt-0.5">
                    🏁 เทียบท่า Grand Port Royal แล้ว
                  </div>
                  <div v-else-if="team.isSunk" class="text-[11px] text-red-400 font-semibold mt-0.5">
                    💀 เรืออับปางในทะเล
                  </div>
                  <div v-else class="text-[11px] text-slate-300 mt-0.5">
                    <span>ข่าวลือพิกัด: </span>
                    <span class="text-purple-300 font-semibold">
                      {{ getNodeName(getTeamSpyData(team.id)?.fakeLocationNodeId) }}
                    </span>
                    <span class="text-slate-500 mx-1">|</span>
                    <span>สมบัติที่อ้าง: </span>
                    <span class="text-yellow-400 font-mono font-bold">{{ getTeamSpyData(team.id)?.fakeTreasures ?? 0 }}</span> กล่อง
                  </div>

                  <!-- Rumor message text -->
                  <div v-if="getTeamSpyData(team.id)?.rumorMessage" class="text-[10px] text-purple-200 bg-purple-950/60 border border-purple-800/40 rounded px-1.5 py-0.5 mt-1 italic flex items-center gap-1">
                    <span class="text-[8px] not-italic px-1 rounded bg-purple-900 text-purple-300 font-bold">ลือ</span>
                    <span>"{{ getTeamSpyData(team.id)?.rumorMessage }}"</span>
                  </div>
                </template>

                <!-- Revealed Real Information Display -->
                <template v-else>
                  <div class="text-[11px] text-slate-400 mt-0.5">
                    พิกัดจริง: <span class="text-amber-300 font-medium">{{ team.locationName }}</span> | 
                    หีบสมบัติจริง: <span class="text-yellow-400 font-bold font-mono">{{ team.treasureBoxes }}</span> กล่อง
                  </div>
                </template>
              </div>
            </div>

            <!-- Score / Rumored Wealth on Right -->
            <div class="text-right">
              <template v-if="fogOfWar && store.phase !== 'FINAL_SUMMARY'">
                <div v-if="team.isSunk" class="text-xs font-bold text-red-400 font-mono">
                  เรืออับปาง (0 Pts)
                </div>
                <div v-else-if="team.isReturnedSafely" class="text-xs font-bold text-emerald-400 font-mono">
                  ภารกิจสำเร็จ 🏁
                </div>
                <div v-else>
                  <div class="text-sm font-bold font-mono text-slate-400 tracking-wider">
                    ??? <span class="text-[10px] text-slate-500 font-sans">Gold</span>
                  </div>
                  <div class="text-[10px] text-purple-300 font-mono">
                    อ้างว่ามี: {{ (getTeamSpyData(team.id)?.fakeGold ?? 0).toLocaleString() }} G
                  </div>
                </div>
              </template>

              <template v-else>
                <div v-if="team.isSunk" class="text-xs font-bold text-red-400 font-mono">
                  เรืออับปาง (0 Pts)
                </div>
                <div v-else class="text-sm font-extrabold font-mono text-amber-300">
                  {{ team.finalScore.toLocaleString() }} <span class="text-[10px] text-slate-400 font-sans">Gold</span>
                </div>
                <div class="text-[10px] text-slate-500">น้ำหนัก: {{ team.weight }} lbs</div>
              </template>
            </div>
          </div>
        </div>

        <!-- QR Code in the Corner -->
        <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-3">
          <div class="p-1 bg-white rounded-lg">
            <qrcode-vue :value="joinUrl" :size="48" level="M" />
          </div>
          <div class="text-[11px] text-slate-400">
            <span class="font-bold text-slate-200">สแกนเพื่อเข้าร่วมเล่น</span>
            <p>เปิดกล้องมือถือสแกน QR เพื่อเข้าสู่เรือของทีม</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Event / Island Pop-up Modal -->
    <EventModal :event-data="activeEventModal" @close="activeEventModal = null" />
  </div>
</template>
