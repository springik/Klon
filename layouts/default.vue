<script setup lang="ts">
  import { useRoute } from 'vue-router'
  const route = useRoute()
  const isLoginPage = computed(() => route.path === '/login')
  const isMobile = ref()
  const mobileBreakpoint = 992

  const onResize = () => {
    isMobile.value = window.innerWidth < mobileBreakpoint
  }

  onMounted(() => {
    window.addEventListener('resize', onResize)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
  })

  onMounted(() => {
    if(import.meta.client)
      onResize()
  })

</script>

<template>
  <main class="h-screen">
    <ClientOnly>
      <Navbar v-if="!isLoginPage"/>
    </ClientOnly>
    <div :class="{ content: !isLoginPage && !isMobile }" class="h-full">
      <slot />
    </div>
    <ClientOnly>
      <div
          v-if="$pwa?.needRefresh"
          class="pwa-toast"
          role="alert"
          aria-labelledby="toast-message"
      >
        <div class="message">
          <span id="toast-message">
            New content available, click on reload button to update
          </span>
        </div>
        <div class="buttons">
          <button @click="$pwa.updateServiceWorker()">
            Reload
          </button>
          <button @click="$pwa.cancelPrompt()">
            Close
          </button>
        </div>
      </div>
    </ClientOnly>
  </main>
</template>

<style>
.pwa-toast {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 16px;
  padding: 12px;
  border: 1px solid #8885;
  border-radius: 4px;
  z-index: 1;
  text-align: left;
  box-shadow: 3px 4px 5px 0 #8885;
  background-color: black;
}
.pwa-toast .message {
  margin-bottom: 8px;
  color: white;
}
.pwa-toast button {
  border: 1px solid white;
  outline: none;
  margin-right: 5px;
  border-radius: 2px;
  padding: 3px 10px;
  color: black;
}
.content {
  margin-left: 200px;
  padding: 1rem;
}
</style>
