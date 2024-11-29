<script setup lang="ts">

    definePageMeta({
        title: 'Login',
        description: 'Login to the application',
        middleware: 'auth'
    })
    const { loggedIn } = useUserSession()
    const config = useRuntimeConfig()

    const redirectToGitHub = () => {
        //navigateTo('/api/auth/github', { external: true })
        if(import.meta.client)
            window.location.href = `${config.public.apiBase}/auth/github`
    }

    const redirectToGoogle = () => {
        //navigateTo('/api/auth/google', { external: true })
        if(import.meta.client)
            window.location.href = `${config.public.apiBase}/auth/google`
    }
</script>

<template>
    <UContainer class="flex flex-col items-center justify-center h-full w-full gap-4">
        <UContainer class="border border-2 border-primary rounded-3xl py-36 px-8 flex flex-col gap-4">
            <h2 class="dark:text-primary light:text-primary text-xl mb-12">
                Please login using one of the options
            </h2>
            <UButton @click="redirectToGitHub" v-if="!loggedIn" size="xl" class="dark:text-black light:text-primary text-bold" label="Login With Github" block />
            <UButton @click="redirectToGoogle" v-if="!loggedIn" size="xl" class="dark:text-black light:text-primary text-bold" label="Login With Google" block />
        </UContainer>
    </UContainer>
</template>