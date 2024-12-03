<script setup lang="ts">
    const props = defineProps({
        conversation: Object
    })
    const messages = ref([])
    const messageInput = ref('')
    const loading = ref<boolean>(false)
    const messageAttachments = ref<{ file : File, name : string, extension : string }[] | null>(null)
    const fileInput = ref<HTMLInputElement | null>(null)

    const emit = defineEmits(['goBack'])

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
        $socket.emit('send-message', { content: messageInput.value, conversationId: props.conversation.id, receiverId: null, attachment: messageAttachments.value })
        messageInput.value = ''
        messageAttachments.value = null
    }
    const addAttachment = () => {
        fileInput.value?.click()
    }
    const removeAttachment = (name: string) => {
        messageAttachments.value = unref(messageAttachments)?.filter(f => f.name !== name) || null
    }
    const handleFileChange = (event: Event) => {
        const input = event.target as HTMLInputElement
        if(input.files && input.files.length > 0) {
            messageAttachments.value = Array.from(input.files).map(file => ({
            file,
            name: file.name.split('.').slice(0, -1).join('.'),
            extension: file.name.split('.').pop() || ''
            }));
        }
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
    const goBack = () => {
        console.log('going back');
        emit('goBack')
    }
    const isImage = (attachment) => {
        const imageExtensions = ['jpg', 'png', 'jpeg', 'gif', 'bmp', 'webp']
        return imageExtensions.includes(attachment.extension.toLowerCase())
    }
    const attachmentSrc = (attachment) => {
        console.log(attachment);
        return URL.createObjectURL(attachment.file)
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
    <UContainer v-if="conversation" class="w-full h-full">
        <div class="rounded-3xl z-10 flex items-start justify-items-center mb-2 gap-x-2 fixed lg:mt-0 p-4 backdrop-blur-sm">
            <UButton size="md" label="Go back" :ui="{ rounded: 'rounded-full' }" @click="goBack">
                <UIcon class="w-5 h-5" name="si:arrow-left-circle-line" />
            </UButton>
            <h3 class="mt-1">
                    {{ conversation.name  }}
            </h3>
        </div>
        <ul class="flex flex-col-reverse h-5/6 overflow-y-auto">
            <MessageDisplay @deleteMessage="onDeleteMessage" @editMessage="onEditMessage" v-for="message in sortedMessages"  :message="message" :key="message.id"></MessageDisplay>
        </ul>
        <UContainer class="w-11/12 lg:w-full mb-2 relative">
            <div v-if="messageAttachments && messageAttachments.length > 0" class="mb-2 absolute lg:bottom-[3rem] bottom-[3rem] left-0 w-full bg-gray-800 p-2 rounded-lg z-10">
                <h4 class="text-white text-md">Attachments:</h4>
                <ul class="overflow-y-auto">
                    <li v-for="file in messageAttachments" :key="file.name" class="text-white flex flex-row">
                        <div v-if="isImage(file)">
                            <img class="w-24 h-24" :src="attachmentSrc(file)" :alt="file.name + '.' +file.extension">
                        </div>
                        <span v-else>
                            {{ file.name + '.' +file.extension }}
                        </span>
                        <UButton @click="removeAttachment(file.name)" variant="ghost" label="Remove">
                            <UIcon name="si:close-circle-line" />
                        </UButton>
                    </li>
                </ul>
            </div>
            <div class="flex">
                <UButton @click="addAttachment" label="Add attachment">
                    <UIcon class="w-5 h-5" name="si:add-circle-line" />
                </UButton>
                <input multiple accept="image/webp, image/jpeg, image/png, .docx, .pdf, .pptx, .txt, text/*" type="file" ref="fileInput" class="hidden" @change="handleFileChange">
                <UTextarea autoresize v-model="messageInput" class="w-full" :rows="1" size="xl" :maxrows="3" placeholder="Chat..." variant="outline" :model-modifiers="{ trim: true }"/>
                <UButton :loading="loading" class="cursor-pointer" label="Send message" size="md" @click="sendMessage">
                    <UIcon class="w-5 h-5" name="si:north-east-circle-line" />
                </UButton>
            </div>
        </UContainer>
    </UContainer>
</template>