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
    <UButton v-if="!loggedIn" @click="loginWithGitHub">Login with GitHub</UButton>
    <UButton v-if="!loggedIn" @click="loginWithGoogle">Login with Google</UButton>
</template>