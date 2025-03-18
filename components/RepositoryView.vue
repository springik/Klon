<script setup lang="ts">
    const { repository } = defineProps<{repository: { id: number, name: string, description: string, html_url: string }}>()
</script>

<template>
    <UCard>
        <template v-if="repository.description" #header>
            <h2>
                {{ repository.name }}
            </h2>
        </template>

        <div v-if="repository.description">
            {{ repository.description }}
        </div>
        <div v-else>
            {{ repository.name }}
        </div>

        <template #footer>
            <a :href="repository.html_url" target="_blank" class="text-primary-500">
                View on GitHub
            </a>
        </template>
    </UCard>
</template>