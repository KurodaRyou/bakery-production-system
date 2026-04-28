const API = '/api'

let csrfToken = null

export const fetchCsrfToken = async () => {
  try {
    const res = await fetch(`${API}/csrf-token`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      csrfToken = data.csrfToken
    }
  } catch (e) {
    console.error('Failed to fetch CSRF token:', e)
  }
}

export const saveAuth = (user) => {
  if (user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user))
  } else {
    sessionStorage.removeItem('currentUser')
  }
}

export const getAuth = () => {
  const userStr = sessionStorage.getItem('currentUser')
  return { user: userStr ? JSON.parse(userStr) : null }
}

export const logout = async () => {
  try {
    await fetch(`${API}/auth/logout`, { 
      method: 'POST',
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
      }
    })
  } catch (e) {
    console.error('Logout error:', e)
  }
  saveAuth(null)
  sessionStorage.removeItem('currentUser')
}

export const fetchMe = () => request('/auth/me')

const authHeaders = () => {
  return { 'Content-Type': 'application/json' }
}

const parseError = async (res) => {
  const data = await res.json().catch(() => null)

  if (data && data.success === false && data.error) {
    return {
      code: data.error.code || 'UNKNOWN',
      message: data.error.message || '请求失败',
      details: data.error.details,
    }
  }

  if (data && data.error) {
    return { code: 'UNKNOWN', message: data.error }
  }

  return { code: 'UNKNOWN', message: `请求失败 (${res.status})` }
}

const friendlyMessage = (code, status) => {
  const map = {
    UNAUTHORIZED: '登录已过期，请重新登录',
    FORBIDDEN: '权限不足，无法执行此操作',
    NOT_FOUND: '请求的资源不存在',
    BAD_REQUEST: '请求参数错误，请检查输入',
    VALIDATION_ERROR: '输入数据验证失败，请检查表单',
    CSRF_ERROR: '安全验证失败，请刷新页面后重试',
    INTERNAL_ERROR: '服务器内部错误，请稍后重试',
    RATE_LIMITED: '请求过于频繁，请稍后再试',
  }
  return map[code] || `请求失败 (${status})`
}

const request = async (path, options = {}) => {
  const method = (options.method || 'GET').toUpperCase()
  const csrfHeaders = {}
  if (['POST', 'PUT', 'DELETE'].includes(method) && csrfToken) {
    csrfHeaders['X-CSRF-Token'] = csrfToken
  }
  const res = await fetch(`${API}${path}`, { 
    ...options, 
    credentials: 'include',
    headers: { ...authHeaders(), ...csrfHeaders, ...options.headers } 
  })

  if (res.status === 401) {
    saveAuth(null)
    sessionStorage.removeItem('currentUser')
    if (!window.location.pathname.endsWith('/login')) {
      window.location.href = '/login'
    }
    throw new Error('登录已过期，请重新登录')
  }

  if (!res.ok) {
    const err = await parseError(res)
    throw new Error(err.message || friendlyMessage(err.code, res.status))
  }

  return res.json()
}

export const login = async (username, password) => {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) {
    const err = await parseError(res)
    throw new Error(err.message || '登录失败')
  }
  const data = await res.json()
  saveAuth({ username: data.username, name: data.name, role: data.role, canViewRecipes: data.canViewRecipes })
  return data
}

export const updateProfile = async (username, password) => {
  const data = await request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ username, password })
  })
  if (data.loggedOut) {
    saveAuth(null)
    sessionStorage.removeItem('currentUser')
  }
  return data
}

export const fetchRecords = () => request('/records')
export const createRecord = (record) => request('/records', { method: 'POST', body: JSON.stringify(record) })
export const updateRecord = (batch, record) => request(`/records/${batch}`, { method: 'PUT', body: JSON.stringify(record) })
export const deleteRecord = (batch) => request(`/records/${batch}`, { method: 'DELETE' })

export const fetchMachines = () => request('/machines')
export const fetchDoughTypes = () => request('/dough-types')
export const fetchPreparations = () => request('/preparations')
export const createPreparation = (data) => request('/preparations', { method: 'POST', body: JSON.stringify(data) })
export const updatePreparation = (id, data) => request(`/preparations/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deletePreparation = (id) => request(`/preparations/${id}`, { method: 'DELETE' })

export const fetchIngredients = () => request('/ingredients')

export const createIngredient = (ingredient) => request('/ingredients', { method: 'POST', body: JSON.stringify(ingredient) })
export const updateIngredient = (id, ingredient) => request(`/ingredients/${id}`, { method: 'PUT', body: JSON.stringify(ingredient) })
export const deleteIngredient = (id) => request(`/ingredients/${id}`, { method: 'DELETE' })

export const fetchMaterials = () => request('/materials')
export const createMaterial = (data) => request('/materials', { method: 'POST', body: JSON.stringify(data) })
export const updateMaterial = (id, data) => request(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteMaterial = (id) => request(`/materials/${id}`, { method: 'DELETE' })

export const fetchUsers = () => request('/users')
export const createUser = (data) => request('/users', { method: 'POST', body: JSON.stringify(data) })
export const updateUser = (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' })

export const fetchRecipes = () => request('/dough')
export const fetchRecipeById = (id) => request(`/dough/${id}`)
export const createRecipe = (recipe) => request('/dough', { method: 'POST', body: JSON.stringify(recipe) })
export const updateRecipe = (id, recipe) => request(`/dough/${id}`, { method: 'PUT', body: JSON.stringify(recipe) })
export const deleteRecipe = (id) => request(`/dough/${id}`, { method: 'DELETE' })
export const fetchRecipeVersions = (id) => request(`/dough/${id}/versions`)
export const fetchRecipeVersionDetail = (id, ver) => request(`/dough/${id}/versions/${ver}`)
export const restoreRecipeVersion = (id, ver) => request(`/dough/${id}/restore/${ver}`, { method: 'POST' })

export const getPreviewBatchNumber = (records = []) => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = records
    .filter(r => r.batch_number?.startsWith(today))
    .reduce((max, r) => Math.max(max, parseInt(r.batch_number.slice(8)) || 0), 0) + 1
  return `${today}${seq < 10 ? '0' : ''}${seq}`
}

export const reserveBatchNumber = () => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const key = `bakery_count_${today}`
  localStorage.setItem(key, (parseInt(localStorage.getItem(key) || '0') + 1).toString())
}
