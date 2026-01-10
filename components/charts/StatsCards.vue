<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div 
      v-for="card in cards" 
      :key="card.title"
      class="stat-card rounded-2xl p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
      :class="card.class"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-white/80 text-sm font-medium mb-2">{{ card.title }}</p>
          <p class="text-3xl font-bold m-0 tracking-tight">
            <a-spin v-if="loading" size="small" />
            <template v-else>{{ formatValue(card.value, card.suffix) }}</template>
          </p>
        </div>
        <div class="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <component :is="card.icon" class="text-2xl" />
        </div>
      </div>
      <div v-if="card.subValue !== undefined" class="mt-4 pt-4 border-t border-white/20">
        <span class="text-white/70 text-xs">{{ card.subLabel }}: </span>
        <span class="text-white font-semibold text-sm">{{ formatValue(card.subValue, card.subSuffix) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Spin as ASpin } from 'ant-design-vue'
import type { Component } from 'vue'

interface StatCard {
  title: string
  value: number | string
  suffix?: string
  icon: Component
  class: string
  subLabel?: string
  subValue?: number | string
  subSuffix?: string
}

defineProps<{
  cards: StatCard[]
  loading?: boolean
}>()

function formatValue(value: number | string | undefined, suffix?: string): string {
  if (value === undefined) return '-'
  if (typeof value === 'number') {
    if (suffix === 'GB' || suffix === 'MB') {
      return `${value.toFixed(2)} ${suffix}`
    }
    return `${value.toLocaleString()}${suffix ? ' ' + suffix : ''}`
  }
  return `${value}${suffix ? ' ' + suffix : ''}`
}
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-card-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-card-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card-info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
</style>
