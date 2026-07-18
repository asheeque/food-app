import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AppUser, UserRole } from '@/types'

// ─── Mock sessions — swap these out when Supabase auth is wired ──────────────

export const MOCK_USERS: Record<UserRole, AppUser> = {
  admin: {
    id: 'user-admin-001',
    name: 'Admin User',
    email: 'admin@deirafresh.ae',
    role: 'admin',
    entityId: null,
  },
  supplier: {
    id: 'user-sup-001',
    name: 'Mohammed Al Rashidi',
    email: 'orders@alkhaleej.ae',
    role: 'supplier',
    entityId: 'sup-001',
  },
  restaurant: {
    id: 'user-res-001',
    name: 'Ahmed Hassan',
    email: 'kitchen@tajdubai.ae',
    role: 'restaurant',
    entityId: 'res-001',
  },
}

// ─── Store shape ──────────────────────────────────────────────────────────────

interface AppStore {
  currentUser: AppUser
  setCurrentUser: (user: AppUser) => void
  clearUser: () => void

  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void

  notificationCount: number
  clearNotifications: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()(
  devtools(
    (set) => ({
      currentUser: MOCK_USERS.admin,
      setCurrentUser: (user) => set({ currentUser: user }, false, 'setCurrentUser'),
      clearUser: () => set({ currentUser: MOCK_USERS.admin }, false, 'clearUser'),

      mobileNavOpen: false,
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }, false, 'setMobileNavOpen'),

      notificationCount: 3,
      clearNotifications: () => set({ notificationCount: 0 }, false, 'clearNotifications'),
    }),
    { name: 'DeiraFreshStore' }
  )
)

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectUser = (s: AppStore) => s.currentUser
export const selectRole = (s: AppStore) => s.currentUser.role
export const selectEntityId = (s: AppStore) => s.currentUser.entityId
