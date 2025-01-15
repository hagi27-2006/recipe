import { ref } from 'vue'
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  startAt,
  endAt,
  type Query,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Firestore
} from 'firebase/firestore'
import type { Recipe } from './useRecipes'

interface SearchParams {
  query: string
  cuisine: string
  sort: string
}

export const useRecipeSearch = () => {
  const { $firestore } = useNuxtApp()
  const recipes = ref<Recipe[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const buildQuery = (params: SearchParams) => {
    if (!$firestore) return null

    let baseQuery: Query = collection($firestore as Firestore, 'recipes')
    const constraints: any[] = []
    
    // Add title search
    if (params.query) {
      const queryUpperBound = params.query + '\uf8ff'
      constraints.push(
        where('title', '>=', params.query),
        where('title', '<=', queryUpperBound)
      )
    }

    // Add cuisine filter
    if (params.cuisine) {
      constraints.push(where('cuisine', '==', params.cuisine))
    }

    // Add sorting
    switch (params.sort) {
      case 'newest':
        constraints.push(orderBy('createdAt', 'desc'))
        break
      case 'oldest':
        constraints.push(orderBy('createdAt', 'asc'))
        break
      case 'title':
        constraints.push(orderBy('title', 'asc'))
        break
      case 'title-desc':
        constraints.push(orderBy('title', 'desc'))
        break
      default:
        constraints.push(orderBy('createdAt', 'desc'))
    }

    return query(baseQuery, ...constraints)
  }

  const searchRecipes = async (params: SearchParams) => {
    if (!$firestore) return

    loading.value = true
    error.value = null

    try {
      const q = buildQuery(params)
      if (!q) return

      const snapshot = await getDocs(q)
      recipes.value = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[]
    } catch (err) {
      console.error('Error searching recipes:', err)
      error.value = 'Failed to search recipes'
      recipes.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    recipes,
    loading,
    error,
    searchRecipes
  }
} 