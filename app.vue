<script setup>
  const { $socket } = useNuxtApp()
  const snackbar = useSnackbar()

  onBeforeMount(() => {
    $socket.on('errr', (err) => {
      snackbar.add({
        message: err?.message || 'An error occurred',
        type: 'error'
      })
    })
  })
</script>

<template>
  <div>
    <NuxtPwaAssets />
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
      <NuxtSnackbar />
    </NuxtLayout>
  </div>

</template>
