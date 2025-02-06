<script setup lang="ts">
    import { UButton } from '#components'
import { useRouter } from '#vue-router'


    const props = defineProps({
        friend: Object
    })
    const messages = ref([])
    const messageInput = ref('')
    const loading = ref<boolean>(false)
    const messageAttachments = ref<{ file : File, name : string, extension : string }[] | null>(null)
    const fileInput = ref<HTMLInputElement | null>(null)
    const gifUiOpen = ref<boolean>(false)
    const gifs = ref<object[]>([])
    const gifCategories = ref<object[]>([])
    const categoryGifs = ref<object>({}) // like a map
    //@ts-expect-error
    const gifUiStage = ref<GifUiStage>('CHOOSING_CATEGORY')
    const chosenCategory = ref<object | null>(null)
    const gifSearch = ref<string>('')
    
    const emit = defineEmits(['goBack'])

    const { $socket } = useNuxtApp()
    const router = useRouter()

    const sortedMessages = computed(() => {
        return messages.value.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    })
    const attachmentSrc = (attachment) => {
        console.log(attachment);
        return URL.createObjectURL(attachment.file)
    }
    const openGifUi = async () => {
        const { data, error } = await useFetch('/api/tenor/trending')
        if(error.value) {
            console.error(error.value)
            return
        }
        console.log(data.value);
        gifCategories.value = data.value
        // @ts-expect-error
        gifUiStage.value = 'CHOOSING_CATEGORY'
        gifUiOpen.value = true
    }
    const chooseGifCategory = async (category: object) => {
        const { data, error } = await useFetch(`/api/tenor/getGifsForCategory?searchterm=${category.searchterm}`)
        if(error.value) {
            console.error(error.value)
            return
        }
        console.log(data.value);
        // @ts-expect-error
        categoryGifs.value = data.value.gifs
        // @ts-expect-error
        gifUiStage.value = 'CHOOSING_GIF'
        chosenCategory.value = category

    }
    const sendGif = (gif: object) => {
        console.log(gif);
        const gifUrl = gif.media_formats.gif.url

        $socket.emit('send-gif-to-friend', { gifUrl, receiverId: props.friend.id })
    }
    const closeGifUi = () => {
        gifUiOpen.value = false
        // @ts-expect-error
        gifUiStage.value = 'CHOOSING_CATEGORY'
    }
    const goBackInGifUi = () => {
        if(gifUiStage.value === 'CHOOSING_GIF') {
            // @ts-expect-error
            gifUiStage.value = 'CHOOSING_CATEGORY'
            chosenCategory.value = null
            categoryGifs.value = []
        } else if(gifUiStage.value === 'SEARCHING_GIF') {
            // @ts-expect-error
            gifUiStage.value = 'CHOOSING_CATEGORY'
            gifs.value = []
        }
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
    const goBack = () => {
        emit('goBack')
    }
    const callFriend = () => {
        console.log('Calling friend');
        router.push('/friends/' + props.friend.id + '/initiate')
    }
    const sendMessage = () => {
        console.log("sending message");
        loading.value = true
        if(messageInput.value === '' && !messageAttachments.value || messageAttachments.value?.length === 0)
            return
        $socket.emit('send-message', { content: messageInput.value, receiverId: props.friend.id, conversationId: null, attachment: messageAttachments.value })
        messageInput.value = ''
        messageAttachments.value = null
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
    const isImage = (attachment) => {
        const imageExtensions = ['jpg', 'png', 'jpeg', 'gif', 'bmp', 'webp']
        return imageExtensions.includes(attachment.extension.toLowerCase())
    }

    onMounted(() => {
        $socket.on('messages', (data) => {
            console.log(data);
            messages.value = data
            console.log('Received messages');
        })
        $socket.on('message', (message) => {
            loading.value = false
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
        <div class="rounded-3xl z-10 flex items-start justify-items-center mb-2 gap-x-2 fixed mt-2 lg:mt-0 backdrop-blur-sm p-4">
            <UButton size="md" label="Go back" :ui="{ rounded: 'rounded-full' }" @click="goBack">
                <UIcon class="w-5 h-5" name="si:arrow-left-circle-line" />
            </UButton>
            <h3 class="mt-1">
                    Chat with {{ friend.username  }}
            </h3>
            <UButton label="Call" @click="callFriend" />
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
                            <img class="w-24 h-24" :src="attachmentSrc(file)" :alt="file.name + '.' + file.extension">
                        </div>
                        <span v-else>
                            {{ file.name + '.' + file.extension }}
                        </span>
                        <UButton @click="removeAttachment(file.name)" variant="ghost" label="Remove">
                            <UIcon name="si:close-circle-line" />
                        </UButton>
                    </li>
                </ul>
            </div>
            <div class="flex">
                <UPopover @update:open="closeGifUi" overlay :popper="{ placement: 'top-start', offsetDistance: 0 }" :ui="{ background: 'bg-gray-800', border: 'border-none', rounded: 'rounded-lg' }">
                    <UButton label="+">
                        <UIcon class="w-8 h-8" name="si:add-circle-line" />
                    </UButton>
                    <template v-if="!gifUiOpen" #panel>
                        <div class="flex flex-col gap-y-2 bg-gray-800 p-2 rounded-lg">
                            <UButton block @click="openGifUi" label="Share gif" trailing-icon="si:window-line" />
                            <UButton block @click="addAttachment" label="Add attachment" trailing-icon="si:file-upload-fill">
                            </UButton>
                        </div>
                    </template>
                    <template v-else #panel>
                        <div class="flex flex-row p-2 rounded-lg">
                            <UButton variant="ghost" v-if="gifUiStage != 'CHOOSING_CATEGORY'" @click="goBackInGifUi" trailing-icon="si:arrow-left-line" />
                            <UButton variant="ghost" v-else @click="closeGifUi" trailing-icon="si:close-circle-line" />
                            <UInput class="flex-1" v-model="gifSearch" placeholder="Search gifs" leading-icon="si:search-line" />
                        </div>
                        <div class="grid grid-cols-2 gap-4 p-2 rounded-lg overflow-y-auto h-64">
                            <div v-if="gifUiStage == 'CHOOSING_CATEGORY'" @click="chooseGifCategory(category)" v-for="category in gifCategories" :key="category.name" class="relative cursor-pointer lg:h-48 h-32 lg:w-48 w-32">
                                <img class="lg:h-48 h-32 lg:w-48 w-32" :src="category.image" :alt="category.name" />
                                <div class="uppercase text-center absolute bottom-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    {{ category.searchterm }}
                                </div>
                            </div>
                            <div v-else-if="gifUiStage == 'CHOOSING_GIF'" v-for="gif in categoryGifs" :key="gif.id" class="cursor-pointer lg:h-48 h-32 lg:w-48 w-32">
                                <img class="lg:h-48 h-32 lg:w-48 w-32" :src="gif.media_formats.gif.url" :alt="gif.title" @click="sendGif(gif)" />
                            </div>
                            <div v-else-if="gifUiStage == 'SEARCHING_GIF'" v-for="gif in gifs" :key="`search-${gif.id}`" class="cursor-pointer lg:h-48 h-32 lg:w-48 w-32">
                                <img class="lg:h-48 h-32 lg:w-48 w-32" :src="gif.media_formats.gif.url" :alt="gif.title" @click="sendGif(gif)" />
                            </div>
                        </div>
                    </template>
                </UPopover>
                <input multiple accept="image/webp, image/jpeg, image/png, .docx, .pdf, .pptx, .txt, text/*" type="file" ref="fileInput" class="hidden" @change="handleFileChange">
                <UTextarea autoresize v-model="messageInput" class="w-full" :rows="1" size="xl" :maxrows="3" placeholder="Chat..." variant="outline" :model-modifiers="{ trim: true }"/>
                <UButton :loading="loading" class="cursor-pointer" label="Send message" size="md" @click="sendMessage">
                    <UIcon class="w-5 h-5" name="si:north-east-circle-line" />
                </UButton>
            </div>
        </UContainer>
    </UContainer>
</template>