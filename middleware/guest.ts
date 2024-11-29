export default defineNuxtRouteMiddleware(async (from, to) => {
    const { loggedIn } = useUserSession()

    await nextTick()

    if(loggedIn.value && to.path === '/login' && from.path !== '/login')
        return navigateTo(from.path)
})