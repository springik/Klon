<script setup lang="ts">
    definePageMeta({
        title: 'Friends',
        description: 'Friends page of the application',
        middleware: 'auth'
    })
    const selectedFriend = ref<object | null>(null)

    const onFriendClick = (friend : object) => {
        console.log("friend clicked");
        selectedFriend.value = friend
    }
    const onGoBack = () => {
        console.log("going back");
        selectedFriend.value = null
    }
</script>

<template>
    <FriendChat v-if="selectedFriend !== null" @goBack="onGoBack" :friend="selectedFriend" />
    <FriendsList v-else @friendClicked="onFriendClick" />
</template>
