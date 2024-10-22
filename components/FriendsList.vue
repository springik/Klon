<script setup lang="ts">
    const friends = ref([])

    const emit = defineEmits(['friendClicked'])

    const onFriendClick = (friend : object) => {
        emit('friendClicked', friend)
    }

    onMounted(async () => {
        friends.value = [
            { id: 1, name: 'user1', online: true, avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocK8ZZV7yW6bEHGe1EVa9uZnZ2ZGfsd_hbBJM67zbRxe9et7GRsP=s96-c'},
            { id: 2, name: 'user2', online: false, avatarUrl: 'https://avatars.githubusercontent.com/u/95045384?v=4'}
        ]
    })
</script>

<template>
    <div class="p-4 border-l border-gray-700 w-full h-full">
        <h2 class="text-white text-lg font-semibold mb-2">Friends</h2>
        <ul>
            <li v-for="friend in friends" :key="friend.id" class="py-2 border-b border-gray-500 last:border-b-0 flex items-center cursor-pointer" @click.prevent="onFriendClick(friend)">
                <UChip inset position="bottom-left" size="md" :color="friend.online ? 'green' : 'red'">
                    <UAvatar :src="friend.avatarUrl" :alt="friend.name +'s Avatar'" />
                </UChip>
                <span class="text-white antialiased font-semibold ml-2 text-center mb-1">
                    {{ friend.name }}
                </span>
            </li>
        </ul>
    </div>
</template>
