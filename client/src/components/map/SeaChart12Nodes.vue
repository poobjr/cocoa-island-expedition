<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore, MapNode } from '../../stores/gameStore';

const store = useGameStore();

const props = withDefaults(defineProps<{
  interactive?: boolean;
  selectedNodeId?: string;
  fogOfWar?: boolean;
  compact?: boolean;
}>(), {
  interactive: true,
  fogOfWar: false,
  compact: false
});

const emit = defineEmits<{
  (e: 'selectNode', node: MapNode): void;
}>();

const hoveredNodeId = ref<string | null>(null);
const nodesList = computed(() => Object.values(store.mapNodes));

export interface MapShipDisplay {
  id: string;
  name: string;
  color: string;
  isSunk: boolean;
  isReturnedSafely: boolean;
  isRumor: boolean;
  isRadarRevealed: boolean;
  tooltipText: string;
}

// Find ships stationed at each node (respecting Fog of War & Spy rumors)
function getShipsAtNode(nodeId: string): MapShipDisplay[] {
  if (!props.fogOfWar || store.phase === 'FINAL_SUMMARY') {
    return store.teams.filter(t => t.currentLocationId === nodeId).map(t => ({
      id: t.id,
      name: t.name,
      color: t.color,
      isSunk: t.isSunk,
      isReturnedSafely: t.isReturnedSafely,
      isRumor: false,
      isRadarRevealed: false,
      tooltipText: `${t.name} (พิกัดจริง)`
    }));
  }

  const list: MapShipDisplay[] = [];

  // Under Fog of War:
  if (nodeId === 'node-1') {
    store.teams.filter(t => t.currentLocationId === 'node-1').forEach(t => {
      list.push({
        id: t.id,
        name: t.name,
        color: t.color,
        isSunk: t.isSunk,
        isReturnedSafely: t.isReturnedSafely,
        isRumor: false,
        isRadarRevealed: false,
        tooltipText: `${t.name} (เทียบท่า Grand Port Royal)`
      });
    });
  }

  const leakedTeamNames = store.intelLeakNotice?.leakedInfo?.map((i: any) => i.teamName) || [];
  store.teams.forEach(t => {
    if (t.currentLocationId === nodeId && nodeId !== 'node-1') {
      if (leakedTeamNames.includes(t.name) || t.currentLocationId === 'node-6') {
        list.push({
          id: t.id,
          name: t.name,
          color: t.color,
          isSunk: t.isSunk,
          isReturnedSafely: t.isReturnedSafely,
          isRumor: false,
          isRadarRevealed: true,
          tooltipText: `📡 [เรดาร์ตรวจจับได้] ${t.name}`
        });
      }
    }

    if (t.spyData?.fakeLocationNodeId === nodeId && nodeId !== 'node-1') {
      list.push({
        id: `rumor-${t.id}`,
        name: t.name,
        color: t.color,
        isSunk: false,
        isReturnedSafely: false,
        isRumor: true,
        isRadarRevealed: false,
        tooltipText: `📢 [ข่าวลือสายลับ] รายงานว่าพบ ${t.name} ที่นี่!`
      });
    }
  });

  return list;
}

// Generate SVG connection paths between nodes
const connectionLines = computed(() => {
  const lines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
  const processed = new Set<string>();

  for (const node of nodesList.value) {
    for (const targetId of node.connectedTo) {
      const target = store.mapNodes[targetId];
      if (target) {
        const pairKey = [node.id, target.id].sort().join('-');
        if (!processed.has(pairKey)) {
          processed.add(pairKey);
          lines.push({
            x1: node.x,
            y1: node.y,
            x2: target.x,
            y2: target.y,
            key: pairKey,
          });
        }
      }
    }
  }
  return lines;
});

