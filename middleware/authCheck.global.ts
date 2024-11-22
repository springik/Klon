export default defineNuxtRouteMiddleware((to, from) => {
    const { loggedIn } = useUserSession()
    //console.log(loggedIn.value);
    //console.log(session.value);
    
    if(!loggedIn.value && to.path !== '/login')
        return navigateTo('/login')
})