import { create } from 'zustand'
import { login as apiLogin, logout as apiLogout, fetchMe, saveAuth, getAuth } from '../services/api'

interface User {
  username: string
  name: string
  role: string
  canViewRecipes: boolean
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  login: (username: string, password: string) => Promise<User>
  logout: () => Promise<void>
  initialize: () => Promise<void>
  updateUser: (updatedUser: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  setUser: (user) => {
    set({ user })
  },

  login: async (username, password) => {
    const data = await apiLogin(username, password)
    const user: User = {
      username: data.username,
      name: data.name,
      role: data.role,
      canViewRecipes: data.canViewRecipes,
    }
    set({ user })
    return user
  },

  logout: async () => {
    await apiLogout()
    set({ user: null })
  },

  initialize: async () => {
    const auth = getAuth()
    if (auth.user) {
      set({ user: auth.user })
      try {
        const data = await fetchMe()
        const updatedUser: User = {
          username: data.username,
          name: data.name,
          role: data.role,
          canViewRecipes: data.canViewRecipes,
        }
        set({ user: updatedUser })
        saveAuth(updatedUser)
      } catch {
        // fetchMe failed, keep existing user from sessionStorage
      }
    }
  },

  updateUser: (updatedUser) => {
    set({ user: updatedUser })
    saveAuth(updatedUser)
  },
}))
