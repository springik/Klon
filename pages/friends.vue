<script setup lang="ts">
    const selectedFriend = ref(null)

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
