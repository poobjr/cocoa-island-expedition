<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '../../stores/gameStore';

const store = useGameStore();

const buyWaterQty = ref(0);
const buyFuelQty = ref(0);
const buyCannonQty = ref(0);
const buyCompassQty = ref(0);
const wantSalvageFlotsam = ref(false);

const myTeam = computed(() => store.myTeam);
const currentNode = computed(() => store.currentNode);
const currentWeight = computed(() => store.currentShipWeight);
const deckhandBonus = computed(() => (myTeam.value?.members.filter(m => m.role === 'DECKHAND').length || 0) * 15);
const maxCapacity = computed(() => 1000 + deckhandBonus.value);
const isOverweight = computed(() => currentWeight.value > maxCapacity.value);

// Shop prices at current node
const prices = computed(() => currentNode.value?.prices || { water: 50, fuel: 30, cannon: 200, compass: 100 });
const shopAvailable = computed(() => currentNode.value?.shopAvailable || false);

const totalCost = computed(() => {
  return (
    buyWaterQty.value * prices.value.water +
    buyFuelQty.value * prices.value.fuel +
    buyCannonQty.value * prices.value.cannon +
    buyCompassQty.value * prices.value.compass
  );
});

const remainingCapacity = computed(() => Math.max(0, maxCapacity.value - currentWeight.value));
const maxTreasureBoxesPossible = computed(() => Math.floor(remainingCapacity.value / 50));

function handleSendRationAlert() {
  store.submitAdvisoryVote('ANCHOR', undefined, `ฝ่ายเสบียงเตือน: น้ำดื่มเหลือ ${myTeam.value?.inventory.water} ถัง เชื้อเพลิง ${myTeam.value?.inventory.fuel} ถัง! ขนสมบัติได้อีกไม่เกิน ${maxTreasureBoxesPossible.value} กล่อง`);
  alert('ส่งสัญญาณวิเคราะห์เสบียงไปยังกัปตันเรียบร้อยแล้ว!');
}

