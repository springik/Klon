<script setup lang="ts">
    const props = defineProps({
        friend: Object
    })

    const messages = ref([])
    
    const emit = defineEmits(['goBack'])

    const goBack = () => {
        emit('goBack')
    }
    const sendMessage = () => {
        console.log("sending message");
    }

    onMounted(() => {
        messages.value = [
            { id: 1, content: 'hey', author: { id: 1, name: 'foo', avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocK8ZZV7yW6bEHGe1EVa9uZnZ2ZGfsd_hbBJM67zbRxe9et7GRsP=s96-c'} },
            { id: 2, content: 'hello there', author: { id: 2, name: 'bar', avatarUrl: 'https://avatars.githubusercontent.com/u/95045384?v=4'} }
        ]
    })
</script>

<template>
    <UContainer v-if="friend" class="border-l border-gray-700 w-full h-full relative">
        <div class="flex items-start justify-items-center mb-2 gap-x-2 fixed mt-2 lg:mt-0">
            <UButton size="md" label="Go back" :ui="{ rounded: 'rounded-full' }" @click="goBack" />
            <h3 class="mt-1">
                    Chat with {{ friend.name  }}
            </h3>
        </div>
        <ul class="flex flex-col-reverse h-5/6 overflow-y-auto">
            <li v-for="message in messages" :key="message.id" class="py-2 flex items-center">
                <div>
                    <UAvatar :src="message.author.avatarUrl" :alt="message.author.name" />
                </div>
                <span class="text-white antialiased font-semibold ml-2 text-center mb-1">
                        {{ message.author.name }}
                </span>
                <span class="rounded-full bg-green-400 px-3 py-1.5 text-black antialiased font-medium ml-2 text-center mb-1">
                    {{ message.content }}
                </span>
            </li>
        </ul>
        <UContainer class="w-11/12 lg:w-full mb-2">
            <div class="flex">
                <UTextarea class="w-full" rows="1" size="xl" placeholder="Chat..." variant="outline" :model-modifiers="{ trim: true }" />
                <UButton class="cursor-pointer" label="Send message" size="md" @click="sendMessage" />
            </div>
        </UContainer>
    </UContainer>
</template>

<style>
.h-nine-tenth {
    height: 90%;
}
.h-one-tenth {
    height: 10%;
}
</style>