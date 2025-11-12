// Subscription tier configuration
export const SUBSCRIPTION_TIERS = {
  MONTHLY: {
    name: "Monthly",
    price_id: "price_1SScT85d5AuxGTtPEyWiYHSB",
    product_id: "prod_TPRL25ttcNXqcV",
    price: "£9.99",
    interval: "month"
  },
  ANNUAL: {
    name: "Annual", 
    price_id: "price_1SScTO5d5AuxGTtP2DzspPES",
    product_id: "prod_TPRMKSEOLWHXTm",
    price: "£79.99",
    interval: "year"
  }
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export const getSubscriptionTierByProductId = (productId: string): SubscriptionTier | null => {
  const tier = Object.entries(SUBSCRIPTION_TIERS).find(
    ([_, config]) => config.product_id === productId
  );
  return tier ? (tier[0] as SubscriptionTier) : null;
};
