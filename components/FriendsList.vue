<script setup lang="ts">
    //import { io } from 'socket.io-client'

    const friends = ref([])
    const isOpen = ref(false)
    const friendEmail = ref('')
    const friendLink = ref('')

    const emit = defineEmits(['friendClicked'])

    const { $socket } = useNuxtApp()

    const openAddModal = async () => {
        isOpen.value = true
        //request the link
        try {
            const response = await $fetch('/api/friends/url', {
                    method: 'GET'
                })
                friendLink.value = response?.body?.url
        } catch (error) {
            console.error(error);
            friendLink.value = ''
        }
    }
    const onFriendClick = (friend : object) => {
        emit('friendClicked', friend)
    }
    const addFriend = () => {
        console.log('Add friend')
        $socket.emit('add-friend', friendEmail.value)
    }
    const removeFriend = (friendId : string) => {
        console.log('Remove friend')
        $socket.emit('remove-friend', friendId)
        friends.value = friends.value.filter(friend => friend.id !== friendId)
    }
    const copyFriendLink = () => {
        if(friendLink.value === '')
            return
        navigator.clipboard.writeText(friendLink.value)
    }

    onMounted(async () => {
        console.log($socket.id);
        $socket.on('friends-list', (friendsList) => {
            console.log('Receiving friends');
            
            friends.value = friendsList
        })
        $socket.on('friend-added', (data) => {
            console.log('Friend added', data);
            friends.value.push(data)
        })

        $socket.emit('request-friends')
    })
    onBeforeUnmount(() => {
        $socket.off('friends-list')
        $socket.off('friend-added')
    })
</script>

<template>
    <div class="p-4 border-l border-gray-700 w-full h-full">
        <h2 class="text-white text-lg font-semibold mb-2">Friends
            <UButton @click="openAddModal" label="Add">
            <UIcon class="w-5 h-5" name="si:add-circle-line" />
        </UButton></h2>
        <UModal v-model="isOpen">
            <UCard>
                <template #header>
                    Add Friend
                </template>
                <UInput v-model="friendEmail" placeholder="Enter friend's email" />
                <UDivider class="my-4" label="OR" />
                <div class="flex flex-col">
            <h3 class="text-lg">
                Send your friends a link!
            </h3>
            <div class="flex border-green-400 border rounded-lg w-fit justify-between">
                <UInput variant="none" class="w-full" disabled color="primary" v-model="friendLink" :ui="{ base: 'disabled:cursor-text overflow-x-hidden', trailing: { '2xs': 'pe-0', xs: 'pe-0', sm: 'pe-0', md: 'pe-0', lg: 'pe-0', xl: 'pe-0' } }">
                </UInput>
                <UButton @click.prevent="copyFriendLink" label="Copy">
                    <UIcon name="si:clipboard-alt-line" class="z-10 w-5 h-5" />
                </UButton>
            </div>
            
        </div>
                <template #footer>
                    <UButton @click="addFriend">Add</UButton>
                </template>
            </UCard>
        </UModal>
        <ul>
            <li v-for="friend in friends" :key="friend.id" class="py-2 border-b border-gray-500 last:border-b-0 flex items-center justify-between lg:justify-normal lg:gap-4 cursor-pointer" @click.prevent="onFriendClick(friend)">
                <div class="flex items-center justify-center">
                        <!--<UChip inset position="bottom-left" size="md" :color="friend.online ? 'green' : 'red'">-->
                            <UAvatar :src="friend.avatarUrl" :alt="friend.username +'s Avatar'" />
                    <!--</UChip>-->
                    <span class="text-white antialiased font-semibold ml-2 text-center mb-1.5">
                        {{ friend.username }}
                    </span>
                </div>
                
                <UButton label="Remove" @click.stop="removeFriend(friend.id)" variant="outline" color="red">
                    <UIcon class="w-5 h-5" name="si:close-circle-line" />
                </UButton>
            </li>
        </ul>
    </div>
</template>
