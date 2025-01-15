export const translations = {
  mn: {
    common: {
      loading: 'Ачаалж байна...',
      error: 'Алдаа гарлаа',
      tryAgain: 'Дахин оролдох',
      clearSearch: 'Хайлтыг цэвэрлэх',
      noResults: 'Жор олдсонгүй',
      save: 'Хадгалах',
      delete: 'Устгах',
      cancel: 'Цуцлах',
      create: 'Үүсгэх',
      view: 'Харах'
    },
    nav: {
      home: 'Нүүр',
      createRecipe: 'Жор үүсгэх',
      savedRecipes: 'Хадгалсан жорууд',
      signIn: 'Нэвтрэх',
      signOut: 'Гарах'
    },
    search: {
      placeholder: 'Жор хайх...',
      allCuisines: 'Бүх төрөл',
      sortBy: {
        newest: 'Шинэ эхэндээ',
        oldest: 'Хуучин эхэндээ',
        titleAsc: 'Нэрээр (А-Я)',
        titleDesc: 'Нэрээр (Я-А)'
      },
      cuisines: {
        italian: 'Итали',
        mexican: 'Мексик',
        indian: 'Энэтхэг',
        chinese: 'Хятад',
        japanese: 'Япон',
        thai: 'Тайланд',
        mediterranean: 'Газрын дундад тэнгис'
      }
    },
    recipe: {
      title: 'Жорын нэр',
      cuisine: 'Хоолны төрөл',
      ingredients: 'Орц',
      instructions: 'Хийх заавар',
      imageUrl: 'Зургийн холбоос',
      addIngredient: 'Орц нэмэх',
      removeIngredient: 'Орц хасах',
      createSuccess: 'Жор амжилттай үүслээ!',
      createError: 'Жор үүсгэхэд алдаа гарлаа',
      saveSuccess: 'Жор амжилттай хадгалагдлаа!',
      saveError: 'Жор хадгалахад алдаа гарлаа',
      deleteSuccess: 'Жор амжилттай устгагдлаа!',
      deleteError: 'Жор устгахад алдаа гарлаа',
      viewRecipe: 'Жор харах',
      loading: 'Жор ачаалж байна...',
      notFound: 'Жор олдсонгүй',
      backToRecipes: 'Жорын жагсаалт руу буцах',
      deleteConfirm: 'Энэ жорыг устгахдаа итгэлтэй байна уу?',
      viewFullRecipe: 'Дэлгэрэнгүй харах'
    }
  }
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.mn

export const useTranslations = () => {
  const lang = ref<Language>('mn')

  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = translations[lang.value]
    
    for (const k of keys) {
      value = value[k]
      if (!value) return key
    }
    
    return value
  }

  return {
    t,
    lang
  }
} 