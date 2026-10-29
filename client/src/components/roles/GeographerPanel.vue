<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../../stores/gameStore';

const store = useGameStore();

const currentEvent = computed(() => store.currentEvent);
const currentNode = computed(() => store.currentNode);
const currentDay = computed(() => store.currentDay);

// Geographer gets an exclusive preview of tomorrow's weather trends
const tomorrowDay = computed(() => Math.min(store.maxDays, currentDay.value + 1));

function handleSendWeatherWarning() {
  store.submitAdvisoryVote('ANCHOR', undefined, `เนตรนักภูมิศาสตร์เตือน: พรุ่งนี้ (Day ${tomorrowDay.value}) น่านน้ำอาจแปรปรวน ควรตรวจสอบเข็มทิศและเส้นทางให้ดี`);
  alert('ส่งรายงานพยากรณ์อากาศล่วงหน้าไปยังกัปตันเรียบร้อยแล้ว!');
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="p-3 bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-500/40 rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🧭</span>
        <div>
          <h3 class="font-bold text-teal-200">โต๊ะนักภูมิศาสตร์ & แผนที่ (Geographer)</h3>
          <p class="text-xs text-slate-400">เนตรแห่งท้องทะเล พยากรณ์อากาศล่วงหน้าและประเมินความเสี่ยง</p>
        </div>
      </div>
    </div>

    <!-- Today's Weather Report -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-1.5">
      <div class="flex justify-between items-center text-xs">
        <h4 class="font-semibold text-amber-300">☀️ สภาพอากาศวันนี้ (Day {{ currentDay }})</h4>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
          {{ currentEvent?.type }}
        </span>
      </div>
      <p class="text-xs font-bold text-slate-100">{{ currentEvent?.title }}</p>
      <p class="text-xs text-slate-300">{{ currentEvent?.description }}</p>
    </div>

    <!-- Exclusive Geographer Weather Radar for Tomorrow -->
    <div class="p-3 bg-teal-950/30 border border-teal-500/40 rounded-xl space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span class="text-base">🔮</span>
          <h4 class="text-xs font-bold text-teal-300 uppercase tracking-wider">
            บันทึกพยากรณ์อากาศล่วงหน้า (วันพรุ่งนี้ Day {{ tomorrowDay }})
          </h4>
        </div>
        <button
          @click="handleSendWeatherWarning"
          class="px-2 py-1 bg-teal-600/40 hover:bg-teal-500/60 border border-teal-400/50 rounded text-teal-200 text-[10px] font-bold transition-all active:scale-95 flex items-center gap-1 shadow"
        >
          <span>📡 ส่งเตือนกัปตัน</span>
        </button>
      </div>
      
      <p class="text-xs text-slate-300 leading-relaxed">
        จากการสังเกตทิศทางลมและฝูงนกนางนวล: วันพรุ่งนี้จะมีคลื่นลมแปรปรวนในแถบสายกลางและสายใต้ หากเรือเตรียมผ่าน <span class="text-amber-300 font-semibold">Bermuda Triangle</span> หรือ <span class="text-amber-300 font-semibold">Pirate's Cove</span> ควรแจ้งต้นหนและสรั่งเรือให้เตรียมพร้อม!
      </p>

      <div class="p-2 bg-slate-900/90 rounded border border-teal-600/30 text-[11px] text-teal-200 flex items-center justify-between">
        <span>คำแนะนำถึงกัปตัน:</span>
        <span class="font-semibold text-amber-300">"ควรเดินเรือเลียบสายเหนือ หรือเตรียมเข็มทิศ"</span>
      </div>
    </div>

    <!-- Current Node Hazard Info -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-1.5 text-xs">
      <h4 class="font-semibold text-slate-300">📍 พิกัดปัจจุบัน: {{ currentNode?.nameTh }}</h4>
      <p class="text-slate-400">{{ currentNode?.description }}</p>
      <div v-if="currentNode?.specialRule" class="text-amber-400 font-medium">
        ⭐ กฎพิเศษประจำโหนด: 
        <span v-if="currentNode.specialRule.stormImmunity">ภูมิคุ้มกันพายุ 100%</span>
        <span v-if="currentNode.specialRule.radarRevealAll">ประภาคารเปิดเรดาร์มองเห็นเรือทุกลำ</span>
        <span v-if="currentNode.specialRule.weightLimit">จำกัดน้ำหนักเรือไม่เกิน {{ currentNode.specialRule.weightLimit }} lbs</span>
        <span v-if="currentNode.specialRule.flotsamChance">มีโอกาสพบของลอยน้ำ {{ currentNode.specialRule.flotsamChance * 100 }}%</span>
      </div>
    </div>
  </div>
</template>
