<script setup lang="ts">
    definePageMeta({
        title: 'Settings',
        description: 'User settings',
        middleware: 'auth'
    })
    //const avatarFile = ref<File | null>(null);
    const avatarFile = ref<{ file : File, name : string, extension : string } | null>({ file : null, name : null, extension : null })
    const avatar = ref<string>('');
    const changed = ref<boolean>(false)
    const { $socket } = useNuxtApp()
    const snackbar = useSnackbar()
    const { user } = useUserSession()

    const save = async () => {
        if(changed.value) {
            
            try {
                $socket.emit('update-user-avatar', avatarFile.value)
            } catch (error) {
                console.error(error)
            }
            
        }
    }
    const onAvatarChange = (event : Event) => {
        const input = event.target as HTMLInputElement
        
        if(input.files && input.files.length > 0) {
            const file = input.files[0];
            avatarFile.value.file = file;
            avatarFile.value.name = file.name
            avatarFile.value.extension = file.name.split('.').pop() || ''

            const reader = new FileReader();
            reader.onload = (e) => {
                console.log(e.target?.result);
                avatar.value = e.target?.result as string;
            }
            reader.readAsDataURL(input.files[0]);
            console.log(avatarFile.value.file);
            
            changed.value = true
        }
    }
    onMounted(() => {
        $socket.on('avatar-changed', (response) => {
            if(response.status == 200) {
                snackbar.add({
                    text: response.message,
                    type: 'success'
                })
                user.value.avatarUrl = response.newUrl
            }
        })
    })
</script>

<template>
    <div>
        <UCard :ui="{ divide: 'divide-none' }">
            <template #header>
                <h3 class="font-semibold">
                    Customisation
                </h3>
            </template>
            <label for="avatarInput">
                Avatar:
            </label>
            <input name="avatarInput" ref="input" type="file" @change="onAvatarChange">
            <template #footer>
                <UButton @click="save" label="Save">

                </UButton>
            </template>
        </UCard>
    </div>
</template>
