import { defineNuxtPlugin } from '#app'
import ImageGallery from '~/components/ImageGallery.vue'
import VideoPlayer from '~/components/VideoPlayer.vue'
import ShareButton from '~/components/ShareButton.vue'
import Comments from '~/components/Comments.vue'
import Footer from '~/components/Footer.vue'
import DefaultAvatar from '~/components/DefaultAvatar.vue'
import DeleteConfirmModal from '~/components/DeleteConfirmModal.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('ImageGallery', ImageGallery)
  nuxtApp.vueApp.component('VideoPlayer', VideoPlayer)
  nuxtApp.vueApp.component('ShareButton', ShareButton)
  nuxtApp.vueApp.component('Comments', Comments)
  nuxtApp.vueApp.component('Footer', Footer)
  nuxtApp.vueApp.component('DefaultAvatar', DefaultAvatar)
  nuxtApp.vueApp.component('DeleteConfirmModal', DeleteConfirmModal)
}) 