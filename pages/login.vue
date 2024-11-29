<script setup lang="ts">

    definePageMeta({
        title: 'Login',
        description: 'Login to the application'
    })
    const { loggedIn } = useUserSession()

    const redirectToGitHub = () => {
        //navigateTo('/api/auth/github', { external: true })
        window.location.href = 'http://localhost:3000/api/auth/github'
    }

    const redirectToGoogle = () => {
        //navigateTo('/api/auth/google', { external: true })
        window.location.href = 'http://localhost:3000/api/auth/google'
    }
</script>

//FIXME: The redirection doesn't work in normal mode. It works in private browsing mode only.

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