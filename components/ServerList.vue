<script setup lang="ts">
    const { $socket } = useNuxtApp()

    const servers = ref([{}]);
    const isOpen = ref(false);
    const serverName = ref('');
    const serverDescription = ref('');
    const serverAvatarFile = ref<File | null>(null);
    const serverAvatar = ref<string>('');
    const creating = ref<boolean>(false)

    const emit = defineEmits(['serverSelected']);

    const requestServerList = () => {
        $socket.emit('request-servers');
    }
    const createServer = () => {
        console.log('Create server');
        creating.value = true;

        $socket.emit('create-server', {
            name: serverName.value,
            description: serverDescription.value,
            avatar: serverAvatarFile.value
        });

    }
    const onSelectServer = (server : object) => {
        emit('serverSelected', server);
    }
    const onAvatarChange = (event : Event) => {
        const input = event.target as HTMLInputElement
        
        if(input.files && input.files.length > 0) {
            const file = input.files[0];
            serverAvatarFile.value = file;

            const reader = new FileReader();
            reader.onload = (e) => {
                console.log(e.target?.result);
                serverAvatar.value = e.target?.result as string;
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    onMounted(() => {
        $socket.on('server-list', (serverList : object[]) => {
            servers.value = serverList;
            console.log('got server list');
        });
        $socket.on('server-created', (server : object) => {
            servers.value.push(server);
            creating.value = false;
            isOpen.value = false;
        });

        requestServerList();
    });
    onBeforeUnmount(() => {
        $socket.off('server-list');
        $socket.off('server-created');
    });

</script>

<template>
    <div class="p-4 w-full h-11/12">
        <h2 class="text-white text-lg font-semibold mb-2">Servers
            <UButton @click="isOpen = true" label="Add">
            <UIcon class="w-5 h-5" name="si:add-circle-line" />
        </UButton></h2>
        <UModal v-model="isOpen">
            <UCard>
                <template #header>
                    Create a Server
                </template>
                <div class="overflow-y-auto">
                    <label for="serverName">Name:</label>
                    <UInput name="serverName" v-model="serverName" placeholder="Enter your server's name" label="Name" class="lg:px-3 px-2 py-2" :model-modifiers="{ trim: true }" />

                    <label for="serverDescription">Description:</label>
                    <UTextarea :rows="5" name="serverDescription" v-model="serverDescription" placeholder="Enter your server's description" label="Description" class="lg:px-3 px-2 py-2" :model-modifiers="{ trim: true }" />

                    <label for="serverAvatar">Avatar:</label>
                    <!--<UInput @change="onAvatarChange" name="serverAvatar" type="file" class="lg:px-3 px-2 py-2" />-->
                    <input @change="onAvatarChange" accept="image/webp, image/jpeg, image/png" type="file" name="serverAvatar" class="lg:px-3 px-2 py-2">
                </div>
                <UDivider v-if="serverName != '' || serverDescription != '' || serverAvatar != ''" label="Preview" />
                
                <div class="flex flex-col gap-2" v-if="serverName != '' || serverDescription != '' || serverAvatar != ''">
                    <h3>
                        Name: {{ serverName }}
                    </h3>
                    <h3>
                        Description: <UTextarea :maxrows="5" :disabled="true" v-model="serverDescription" label="Description" class="lg:px-3 px-2 py-2" :model-modifiers="{ trim: true }" />
                    </h3>
                    <h3>
                        <span class="lg:gap-4 gap-2 flex items-center">
                            Avatar:
                            <UAvatar :src="serverAvatar" size="lg" />
                        </span>
                    </h3>
                </div>
                <template #footer>
                    <UButton :loading="creating" @click="createServer">Create</UButton>
                </template>
            </UCard>
        </UModal>
        <div>
            <ul class="overflow-y-auto overflow-x-none">
                <li @click.prevent="onSelectServer(server)" class=" border-l-2 border-gray-700 px-2 py-4 cursor-pointer flex flex-col hover:bg-gray-700" v-for="server in servers" :key="server.id">
                    <div class="flex items-center gap-2">
                        <UAvatar :src="server.avatarUrl" size="lg" />
                        <h3 class="font-semibold text-primary">
                            {{ server.name }}
                        </h3>
                    </div>
                    <h5 class="font-light" v-if="server.description !== '' || server.description !== null">
                        {{ server.description }}
                    </h5>
                </li>
            </ul>
        </div>
    </div>
</template>