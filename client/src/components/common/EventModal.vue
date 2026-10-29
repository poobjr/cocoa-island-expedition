<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import confetti from 'canvas-confetti';

export interface EventModalData {
  isOpen: boolean;
  type: 'PIRATE' | 'STORM' | 'ISLAND_DISCOVERY' | 'TREASURE' | 'FLOTSAM' | 'CALM' | 'START';
  title: string;
  subtitle?: string;
  image?: string;
  description: string;
  details?: {
    goldChange?: number;
    hullDamage?: number;
    waterChange?: number;
    fuelChange?: number;
    treasuresGained?: number;
    customNote?: string;
  };
  islandInfo?: {
    nameTh: string;
    type: string;
    features: string[];
    hazards: string[];
  };
}

const props = defineProps<{
  eventData: EventModalData | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'action', actionKey: string): void;
}>();

// 10-Second Auto-close Countdown
const countdown = ref(10);
const isPaused = ref(false);
let timer: any = null;

function startTimer() {
  stopTimer();
  countdown.value = 10;
  isPaused.value = false;
  timer = setInterval(() => {
    if (!isPaused.value) {
      countdown.value--;
      if (countdown.value <= 0) {
        stopTimer();
        emit('close');
      }
    }
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function togglePause() {
  isPaused.value = !isPaused.value;
}

watch(() => props.eventData?.isOpen, (newVal) => {
  if (newVal) {
    startTimer();
    if (props.eventData?.type === 'TREASURE') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#facc15', '#fbbf24', '#eab308', '#ffffff']
      });
    }
  } else {
    stopTimer();
  }
}, { immediate: true });

onUnmounted(() => {
  stopTimer();
});

const isPirate = computed(() => props.eventData?.type === 'PIRATE');
const isStorm = computed(() => props.eventData?.type === 'STORM');
const isTreasure = computed(() => props.eventData?.type === 'TREASURE');
const isIsland = computed(() => props.eventData?.type === 'ISLAND_DISCOVERY');
const isFlotsam = computed(() => props.eventData?.type === 'FLOTSAM');
const isCalm = computed(() => props.eventData?.type === 'CALM');
const isStart = computed(() => props.eventData?.type === 'START');

const resolvedImage = computed(() => {
  if (props.eventData?.image) return props.eventData.image;
  switch (props.eventData?.type) {
    case 'PIRATE': return '/images/events/pirate_attack.jpg';
    case 'STORM': return '/images/events/ocean_storm.jpg';
    case 'FLOTSAM': return '/images/events/flotsam_salvage.jpg';
    case 'CALM': return '/images/events/calm_sea.jpg';
    case 'START': return '/images/events/calm_sea.jpg';
    case 'TREASURE': return '/images/events/cocoa_island.jpg';
    default: return '/images/events/cocoa_island.jpg';
  }
});
</script>

