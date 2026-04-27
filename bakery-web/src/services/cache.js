const CACHE_PREFIX = 'bakery_'
const CACHE_EXPIRE = 5 * 60 * 1000 // 5 minutes

export function getCache(key) {
  try {
    const data = localStorage.getItem(CACHE_PREFIX + key)
    if (!data) return null
    const { data: cachedData, timestamp } = JSON.parse(data)
    if (Date.now() - timestamp > CACHE_EXPIRE) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    return cachedData
  } catch {
    return null
  }
}

export function setCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.error('Cache write failed:', e)
  }
}

export function clearCache(key) {
  try {
    if (key) {
      localStorage.removeItem(CACHE_PREFIX + key)
    } else {
      Object.keys(localStorage)
        .filter(k => k.startsWith(CACHE_PREFIX))
        .forEach(k => localStorage.removeItem(k))
    }
  } catch (e) {
    console.error('Cache clear failed:', e)
  }
}
