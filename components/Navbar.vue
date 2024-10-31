<script setup lang="ts">
    const { clear } = useUserSession()

    const windowWidth = ref(window.innerWidth)
    const mobileBreakpoint = 992

    const logout = async () => {
        await clear()
        window.location.href = "/login"
    }
    const navItems = [
        [
            { label: 'Home', to:'/' },
            { label: 'Friends', to:'/friends' },
            { label: 'Servers', to:'/servers' }
        ],
        [
            { label: 'Logout', click: logout }
        ]
    ]
    const isMobile = computed(() => windowWidth.value < mobileBreakpoint)
    const onResize = () => {
        windowWidth.value = window.innerWidth
    }
    onMounted(() => {
        window.addEventListener('resize', onResize)
    })
    onBeforeUnmount(() => {
        window.removeEventListener('resize', onResize)
    })
</script>

<template>
    <div>
        <UHorizontalNavigation class="z-10" v-if="isMobile" :links="navItems" :ui="{ wrapper: 'fixed bottom-0' }"></UHorizontalNavigation>
        <UVerticalNavigation v-else :links="navItems" :ui="{ wrapper: 'fixed left-0 top-0 h-full', width: 'w-52', size: 'text-lg', active: 'text-primary-500 dark:text-primary-400 border-current font-semibold', inactive: 'border-transparent hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'  }" />
    </div>
</template>
