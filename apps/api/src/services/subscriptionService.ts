import { supabase } from "../lib/supabase.js";

/*
|--------------------------------------------------------------------------
| Subscription Types
|--------------------------------------------------------------------------
*/

export type SubscriptionPlan =
  | "free"
  | "premium";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "cancelled"
  | "expired";

export type Subscription = {
  id: string;
  user_id: string;

  provider: string;

  provider_customer_id: string | null;

  provider_subscription_id: string | null;

  plan: SubscriptionPlan;

  status: SubscriptionStatus;

  current_period_start: string | null;

  current_period_end: string | null;

  cancel_at_period_end: boolean;

  created_at: string;

  updated_at: string;
};

/*
|--------------------------------------------------------------------------
| Resolve Entitlements
|--------------------------------------------------------------------------
|
| This is the central definition of what Free and Premium users can access.
|
| IMPORTANT:
|
| The browser must never decide whether a user is Premium.
|
| The API determines the entitlement.
|
|--------------------------------------------------------------------------
*/

export type ResolveEntitlements = {
  /*
  |--------------------------------------------------------------------------
  | Core features
  |--------------------------------------------------------------------------
  */

  basicRecoveryDashboard: boolean;

  journalAndMoodTracking: boolean;

  basicWebsiteBlocking: boolean;

  /*
  |--------------------------------------------------------------------------
  | AI Coach
  |--------------------------------------------------------------------------
  */

  basicAICoach: boolean;

  fullAICoach: boolean;

  /*
  |--------------------------------------------------------------------------
  | Blocking
  |--------------------------------------------------------------------------
  */

  customBlockedWebsites: boolean;

  unlimitedBlockedSites: boolean;

  scheduledBlocking: boolean;

  multipleBlockingProfiles: boolean;

  adaptiveProtection: boolean;

  /*
  |--------------------------------------------------------------------------
  | Recovery intervention
  |--------------------------------------------------------------------------
  */

  emergencyIntervention: boolean;

  guidedBreathing: boolean;

  focusTools: boolean;

  /*
  |--------------------------------------------------------------------------
  | Analytics
  |--------------------------------------------------------------------------
  */

  advancedRecoveryAnalytics: boolean;
};

/*
|--------------------------------------------------------------------------
| FREE ENTITLEMENTS
|--------------------------------------------------------------------------
|
| Free users receive enough functionality to experience the core value
| of Resolve.
|
|--------------------------------------------------------------------------
*/

export const FREE_ENTITLEMENTS: ResolveEntitlements = {
  basicRecoveryDashboard: true,

  journalAndMoodTracking: true,

  basicWebsiteBlocking: true,

  basicAICoach: true,

  fullAICoach: false,

  customBlockedWebsites: false,

  unlimitedBlockedSites: false,

  scheduledBlocking: false,

  multipleBlockingProfiles: false,

  adaptiveProtection: false,

  emergencyIntervention: false,

  guidedBreathing: false,

  focusTools: false,

  advancedRecoveryAnalytics: false,
};

/*
|--------------------------------------------------------------------------
| PREMIUM ENTITLEMENTS
|--------------------------------------------------------------------------
|
| Premium unlocks the complete Resolve protection and recovery system.
|
|--------------------------------------------------------------------------
*/

export const PREMIUM_ENTITLEMENTS: ResolveEntitlements = {
  basicRecoveryDashboard: true,

  journalAndMoodTracking: true,

  basicWebsiteBlocking: true,

  basicAICoach: true,

  fullAICoach: true,

  customBlockedWebsites: true,

  unlimitedBlockedSites: true,

  scheduledBlocking: true,

  multipleBlockingProfiles: true,

  adaptiveProtection: true,

  emergencyIntervention: true,

  guidedBreathing: true,

  focusTools: true,

  advancedRecoveryAnalytics: true,
};

/*
|--------------------------------------------------------------------------
| GET SUBSCRIPTION
|--------------------------------------------------------------------------
*/

export async function getSubscription(
  userId: string
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "❌ Failed to get subscription:",
      error
    );

    throw error;
  }

  return data as Subscription | null;
}

/*
|--------------------------------------------------------------------------
| ENSURE SUBSCRIPTION
|--------------------------------------------------------------------------
|
| Every authenticated Resolve user should have exactly one subscription.
|
| New users receive:
|
| plan   = free
| status = active
|
|--------------------------------------------------------------------------
*/

export async function ensureSubscription(
  userId: string
): Promise<Subscription> {
  /*
  |--------------------------------------------------------------------------
  | Check existing subscription
  |--------------------------------------------------------------------------
  */

  const existing =
    await getSubscription(userId);

  if (existing) {
    return existing;
  }

  /*
  |--------------------------------------------------------------------------
  | Create Free subscription
  |--------------------------------------------------------------------------
  */

  const { data, error } =
    await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        provider: "manual",
        plan: "free",
        status: "active",
        provider_customer_id: null,
        provider_subscription_id: null,
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
      })
      .select("*")
      .single();

  if (error) {
    /*
    |--------------------------------------------------------------------------
    | Possible race condition
    |--------------------------------------------------------------------------
    |
    | Another request may have created the subscription between
    | getSubscription() and insert().
    |
    |--------------------------------------------------------------------------
    */

    console.error(
      "❌ Failed to create free subscription:",
      error
    );

    const existingAfterInsertFailure =
      await getSubscription(userId);

    if (existingAfterInsertFailure) {
      return existingAfterInsertFailure;
    }

    throw error;
  }

  return data as Subscription;
}

