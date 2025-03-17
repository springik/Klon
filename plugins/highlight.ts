import Highlight from "~/directives/v-highlight";

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('highlight', Highlight);
})