import { Permissions, type Role, type SubscriptionPlan } from './permissions'

export function canAccessPage(role: Role, page: string) {
  return Permissions.pages[page]?.includes(role)
}

export function hasFeature(subscription: SubscriptionPlan, feature: string) {
  return Permissions.features[feature]?.includes(subscription)
}