<template>
  <div 
    v-if="eventData && eventData.isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 overflow-hidden select-none"
  >
    <!-- Dark Backdrop -->
    <div 
      class="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
      @click="emit('close')"
    ></div>

    <!-- 3D Environment Overlays based on Event Type -->
    <!-- Storm: Rain & Lightning -->
    <div v-if="isStorm" class="absolute inset-0 pointer-events-none rain-overlay z-10 opacity-80"></div>
    <div v-if="isStorm" class="absolute inset-0 pointer-events-none lightning-fx bg-white/10 z-20"></div>

    <!-- Flotsam / Calm: Floating Caustics Glow -->
    <div v-if="isFlotsam || isCalm" class="absolute inset-0 pointer-events-none water-shimmer z-10 opacity-30"></div>

    <!-- Treasure: Golden Dust Glow -->
    <div v-if="isTreasure" class="absolute inset-0 pointer-events-none gold-ambient-glow z-10 opacity-40"></div>

    <!-- Modal Box Container (with 3D perspective pop-in) -->
    <div 
      class="relative z-30 w-full max-w-lg rounded-3xl overflow-hidden border-2 shadow-2xl transition-all parchment-card transform animate-modal-pop"
      :class="[
        isPirate ? 'border-red-500/90 ring-4 ring-red-600/40 animate-combat-shake' : '',
        isStorm ? 'border-sky-400/90 ring-4 ring-sky-500/40' : '',
        isTreasure ? 'border-amber-400/90 ring-4 ring-amber-400/50 shadow-[0_0_35px_rgba(245,158,11,0.5)]' : '',
        isFlotsam ? 'border-teal-400/90 ring-4 ring-teal-500/40' : '',
        isCalm ? 'border-amber-300/80 ring-4 ring-amber-400/30' : '',
        isIsland ? 'border-emerald-500/90 ring-4 ring-emerald-500/40' : 'border-slate-700'
      ]"
    >
      <!-- 10-Second Countdown Progress Bar -->
      <div class="w-full bg-slate-900 h-1.5 overflow-hidden relative z-40">
        <div 
          class="h-full transition-all duration-1000 ease-linear rounded-r-full"
          :class="[
            isPirate ? 'bg-red-500' : isStorm ? 'bg-sky-400' : isTreasure ? 'bg-amber-400' : 'bg-emerald-400'
          ]"
          :style="{ width: `${(countdown / 10) * 100}%` }"
        ></div>
      </div>

      <!-- Image Banner with 3D Breathing Float Animation -->
      <div class="relative w-full aspect-[16/9] overflow-hidden bg-slate-900 group">
        <img 
          :src="resolvedImage" 
          :alt="eventData.title"
          class="w-full h-full object-cover transition-transform duration-700 image-3d-float"
        />

        <!-- Gradient Vignette on top of Image -->
        <div 
          class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"
          :class="isPirate ? 'bg-red-950/30 mix-blend-color-burn' : ''"
        ></div>

        <!-- Floating Particles / Weather Effects Inside Image -->
        <div v-if="isTreasure" class="absolute inset-0 pointer-events-none sparkle-overlay animate-pulse"></div>

        <!-- Event Type Badge Floating on Image -->
        <div class="absolute top-3 left-4 flex items-center gap-2">
          <span 
            class="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-xl border flex items-center gap-1.5 backdrop-blur-md"
            :class="{
              'bg-red-600/90 text-white border-red-400 animate-pulse': isPirate,
              'bg-sky-600/90 text-white border-sky-400': isStorm,
              'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_15px_rgba(250,204,21,0.8)]': isTreasure,
              'bg-teal-600/90 text-white border-teal-300': isFlotsam,
              'bg-amber-500/90 text-slate-950 border-amber-300': isCalm,
              'bg-blue-600/90 text-white border-blue-300': isStart,
              'bg-emerald-600/90 text-white border-emerald-400': isIsland,
            }"
          >
            <span v-if="isPirate">🏴‍☠️ โจรสลัดเข้าโจมตี!</span>
            <span v-else-if="isStorm">⛈️ พายุคลื่นยักษ์กระหน่ำ!</span>
            <span v-else-if="isTreasure">👑 ค้นพบขุมทรัพย์ในตำนาน!</span>
            <span v-else-if="isFlotsam">📦 พบเสบียงลอยน้ำ (Flotsam)!</span>
            <span v-else-if="isCalm">☀️ ทะเลสงบ อากาศแจ่มใส</span>
            <span v-else-if="isStart">⛵ กางใบออกผจญภัย (Start Expedition)!</span>
            <span v-else>🏝️ ค้นพบเกาะใหม่</span>
          </span>
        </div>

        <!-- Countdown Pill & Close Controls in Top Right -->
        <div class="absolute top-3 right-4 flex items-center gap-1.5 z-40">
          <!-- Pause/Resume Button -->
          <button
            type="button"
            @click="togglePause"
            class="px-2 py-1 rounded-full bg-slate-950/80 border border-slate-700 hover:border-amber-400 text-slate-200 text-[10px] font-mono font-bold flex items-center gap-1 shadow-lg transition-transform active:scale-95 backdrop-blur-md"
            :title="isPaused ? 'เริ่มนับเวลาต่อ' : 'หยุดเวลาอัตโนมัติ'"
          >
            <span>{{ isPaused ? '▶️ พัก' : '⏸️' }}</span>
            <span>{{ countdown }}s</span>
          </button>

          <!-- Close 'X' Button -->
          <button
            type="button"
            @click="emit('close')"
            class="w-7 h-7 rounded-full bg-slate-950/80 border border-slate-700 hover:border-red-400 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs shadow-lg transition-transform active:scale-90 backdrop-blur-md"
            title="ปิดหน้าต่างนี้"
          >
            ✕
          </button>
        </div>

        <!-- Big Title on Bottom of Image -->
        <div class="absolute bottom-3 left-4 right-4">
          <h2 class="text-xl md:text-2xl font-black font-serif tracking-wide text-slate-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {{ eventData.title }}
          </h2>
          <p v-if="eventData.subtitle" class="text-xs text-amber-300 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] mt-0.5">
            {{ eventData.subtitle }}
          </p>
        </div>
      </div>

      <!-- Content Body -->
      <div class="p-4 md:p-5 space-y-4 bg-slate-950/95">
        <!-- Main Description -->
        <p class="text-sm text-slate-200 leading-relaxed font-sans">
          {{ eventData.description }}
        </p>

        <!-- Consequence / Impact Breakdown Grid (Loss/Gains) -->
        <div 
          v-if="eventData.details"
          class="p-3.5 rounded-2xl border space-y-2"
          :class="isPirate ? 'bg-red-950/30 border-red-500/40' : isStorm ? 'bg-sky-950/30 border-sky-500/40' : isTreasure ? 'bg-amber-950/30 border-amber-500/40' : 'bg-slate-900 border-slate-800'"
        >
          <div class="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
            <span>📊 ผลกระทบต่อเรือและทรัพยากร:</span>
            <span v-if="isPirate" class="text-red-400 animate-pulse font-bold">⚠️ วิกฤตการปะทะ!</span>
            <span v-else-if="isTreasure" class="text-yellow-300 font-bold">✨ มหาโชคขุมทรัพย์!</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <div v-if="eventData.details.goldChange !== undefined" class="flex justify-between p-1.5 bg-slate-900/80 rounded border border-slate-800">
              <span class="text-slate-400">ทองคำ (Gold):</span>
              <span 
                class="font-mono font-bold"
                :class="eventData.details.goldChange >= 0 ? 'text-emerald-400' : 'text-red-400'"
              >
                {{ eventData.details.goldChange >= 0 ? `+${eventData.details.goldChange}` : eventData.details.goldChange }} G
              </span>
            </div>

            <div v-if="eventData.details.hullDamage" class="flex justify-between p-1.5 bg-slate-900/80 rounded border border-slate-800">
              <span class="text-slate-400">ความเสียหายตัวเรือ:</span>
              <span class="font-mono font-bold text-red-400">-{{ eventData.details.hullDamage }}%</span>
            </div>

            <div v-if="eventData.details.waterChange" class="flex justify-between p-1.5 bg-slate-900/80 rounded border border-slate-800">
              <span class="text-slate-400">น้ำดื่ม (Water):</span>
              <span 
                class="font-mono font-bold"
                :class="eventData.details.waterChange > 0 ? 'text-emerald-400' : 'text-sky-400'"
              >
                {{ eventData.details.waterChange > 0 ? `+${eventData.details.waterChange}` : eventData.details.waterChange }} ถัง
              </span>
            </div>

            <div v-if="eventData.details.fuelChange" class="flex justify-between p-1.5 bg-slate-900/80 rounded border border-slate-800">
              <span class="text-slate-400">เชื้อเพลิง (Fuel):</span>
              <span 
                class="font-mono font-bold"
                :class="eventData.details.fuelChange > 0 ? 'text-emerald-400' : 'text-amber-400'"
              >
                {{ eventData.details.fuelChange > 0 ? `+${eventData.details.fuelChange}` : eventData.details.fuelChange }} ถัง
              </span>
            </div>

            <div v-if="eventData.details.treasuresGained" class="flex justify-between p-2 bg-gradient-to-r from-amber-950/60 to-yellow-950/40 rounded border border-amber-500/50 col-span-2">
              <span class="text-amber-200 font-bold">👑 หีบสมบัติที่ขุดได้:</span>
              <span class="font-mono font-black text-yellow-300 text-sm">+{{ eventData.details.treasuresGained }} หีบทองคำ (50 lbs)</span>
            </div>
          </div>

          <p v-if="eventData.details.customNote" class="text-xs text-amber-200/90 italic pt-1 border-t border-slate-800/80">
            💡 "{{ eventData.details.customNote }}"
          </p>
        </div>

        <!-- Island Features Breakdown (For Island Discovery) -->
        <div v-if="eventData.islandInfo" class="space-y-2 text-xs">
          <div class="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-1.5">
            <span class="font-bold text-emerald-300 uppercase tracking-wider">🌟 กิจกรรมและสิ่งที่ทำได้ที่นี่:</span>
            <ul class="space-y-1 text-slate-200 pl-2">
              <li v-for="(feat, idx) in eventData.islandInfo.features" :key="idx" class="flex items-start gap-1.5">
                <span class="text-emerald-400">✔</span>
                <span>{{ feat }}</span>
              </li>
            </ul>
          </div>

          <div v-if="eventData.islandInfo.hazards.length" class="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-1">
            <span class="font-bold text-rose-300 uppercase tracking-wider">⚠️ ข้อควรระวังประจำน่านน้ำนี้:</span>
            <ul class="space-y-0.5 text-slate-300 pl-2">
              <li v-for="(haz, idx) in eventData.islandInfo.hazards" :key="idx" class="flex items-start gap-1.5">
                <span class="text-rose-400">!</span>
                <span>{{ haz }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Confirm / Acknowledge Button with Dynamic Countdown Indicator -->
        <button
          type="button"
          @click="emit('close')"
          class="w-full py-3.5 text-slate-950 font-extrabold text-sm rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          :class="[
            isPirate ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white' : '',
            isStorm ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white' : '',
            isTreasure ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(250,204,21,0.6)]' : '',
            isFlotsam ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950' : '',
            isCalm ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950' : '',
            isIsland ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950' : 'bg-amber-500 text-slate-950'
          ]"
        >
          <span>รับทราบและปิดหน้านี้ ⚓</span>
          <span class="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-950/20 border border-slate-950/30 font-bold">
            ({{ countdown }}s)
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes modalPop {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-pop {
  animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes image3DBreath {
  0%, 100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.03) translateY(-3px);
  }
}

.image-3d-float {
  animation: image3DBreath 6s ease-in-out infinite;
}

@keyframes rain {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 20% 100%;
  }
}

.rain-overlay {
  background-image: repeating-linear-gradient(
    105deg,
    rgba(255, 255, 255, 0.08) 0px,
    rgba(255, 255, 255, 0.08) 1px,
    transparent 1px,
    transparent 8px
  );
  animation: rain 0.3s linear infinite;
}

@keyframes lightning {
  0%, 94%, 98%, 100% {
    opacity: 0;
  }
  95%, 97% {
    opacity: 1;
  }
}

.lightning-fx {
  animation: lightning 5s infinite;
}

@keyframes combatShake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-3px); }
  40%, 80% { transform: translateX(3px); }
}

.animate-combat-shake {
  animation: combatShake 0.6s ease-in-out;
}
</style>
