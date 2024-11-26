<script setup lang="ts">
    definePageMeta({
        title: 'Servers',
        description: 'Servers page of the application',
        middleware: 'auth'
    })

    const selectedTab = ref('Servers')
    const selectedServer = ref<object | null>(null)

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
    const onServerSelected = (server : object) => {
        selectedServer.value = server
    }

</script>

<template>
    <UTabs v-if="selectedServer === null" @change="onTabChange" :items="tabs">
        <template #icon="{ item, selected }">
            <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0 me-2" :class="[selected && 'text-primary-500 dark:text-primary-400']" />
        </template>
    </UTabs>

    <ServerList @serverSelected="onServerSelected" v-if="selectedTab === 'Servers' && selectedServer === null" />
    <ServerDisplay @goBack="selectedServer = null" :server="selectedServer"v-else-if="selectedTab === 'Servers' && selectedServer !== null" />
    <ServerRequestsList v-if="selectedTab === 'Requests'" />
</template>
