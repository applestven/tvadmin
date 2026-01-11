<template>
  <ConfigProvider :locale="locale">
    <NuxtLayout>
      <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
    </NuxtLayout>
  </ConfigProvider>
</template>

<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

// 设置默认语言
const locale = zhCN
</script>
