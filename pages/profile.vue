<script setup lang="ts">
    definePageMeta({
        title: 'Profile',
        description: 'User profile',
        middleware: 'auth'
    })
    const userRef = ref<object | null>(null)
    
    onMounted(async () => {
        const { user } = useUserSession()

        if(user.value)
            userRef.value = user.value
    })
</script>

<template>
    <div v-if="userRef">
            <div class="mb-4">
                <img :src="userRef.avatarUrl" alt="Avatar" class="w-32 h-32 rounded-full" />
            </div>
            <div class="mb-4">
                <h2 class=" text-xl font-semibold">Username</h2>
                <p class="indent-4">{{ userRef.username }}</p>
            </div>
            <div class="mb-4">
                <h2 class="text-xl font-semibold">Email</h2>
                <p class="indent-4">{{ userRef.email }}</p>
            </div>
            <div class="mb-4">
                <h2 class="text-xl font-semibold">Provider</h2>
                <p class="capitalize indent-4">{{ userRef.provider }}</p>
            </div>
            <div class="mb-4">
                <h2 class="text-xl font-semibold">Joined At</h2>
                <p class="indent-4">{{ new Date(userRef.createdAt).toLocaleString() }}</p>
            </div>
    </div>
</template>
