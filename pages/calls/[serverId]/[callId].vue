<script setup lang="ts">
const route = useRoute()

const serverId = route.params.serverId
const callId = route.params.callId
</script>

<template>
    <GroupCall :serverId="serverId" :groupId="callId" />
</template>
