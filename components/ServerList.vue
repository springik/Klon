<script setup lang="ts">
    const { $socket } = useNuxtApp()

    const servers = ref([{}]);

    const emit = defineEmits(['serverSelected']);

    const requestServerList = () => {
        $socket.emit('request-servers');
    }

    onMounted(() => {
        $socket.on('server-list', (serverList : object[]) => {
            servers.value = serverList;
            console.log('got server list');
        });

        requestServerList();
    });
    onBeforeUnmount(() => {
        $socket.off('server-list');
    });

</script>

<template>

</template>