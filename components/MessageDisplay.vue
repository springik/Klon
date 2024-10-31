<script setup lang="ts">
import type { c } from '@vite-pwa/assets-generator/dist/shared/assets-generator.5e51fd40.mjs';
import { useMouse, useWindowScroll } from '@vueuse/core'

const props = defineProps({
    message: Object
})
const emit = defineEmits(['editMessage'])

    const { x, y } = useMouse()
    const { y: windowY } = useWindowScroll()

    const isOpen = ref(false)
    const virtualElement = ref({ getBoundingClientRect: () => ({}) })
    const isBeingEdited = ref(false)
    const editSpan = ref<HTMLElement | null>(null)
    const content = ref(props.message?.content || '')

    const postTime = computed(() => {
        const date = new Date(props.message.createdAt)
        return `${date.getHours()}:${date.getMinutes()}`
    })

    const startEditingMessage = () => {
        isBeingEdited.value = true
    }
    const editMessage = () => {
        isBeingEdited.value = false
        console.log(editSpan.value?.innerText);

        emit('editMessage', props.message?.id, editSpan.value?.innerText)
    }

    const onContextMenu = () => {
        const top = unref(y) - unref(windowY)
        const left = unref(x)

        virtualElement.value.getBoundingClientRect = () => ({
            top,
            left,
            width: 0,
            height: 0
        })

        isOpen.value = true
    }
</script>

<template>
<li class="py-2 px-1 flex items-center hover:bg-gray-900 relative" @contextmenu.prevent="onContextMenu">
            <span class="mb-1 mx-1">{{ postTime }}</span>
            <div>
                <UAvatar :src="message.author.avatarUrl" :alt="message.author.name" />
            </div>
            <span class="text-white antialiased font-semibold ml-2 text-center mb-1">
                    {{ message.author.name }}
            </span>
            <div class="ml-2 lg:ml-1.5 rounded-3xl bg-green-400 text-center max-w-[80%] lg:min-w-20">
                <span class="break-words px-3 py-1.5 text-black antialiased font-medium w-full">
                    <span ref="editSpan" :contenteditable="isBeingEdited" class="whitespace-pre-wrap indent-0 text-center m-0 p-0 inline-block">
                        {{ message.content }}
                    </span>
                    <UButton v-if="isBeingEdited" @click="editMessage" variant="soft" class="absolute right-0">
                        <span class="text-white">
                            Finish Editing
                        </span>
                    </UButton>
                </span>
            </div>

            <UContextMenu v-model="isOpen" :virtual-element="virtualElement" class="p-4 z-10">
                <UButton label="Edit" @click="startEditingMessage()"></UButton>
                <UButton label="Delete"></UButton>
                <UButton label="Close"></UButton>
            </UContextMenu>
        </li>
</template>

<style>
[contenteditable="true"] {
    outline: none;
    cursor: text;
}
</style>