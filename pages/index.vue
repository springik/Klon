<script setup lang="ts">
  import type { Socket } from 'socket.io-client';
  const { $socket } = useNuxtApp()
  const snackbar = useSnackbar()

  const testSocket = () => {
    console.log($socket);
    //@ts-expect-error
    $socket.emit('test-event', 'hello')

    snackbar.add({
      type: 'success',
      text: 'test'
    })
  }
</script>

<template>
  <UButton label="NuxtUI test" @click="testSocket"></UButton>
</template>
