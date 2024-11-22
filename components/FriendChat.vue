<script setup lang="ts">
    const props = defineProps({
        friend: Object
    })
    const messages = ref([])
    const messageInput = ref('')
    
    const emit = defineEmits(['goBack'])

    const { $socket } = useNuxtApp()

    const sortedMessages = computed(() => {
        return messages.value.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    })

    const goBack = () => {
        emit('goBack')
    }
    const sendMessage = () => {
        console.log("sending message");
        if(messageInput.value === '')
            return
        $socket.emit('send-message', { content: messageInput.value, receiverId: props.friend.id })
        messageInput.value = ''
    }
    const onEditMessage = (messageId: string, newContent: string) => {
        const message = messages.value.find(m => m.id === messageId)
        message.content = newContent
        $socket.emit('edit-message', { messageId, newContent })
    }
    const onDeleteMessage = (messageId: string) => {
        messages.value = messages.value.filter(m => m.id !== messageId)
        console.log('Deleting message');
        $socket.emit('delete-message', messageId)
    }

    onMounted(() => {
        $socket.on('messages', (data) => {
            console.log(data);
            messages.value = data
            console.log('Received messages');
        })
        $socket.on('message', (message) => {
            console.log(message);
            messages.value.push(message)
        })
        $socket.on('message-deleted', (messageId) => {
            messages.value = messages.value.filter(m => m.id !== messageId)
        })
        $socket.on('message-edited', (message) => {
            const index = messages.value.findIndex(m => m.id === message.id)
            messages.value[index].content = message.content
            messages.value[index].updatedAt = message.updatedAt
        })
        $socket.emit('request-messages', props.friend.id)
    })

    onBeforeUnmount(() => {
        $socket.off('messages')
        $socket.off('message')
        $socket.off('message-deleted')
        $socket.off('message-edited')
    })
</script>

<template>
    <UContainer v-if="friend" class="border-l border-gray-700 w-full h-full relative">
        <div class="z-10 flex items-start justify-items-center mb-2 gap-x-2 fixed mt-2 lg:mt-0 backdrop-blur-sm p-4">
            <UButton size="md" label="Go back" :ui="{ rounded: 'rounded-full' }" @click="goBack">
                <UIcon class="w-5 h-5" name="si:arrow-left-circle-line" />
            </UButton>
            <h3 class="mt-1">
                    Chat with {{ friend.username  }}
            </h3>
        </div>
        <ul class="flex flex-col-reverse h-5/6 overflow-y-auto">
            <MessageDisplay @deleteMessage="onDeleteMessage" @editMessage="onEditMessage" v-for="message in sortedMessages"  :message="message" :key="message.id"></MessageDisplay>
        </ul>
        <UContainer class="w-11/12 lg:w-full mb-2">
            <div class="flex">
                <UTextarea autoresize v-model="messageInput" class="w-full" :rows="1" size="xl" :maxrows="3" placeholder="Chat..." variant="outline" :model-modifiers="{ trim: true }"/>
                <UButton class="cursor-pointer" label="Send message" size="md" @click="sendMessage">
                    <UIcon class="w-5 h-5" name="si:north-east-circle-line" />
                </UButton>
            </div>
        </UContainer>
    </UContainer>
</template>