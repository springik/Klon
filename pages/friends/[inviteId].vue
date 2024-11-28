<script setup lang="ts">
    import { useRoute, useRouter } from 'vue-router';
    definePageMeta({
        title: 'Friend Request',
        description: 'Accept friend requests',
        middleware: 'auth'
    })
    const route = useRoute()
    const router = useRouter()
    const snackbar = useSnackbar()
    const inviteId = route.params.inviteId

    onMounted(async () => {
        try {
            const response = await $fetch('/api/friends/accept', {
                method: 'POST',
                query: {
                    inviteId
                }
            })
            snackbar.add({
                type: 'success',
                title: 'Friendship accepted',
                text: 'You have become friends'
            })
            router.push('/friends')
        } catch (error) {
            if(error?.response?.status === 400) {
                snackbar.add({
                    type: 'error',
                    title: 'Failed to accept request',
                    text: `You're already friends`
                })
                router.push('/')
            }
            else {
                snackbar.add({
                    type: 'error',
                    title: 'Failed to accept request',
                    text: 'The request may have expired or is invalid'
                })
                router.push('/')
            }
        }
    })
    
</script>

<template>
    <div>
        <h3 class="text-lg">
            Proccessing Request...
        </h3>
        <UProgress animation="swing" />
    </div>
</template>
