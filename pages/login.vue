<script setup lang="ts">

    definePageMeta({
        title: 'Login',
        description: 'Login to the application'
    })
    const { loggedIn } = useUserSession()
</script>

<template>
    <UContainer class="flex flex-col items-center justify-center h-full w-full gap-4">
        <UContainer class="border border-2 border-primary rounded-3xl py-36 px-8 flex flex-col gap-4">
            <h2 class="dark:text-primary light:text-primary text-xl mb-12">
                Please login using one of the options
            </h2>
            <ClientOnly>
            <UButton size="xl" class="dark:text-black light:text-primary text-bold" v-if="!loggedIn" to="/api/auth/github" external>
                <span class="text-center w-full">
                    Login with GitHub
                </span>
            </UButton>
            <UButton size="xl" class="dark:text-black light:text-primary text-bold" v-if="!loggedIn" to="/api/auth/google" external>
                <span class="text-center w-full">
                    Login with Google
                </span>
            </UButton>
            </ClientOnly>
        </UContainer>
    </UContainer>
</template>