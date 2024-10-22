<script setup lang="ts">
    const { loggedIn } = useUserSession()

    const loginWithGitHub = () => {
        window.location.href = '/api/auth/github'
    }
    const loginWithGoogle = () => {
        window.location.href = '/api/auth/google'
    }
</script>

<template>
    <UContainer class="flex flex-col items-center justify-center h-full w-full gap-4">
        <UContainer class="border border-2 border-primary rounded-3xl py-36 px-8 flex flex-col gap-4">
            <h2 class="dark:text-primary light:text-primary text-xl mb-12">
                Please login using one of the options
            </h2>
            <UButton size="xl" class="dark:text-black light:text-primary text-bold" v-if="!loggedIn" @click="loginWithGitHub">
                <span class="text-center w-full">
                    Login with GitHub
                </span>
            </UButton>
            <UButton size="xl" class="dark:text-black light:text-primary text-bold" v-if="!loggedIn" @click="loginWithGoogle">
                <span class="text-center w-full">
                    Login with Google
                </span>
            </UButton>
        </UContainer>
    </UContainer>
</template>