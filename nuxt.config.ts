// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
  ],

  css: [
    'ant-design-vue/dist/reset.css',
    '~/assets/styles/main.css',
  ],

  build: {
    transpile: ['ant-design-vue', '@ant-design/icons-vue', 'echarts', 'vue-echarts'],
  },

  runtimeConfig: {
    // 服务端运行时配置
    tvApiPublic: 'http://43.139.236.50:8686/tv',
    tvApiInternal: 'http://192.168.191.168:6789',
    dvApiPublic: 'http://43.139.236.50:8686/dv',
    dvApiInternal: 'http://192.168.191.168:3456',

    // 客户端运行时配置
    public: {
      apiBase: '/api',
    }
  },

  nitro: {
    routeRules: {
      '/api/**': { cors: true },
    },
  },

  app: {
    head: {
      title: 'TV Admin Panel',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'TV/DV 后台管理系统' }
      ],
    }
  },

  compatibilityDate: '2024-12-01',
})
