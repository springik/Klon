<script setup lang="ts">

const props = defineProps({
    message: Object
})
const emit = defineEmits(['editMessage', 'deleteMessage'])

    const { session } = useUserSession()

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

    onMounted(() => {
        //console.log(session.value.user);
    })

</script>

<template>
<li class="py-2 px-1 flex items-center hover:bg-gray-900 relative">
    <UCard :ui="{ divide: 'dark:divide-none divide-none divide-transparent divide-y-0', base: 'border-none', body: { padding: 'px-1 py-1 sm:p-2' }, header: { padding: 'px-1 py-1 sm:p-2' }, footer: { padding: 'px-1 py-1 sm:p-2' }, background: 'bg-transparent dark:bg-transparent', ring: 'dark:ring-transparent ring-transparent' }">
        <template #header>
            <div class="flex items-center">
                <UAvatar :src="message.author.avatarUrl" :alt="message.author.name" />
                <span class="text-white antialiased font-semibold ml-2 text-center mb-1">
                    {{ message.author.username }}
                </span>
            </div>
        </template>
        <UTextarea :resize="false" autoresize :disabled="!isBeingEdited"  :model-modifiers="{ trim: true }" :padded="true" variant="none" :ui="{ base: messageColor }" v-model="messageValue"/>
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
</li>
</template>