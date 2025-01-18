import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  const { user, loading } = useAuth()
  
  const protectedRoutes = ['/saved-recipes', '/create-recipe', '/my-recipes']
  
  // If loading, let the navigation happen and let the layout handle the loading state
  if (loading.value) {
    return
  }
  
  // Redirect to home if trying to access protected route while not authenticated
  if (!user.value && protectedRoutes.includes(to.path)) {
    return navigateTo('/', { replace: true })
  }
}) 