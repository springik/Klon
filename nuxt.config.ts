// https://nuxt.com/docs/api/configuration/nuxt-config
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineNuxtConfig({
  ssr: true,
  hooks: {
    close: (nuxt) => {
      if(!nuxt.options._prepare)
        process.exit()
    }
  },
  devtools: { enabled: true },
  compatibilityDate: '2025-01-21',
  router: {
    options: {
      strict: false
    }
  },
  vite: {
    logLevel: 'info',
    define: {
      __VUE_PROD_DEVTOOLS__: true,
    },
    plugins: [
      nodePolyfills()
    ]
  },
  experimental: {
    payloadExtraction: true,
    watcher: 'parcel'
  },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
    prerender: {
      routes: ['/'],
    },
    routeRules: {
      '/sw.js': { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' } },
      '/manifest.webmanifest': { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } },
      '/index.html': { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } },
    },
    experimental: {
      websocket: true
    },
  },
  modules: [
    '@vite-pwa/nuxt',
    '@nuxt/ui',
    'nuxt-auth-utils',
    'nuxt-snackbar',
    '@pinia/nuxt',
    'nuxt-authorization',
    '@nuxt/image',
    '@nuxtjs/html-validator',
  ],
  runtimeConfig: {
    DATABASE_USERNAME : process.env.DATABASE_USERNAME,
    DATABASE_PASSWORD : process.env.DATABASE_PASSWORD,
    DATABASE_HOST : process.env.DATABASE_HOST,
    DATABASE_NAME : process.env.DATABASE_NAME,
    DATABASE_URL : process.env.DATABASE_URL,

    public: {
      serverUrl: process.env.SERVER_URL,
      apiBase: process.env.NUXT_API_BASE,
    },
    oauth: {
      github: {
        clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET,
        redirectURL: process.env.NUXT_OAUTH_GITHUB_REDIRECT_URL
      },
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET,
        redirectURL: process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL
      }
    }
  },

  tailwindcss: {
    cssPath: ['~/assets/css/tailwind.css', { injectPosition: 0 }], 
    configPath: 'tailwind.config', 
    exposeConfig: false, 
    config: {},
    viewer: false,
  },
  image: {
    format: ['webp', 'png', 'jpeg'],
    screens: {
      'xs': 320,
      'sm': 640,
      'md': 768,
      'lg': 1024,
      'xl': 1280,
      'xxl': 1536,
      '2xl': 1536,
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    strategies: 'generateSW',

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
      //navigateFallback: '/',
      /*
      runtimeCaching: [
        {
          urlPattern: '/',
          handler: 'NetworkFirst',
          method: 'GET'
        }
      ],
      */
      //globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: true,
      suppressWarnings: false,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },

    registerWebManifestInRouteRules: true,
  },
})