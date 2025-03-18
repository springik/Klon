<script setup lang="ts">
    const { session } = useUserSession()

    const emit = defineEmits(['sendRepo'])

    const repositories = ref<Object[]>([])
    const dataLoaded = ref<boolean>(false)
    console.log(session);

    function sendRepo(repo) {
        emit('sendRepo', repo)
    }

    onMounted(async () => {
        const { data, error } = await useFetch(session.value.repos_url)
        if(error.value) {
            console.log(error.value)
            return
        }
        dataLoaded.value = true
        console.log(data.value)
        repositories.value = data.value
    })

</script>

<template>
    <div v-if="dataLoaded">
        <h1 class="text-center color-primary-400">Repositories</h1>
        <ul class="h-96 overflow-y-auto">
            <li @click="sendRepo(repo)" v-for="repo in repositories" :key="repo.id">
                <UCard :ui="{  }">
                    <div>
                        <h2>
                            <span>{{ repo.name }}</span>
                        </h2>
                    </div>
                </UCard>
            </li>
        </ul>
    </div>
    <div class="w-32 h-32 flex items-center justify-center" v-else>
        <BlockLoad />
    </div>
</template>