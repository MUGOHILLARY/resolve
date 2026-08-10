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
| Every authenticated Resolve user should have
| exactly one subscription record.
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

  const existing = await getSubscription(userId);

  if (existing) {
    return existing;
  }

  /*
  |--------------------------------------------------------------------------
  | Create free subscription
  |--------------------------------------------------------------------------
  */

  const { data, error } = await supabase
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
    | In that case, retrieve the existing record.
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
| PREMIUM ENTITLEMENT CHECK
|--------------------------------------------------------------------------
|
| Premium requires:
|
| 1. plan = premium
| 2. status = active OR trialing
| 3. subscription has not expired
|
|--------------------------------------------------------------------------
*/

export async function isPremium(
  userId: string
): Promise<boolean> {
  const subscription =
    await getSubscription(userId);

  if (!subscription) {
    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | Check plan
  |--------------------------------------------------------------------------
  */

  if (subscription.plan !== "premium") {
    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | Check status
  |--------------------------------------------------------------------------
  */

  const validStatus =
    subscription.status === "active" ||
    subscription.status === "trialing";

  if (!validStatus) {
    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | Check expiration
  |--------------------------------------------------------------------------
  */

  if (subscription.current_period_end) {
    const expiresAt = new Date(
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
| UPDATE SUBSCRIPTION
|--------------------------------------------------------------------------
|
| This will later be used by the payment webhook.
|
| The browser must NEVER directly modify its
| subscription.
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
  const { data, error } = await supabase
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