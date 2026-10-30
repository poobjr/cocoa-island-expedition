<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore, MapNode } from '../stores/gameStore';
import CountdownClock from '../components/common/CountdownClock.vue';
import SeaChart12Nodes from '../components/map/SeaChart12Nodes.vue';
import CaptainBridge from '../components/roles/CaptainBridge.vue';
import NavigatorPanel from '../components/roles/NavigatorPanel.vue';
import QuartermasterPanel from '../components/roles/QuartermasterPanel.vue';
import GeographerPanel from '../components/roles/GeographerPanel.vue';
import GunnerPanel from '../components/roles/GunnerPanel.vue';
import SpyTerminal from '../components/roles/SpyTerminal.vue';
import DeckhandPanel from '../components/roles/DeckhandPanel.vue';
import EventModal, { EventModalData } from '../components/common/EventModal.vue';

const store = useGameStore();

// All Ship Roles Definition
const allRoleOptions = [
  { value: 'CAPTAIN', label: '👑 กัปตันเรือ (Captain) - ฟันธงคำสั่งเดินเรือ', colorClass: 'text-amber-300' },
  { value: 'NAVIGATOR', label: '⚓ ต้นหน (Navigator) - วางแผนทิศทาง/เชื้อเพลิง', colorClass: 'text-blue-300' },
  { value: 'QUARTERMASTER', label: '💰 ฝ่ายเสบียง (Quartermaster) - คุมน้ำหนัก/ซื้อขาย', colorClass: 'text-emerald-300' },
  { value: 'GEOGRAPHER', label: '🧭 นักภูมิศาสตร์ (Geographer) - พยากรณ์อากาศล่วงหน้า', colorClass: 'text-teal-300' },
  { value: 'GUNNER', label: '⚔️ สรั่งเรือ (Gunner) - ปืนใหญ่/การป้องกันตัว', colorClass: 'text-red-300' },
  { value: 'SPY', label: '🕵️ สายลับ (Spy) - สืบข่าวกรอง/ปล่อยข่าวลือลวง', colorClass: 'text-purple-300' },
  { value: 'DECKHAND', label: '👥 ลูกเรือทั่วไป (Deckhand) - ดูสถานะสด/โหวตชี้แนะ', colorClass: 'text-sky-300' }
];

// Lobby Form
const playerName = ref('');
const selectedTeamId = ref('team-1');
const selectedRole = ref('CAPTAIN');

// 1. Calculate taken roles for the team currently chosen in the Lobby
const takenRolesInSelectedTeam = computed(() => {
  const team = store.teams.find(t => t.id === selectedTeamId.value);
  const set = new Set<string>();
  if (team?.members) {
    team.members.forEach(m => {
      // Exclude DECKHAND so DECKHAND is never considered taken
      if (m.role !== 'DECKHAND') {
        set.add(m.role);
      }
    });
  }
  return set;
});

// Roles available for the selected team in the Lobby
const availableRolesInLobby = computed(() => {
  return allRoleOptions.filter(r => r.value === 'DECKHAND' || !takenRolesInSelectedTeam.value.has(r.value));
});

// Auto-switch selectedRole if the currently chosen role is already taken on that ship
watch([selectedTeamId, availableRolesInLobby], () => {
  const isAvailable = availableRolesInLobby.value.some(r => r.value === selectedRole.value);
  if (!isAvailable) {
    selectedRole.value = availableRolesInLobby.value[0]?.value || 'DECKHAND';
  }
}, { immediate: true });

const activeTab = ref<'ROLE_PANEL' | 'MAP' | 'LOGS'>('ROLE_PANEL');
const selectedMapNode = ref<MapNode | null>(null);
const activeEventModal = ref<EventModalData | null>(null);

const myTeam = computed(() => store.myTeam);
const currentDay = computed(() => store.currentDay);
const turnSeconds = computed(() => store.turnSecondsRemaining);
const isSpyPhase = computed(() => store.phase === 'SPY_FREEZE');
const isRegistered = computed(() => !!store.currentPlayer);

function handleRegister() {
  if (!playerName.value.trim()) {
    alert('กรุณากรอกชื่อของคุณ');
    return;
  }
  store.registerPlayer(playerName.value.trim(), selectedTeamId.value, selectedRole.value);
}