function handleSaveSupplies() {
  if (!myTeam.value) return;

  store.updateDailyOrder({
    buyWater: buyWaterQty.value,
    buyFuel: buyFuelQty.value,
    buyCannon: buyCannonQty.value,
    buyCompass: buyCompassQty.value,
    salvageFlotsam: wantSalvageFlotsam.value,
  });

  alert('บันทึกแผนจัดซื้อและจัดการเสบียงเรียบร้อยแล้ว!');
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="p-3 bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl">💰</span>
        <div>
          <h3 class="font-bold text-emerald-200">ห้องฝ่ายเสบียง & การเงิน (Purser & Quartermaster)</h3>
          <p class="text-xs text-slate-400">ควบคุมน้ำหนักรวม จัดซื้อเสบียง และตัดสินใจเก็บของลอยน้ำ</p>
        </div>
      </div>
    </div>

    <!-- Weight Capacity Gauge -->
    <div class="p-3 bg-slate-900/80 border rounded-xl space-y-1.5" :class="isOverweight ? 'border-red-500 bg-red-950/30' : 'border-slate-700/60'">
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-300 font-medium">น้ำหนักบรรทุกรวม (Total Weight):</span>
        <span class="font-mono font-bold" :class="isOverweight ? 'text-red-400 animate-pulse' : 'text-amber-400'">
          {{ currentWeight }} / {{ maxCapacity }} lbs <span v-if="deckhandBonus > 0" class="text-emerald-400 text-[10px]">(+{{ deckhandBonus }} ลูกเรือ)</span>
        </span>
      </div>
      <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
        <div 
          class="h-full rounded-full transition-all"
          :class="isOverweight ? 'bg-red-500' : currentWeight > (maxCapacity * 0.8) ? 'bg-amber-500' : 'bg-emerald-500'"
          :style="{ width: `${Math.min(100, (currentWeight / maxCapacity) * 100)}%` }"
        ></div>
      </div>
      <p v-if="isOverweight" class="text-[11px] text-red-400 font-medium">
        ⚠️ คำเตือนวิกฤต: เรือบรรทุกน้ำหนักเกินพิกัด! เรือจะอับปางหากไม่ลดเสบียง
      </p>

      <!-- Capacity for Treasure Calculator -->
      <div class="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
        <span class="text-slate-400">✨ พื้นที่ว่างสำหรับหีบสมบัติ:</span>
        <span class="font-mono font-bold text-yellow-300">ขนได้อีก {{ maxTreasureBoxesPossible }} กล่อง (ว่าง {{ remainingCapacity }} lbs)</span>
      </div>

      <div class="pt-1 flex justify-end">
        <button
          @click="handleSendRationAlert"
          type="button"
          class="px-2.5 py-1 bg-emerald-700/40 hover:bg-emerald-600/60 border border-emerald-500/50 rounded text-emerald-200 text-[10px] font-bold transition-all active:scale-95 flex items-center gap-1"
        >
          <span>📢 ส่งรายงานเสบียงเตือนกัปตัน</span>
        </button>
      </div>
    </div>

    <!-- Salvage Flotsam Action -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl flex items-center justify-between">
      <div>
        <h4 class="text-xs font-semibold text-amber-300">📦 เก็บกู้ทรัพยากรลอยน้ำ (Flotsam Salvage)</h4>
        <p class="text-[11px] text-slate-400">หากพบถังน้ำมันหรือน้ำดื่มลอยน้ำ สั่งให้ลูกเรือหย่อนเรือเล็กลงไปเก็บ</p>
      </div>
      <input 
        v-model="wantSalvageFlotsam"
        type="checkbox" 
        class="w-5 h-5 accent-emerald-500 cursor-pointer"
      />
    </div>

    <!-- Shop Interface -->
    <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
      <div class="flex justify-between items-center">
        <h4 class="text-xs font-semibold text-emerald-300 uppercase tracking-wider">🛒 ตลาดค้าเสบียง ณ จุดจอดปัจจุบัน</h4>
        <span class="text-xs text-amber-300 font-mono">ทองของทีม: {{ myTeam?.gold }} Gold</span>
      </div>

      <div v-if="!shopAvailable" class="text-xs text-slate-500 italic py-2 text-center">
        โหนดปัจจุบันไม่มีร้านค้าเสบียง (ต้องไปที่ Port, Fisherman Village, หรือ Oasis)
      </div>

      <div v-else class="space-y-2">
        <div class="grid grid-cols-2 gap-2 text-xs">
          <!-- Water -->
          <div class="p-2 bg-slate-800 rounded border border-slate-700 flex justify-between items-center">
            <div>
              <div class="font-bold text-slate-200">💧 น้ำดื่ม ({{ prices.water }} G)</div>
              <div class="text-[10px] text-slate-400">50 lbs/ถัง</div>
            </div>
            <input 
              v-model.number="buyWaterQty" 
              type="number" min="0" max="10" 
              class="w-12 bg-slate-900 border border-slate-600 rounded p-1 text-center font-mono text-xs" 
            />
          </div>

          <!-- Fuel -->
          <div class="p-2 bg-slate-800 rounded border border-slate-700 flex justify-between items-center">
            <div>
              <div class="font-bold text-slate-200">⛽ เชื้อเพลิง ({{ prices.fuel }} G)</div>
              <div class="text-[10px] text-slate-400">10 lbs/ถัง</div>
            </div>
            <input 
              v-model.number="buyFuelQty" 
              type="number" min="0" max="10" 
              class="w-12 bg-slate-900 border border-slate-600 rounded p-1 text-center font-mono text-xs" 
            />
          </div>

          <!-- Cannon -->
          <div class="p-2 bg-slate-800 rounded border border-slate-700 flex justify-between items-center">
            <div>
              <div class="font-bold text-slate-200">💣 ปืนใหญ่ ({{ prices.cannon }} G)</div>
              <div class="text-[10px] text-slate-400">60 lbs (max 3)</div>
            </div>
            <input 
              v-model.number="buyCannonQty" 
              type="number" min="0" max="3" 
              class="w-12 bg-slate-900 border border-slate-600 rounded p-1 text-center font-mono text-xs" 
            />
          </div>

          <!-- Compass -->
          <div class="p-2 bg-slate-800 rounded border border-slate-700 flex justify-between items-center">
            <div>
              <div class="font-bold text-slate-200">🧭 เข็มทิศ ({{ prices.compass }} G)</div>
              <div class="text-[10px] text-slate-400">10 lbs</div>
            </div>
            <input 
              v-model.number="buyCompassQty" 
              type="number" min="0" max="2" 
              class="w-12 bg-slate-900 border border-slate-600 rounded p-1 text-center font-mono text-xs" 
            />
          </div>
        </div>

        <div class="flex justify-between items-center text-xs pt-1 border-t border-slate-700">
          <span class="text-slate-400">ยอดชำระรวม:</span>
          <span class="font-bold text-amber-400 font-mono">{{ totalCost }} Gold</span>
        </div>
      </div>

      <button
        type="button"
        @click="handleSaveSupplies"
        class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-transform active:scale-95"
      >
        บันทึกรายการจัดซื้อและส่งข้อมูลให้กัปตัน
      </button>
    </div>
  </div>
</template>
