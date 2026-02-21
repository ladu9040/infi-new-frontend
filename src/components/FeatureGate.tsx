import React from 'react'

interface FeatureGateProps {
  feature: string
  children: React.ReactNode
}

export default function FeatureGate({ feature, children }: FeatureGateProps) {
  console.log('feature : ', feature)
  // const { subscription } = useAuth();

  // if (!hasFeature(subscription, feature)) return null;

  return <>{children}</>
}
