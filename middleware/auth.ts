export default defineNuxtRouteMiddleware((from, to) => {
    const { loggedIn, user } = useUserSession()

    //console.log('loggedIn?', loggedIn.value)
    //console.log('user?', user.value);
    

    //console.log('redir condition', (!loggedIn.value && to.path != '/login'));

    if(!loggedIn.value && to.path != '/login')
        return navigateTo('/login')
})