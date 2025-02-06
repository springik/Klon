<script setup lang="ts">
import { UPopover } from '#components'
import { log } from 'console'

    const props = defineProps({
        conversation: Object
    })
    const messages = ref([])
    const messageInput = ref('')
    const loading = ref<boolean>(false)
    const messageAttachments = ref<{ file : File, name : string, extension : string }[] | null>(null)
    const fileInput = ref<HTMLInputElement | null>(null)
    const creatingPoll = ref<boolean>(false)
    const question = ref<string>('')
    const options = ref<string[]>([])
    const optionsCount = ref<string[]>(['1', '2', '3'])
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

    const sortedMessages = computed(() => {
        if(!props.conversation)
            return []
        if(!props.conversation.messages || props.conversation.messages.length === 0 || !props.conversation.polls || props.conversation.polls.length === 0)
            return []
        const combined = [...props.conversation.messages, ...props.conversation.polls]
        return combined.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    })
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

        $socket.emit('send-gif-to-conversation', { gifUrl, conversationId: props.conversation.id })
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

    const sendMessage = () => {
        console.log("sending message");
        loading.value = true
        if(messageInput.value === '' && !messageAttachments.value || messageAttachments.value.length === 0)
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
    const createPoll = () => {
        console.log('creating poll');
        creatingPoll.value = true
    }
    const addOption = () => {
        optionsCount.value.push((optionsCount.value.length + 1).toString())
    }
    const changeOptionValue = (event: InputEvent, index: number) => {
        console.log('changing option value');
        //console.log('event', event);
        options.value[index] = (event.target as HTMLInputElement).value
    }
    const cancelPollCreation = () => {
        creatingPoll.value = false
        question.value = ''
        options.value = []
    }
    const finalisePoll = () => {
        console.log('finalising poll');
        creatingPoll.value = false
        $socket.emit('create-poll', { serverId: props.conversation?.serverId, conversationId: props.conversation?.id, poll: { question: question.value, options: options.value } })
    }
    const removeOption = (index: number) => {
        optionsCount.value.splice(index, 1)
        options.value.splice(index, 1)
    }

    onMounted(() => {
        $socket.on('message', (message) => {
            console.log('message received');
            console.log(message);
            if(message.conversationId !== props.conversation.id) {
                loading.value = false
                return
            }
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
        $socket.on('poll-deleted', (pollId: string) => {
            props.conversation.polls = props?.conversation?.polls?.filter(p => p.id !== pollId)
        })
        $socket.on('poll-voted', async (data: { pollEntry: object, lastOption: number | null}) => {
            log('last option', data.lastOption);
            props.conversation?.polls?.forEach(p => {
                if(!p || !p.optionCounts)
                    return
                if(p.id !== data.pollEntry.pollId)
                    return

                if(!p.voted)
                    p.totalVotes++

                p.voted = data.pollEntry
                if(!p.optionCounts[data.pollEntry.option]) {
                    p.optionCounts[data.pollEntry.option] = { count: 1, option: data.pollEntry.option }
                    log('last option entry did not exist before', data.lastOption);
                    if(data.lastOption)
                        p.optionCounts[data.lastOption].count--
                }
                else {
                    p.optionCounts[data.pollEntry.option].count++
                    log('last option already existed entry', data.lastOption);
                    p.optionCounts[data.lastOption].count--
                }
            });
            await nextTick()
        })
        $socket.on('poll-vote', async (data: { pollId: string, option: number, lastOption: number | null }) => {
            log('last option', data.lastOption);
            const poll = props.conversation?.polls?.find(p => p.id === data.pollId)
            if(!data.lastOption)
                poll.optionCounts[data.option].count++
            else {
                poll.optionCounts[data.option].count++
                poll.optionCounts[data.lastOption].count--
            }

            await nextTick()
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
                <UPopover @update:open="closeGifUi" overlay :popper="{ placement: 'top-start', offsetDistance: 0 }" :ui="{ background: 'bg-gray-800', border: 'border-none', rounded: 'rounded-lg' }">
                    <UButton label="+">
                        <UIcon class="w-8 h-8" name="si:add-circle-line" />
                    </UButton>
                    <template v-if="!gifUiOpen" #panel>
                        <div class="flex flex-col gap-y-2 bg-gray-800 p-2 rounded-lg">
                            <UButton block @click="createPoll" label="Create poll" trailing-icon="si:dashboard-customize-duotone">
                            </UButton>
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
                    <UIcon class="w-8 h-8" name="si:north-east-circle-line" />
                </UButton>
            </div>
        </UContainer>
        <UModal v-model="creatingPoll" class="bg-gray-800 p-6" :ui="{ rounded: 'rounded-lg' }">
            <UCard :ui="{ rounded: 'rounded-lg', divide: 'divide-none' }">
                <template #header>
                    <h3 class="text-lg">Create poll</h3>
                </template>
                <label for="question-input">Question</label>
                <UInput v-model="question" name="question-input" size="xl" />
                <ul class="overflow-y-auto my-1 mx-2 flex flex-col gap-y-4">
                    <li class="flex justify-center items-center gap-x-2" v-for="(option, index) in optionsCount" :key="index">
                        <div class="flex-1">
                            <label :for="option + index">Option {{ index + 1 }}</label>
                            <UInput v-model="options[index]" @input="changeOptionValue($event, index)" :name="option + index" />
                        </div>
                        <div class="mt-6">
                            <UButton @click="removeOption(index)" icon="si:close-circle-line" />
                        </div>
                    </li>
                    <li>
                        <UButton block @click="addOption" label="Add option" />
                    </li>
                </ul>

                <template #footer>
                    <div class="flex gap-x-2 justify-between">
                        <UButton @click="cancelPollCreation" label="Cancel" />
                        <UButton @click="finalisePoll" label="Create" />
                    </div>
                </template>
            </UCard>
        </UModal>
    </UContainer>
</template>