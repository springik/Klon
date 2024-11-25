<script setup lang="ts">
    const { $socket } = useNuxtApp()

    const conversationsOpen = ref<boolean>(false)
    const startX = ref<number | null>(null)
    const conversations = ref<object[] | null>(null)
    const selectedConversation = ref<object | null>(null)

    const emit = defineEmits(['goBack'])

    const props = defineProps<{
        server: object
    }>()

    const goBack = () => {
        emit('goBack')
    }
    const onSelectConversation = (conversation : object) => {
        selectedConversation.value = conversation
        $socket.emit('request-conversation-messages', conversation.id)
    }
    const handleMouseEnter = () => {
        conversationsOpen.value = true
    }
    const handleMouseLeave = () => {
        //conversationsOpen.value = false
    }
    const handleTouchStart = (event : TouchEvent) => {
        const touch = event.touches[0]
        startX.value = touch.clientX
    }
    const handleTouchMove = (event : TouchEvent) => {
        if(startX.value === null)
            return

        const touch = event.touches[0]
        const diff = startX.value - touch.clientX
        if(diff > 50) {
            conversationsOpen.value = true
            startX.value = null
        }
    }

    onMounted(() => {
        const container = document.querySelector('.hover-area')
        container?.addEventListener('mouseenter', handleMouseEnter)
        container?.addEventListener('mouseleave', handleMouseLeave)
        container?.addEventListener('touchstart', handleTouchStart)
        container?.addEventListener('touchmove', handleTouchMove)
        $socket.on('conversations-list', (conversationsList : object[]) => {
            conversations.value = conversationsList
        })
        $socket.on('conversation-messages', (messages : object[]) => {
            selectedConversation.value = {
                ...selectedConversation.value,
                messages
            }
            conversations.value = conversations.value?.map(conversation => {
                if(conversation.id === selectedConversation.value?.id) {
                    return selectedConversation.value
                }
                return conversation
            })
        })

        $socket.emit('request-conversations', props.server.id)
    })
    onBeforeUnmount(() => {
        const container = document.querySelector('.hover-area')
        container?.removeEventListener('mouseenter', handleMouseEnter)
        container?.removeEventListener('mouseleave', handleMouseLeave)
        container?.removeEventListener('touchstart', handleTouchStart)
        container?.removeEventListener('touchmove', handleTouchMove)
        $socket.off('conversations-list')
        $socket.off('conversation-messages')
    })
</script>

<template>
    <UContainer class="h-full" v-if="server">
        <div class="z-10 flex items-start justify-items-center mb-2 gap-x-2 fixed mt-2 lg:mt-0 backdrop-blur-sm p-4">
            <UButton size="md" label="Go back" :ui="{ rounded: 'rounded-full' }" @click="goBack">
                <UIcon class="w-5 h-5" name="si:arrow-left-circle-line" />
            </UButton>
        </div>
        <div v-if="selectedConversation === null">
        <h2 class="text-white text-lg font-semibold mb-2">Server: {{ server.name }}</h2>
        <div class="grid grid-cols-3 gap-4">
            <div class="col-span-2">
                <div class="bg-gray-800 p-4 rounded-lg">
                    <h3 class="text-white text-lg font-semibold mb-2">Description</h3>
                    <p class="text-gray-300">{{ server.description }}</p>
                </div>
            </div>
        </div>
        </div>
        <ServerChat :conversation="selectedConversation" v-if="selectedConversation !== null" />
        <div class="hover-area absolute left-0 top-0 bottom-0 h-full w-10" />
        <USlideover side="left" v-model="conversationsOpen">
            <ul>
                <li @click="onSelectConversation(conversation)" v-for="conversation in conversations" :key="conversation.id" class="cursor-pointer">
                    <h1>
                        {{ conversation.name }}
                    </h1>
                </li>
            </ul>
        </USlideover>
    </UContainer>
</template>