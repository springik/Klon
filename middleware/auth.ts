export default defineNuxtRouteMiddleware((from, to) => {
    const { loggedIn } = useUserSession()

    if(!loggedIn.value && to.path !== '/login' && from.path !== '/login') {
        return navigateTo('/login')
    }
})