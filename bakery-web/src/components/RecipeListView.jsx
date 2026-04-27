import { useState, useEffect } from 'react'
import { fetchRecipes } from '../services/api'
import RecipeDetailView from './RecipeDetailView'
import NewRecipeView from './NewRecipeView'
import { getCache, setCache } from '../services/cache'

const CACHE_KEY = 'recipes_cache'

function RecipeListView({ showHeader = true, onRefresh, onBack }) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showNewView, setShowNewView] = useState(false)
  const [showNewButton, setShowNewButton] = useState(true)

  useEffect(() => {
    const cachedRecipes = getCache(CACHE_KEY)
    if (cachedRecipes) {
      setRecipes(cachedRecipes)
    }
    loadRecipes()
  }, [])

  async function loadRecipes() {
    try {
      const data = await fetchRecipes()
      setCache(CACHE_KEY, data)
      setRecipes(prev => {
        if (prev.length !== data.length || prev[0]?.id !== data[0]?.id) {
          return data
        }
        return prev
      })
    } catch (error) {
      console.error('Failed to load recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const categoryLabels = {
    dough: '面团',
    ingredient: '原材料',
    preparation: '半成品'
  }

  const groupedRecipes = recipes.reduce((acc, recipe) => {
    const cats = recipe.material_type || 'dough'
    if (!acc[cats]) acc[cats] = []
    acc[cats].push(recipe)
    return acc
  }, {})

  if (selectedRecipe) {
    return (
      <RecipeDetailView 
        recipeId={selectedRecipe.id} 
        onBack={() => setSelectedRecipe(null)}
      />
    )
  }

  if (showNewView) {
    return (
      <NewRecipeView 
        showHeader={false}
        onBack={() => setShowNewView(false)}
        onSuccess={() => {
          setShowNewView(false)
          loadRecipes()
        }}
      />
    )
  }

  return (
    <div>
      {showHeader && (
        <div className="page-header">
          <div className="page-header-left">
            {onBack ? (
              <button className="back-btn" onClick={onBack}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                <span className="back-btn-text">返回</span>
              </button>
            ) : (
              <span style={{ width: 60 }}></span>
            )}
          </div>
          <span className="page-title">配方</span>
          <button className="back-btn" onClick={onRefresh || loadRecipes} style={{ minWidth: 60, justifyContent: 'flex-end' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, marginRight: 4 }}>
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            刷新
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            <line x1="12" y1="6" x2="12" y2="14"/>
            <line x1="8" y1="10" x2="16" y2="10"/>
          </svg>
          <p>暂无配方</p>
          <p style={{ fontSize: '13px', marginTop: '8px', opacity: 0.7 }}>点击下方按钮创建第一个配方</p>
        </div>
      ) : (
        <div className="recipe-groups">
          {Object.entries(groupedRecipes).map(([category, categoryRecipes]) => (
            <div key={category} className="recipe-group">
              <h3 className="recipe-group-title">{categoryLabels[category] || category}</h3>
              <div className="recipe-grid">
                {categoryRecipes.map((recipe, index) => (
                  <div 
                    key={recipe.id} 
                    className="recipe-card"
                    onClick={() => setSelectedRecipe(recipe)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="recipe-card-header">
                      <div className="recipe-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                      </div>
                    </div>
                    <h3 className="recipe-card-title">{recipe.name || '未命名配方'}</h3>
                    {recipe.author && (
                      <p className="recipe-card-author">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        {recipe.author}
                      </p>
                    )}
                    <div className="recipe-card-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showNewButton && (
        <button className="btn btn-primary btn-full" onClick={() => setShowNewView(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, marginRight: 8 }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          新建配方
        </button>
      )}
    </div>
  )
}

export default RecipeListView