function handleNodeSelect(node: MapNode) {
  selectedMapNode.value = node;
  openIslandModal(node);
}

function openIslandModal(node: MapNode) {
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
    subtitle: `รหัสพิกัด [Node ${node.code}] - ประเภท: ${node.type}`,
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
        node.specialRule?.freeWater ? '💧 มีตาน้ำจืดธรรมชาติ' : '',
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

function checkCurrentLocationEvent() {
  if (!myTeam.value) return;
  const currentNode = store.mapNodes[myTeam.value.currentLocationId];
  if (!currentNode) return;

  if (myTeam.value.currentLocationId === 'node-11') {
    // Pirate Encounter
    activeEventModal.value = {
      isOpen: true,
      type: 'PIRATE',
      title: '🏴‍☠️ กองเรือโจรสลัดบุกปล้นเรือ!',
      subtitle: 'พิกัด: Pirate\'s Cove (อ่าวรังโจรสลัด)',
      image: '/images/events/pirate_attack.jpg',
      description: 'เรือโจรสลัดแบล็คเบียร์ดกางใบปิดล้อมและยิงปืนใหญ่ขู่! ลูกเรือทุกคนต้องเตรียมพร้อม หากไม่มีปืนใหญ่ยิงตอบโต้ จะสูญเสียทองคำและตัวเรือเสียหายหนัก!',
      details: {
        goldChange: -200,
        hullDamage: 25,
        customNote: 'หากสรั่งเรือสั่งยิงปืนใหญ่ตอบโต้ จะขับไล่โจรสลัดและได้รับทองคำ +500 Gold!'
      }
    };
  } else if (myTeam.value.currentLocationId === 'node-7') {
    // Flotsam Encounter
    activeEventModal.value = {
      isOpen: true,
      type: 'FLOTSAM',
      title: '📦 ตกใจ! พบเสบียงลอยน้ำ (Flotsam Salvage)',
      subtitle: 'พิกัด: Shipwreck Graveyard (สุสานเรืออับปาง)',
      image: '/images/events/flotsam_salvage.jpg',
      description: 'ลูกเรือมองเห็นลังเสบียงไม้และถังน้ำมันเชื้อเพลิงลอยตามคลื่นน้ำทะเลสีครามมาจากซากเรือโบราณ! สั่งกว้านดึงขึ้นมาบนเรือได้อย่างปลอดภัย ได้รับน้ำดื่มและเชื้อเพลิงเสริมฟรี!',
      details: {
        waterChange: 2,
        fuelChange: 2,
        customNote: 'เก็บกู้เสบียงลอยน้ำสำเร็จ ช่วยให้ประหยัดทองคำโดยไม่ต้องแวะซื้อ!'
      }
    };
  } else if (myTeam.value.currentLocationId === 'node-12') {
    // Cocoa Island Treasure Discovery
    activeEventModal.value = {
      isOpen: true,
      type: 'TREASURE',
      title: '👑 ค้นพบขุมทรัพย์ในตำนาน เกาะโกโก้ (Cocoa Island)!',
      subtitle: 'พิกัด: ปลายทางมหาสมบัติแห่งทะเลใต้',
      image: '/images/events/cocoa_island.jpg',
      description: 'ยินดีด้วย! เรือของท่านแล่นมาถึงเกาะโกโก้ในตำนานได้สำเร็จ ประกายแสงทองคำเจิดจ้าจากถ้ำสมบัติโบราณ สามารถขุดหีบสมบัติได้วันละ 1 หีบ (น้ำหนัก 50 lbs)',
      details: {
        treasuresGained: 1,
        customNote: 'อย่าลืมคำนวณน้ำหนักและเสบียงขากลับสู่ Grand Port Royal ให้เพียงพอ!'
      }
    };
  } else if (myTeam.value.currentLocationId === 'node-5') {
    // Serene Calm Lagoon
    activeEventModal.value = {
      isOpen: true,
      type: 'CALM',
      title: '☀️ วันที่สงบ แสงแดดอบอุ่น ชายหาดสวยงาม (Coral Lagoon)',
      subtitle: 'พิกัด: ทะเลสาบปะการังอันเงียบสงบ',
      image: '/images/events/calm_sea.jpg',
      description: 'แสงแดดยามเช้าสาดส่องลงบนหาดทรายขาวบริสุทธิ์ คลื่นลมสงบราบเรียบใสราวกระจก มีแนวปะการังป้องกันพายุ 100% ลูกเรือได้พักผ่อนฟื้นฟูกำลังใจอย่างเต็มที่',
      details: {
        customNote: 'จุดจอดปลอดภัย ป้องกันพายุคลื่นลมทุกรูปแบบ 100%'
      }
    };
  } else if (store.currentDay === 1 && myTeam.value.currentLocationId === 'node-1') {
    // Start of Expedition
    activeEventModal.value = {
      isOpen: true,
      type: 'START',
      title: '⛵ เริ่มต้นการผจญภัย: กางใบสู่ Cocoa Island!',
      subtitle: 'วันที่ 1: Grand Port Royal ท่าเรือหลักหลวง',
      image: '/images/events/calm_sea.jpg',
      description: 'ระฆังเรือหลวงดังก้องกังวาน ท้องฟ้าแจ่มใส ทะเลเปิดรับสายลมส่งท้าย กองเรือทุกลำเตรียมพร้อมออกผจญภัย 15 วันเพื่อชิงความเป็นหนึ่งแห่งมหาสมุทร!',
      details: {
        customNote: 'ตรวจสอบน้ำดื่มและเชื้อเพลิงกับฝ่ายเสบียงให้พร้อมก่อนมุ่งหน้าสู่น่านน้ำเปิด'
      }
    };
  } else if (store.currentEvent?.type === 'STORM' && store.currentEvent.affectedNodeIds.includes(myTeam.value.currentLocationId)) {
    // Storm Encounter
    activeEventModal.value = {
      isOpen: true,
      type: 'STORM',
      title: store.currentEvent.title,
      subtitle: `พายุกระหน่ำในพื้นที่ ${currentNode.nameTh}`,
      image: '/images/events/ocean_storm.jpg',
      description: store.currentEvent.description,
      details: {
        hullDamage: store.currentEvent.effect?.hullDamage || 15,
        waterChange: store.currentEvent.effect?.waterDrain ? -store.currentEvent.effect.waterDrain : undefined,
        fuelChange: store.currentEvent.effect?.fuelDrain ? -store.currentEvent.effect.fuelDrain : undefined,
        customNote: 'ลูกเรือต้องระวัง! คลื่นลมแรงซัดกระหน่ำตัวเรือ'
      }
    };
  } else {
    openIslandModal(currentNode);
  }
}

const roleBadgeColor = computed(() => {
  switch (store.currentRole) {
    case 'CAPTAIN': return 'text-amber-400 bg-amber-950/80 border-amber-500/40';
    case 'NAVIGATOR': return 'text-blue-400 bg-blue-950/80 border-blue-500/40';
    case 'QUARTERMASTER': return 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40';
    case 'GEOGRAPHER': return 'text-teal-400 bg-teal-950/80 border-teal-500/40';
    case 'GUNNER': return 'text-red-400 bg-red-950/80 border-red-500/40';
    case 'SPY': return 'text-purple-400 bg-purple-950/80 border-purple-500/40';
    default: return 'text-sky-400 bg-sky-950/80 border-sky-500/40';
  }
});

const roleNameTh = computed(() => {
  switch (store.currentRole) {
    case 'CAPTAIN': return 'กัปตันเรือ';
    case 'NAVIGATOR': return 'ต้นหน & คุมหางเสือ';
    case 'QUARTERMASTER': return 'ฝ่ายเสบียง & การเงิน';
    case 'GEOGRAPHER': return 'นักภูมิศาสตร์';
    case 'GUNNER': return 'สรั่งเรือ & ปืนใหญ่';
    case 'SPY': return 'สายลับ & ข่าวกรอง';
    default: return 'ลูกเรือทั่วไป';
  }
});

// Roles available in Active Dashboard for myTeam
const takenRolesInMyTeam = computed(() => {
  const set = new Set<string>();
  if (myTeam.value?.members) {
    myTeam.value.members.forEach(m => {
      // Don't mark my own current role as taken by someone else
      if (m.id !== store.currentPlayer?.id && m.name !== store.currentPlayer?.name && m.role !== 'DECKHAND') {
        set.add(m.role);
      }
    });
  }
  return set;
});

const availableSwitchRoles = computed(() => {
  return allRoleOptions.filter(r => r.value === 'DECKHAND' || !takenRolesInMyTeam.value.has(r.value));
});
</script>

<template>
  <div class="max-w-md mx-auto min-h-screen bg-slate-950 flex flex-col justify-between p-3 select-none pb-16">
    <!-- 1. LOBBY SCREEN (If not yet registered) -->
    <div v-if="!isRegistered" class="my-auto space-y-5 p-4 parchment-card rounded-2xl border border-amber-600/40 shadow-2xl">
      <div class="text-center space-y-1">
        <span class="text-4xl">⛵</span>
        <h1 class="text-xl font-bold font-serif text-amber-300 tracking-wider">The Island Adventure</h1>
        <p class="text-xs text-slate-400">Cocoa Island Expedition (สัมมนา Team Building)</p>
      </div>

      <div class="space-y-3">
        <div>
          <label class="text-xs text-slate-300 font-medium">ชื่อของคุณ (Display Name):</label>
          <input
            v-model="playerName"
            type="text"
            placeholder="เช่น โจรสลัดแจ็ค"
            class="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label class="text-xs text-slate-300 font-medium">เลือกเรือ / กลุ่มของคุณ (Select Team):</label>
          <select
            v-model="selectedTeamId"
            class="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option v-for="team in store.teams" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="text-xs text-slate-300 font-medium">เลือกบทบาทหน้าที่ในเรือ (Select Role):</label>
          <select
            v-model="selectedRole"
            class="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
          >
            <option 
              v-for="role in availableRolesInLobby" 
              :key="role.value" 
              :value="role.value"
              class="bg-slate-900"
              :class="role.colorClass"
            >
              {{ role.label }}
            </option>
          </select>
          <p class="text-[11px] text-slate-400 mt-1">
            * ตำแหน่งหลักจำกัด 1 คนต่อลำ (เมื่อมีคนเลือกแล้วจะหายไป) — สามารถเลือก <span class="text-sky-300 font-semibold">ลูกเรือทั่วไป</span> ได้เสมอไม่จำกัดจำนวน
          </p>
        </div>

        <button
          @click="handleRegister"
          type="button"
          class="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 text-slate-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 mt-2"
        >
          ขึ้นเรือและร่วมการเดินทาง! 🏴‍☠️
        </button>
      </div>
    </div>

    <!-- 2. ACTIVE SHIP DASHBOARD (When Registered) -->
    <div v-else class="space-y-3">
      <!-- Top Sticky Bar -->
      <div class="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 flex items-center justify-between shadow-lg">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: myTeam?.color }"></div>
          <div>
            <div class="text-xs font-bold text-slate-100 truncate max-w-[140px]">{{ myTeam?.name }}</div>
            <select
              :value="store.currentRole"
              @change="store.switchRole(($event.target as HTMLSelectElement).value)"
              class="text-[10px] px-1.5 py-0.5 rounded border inline-block cursor-pointer outline-none font-bold"
              :class="roleBadgeColor"
            >
              <option 
                v-for="role in availableSwitchRoles" 
                :key="role.value" 
                :value="role.value"
                class="bg-slate-900"
                :class="role.colorClass"
              >
                {{ role.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="text-right">
            <div class="text-[10px] text-slate-400">วันที่จำลอง</div>
            <div class="text-xs font-mono font-bold text-amber-300">Day {{ currentDay }}/{{ store.maxDays }}</div>
          </div>
          <CountdownClock :seconds="turnSeconds" :is-urgent="turnSeconds <= 30" />
        </div>
      </div>

      <!-- Spy Phase Freeze Banner -->
      <div v-if="isSpyPhase" class="p-3 bg-purple-950/80 border-2 border-purple-500 text-purple-200 rounded-xl text-center space-y-1 animate-pulse shadow-lg">
        <div class="text-lg">🕵️ สงครามข้อมูล (Spy Phase กำลังดำเนินอยู่!)</div>
        <p class="text-xs">แช่แข็งการเดินเรือปกติ! ส่งตัวแทนสายลับเข้าสู่ HQ เพื่อสืบข่าวหรือปล่อยข่าวลือ</p>
      </div>

      <!-- Intel Leak Notification Banner -->
      <div v-if="store.intelLeakNotice" class="p-2.5 bg-amber-950/90 border border-amber-500 text-amber-200 rounded-xl text-xs space-y-1 animate-bounce">
        <span class="font-bold">📢 {{ store.intelLeakNotice.message }}</span>
      </div>

      <!-- Current Location Quick Event Action Bar -->
      <button 
        type="button"
        @click="checkCurrentLocationEvent"
        class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-sky-950/60 border border-amber-500/50 text-xs font-bold text-amber-200 flex items-center justify-between shadow-lg hover:border-amber-400 transition-all active:scale-95"
      >
        <span class="flex items-center gap-1.5 truncate">
          <span>📍</span>
          <span>พิกัดปัจจุบัน: {{ store.currentNode?.nameTh.split(' ')[0] }}</span>
        </span>
        <span class="text-[11px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold flex items-center gap-1 shadow">
          <span>🔍</span> ดูเหตุการณ์เกาะนี้
        </span>
      </button>

      <!-- Navigation Tabs -->
      <div class="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
        <button
          type="button"
          @click="activeTab = 'ROLE_PANEL'"
          class="py-2 rounded-lg transition-all"
          :class="activeTab === 'ROLE_PANEL' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-slate-200'"
        >
          ⚙️ หน้าที่ของคุณ
        </button>
        <button
          type="button"
          @click="activeTab = 'MAP'"
          class="py-2 rounded-lg transition-all"
          :class="activeTab === 'MAP' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-slate-200'"
        >
          🗺️ แผนที่ 12 โหนด
        </button>
        <button
          type="button"
          @click="activeTab = 'LOGS'"
          class="py-2 rounded-lg transition-all"
          :class="activeTab === 'LOGS' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-slate-200'"
        >
          📜 ปูมบันทึกเรือ
        </button>
      </div>

      <!-- Tab Content 1: Role Panel -->
      <div v-if="activeTab === 'ROLE_PANEL'">
        <CaptainBridge v-if="store.currentRole === 'CAPTAIN'" />
        <NavigatorPanel v-else-if="store.currentRole === 'NAVIGATOR'" />
        <QuartermasterPanel v-else-if="store.currentRole === 'QUARTERMASTER'" />
        <GeographerPanel v-else-if="store.currentRole === 'GEOGRAPHER'" />
        <GunnerPanel v-else-if="store.currentRole === 'GUNNER'" />
        <SpyTerminal v-else-if="store.currentRole === 'SPY'" />
        <DeckhandPanel v-else />
      </div>

      <!-- Tab Content 2: Map View -->
      <div v-else-if="activeTab === 'MAP'" class="space-y-3">
        <SeaChart12Nodes 
          :interactive="true" 
          :compact="true"
          :selected-node-id="selectedMapNode?.id || myTeam?.currentLocationId"
          :fog-of-war="true"
          @select-node="handleNodeSelect" 
        />

        <div v-if="selectedMapNode" class="p-3 bg-slate-900/90 border border-slate-700 rounded-xl space-y-1 text-xs">
          <div class="flex justify-between items-center">
            <h4 class="font-bold text-amber-300">[{{ selectedMapNode.code }}] {{ selectedMapNode.nameTh }}</h4>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{{ selectedMapNode.type }}</span>
          </div>
          <p class="text-slate-400">{{ selectedMapNode.description }}</p>
          <div v-if="selectedMapNode.shopAvailable" class="text-emerald-400 font-medium">
            🛒 มีตลาดเสบียง: น้ำ {{ selectedMapNode.prices?.water }}G, น้ำมัน {{ selectedMapNode.prices?.fuel }}G
          </div>
        </div>
      </div>

      <!-- Tab Content 3: Ship Log History -->
      <div v-else-if="activeTab === 'LOGS'" class="space-y-2">
        <h4 class="text-xs font-semibold text-amber-300 uppercase tracking-wider">📜 บันทึกการเดินเรือประจำวัน</h4>
        <div class="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
          <div 
            v-for="(log, idx) in myTeam?.logHistory" 
            :key="idx"
            class="text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1"
          >
            <div class="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Day {{ log.day }}</span>
              <span>น้ำหนัก: {{ log.weight }} lbs</span>
            </div>
            <p class="text-slate-200">{{ log.message }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Event & Island Discovery Pop-up Modal -->
    <EventModal 
      :event-data="activeEventModal" 
      @close="activeEventModal = null" 
    />
  </div>
</template>