function getNodeBadgeColor(type: string, isSelected: boolean) {
  if (isSelected) {
    return 'ring-4 ring-amber-300 ring-offset-2 ring-offset-slate-950 scale-110 shadow-[0_0_25px_rgba(251,191,36,0.8)]';
  }
  switch (type) {
    case 'PORT': return 'bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 text-blue-100 border-blue-400/90 shadow-[0_0_15px_rgba(59,130,246,0.4)]';
    case 'SAFE': return 'bg-gradient-to-br from-emerald-600 via-teal-900 to-slate-950 text-emerald-100 border-emerald-400/90 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
    case 'TRADE': return 'bg-gradient-to-br from-amber-500 via-yellow-800 to-slate-950 text-amber-100 border-amber-300/90 shadow-[0_0_15px_rgba(245,158,11,0.4)]';
    case 'HAZARD': return 'bg-gradient-to-br from-rose-700 via-red-950 to-slate-950 text-rose-100 border-rose-500/90 shadow-[0_0_15px_rgba(244,63,94,0.5)]';
    case 'INTEL': return 'bg-gradient-to-br from-purple-600 via-indigo-950 to-slate-950 text-purple-100 border-purple-400/90 shadow-[0_0_15px_rgba(168,85,247,0.4)]';
    case 'DESTINATION': return 'bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 text-yellow-950 border-yellow-100 font-extrabold shadow-[0_0_30px_rgba(250,204,21,0.8)] animate-pulse';
    default: return 'bg-slate-800 text-slate-100 border-slate-600';
  }
}

function getNodeIcon(type: string, id: string) {
  if (id === 'node-12') return '👑';
  if (id === 'node-8') return '🌀';
  if (id === 'node-11') return '⚔️';
  if (id === 'node-7') return '⚓';
  if (id === 'node-6') return '👁️';
  switch (type) {
    case 'PORT': return '🏰';
    case 'SAFE': return '🏝️';
    case 'TRADE': return '🪙';
    case 'HAZARD': return '⚡';
    case 'INTEL': return '🔮';
    case 'DESTINATION': return '👑';
    default: return '📍';
  }
}

function getNodeTypeTag(node: MapNode) {
  if (node.id === 'node-12') return '👑 เกาะสมบัติ';
  if (node.id === 'node-1') return '🏰 ท่าเรือหลัก';
  if (node.id === 'node-11') return '⚔️ รังโจรสลัด';
  if (node.id === 'node-8') return '🌀 เบอร์มิวดา';
  if (node.id === 'node-6') return '👁️ เรดาร์น่านน้ำ';
  if (node.id === 'node-9') return '⚠️ ร่องน้ำตื้น';
  if (node.shopAvailable) return '🛒 ตลาดเสบียง';
  if (node.specialRule?.stormImmunity) return '🛡️ กำบังพายุ';
  return '🏝️ น่านน้ำพักเรือ';
}
</script>

