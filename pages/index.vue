<script setup lang="ts">
  //import { io } from 'socket.io-client';
  //const socket = io()
  const { $socket } = useNuxtApp()
  const { loggedIn, session } = useUserSession()

  const snackbar = useSnackbar()

  const testSocket = () => {
    if(!loggedIn)
      return

    $socket.connect()
    $socket.emit('test-event', 'hello testing')
    console.log($socket);
    
  }
</script>

<template>
  <UButton label="NuxtUI test" @click="testSocket"></UButton>
</template>
