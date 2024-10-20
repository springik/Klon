<script setup lang="ts">
  import { io } from 'socket.io-client';
  const socket = io()
  const { session } = useUserSession()
  console.log(session);

  const snackbar = useSnackbar()

  const testSocket = () => {
    socket.emit('test-event', 'hello testing')
    console.log(socket);
    
  }
</script>

<template>
  <UButton label="NuxtUI test" @click="testSocket"></UButton>
</template>
