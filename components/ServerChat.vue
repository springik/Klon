<script setup lang="ts">
    const props = defineProps({
        conversation: Object
    })
    const messages = ref([])
    const messageInput = ref('')
    const loading = ref<boolean>(false)

    const { $socket } = useNuxtApp()

    const sortedMessages = computed(() => {
        if(!props.conversation)
            return []
        if(!props.conversation.messages || props.conversation.messages.length === 0)
            return []
        return props?.conversation?.messages.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    })

    const sendMessage = () => {
        console.log("sending message");
        loading.value = true
        if(messageInput.value === '')
            return
        $socket.emit('send-message', { content: messageInput.value, conversationId: props.conversation.id, receiverId: null })
        messageInput.value = ''
    }
    const onEditMessage = (messageId: string, newContent: string) => {
        const message = props.conversation?.messages.find(m => m.id === messageId)
        message.content = newContent
        $socket.emit('edit-message', { messageId, newContent })
    }
    const onDeleteMessage = (messageId: string) => {
        props.conversation.messages = props.conversation.messages.filter(m => m.id !== messageId)
        console.log('Deleting message');
        $socket.emit('delete-message', messageId)
    }

    onMounted(() => {
        $socket.on('message', (message) => {
            console.log(message);
            if(message.conversationId !== props.conversation.id)
                return
            props.conversation.messages.push(message)
            loading.value = false
        })
        $socket.on('message-deleted', (messageId) => {
            props.conversation.messages = messages.value.filter(m => m.id !== messageId)
        })
        $socket.on('message-edited', (message) => {
            const index = props.conversation.messages.findIndex(m => m.id === message.id)
            props.conversation.messages[index].content = message.content
            props.conversation.messages[index].updatedAt = message.updatedAt
        })
    })

    onBeforeUnmount(() => {
        $socket.off('message')
        $socket.off('message-deleted')
        $socket.off('message-edited')
    })
</script>

<template>
    <UContainer v-if="conversation" class="w-full h-full relative">
        <div class="z-10 flex items-start justify-items-center mb-2 gap-x-2 fixed mt-2 lg:mt-0 ml-8 p-4">
            <h3 class="mt-1">
                    Chat with {{ conversation.name  }}
            </h3>
        </div>
        <ul class="flex flex-col-reverse h-5/6 overflow-y-auto">
            <MessageDisplay @deleteMessage="onDeleteMessage" @editMessage="onEditMessage" v-for="message in sortedMessages"  :message="message" :key="message.id"></MessageDisplay>
        </ul>
        <UContainer class="w-11/12 lg:w-full mb-2">
            <div class="flex">
                <UTextarea autoresize v-model="messageInput" class="w-full" :rows="1" size="xl" :maxrows="3" placeholder="Chat..." variant="outline" :model-modifiers="{ trim: true }"/>
                <UButton :loading="loading" class="cursor-pointer" label="Send message" size="md" @click="sendMessage">
                    <UIcon class="w-5 h-5" name="si:north-east-circle-line" />
                </UButton>
            </div>
        </UContainer>
    </UContainer>
</template>