import { ref } from 'vue'
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
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
  const indexBuilding = ref(false)

  const buildQuery = (params: SearchParams) => {
    if (!$firestore) return null

    const constraints: any[] = []
    let baseQuery = collection($firestore as unknown as Firestore, 'recipes')

    try {
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
        case 'most-liked':
          constraints.push(orderBy('likesCount', 'desc'))
          break
        case 'title':
          constraints.push(orderBy('titleLower', 'asc'))
          break
        case 'title-desc':
          constraints.push(orderBy('titleLower', 'desc'))
          break
        default:
          constraints.push(orderBy('createdAt', 'desc'))
      }

      return query(baseQuery, ...constraints)
    } catch (error) {
      console.error('Error building query:', error)
      return query(baseQuery)
    }
  }

  const searchRecipes = async (params: SearchParams) => {
    loading.value = true
    error.value = null
    indexBuilding.value = false
    
    try {
      const q = buildQuery(params)
      if (!q) {
        recipes.value = []
        return
      }

      const snapshot = await getDocs(q)
      let results = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[]

      // Apply filters in memory if needed
      if (results.length > 0) {
        // Filter by search query if exists
        if (params.query) {
          const searchTerm = params.query.toLowerCase()
          results = results.filter(recipe => 
            recipe.title.toLowerCase().includes(searchTerm)
          )
        }

        // Apply sorting in memory if we couldn't do it in query
        if (params.cuisine && params.sort) {
          results.sort((a, b) => {
            switch (params.sort) {
              case 'newest':
                return (b.createdAt || 0) - (a.createdAt || 0)
              case 'oldest':
                return (a.createdAt || 0) - (b.createdAt || 0)
              case 'title':
                return (a.titleLower ?? '').localeCompare(b.titleLower ?? '')
              case 'title-desc':
                return (b.titleLower ?? '').localeCompare(a.titleLower ?? '')
              default:
                return 0
            }
          })
        }
      }

      recipes.value = results

    } catch (err: any) {
      console.error('Error searching recipes:', err)
      if (err?.message?.includes('index')) {
        indexBuilding.value = true
        error.value = 'Search index is being built. Please try again in a few minutes.'
      } else {
        error.value = 'Failed to search recipes'
      }
      recipes.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    recipes,
    loading,
    error,
    indexBuilding,
    searchRecipes
  }
} 