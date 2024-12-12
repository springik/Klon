<script setup lang="ts">
    import { useRoute } from 'vue-router';
    definePageMeta({
        title: 'Call page',
        description: 'Accept, decline or start a call',
        middleware: 'auth'
    })
    const route = useRoute()
    const snackbar = useSnackbar()

    const friendId = route.params.friendId
    if(friendId === undefined) {
        snackbar.add({
            type: 'error',
            text: 'The friend ID is invalid'
        })
    }
</script>

<template>
    <div>
        <Call v-if="friendId !== null || friendId !== undefined" :friendId="friendId" />
    </div>
</template>