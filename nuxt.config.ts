// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-09-12',

  nitro: {
    prerender: {
      routes: ['/'],
    },
    experimental: {
      websocket: true
    }
  },

  modules: ['@vite-pwa/nuxt', '@nuxt/ui', 'nuxt-auth-utils'],
  runtimeConfig: {
    DATABASE_USERNAME : process.env.DATABASE_USERNAME,
    DATABASE_PASSWORD : process.env.DATABASE_PASSWORD,
    DATABASE_HOST : process.env.DATABASE_HOST,
    DATABASE_NAME : process.env.DATABASE_NAME,

    public: {
      serverUrl: process.env.SERVER_URL
    }
  },

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css', 
    configPath: 'tailwind.config', 
    exposeConfig: false, 
    config: {}, 
    injectPosition: 0, 
    viewer: false,
  },

  pwa: {
    registerType: 'prompt',
    injectRegister: false,

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'Klon',
      short_name: 'Klon',
      description: 'A chatting app in Nuxt',
      theme_color: '#ffffff',
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },

    registerWebManifestInRouteRules: true,
  },
})