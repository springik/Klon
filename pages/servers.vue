<script setup lang="ts">

    const selectedTab = ref('Servers')
    const selectedServer = ref(null)

    const tabs = [{
        label: 'Servers',
        icon: 'si:library-books-line'
    },
    {
        label: 'Requests',
        icon: 'si:user-alt-5-line'
    }]

    const onTabChange = (index : number) => {
        selectedTab.value = tabs[index].label
    }
</script>

<template>
    <UTabs @change="onTabChange" :items="tabs">
        <template #icon="{ item, selected }">
            <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0 me-2" :class="[selected && 'text-primary-500 dark:text-primary-400']" />
        </template>
    </UTabs>

    <ServerList v-if="selectedTab === 'Servers'" />
    <ServerDisplay v-else-if="selectedTab === 'Servers' && selectedServer !== null" />
    <ServerRequestsList v-if="selectedTab === 'Requests'" />
</template>
