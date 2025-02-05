<script setup lang="ts">
import { UButton } from '#components'


const props = defineProps({
    message: Object
})
const emit = defineEmits(['editMessage', 'deleteMessage'])

    const { session } = useUserSession()
    const { $socket } = useNuxtApp()

    const isBeingEdited = ref(false)
    const messageValue = ref(props.message?.content || '')
    const previousMessage = ref('')

    const postTime = computed(() => {
        const date = new Date(props.message.createdAt)
        return `${date.getHours()}:${date.getMinutes()}`
    })
    const editedTime = computed(() => {
        const date = new Date(props.message.updatedAt)
        return `Edited: ${date.getHours()}:${date.getMinutes()}`
    })
    const edited = computed(() => {
        return props.message.updatedAt > props.message.createdAt
    })
    const messageColor = computed(() => {
        return props.message.author.id === session.value.user.id ? 'bg-primary-400 dark:bg-primary-800' : 'bg-gray-400 dark:bg-gray-800'
    })

    const startEditingMessage = () => {
        previousMessage.value = unref(messageValue)
        isBeingEdited.value = true
    }
    const editMessage = () => {
        isBeingEdited.value = false

        emit('editMessage', props.message?.id, messageValue.value)
    }
    const stopEditing = () => {
        isBeingEdited.value = false
        messageValue.value = unref(previousMessage)
    }
    const deleteMessage = () => {
        console.log('Deleting message');
        emit('deleteMessage', props.message.id)
    }
    const isImage = (attachment) => {
        const imageExtensions = ['jpg', 'png', 'jpeg', 'gif', 'bmp', 'webp']
        return imageExtensions.some(ext => attachment.contentUrl.toLowerCase().endsWith(`.${ext}`))
    }
    const getFileName = (contentUrl) => {
        const parts = contentUrl.split('/')
        const fileNameWithExtension = parts[parts.length - 1]
        const fileName = fileNameWithExtension.split('.')[0]
        return fileNameWithExtension
    }
    const hasImageAttachment = computed(() => {
        return props?.message?.attachments.some(attachment => isImage(attachment))
    })
    const voteForOption = (pollId: string, optionIndex: number) => {
        console.log('Voting for option', pollId, optionIndex);
        $socket.emit('vote-in-poll', { pollId, option: optionIndex })
    }
    const votedAlready = computed(() => {
        if(!props?.message?.voted) return false
        return props.message.voted !== null
    })
    const deletePoll = (pollId: string) => {
        console.log('Deleting poll', pollId);
        $socket.emit('delete-poll', { pollId })
    }



    onMounted(() => {
        
    })

</script>

<template>
<li class="py-2 px-1 flex items-center hover:bg-gray-900 relative">
    <UCard v-if="!message?.question" :ui="{ divide: 'dark:divide-none divide-none divide-transparent divide-y-0', base: 'border-none', body: { padding: 'px-1 py-1 sm:p-2' }, header: { padding: 'px-1 py-1 sm:p-2' }, footer: { padding: 'px-1 py-1 sm:p-2' }, background: 'bg-transparent dark:bg-transparent', ring: 'dark:ring-transparent ring-transparent' }">
        <template #header>
            <div class="flex items-center">
                <UAvatar :src="message.author.avatarUrl" :alt="message.author.name" />
                <span class="text-white antialiased font-semibold ml-2 text-center mb-1">
                    {{ message.author.username }}
                </span>
            </div>
        </template>
        <UTextarea v-if="message?.content" :resize="false" autoresize :disabled="!isBeingEdited"  :model-modifiers="{ trim: true }" :padded="true" variant="none" :ui="{ base: messageColor }" v-model="messageValue"/>
        <ul class="flex flex-row gap-2" v-if="props.message.attachments">
            <li v-for="file in props.message.attachments">
                <div v-if="isImage(file)">
                    <img class="w-24 h-24 rounded-lg mt-2" :src="file.contentUrl" :alt="file.name + '.' + file.extension">
                </div>
                <span v-else>
                    <a class="text-green-400" target="_blank" :href="file.contentUrl">
                        {{ getFileName(file.contentUrl) }}
                    </a>
                </span>
            </li>
        </ul>
        <template #footer>
            <div class="flex justify-between items-center lg:gap-2">
                <span class="mb-1 mx-1 text-white">{{ postTime }}</span>
                <span v-show="edited" class="mb-1 mx-1 lg:mx-2 text-nowrap font-light">{{ editedTime }}</span>
                <div class="gap-2 flex">
                <UButton @click="startEditingMessage" label="Edit" v-if="session.user.id == message.author.id && !isBeingEdited">
                    <UIcon class="w-5 h-5" name="si:edit-simple-line" />
                </UButton>
                <UButton @click="editMessage" label="Save" v-if="session.user.id == message.author.id && isBeingEdited">
                    <UIcon class="w-5 h-5" name="si:check-fill" />
                </UButton>
                <UButton @click="stopEditing" label="Cancel" v-if="session.user.id == message.author.id && isBeingEdited">
                    <UIcon class="w-5 h-5" name="si:close-circle-line" />
                </UButton>
                <UButton label="Delete" @click="deleteMessage" v-if="session.user.id == message.author.id">
                    <UIcon class="w-5 h-5" name="si:archive-alt-line" />
                </UButton>
                </div>
            </div>
        </template>
    </UCard>
    <UCard v-else :ui="{ divide: 'dark:divide-none divide-none divide-transparent divide-y-0', base: 'border-none', body: { padding: 'px-1 py-1 sm:p-2' }, header: { padding: 'px-1 py-1 sm:p-2' }, footer: { padding: 'px-1 py-1 sm:p-2' }, background: 'bg-transparent dark:bg-transparent', ring: 'dark:ring-transparent ring-transparent' }">
        <template #header>
            <h2>
                {{ message.question }}
            </h2>
        </template>

        <ul>
            <li v-for="(option, index) in message.options" :key="index">
                <UButton :variant="message.voted.option === index ? 'solid' : 'outline'" block @click="voteForOption(message.id, index)" :label="option" />
                <UProgress v-if="votedAlready" :max="message.totalVotes ?? 0" :value="message.optionCounts[index]?.count ?? 0" />
            </li>
        </ul>

        <template #footer>
            <div>
                <p>
                    {{  message.totalVotes }} votes
                </p>
                <UButton icon="si:archive-alt-line" @click="deletePoll(message.id)" />
            </div>
        </template>
    </UCard>
</li>
</template>