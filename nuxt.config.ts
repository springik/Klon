// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  hooks: {
    close: (nuxt) => {
      if(!nuxt.options._prepare)
        process.exit()
    }
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-09-12',
  router: {
    options: {
      strict: true
    }
  },

  nitro: {
    prerender: {
      routes: ['/'],
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
  ],
  runtimeConfig: {
    DATABASE_USERNAME : process.env.DATABASE_USERNAME,
    DATABASE_PASSWORD : process.env.DATABASE_PASSWORD,
    DATABASE_HOST : process.env.DATABASE_HOST,
    DATABASE_NAME : process.env.DATABASE_NAME,
    DATABASE_URL : process.env.DATABASE_URL,

    public: {
      serverUrl: process.env.SERVER_URL,
    },
    oauth: {
      github: {
        clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET,
        redirectURL: 'http://localhost:3000/api/auth/github'
      },
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET,
        redirectURL: 'http://localhost:3000/api/auth/google'
      }
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