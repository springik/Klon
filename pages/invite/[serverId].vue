<script setup lang="ts">
    import { useRoute, useRouter } from 'vue-router';
    definePageMeta({
        title: 'Invite',
        description: 'Invite page for servers',
        middleware: 'auth'
    })
    const route = useRoute()
    const router = useRouter()
    const snackbar = useSnackbar()
    const serverId = route.params.serverId

    onMounted(async () => {
        try {
            const response = await $fetch('/api/invites/accept', {
                method: 'POST',
                query: {
                    serverId
                }
            })
            snackbar.add({
                type: 'success',
                title: 'Invite accepted',
                text: 'You have joined the server'
            })
            router.push('/servers')
        } catch (error) {
            if(error?.response?.status === 400) {
                snackbar.add({
                    type: 'error',
                    title: 'Failed to accept invite',
                    text: `You're already a member of this server`
                })
                router.push('/')
            }
            else {
                snackbar.add({
                    type: 'error',
                    title: 'Failed to accept invite',
                    text: 'The invite may have expired or is invalid'
                })
                router.push('/')
            }
        }
    })
    
</script>

<template>
    <div>
        <h3 class="text-lg">
            Proccessing Invite...
        </h3>
        <UProgress animation="swing" />
    </div>
</template>