<template>
  <div class="relative w-full aspect-[16/9] rounded-2xl border-2 border-amber-600/70 overflow-hidden shadow-2xl select-none bg-slate-950 group">
    <!-- 1. High-Resolution Antique Sea Chart Background -->
    <div 
      class="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
      style="background-image: url('/images/map/nautical_sea_chart_bg.jpg');"
    ></div>

    <!-- 2. Dark Oceanic Vignette & Gradient Overlay -->
    <div class="absolute inset-0 bg-radial from-slate-950/40 via-slate-950/70 to-slate-950/92 pointer-events-none"></div>

    <!-- 3. Antique Brass Corner Rivets -->
    <div class="absolute top-2 left-2 w-3.5 h-3.5 rounded-full border border-amber-400 bg-gradient-to-br from-amber-300 to-amber-700 shadow-md pointer-events-none"></div>
    <div class="absolute top-2 right-2 w-3.5 h-3.5 rounded-full border border-amber-400 bg-gradient-to-br from-amber-300 to-amber-700 shadow-md pointer-events-none"></div>
    <div class="absolute bottom-2 left-2 w-3.5 h-3.5 rounded-full border border-amber-400 bg-gradient-to-br from-amber-300 to-amber-700 shadow-md pointer-events-none"></div>
    <div class="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full border border-amber-400 bg-gradient-to-br from-amber-300 to-amber-700 shadow-md pointer-events-none"></div>

    <!-- 4. Nautical Coordinate Lines & Compass Rose (Top-Right) -->
    <div class="absolute top-3 right-4 w-18 h-18 md:w-24 md:h-24 opacity-35 pointer-events-none text-amber-300 drop-shadow-md">
      <svg viewBox="0 0 100 100" class="w-full h-full animate-[spin_160s_linear_infinite]">
        <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2,3" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="1" />
        <polygon points="50,4 56,42 50,36 44,42" fill="#facc15" />
        <polygon points="50,96 56,58 50,64 44,58" fill="currentColor" opacity="0.7" />
        <polygon points="96,50 58,56 64,50 58,44" fill="currentColor" opacity="0.7" />
        <polygon points="4,50 42,56 36,50 42,44" fill="currentColor" opacity="0.7" />
        <polygon points="82,18 58,44 56,38 64,38" fill="currentColor" opacity="0.5" />
        <polygon points="18,82 42,56 44,62 36,62" fill="currentColor" opacity="0.5" />
        <polygon points="82,82 58,56 64,62 56,62" fill="currentColor" opacity="0.5" />
        <polygon points="18,18 42,44 36,38 44,38" fill="currentColor" opacity="0.5" />
        <circle cx="50" cy="50" r="4" fill="#facc15" />
      </svg>
    </div>

    <!-- 5. Map Title & Fog of War Indicator Banner -->
    <div class="absolute top-2 left-2 sm:top-3 sm:left-4 text-[9px] sm:text-xs font-serif text-amber-300 tracking-wider sm:tracking-widest uppercase flex items-center gap-1.5 sm:gap-2 drop-shadow z-20">
      <span class="text-sm sm:text-lg">🧭</span>
      <span class="font-extrabold text-amber-200">CARIBBEAN EXPEDITION • 12 ISLES</span>
      <span 
        v-if="props.fogOfWar && store.phase !== 'FINAL_SUMMARY'"
        class="hidden sm:inline-flex ml-2 px-2.5 py-0.5 rounded-full bg-purple-950/85 border border-purple-400 text-purple-200 text-[10px] font-sans font-bold items-center gap-1 shadow-lg animate-pulse"
      >
        <span>🌫️ FOG OF WAR (ซ่อนพิกัดจริง)</span>
      </span>
    </div>

    <!-- 6. Animated Oceanic Shipping Routes (SVG) -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none z-0">
      <defs>
        <!-- Route Ambient Glow -->
        <linearGradient id="currentGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3" />
          <stop offset="50%" stop-color="#fbbf24" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.3" />
        </linearGradient>

        <!-- Dynamic Flowing Dashes -->
        <linearGradient id="currentFlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7dd3fc" stop-opacity="0.9" />
          <stop offset="50%" stop-color="#fde047" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#fb923c" stop-opacity="0.9" />
        </linearGradient>
      </defs>

      <!-- Ambient Glow Under-Line -->
      <line
        v-for="line in connectionLines"
        :key="`glow-${line.key}`"
        :x1="`${line.x1}%`"
        :y1="`${line.y1}%`"
        :x2="`${line.x2}%`"
        :y2="`${line.y2}%`"
        stroke="url(#currentGlow)"
        stroke-width="5"
        stroke-linecap="round"
        class="opacity-60"
      />

      <!-- Flowing Trade Current Line -->
      <line
        v-for="line in connectionLines"
        :key="`flow-${line.key}`"
        :x1="`${line.x1}%`"
        :y1="`${line.y1}%`"
        :x2="`${line.x2}%`"
        :y2="`${line.y2}%`"
        stroke="url(#currentFlow)"
        stroke-width="2"
        stroke-dasharray="8,6"
        stroke-linecap="round"
        class="ocean-current-line"
      />
    </svg>

    <!-- 7. Interactive 12 Nodes Layer -->
    <div
      v-for="node in nodesList"
      :key="node.id"
      :style="{ left: `${node.x}%`, top: `${node.y}%` }"
      @click="emit('selectNode', node)"
      @mouseenter="hoveredNodeId = node.id"
      @mouseleave="hoveredNodeId = null"
      class="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group/node z-10 transition-transform duration-300 hover:scale-125"
    >
      <!-- Outer Beacon Breathing Glow -->
      <div 
        class="absolute -inset-3 rounded-full opacity-40 blur-md pointer-events-none transition-all duration-300 group-hover/node:opacity-80"
        :class="node.id === 'node-12' ? 'bg-amber-400 blur-lg animate-pulse' : node.type === 'HAZARD' ? 'bg-red-500' : 'bg-sky-400'"
      ></div>

      <!-- Glowing Selection Ring -->
      <div 
        v-if="selectedNodeId === node.id" 
        class="absolute -inset-3 rounded-full bg-amber-400/50 blur-sm animate-ping pointer-events-none"
      ></div>

      <!-- 3D Stylized Node Token -->
      <div 
        class="relative rounded-full border-2 flex items-center justify-center shadow-2xl transition-all duration-300 backdrop-blur-sm"
        :class="[
          props.compact ? 'w-8 h-8' : 'w-11 h-11 md:w-14 md:h-14',
          getNodeBadgeColor(node.type, selectedNodeId === node.id)
        ]"
      >
        <!-- Embossed Specular Highlight (Inner Shine) -->
        <div class="absolute inset-0.5 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/40 pointer-events-none"></div>

        <!-- Node Icon -->
        <span 
          class="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover/node:rotate-6"
          :class="props.compact ? 'text-xs' : 'text-lg md:text-2xl'"
        >
          {{ getNodeIcon(node.type, node.id) }}
        </span>

        <!-- Node Number Wax Seal Badge -->
        <span 
          class="absolute bg-gradient-to-br from-amber-400 to-amber-700 text-slate-950 font-mono font-extrabold rounded-full border border-amber-200 flex items-center justify-center shadow-lg"
          :class="props.compact ? '-top-1 -left-1 w-3.5 h-3.5 text-[8px]' : '-top-1.5 -left-1.5 w-4.5 h-4.5 text-[10px] md:text-[11px]'"
        >
          {{ node.code }}
        </span>

        <!-- Hazard Warning Badge -->
        <span v-if="node.type === 'HAZARD'" class="absolute -top-1 -right-1 text-[9px] sm:text-xs animate-bounce drop-shadow">
          ⚠️
        </span>

        <!-- Treasure Crown Icon for Cocoa -->
        <span v-if="node.id === 'node-12'" class="absolute -top-2.5 -right-1.5 sm:-top-3 sm:-right-2 text-xs sm:text-sm animate-bounce drop-shadow">
          ✨
        </span>
      </div>

      <!-- Island Name Tag with Type Ribbon -->
      <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 sm:mt-1.5 whitespace-nowrap text-center pointer-events-none z-20 flex flex-col items-center">
        <span 
          class="font-bold rounded-full bg-slate-950/90 border border-amber-500/50 text-amber-200 shadow-xl backdrop-blur-md"
          :class="props.compact ? 'text-[7px] px-1 py-0' : 'text-[9px] md:text-xs px-2.5 py-0.5'"
        >
          {{ node.nameTh.split(' ')[0] }}
        </span>
        <span v-if="!props.compact" class="text-[8px] md:text-[9px] px-1.5 py-0.1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 mt-0.5 shadow-sm">
          {{ getNodeTypeTag(node) }}
        </span>
      </div>

      <!-- Hover Tooltip Preview Card -->
      <div 
        v-if="hoveredNodeId === node.id"
        class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-2.5 bg-slate-950/95 border border-amber-500/70 rounded-xl shadow-2xl backdrop-blur-lg z-50 pointer-events-none text-left space-y-1 transition-opacity animate-fade-in"
      >
        <div class="flex items-center justify-between border-b border-amber-500/30 pb-1">
          <span class="font-bold text-amber-300 text-xs truncate">{{ node.nameTh }}</span>
          <span class="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40">
            Node {{ node.code }}
          </span>
        </div>
        <p class="text-[10px] text-slate-300 leading-tight">{{ node.description }}</p>
        
        <div class="pt-1 text-[9px] space-y-0.5 border-t border-slate-800">
          <div v-if="node.shopAvailable" class="text-emerald-400 font-semibold flex items-center gap-1">
            <span>🛒</span> <span>น้ำ {{ node.prices?.water }}G • น้ำมัน {{ node.prices?.fuel }}G</span>
          </div>
          <div v-if="node.specialRule?.weightLimit" class="text-rose-400 font-semibold flex items-center gap-1">
            <span>⚠️</span> <span>ห้ามเรือหนักเกิน {{ node.specialRule.weightLimit }} lbs</span>
          </div>
          <div v-if="node.specialRule?.pirateChance" class="text-red-400 font-semibold flex items-center gap-1">
            <span>⚔️</span> <span>โอกาสพบโจรสลัด 80%</span>
          </div>
          <div v-if="node.id === 'node-12'" class="text-yellow-300 font-semibold flex items-center gap-1">
            <span>👑</span> <span>ขุดหีบสมบัติได้วันละ 1 หีบ (50 lbs)</span>
          </div>
        </div>
      </div>

      <!-- Stationed / Floating Ship Badges at this Node -->
      <div class="absolute -bottom-2 -right-3 flex -space-x-2 overflow-visible z-30">
        <div
          v-for="ship in getShipsAtNode(node.id)"
          :key="ship.id"
          class="relative rounded-full border-2 border-slate-950 shadow-xl flex items-center justify-center font-bold transition-transform hover:scale-130 ship-floating"
          :class="[
            props.compact ? 'w-5 h-5 text-[9px]' : 'w-6 h-6 md:w-7 md:h-7 text-xs text-white',
            ship.isRumor ? 'ring-2 ring-purple-400 ring-offset-1 ring-offset-slate-950 opacity-90' : '',
            ship.isRadarRevealed ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950 animate-pulse' : ''
          ]"
          :style="{ backgroundColor: ship.color }"
          :title="ship.tooltipText"
        >
          <span v-if="ship.isSunk">💀</span>
          <span v-else-if="ship.isRumor">👻</span>
          <span v-else-if="ship.isRadarRevealed">📡</span>
          <span v-else>⛵</span>

          <!-- Rumor Flag Badge -->
          <span 
            v-if="ship.isRumor" 
            class="absolute -top-2 -right-2 text-[8px] font-bold px-1 rounded-full bg-purple-900 border border-purple-400 text-purple-200 shadow scale-90"
            title="พิกัดลวงตามข่าวลือสายลับ"
          >
            ลือ
          </span>
        </div>
      </div>
    </div>

    <!-- 8. Bottom Sea Chart Legend HUD Bar (Visible when not compact) -->
    <div 
      v-if="!props.compact"
      class="absolute bottom-2 left-4 right-4 flex flex-wrap items-center justify-between text-[10px] md:text-[11px] text-slate-300 bg-slate-950/85 backdrop-blur-md border border-amber-500/40 px-3.5 py-1.5 rounded-xl pointer-events-none shadow-xl"
    >
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span> 🏰 ท่าเรือหลัก</span>
        <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span> 🏝️ เกาะปลอดภัย</span>
        <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span> 🪙 ตลาดค้าเสบียง</span>
        <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span> ⚡ รังโจร/เบอร์มิวดา</span>
        <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm"></span> 🔮 ประภาคาร</span>
        <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span> 👑 เกาะโกโก้</span>
        <span v-if="props.fogOfWar" class="flex items-center gap-2 text-purple-300 border-l border-slate-700 pl-2.5">
          <span>👻 [ลือ] พิกัดข่าวลือ</span>
          <span>📡 เรดาร์จับพิกัด</span>
        </span>
      </div>
      <span class="text-amber-400 font-mono font-bold hidden md:inline ml-2">15 Virtual Days</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes flowingCurrent {
  from {
    stroke-dashoffset: 40;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.ocean-current-line {
  animation: flowingCurrent 2.5s linear infinite;
}

@keyframes shipBob {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-2.5px) rotate(2deg);
  }
}

.ship-floating {
  animation: shipBob 2s ease-in-out infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 6px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