/*
|--------------------------------------------------------------------------
| CHECK WHETHER A SUBSCRIPTION IS CURRENTLY PREMIUM
|--------------------------------------------------------------------------
|
| Premium requires:
|
| 1. plan = premium
| 2. status = active OR trialing
| 3. current period has not expired
|
|--------------------------------------------------------------------------
*/

export function isPremiumSubscription(
  subscription: Subscription | null
): boolean {
  if (!subscription) {
    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | Plan
  |--------------------------------------------------------------------------
  */

  if (
    subscription.plan !==
    "premium"
  ) {
    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | Status
  |--------------------------------------------------------------------------
  */

  const validStatus =
    subscription.status ===
      "active" ||
    subscription.status ===
      "trialing";

  if (!validStatus) {
    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | Expiration
  |--------------------------------------------------------------------------
  */

  if (
    subscription.current_period_end
  ) {
    const expiresAt =
      new Date(
        subscription.current_period_end
      ).getTime();

    if (
      Number.isFinite(expiresAt) &&
      expiresAt < Date.now()
    ) {
      return false;
    }
  }

  return true;
}

/*
|--------------------------------------------------------------------------
| PREMIUM ENTITLEMENT CHECK
|--------------------------------------------------------------------------
*/

export async function isPremium(
  userId: string
): Promise<boolean> {
  const subscription =
    await getSubscription(userId);

  return isPremiumSubscription(
    subscription
  );
}

/*
|--------------------------------------------------------------------------
| GET ENTITLEMENTS FROM SUBSCRIPTION
|--------------------------------------------------------------------------
|
| This function converts the subscription into a stable feature-access
| object that the web application and extension can consume.
|
|--------------------------------------------------------------------------
*/

export function getEntitlementsForSubscription(
  subscription: Subscription | null
): ResolveEntitlements {
  const premium =
    isPremiumSubscription(
      subscription
    );

  if (premium) {
    return PREMIUM_ENTITLEMENTS;
  }

  return FREE_ENTITLEMENTS;
}

/*
|--------------------------------------------------------------------------
| GET USER ENTITLEMENTS
|--------------------------------------------------------------------------
*/

export async function getUserEntitlements(
  userId: string
): Promise<ResolveEntitlements> {
  const subscription =
    await getSubscription(userId);

  return getEntitlementsForSubscription(
    subscription
  );
}

/*
|--------------------------------------------------------------------------
| UPDATE SUBSCRIPTION
|--------------------------------------------------------------------------
|
| Used by Paystack/webhook logic.
|
| The browser must NEVER directly modify its subscription.
|
|--------------------------------------------------------------------------
*/

export async function updateSubscription(
  userId: string,
  updates: Partial<
    Pick<
      Subscription,
      | "provider"
      | "provider_customer_id"
      | "provider_subscription_id"
      | "plan"
      | "status"
      | "current_period_start"
      | "current_period_end"
      | "cancel_at_period_end"
    >
  >
): Promise<Subscription> {
  const { data, error } =
    await supabase
      .from("subscriptions")
      .update(updates)
      .eq("user_id", userId)
      .select("*")
      .single();

  if (error) {
    console.error(
      "❌ Failed to update subscription:",
      error
    );

    throw error;
  }

  return data as Subscription;
}

/*
|--------------------------------------------------------------------------
| FIND SUBSCRIPTION BY PAYSTACK CUSTOMER
|--------------------------------------------------------------------------
*/

export async function getSubscriptionByProviderCustomerId(
  providerCustomerId: string
): Promise<Subscription | null> {
  const { data, error } =
    await supabase
      .from("subscriptions")
      .select("*")
      .eq(
        "provider",
        "paystack"
      )
      .eq(
        "provider_customer_id",
        providerCustomerId
      )
      .maybeSingle();

  if (error) {
    console.error(
      "❌ Failed to find subscription by Paystack customer:",
      error
    );

    throw error;
  }

  return data as Subscription | null;
}

/*
|--------------------------------------------------------------------------
| FIND SUBSCRIPTION BY PAYSTACK SUBSCRIPTION
|--------------------------------------------------------------------------
*/

export async function getSubscriptionByProviderSubscriptionId(
  providerSubscriptionId: string
): Promise<Subscription | null> {
  const { data, error } =
    await supabase
      .from("subscriptions")
      .select("*")
      .eq(
        "provider",
        "paystack"
      )
      .eq(
        "provider_subscription_id",
        providerSubscriptionId
      )
      .maybeSingle();

  if (error) {
    console.error(
      "❌ Failed to find subscription by Paystack subscription:",
      error
    );

    throw error;
  }

  return data as Subscription | null;
}