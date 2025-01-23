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
      theme_color: '#22c55e',
      background_color: '#181818',
      icons: [
        {
          src: '/favicon.ico',
          sizes: '128x128',
          type: 'image/x-icon',
        },
        {
          src: '/icon-48x48.png',
          sizes: '48x48',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/icon-64x64.png',
          sizes: '64x64',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/icon-256x256.png',
          sizes: '256x256',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        }
      ]
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