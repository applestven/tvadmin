<template>
  <a-config-provider :locale="zhCN">
    <a-layout class="min-h-screen">
      <!-- 侧边栏 -->
      <a-layout-sider 
        v-model:collapsed="collapsed" 
        collapsible 
        :trigger="null"
        :width="240"
      >
        <!-- Logo 区域 -->
        <div class="h-16 flex items-center justify-center border-b border-white/10">
          <div v-if="!collapsed" class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <ThunderboltOutlined class="text-white text-lg" />
            </div>
            <span class="text-lg font-bold text-white tracking-wide">TV Admin</span>
          </div>
          <div v-else class="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <ThunderboltOutlined class="text-white text-lg" />
          </div>
        </div>
        
        <!-- 自定义导航菜单 -->
        <nav class="mt-4 px-3">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.key"
            :to="item.key"
            class="nav-item"
            :class="{ 'nav-item-active': isActive(item.key) }"
          >
            <component :is="item.icon" class="nav-icon" />
            <span v-if="!collapsed" class="nav-text">{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </a-layout-sider>

      <a-layout>
        <!-- 顶部导航 -->
        <a-layout-header class="!bg-white/80 backdrop-blur-md !px-6 shadow-sm flex items-center justify-between !h-16">
          <div class="flex items-center gap-4">
            <a-button type="text" class="!w-10 !h-10 !rounded-xl hover:!bg-gray-100" @click="collapsed = !collapsed">
              <template #icon>
                <MenuUnfoldOutlined v-if="collapsed" class="text-lg" />
                <MenuFoldOutlined v-else class="text-lg" />
              </template>
            </a-button>
            <a-breadcrumb class="!text-gray-500">
              <a-breadcrumb-item>
                <NuxtLink to="/" class="hover:text-purple-500 transition-colors">首页</NuxtLink>
              </a-breadcrumb-item>
              <a-breadcrumb-item v-if="currentPageTitle" class="text-gray-800 font-medium">
                {{ currentPageTitle }}
              </a-breadcrumb-item>
            </a-breadcrumb>
          </div>
          
          <div class="flex items-center gap-3">
            <!-- 网络状态指示器 -->
            <div 
              class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
              :class="networkStatus.publicAvailable 
                ? 'bg-green-50 text-green-600' 
                : 'bg-orange-50 text-orange-600'"
            >
              <span 
                class="w-2 h-2 rounded-full"
                :class="networkStatus.publicAvailable 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-orange-500'"
              />
              <GlobalOutlined v-if="networkStatus.publicAvailable" />
              <HomeOutlined v-else />
              <span class="text-sm font-medium">
                {{ networkStatus.mode === 'public' ? '公网' : '内网' }}
              </span>
            </div>
            
            <a-button 
              type="text" 
              class="!w-10 !h-10 !rounded-xl hover:!bg-gray-100"
              @click="refreshNetwork"
            >
              <template #icon>
                <ReloadOutlined :spin="isChecking" class="text-lg text-gray-500" />
              </template>
            </a-button>
          </div>
        </a-layout-header>

        <!-- 内容区域 -->
        <a-layout-content class="m-6 p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm min-h-[calc(100vh-120px)]">
          <slot />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script setup lang="ts">
import { 
  Layout as ALayout,
  LayoutSider as ALayoutSider,
  LayoutHeader as ALayoutHeader,
  LayoutContent as ALayoutContent,
  Menu as AMenu,
  MenuItem as AMenuItem,
  Breadcrumb as ABreadcrumb,
  BreadcrumbItem as ABreadcrumbItem,
  Button as AButton,
  Tag as ATag,
  Tooltip as ATooltip,
  ConfigProvider as AConfigProvider,
} from 'ant-design-vue'
import {
  DashboardOutlined,
  CloudDownloadOutlined,
  SwapOutlined,
  CodeOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  GlobalOutlined,
  HomeOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const route = useRoute()
const router = useRouter()

// 侧边栏折叠状态
const collapsed = ref(false)

// 菜单项配置
const menuItems = [
  { key: '/', label: '控制台', icon: DashboardOutlined },
  { key: '/download', label: '下载管理', icon: CloudDownloadOutlined },
  { key: '/transcode', label: '转译管理', icon: SwapOutlined },
  { key: '/logs', label: '日志监控', icon: CodeOutlined },
]

// 判断是否激活
function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

// 当前页面标题
const currentPageTitle = computed(() => {
  const path = route.path
  if (path.startsWith('/download')) return '下载管理'
  if (path.startsWith('/transcode')) return '转译管理'
  if (path.startsWith('/logs')) return '日志管理'
  return ''
})

// 网络状态
const { networkStatus, isChecking, checkNetwork, startPolling } = useNetworkStatus()

const networkTooltip = computed(() => {
  if (networkStatus.value.publicAvailable) {
    return '公网可用，使用公网 API'
  }
  return '公网不可用，使用内网 API'
})

function refreshNetwork() {
  checkNetwork()
}

// 开始轮询网络状态
onMounted(() => {
  startPolling()
})
</script>
<style scoped>
  .ant-layout-sider-children {
    overflow-y: auto !important;
    overflow-x: hidden;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin: 4px 0;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.65);
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    user-select: none;
  }

  .nav-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.85);
  }

  .nav-item-active {
    background-color: rgba(139, 92, 246, 0.3);
    color: rgba(255, 255, 255, 1);
    border-left: 3px solid rgb(139, 92, 246);
    padding-left: 13px;
  }

  .nav-icon {
    font-size: 18px;
    min-width: 18px;
    display: flex;
    align-items: center;
  }

  .nav-text {
    white-space: nowrap;
  }
</style>