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
  orderBy,
  getDoc,
  setDoc,
  increment,
  limit
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
  likesCount?: number
  avgRating?: number
  ratingCount?: number
  videoUrl?: string
  images: string[]
  similarRecipes?: string[] // IDs of similar recipes
}

export interface Like {
  userId: string
  recipeId: string
  createdAt: number
}

export interface Comment {
  id?: string
  userId: string
  recipeId: string
  text: string
  rating: number
  createdAt: number
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
    if (!$firestore) return

    try {
      // Delete recipe document
      await deleteDoc(doc($firestore, 'recipes', recipeId))

      // Delete all comments for this recipe
      const commentsQuery = query(
        collection($firestore, 'comments'),
        where('recipeId', '==', recipeId)
      )
      const commentsSnapshot = await getDocs(commentsQuery)
      const commentDeletions = commentsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      )

      // Delete all likes for this recipe
      const likesQuery = query(
        collection($firestore, 'likes'),
        where('recipeId', '==', recipeId)
      )
      const likesSnapshot = await getDocs(likesQuery)
      const likeDeletions = likesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      )

      // Wait for all deletions to complete
      await Promise.all([...commentDeletions, ...likeDeletions])

    } catch (error) {
      console.error('Error deleting recipe:', error)
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

  const toggleLike = async (recipeId: string) => {
    if (!user.value || !$firestore) throw new Error('User must be logged in')
    
    try {
      const likeRef = doc($firestore, 'likes', `${user.value.uid}_${recipeId}`)
      const likeDoc = await getDoc(likeRef)
      const recipeRef = doc($firestore, 'recipes', recipeId)
      
      if (likeDoc.exists()) {
        // Unlike
        await deleteDoc(likeRef)
        await updateDoc(recipeRef, {
          likesCount: increment(-1)
        })
      } else {
        // Like
        await setDoc(likeRef, {
          userId: user.value.uid,
          recipeId,
          createdAt: Date.now()
        })
        await updateDoc(recipeRef, {
          likesCount: increment(1)
        })
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      throw error
    }
  }

  const isLiked = async (recipeId: string) => {
    if (!user.value || !$firestore) return false
    
    const likeRef = doc($firestore, 'likes', `${user.value.uid}_${recipeId}`)
    const likeDoc = await getDoc(likeRef)
    return likeDoc.exists()
  }

  const addComment = async (recipeId: string, text: string, rating: number) => {
    if (!user.value || !$firestore) throw new Error('User must be logged in')
    
    try {
      const commentData = {
        userId: user.value.uid,
        recipeId,
        text,
        rating,
        createdAt: Date.now()
      }
      
      await addDoc(collection($firestore, 'comments'), commentData)
      
      // Update recipe rating
      const recipeRef = doc($firestore, 'recipes', recipeId)
      const recipeDoc = await getDoc(recipeRef)
      const recipeData = recipeDoc.data()
      
      const currentRatingCount = recipeData?.ratingCount || 0
      const currentAvgRating = recipeData?.avgRating || 0
      
      const newRatingCount = currentRatingCount + 1
      const newAvgRating = ((currentAvgRating * currentRatingCount) + rating) / newRatingCount
      
      await updateDoc(recipeRef, {
        avgRating: newAvgRating,
        ratingCount: newRatingCount
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }

  const getComments = async (recipeId: string) => {
    if (!$firestore) return []
    
    const q = query(
      collection($firestore, 'comments'),
      where('recipeId', '==', recipeId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[]
  }

  const getSimilarRecipes = async (recipeId: string) => {
    if (!$firestore) return []
    
    const recipeDoc = await getDoc(doc($firestore, 'recipes', recipeId))
    if (!recipeDoc.exists()) return []
    
    const recipe = recipeDoc.data()
    
    // Find recipes with same cuisine, excluding current recipe
    const q = query(
      collection($firestore, 'recipes'),
      where('cuisine', '==', recipe.cuisine),
      where('id', '!=', recipeId)
    )
    
    try {
      const snapshot = await getDocs(q)
      const recipes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[]
      
      // Sort by rating and limit client-side
      return recipes
        .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
        .slice(0, 3)
    } catch (error) {
      console.error('Error fetching similar recipes:', error)
      return []
    }
  }

  return {
    recipes,
    savedRecipes,
    addRecipe,
    getSavedRecipes,
    deleteRecipe,
    updateRecipe,
    toggleLike,
    isLiked,
    addComment,
    getComments,
    getSimilarRecipes
  }
} 