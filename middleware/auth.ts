export default defineNuxtRouteMiddleware(() => {
    const { loggedIn } = useUserSession()
    
    console.log('isloggedin',  loggedIn.value);
    if(!loggedIn.value)
        return navigateTo('/login')
})