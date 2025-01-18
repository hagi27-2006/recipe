import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Firestore,
  orderBy
} from 'firebase/firestore'
import { ref } from 'vue'

export interface Recipe {
  id?: string
  title: string
  titleLower?: string
  ingredients: string[]
  instructions: string
  cuisine: string
  imageUrl: string
  userId: string
  createdAt?: number
}

export const useRecipes = () => {
  const { $firestore } = useNuxtApp()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  
  const recipes = ref<Recipe[]>([])
  const savedRecipes = ref<Recipe[]>([])

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'userId' | 'titleLower'>) => {
    if (!user.value) throw new Error('User must be logged in')
    if (!$firestore) throw new Error('Firestore not initialized')
    
    const recipeWithUser = {
      ...recipe,
      titleLower: recipe.title.toLowerCase(),
      userId: user.value.uid,
      createdAt: Date.now()
    }
    
    await addDoc(collection($firestore, 'recipes'), recipeWithUser)
  }

  const getSavedRecipes = async () => {
    if (!user.value || !$firestore) return
    
    const q = query(
      collection($firestore, 'recipes'),
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    savedRecipes.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Recipe[]
  }

  const deleteRecipe = async (recipeId: string) => {
    if (!$firestore) throw new Error('Firestore not initialized')
    try {
      await deleteDoc(doc($firestore, 'recipes', recipeId))
      await getSavedRecipes()
      showNotification('Recipe deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting recipe:', error)
      showNotification('Failed to delete recipe', 'error')
      throw error
    }
  }

  const updateRecipe = async (recipeId: string, updates: Partial<Recipe>) => {
    if (!$firestore) throw new Error('Firestore not initialized')
    try {
      await updateDoc(doc($firestore, 'recipes', recipeId), updates)
      await getSavedRecipes()
      showNotification('Recipe updated successfully', 'success')
    } catch (error) {
      console.error('Error updating recipe:', error)
      showNotification('Failed to update recipe', 'error')
      throw error
    }
  }

  return {
    recipes,
    savedRecipes,
    addRecipe,
    getSavedRecipes,
    deleteRecipe,
    updateRecipe
  }
} 