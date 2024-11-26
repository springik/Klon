<script setup lang="ts">
    const { $socket } = useNuxtApp()
    import { addConversation, inviteUsers } from '~/shared/utils/abilities'

    const conversationsOpen = ref<boolean>(false)
    const startX = ref<number | null>(null)
    const conversations = ref<object[] | null>(null)
    const selectedConversation = ref<object | null>(null)
    const creatingConversation = ref<boolean>(false)
    const isConversationBeingCreated = ref<boolean>(false)
    const conversationName = ref<string>('')
    const inviteLink = ref<string>('')

    const emit = defineEmits(['goBack'])

    const props = defineProps<{
        server: object
    }>()

    const createConversation = () => {
        isConversationBeingCreated.value = true
        $socket.emit('create-conversation', {
            name: conversationName.value,
            serverId: props.server.id
        })
    }
    const goBack = () => {
        emit('goBack')
    }
    const onSelectConversation = (conversation : object) => {
        if(selectedConversation.value?.id === conversation.id) {
            selectedConversation.value = null
            return
        }
        selectedConversation.value = conversation
        $socket.emit('request-conversation-messages', conversation.id)
    }
    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink.value)
    }
    const handleMouseEnter = () => {
        conversationsOpen.value = true
    }
    const handleMouseLeave = () => {
        conversationsOpen.value = false
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

    onMounted(async () => {
        const container = document.querySelector('.hover-area')
        container?.addEventListener('mouseenter', handleMouseEnter)
        //container?.addEventListener('mouseleave', handleMouseLeave)
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
        $socket.on('conversation-created', (conversation : object) => {
            conversations.value?.push(conversation)
            creatingConversation.value = false
        })

        try {
            if(await allows(inviteUsers, props.server)) {
                const response = await $fetch('/api/invites/url', {
                    method: 'GET',
                    query: {
                        serverId: props.server.id
                    }
                })
                inviteLink.value = response.body.url
            }
            else {
                inviteLink.value = ''
            }
            
        } catch (error) {
            inviteLink.value = ''
        }

        $socket.emit('request-conversations', props.server.id)
    })
    onBeforeUnmount(() => {
        const container = document.querySelector('.hover-area')
        container?.removeEventListener('mouseenter', handleMouseEnter)
        //container?.removeEventListener('mouseleave', handleMouseLeave)
        container?.removeEventListener('touchstart', handleTouchStart)
        container?.removeEventListener('touchmove', handleTouchMove)
        $socket.off('conversations-list')
        $socket.off('conversation-messages')
    })
</script>

<template>
    <div class="relative">
        <div class="absolute left-0 right-0 top-0">
            <div v-if="selectedConversation === null" class="z-10 flex items-start justify-items-center mb-2 gap-x-2 fixed mt-2 lg:mt-0 backdrop-blur-sm p-4">
            <UButton size="md" label="Go back" :ui="{ rounded: 'rounded-full' }" @click="goBack">
                <UIcon class="w-5 h-5" name="si:arrow-left-circle-line" />
            </UButton>
            </div>    
        </div>
    </div>
    <UContainer class="h-full" :class="selectedConversation === null ? 'pt-20' : 'pt-0'" v-if="server">
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
        <Can :ability="inviteUsers" :args="[props.server]">
        <div class="flex flex-col pb-2 pt-6">
            <h3 class="text-lg">
                Invite new members
            </h3>
            <div class="flex border-green-400 border rounded-lg w-fit justify-between">
                <UInput variant="none" class="w-full" disabled color="primary" v-model="inviteLink" :ui="{ base: 'disabled:cursor-text overflow-x-hidden', trailing: { '2xs': 'pe-0', xs: 'pe-0', sm: 'pe-0', md: 'pe-0', lg: 'pe-0', xl: 'pe-0' } }">
                </UInput>
                <UButton @click.prevent="copyInviteLink" label="Copy">
                    <UIcon name="si:clipboard-alt-line" class="z-10 w-5 h-5" />
                </UButton>
            </div>
            
        </div>
        </Can>
        <ServerChat @goBack="selectedConversation = null" :conversation="selectedConversation" v-if="selectedConversation !== null" />
        <div class="hover-area absolute left-0 top-0 bottom-0 h-full w-10" />
        <USlideover @mouseleave="handleMouseLeave" :overlay="false" side="left" v-model="conversationsOpen">
            <UCard :ui="{ divide: 'divide-none', rounded: 'rounded-none' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-semibold">Conversations</h3>
                        </div>
                        <UButton @click="conversationsOpen = false" variant="ghost" icon="si:close-line" />
                    </div>
                </template>
                <ul class="overflow-y-auto">
                    <li @click="onSelectConversation(conversation)" v-for="conversation in conversations" :key="conversation.id" class="cursor-pointer w-full">
                        <UButton block :variant="selectedConversation?.id === conversation.id ? 'soft' : 'ghost'" :label="conversation.name" />
                    </li>
                    <Can :ability="addConversation" :args="[props.server]">
                    <li class="mt-4 w-full">
                        <UButton @click="creatingConversation = true" label="Create" block>
                            <UIcon name="si:add-circle-line" class="w-5 h-5" />
                        </UButton>
                    </li>
                    </Can>
            </ul>
            </UCard>
        </USlideover>
        <Can :ability="addConversation" :args="[props.server]">
        <UModal v-model="creatingConversation">
            <UCard :ui="{ divide: 'divide-none' }">
                <template #header>
                    Create a Conversation
                </template>
                <div class="overflow-y-auto">
                    <label for="conversationName">Name:</label>
                    <UInput name="conversationName" v-model="conversationName" placeholder="Enter your conversation's name" label="Name" class="lg:px-3 px-2 py-2" :model-modifiers="{ trim: true }" />
                </div>
                <template #footer>
                    <UButton :loading="isConversationBeingCreated" @click="createConversation" label="Create" />
                </template>
            </UCard>
        </UModal>
        </Can>
    </UContainer>
</template>