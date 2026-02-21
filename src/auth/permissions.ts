export const Roles = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  CLIENT: 'CLIENT',
  VENDOR_ADMIN: 'VENDOR_ADMIN',
  VENDOR: 'VENDOR',
} as const

export type Role = (typeof Roles)[keyof typeof Roles]

export const SubscriptionPlans = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const

export type SubscriptionPlan = (typeof SubscriptionPlans)[keyof typeof SubscriptionPlans]

export interface PermissionConfig {
  pages: Record<string, Role[]>
  features: Record<string, SubscriptionPlan[]>
}

export const Permissions: PermissionConfig = {
  pages: {
    dashboard: [Roles.ADMIN, Roles.MANAGER, Roles.STAFF],
    settings: [Roles.ADMIN],
    analytics: [Roles.ADMIN, Roles.MANAGER],
    clientPortal: [Roles.CLIENT, Roles.ADMIN],
    vendorOnboarding: [Roles.VENDOR_ADMIN, Roles.VENDOR],
  },

  features: {
    videoStreaming: [SubscriptionPlans.PRO, SubscriptionPlans.ENTERPRISE],
    aiSearch: [SubscriptionPlans.ENTERPRISE],
    exports: [SubscriptionPlans.PRO, SubscriptionPlans.ENTERPRISE],
  },
}
