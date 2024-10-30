<script setup lang="ts">
    const props = defineProps({
        friend: Object
    })
    const messages = ref([])
    
    const emit = defineEmits(['goBack'])

    const { $socket } = useNuxtApp()

    const goBack = () => {
        emit('goBack')
    }
    const sendMessage = () => {
        console.log("sending message");
    }
    const onEditMessage = (messageId: string, newContent: string) => {
        const message = messages.value.find(m => m.id === messageId)
        message.content = newContent
    }

    onMounted(() => {
        $socket.on('messages', (data) => {
            console.log(data);
            messages.value = data
            console.log('Received messages');
        })
        $socket.emit('request-messages', props.friend.id)
    })

    onBeforeUnmount(() => {
        $socket.off('messages')
    })
</script>

<template>
    <UContainer v-if="friend" class="border-l border-gray-700 w-full h-full relative">
        <div class="flex items-start justify-items-center mb-2 gap-x-2 fixed mt-2 lg:mt-0">
            <UButton size="md" label="Go back" :ui="{ rounded: 'rounded-full' }" @click="goBack" />
            <h3 class="mt-1">
                    Chat with {{ friend.username  }}
            </h3>
        </div>
        <ul class="flex flex-col-reverse h-5/6 overflow-y-auto">
            <MessageDisplay @editMessage="onEditMessage" v-for="message in messages"  :message="message" :key="message.id"></MessageDisplay>
        </ul>
        <UContainer class="w-11/12 lg:w-full mb-2">
            <div class="flex">
                <UTextarea class="w-full" :rows="1" size="xl" placeholder="Chat..." variant="outline" :model-modifiers="{ trim: true }"/>
                <UButton class="cursor-pointer" label="Send message" size="md" @click="sendMessage" />
            </div>
        </UContainer>
    </UContainer>
</template>