import { getSession } from "./authService";

/*
|--------------------------------------------------------------------------
| Types
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

  provider_customer_id:
    | string
    | null;

  provider_subscription_id:
    | string
    | null;

  plan: SubscriptionPlan;

  status: SubscriptionStatus;

  current_period_start:
    | string
    | null;

  current_period_end:
    | string
    | null;

  cancel_at_period_end: boolean;

  created_at: string;

  updated_at: string;
};

export type SubscriptionResponse = {
  success: boolean;

  subscription: Subscription;
};

export type CheckoutPlan =
  | "monthly"
  | "yearly";

/*
|--------------------------------------------------------------------------
| Card Checkout
|--------------------------------------------------------------------------
*/

export type CheckoutResponse = {
  success: boolean;

  plan: CheckoutPlan;

  authorization_url: string;

  access_code: string;

  reference: string;
};

/*
|--------------------------------------------------------------------------
| M-PESA Checkout
|--------------------------------------------------------------------------
*/

export type MpesaCheckoutResponse = {
  success: boolean;

  plan: CheckoutPlan;

  payment_method: "mpesa";

  reference: string;

  status: string;

  display_text?: string | null;
};

/*
|--------------------------------------------------------------------------
| M-PESA Prices
|--------------------------------------------------------------------------
|
| These are the customer-facing prices in Kenyan Shillings.
|
*/

export const MPESA_PRICES_KES: Record<
  CheckoutPlan,
  number
> = {
  monthly: 899,
  yearly: 9449,
};

/*
|--------------------------------------------------------------------------
| API URL
|--------------------------------------------------------------------------
*/

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

/*
|--------------------------------------------------------------------------
| Get Authorization Header
|--------------------------------------------------------------------------
*/

async function getAuthorizationHeader() {
  const session =
    await getSession();

  if (!session?.access_token) {
    throw new Error(
      "You must be logged in to access your subscription."
    );
  }

  return {
    Authorization:
      `Bearer ${session.access_token}`,
  };
}

/*
|--------------------------------------------------------------------------
| Get My Subscription
|--------------------------------------------------------------------------
*/

export async function getMySubscription(): Promise<Subscription> {
  const headers =
    await getAuthorizationHeader();

  const response =
    await fetch(
      `${API_URL}/api/subscription`,
      {
        method: "GET",

        headers: {
          ...headers,

          "Content-Type":
            "application/json",
        },
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to load subscription."
    );
  }

  return data.subscription;
}

/*
|--------------------------------------------------------------------------
| Create Paystack Card Checkout
|--------------------------------------------------------------------------
*/

export async function createCheckout(
  plan: CheckoutPlan
): Promise<CheckoutResponse> {
  const headers =
    await getAuthorizationHeader();

  const response =
    await fetch(
      `${API_URL}/api/subscription/checkout`,
      {
        method: "POST",

        headers: {
          ...headers,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          plan,
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Unable to initialize Premium checkout."
    );
  }

  return data as CheckoutResponse;
}

/*
|--------------------------------------------------------------------------
| Start Paystack Card Checkout
|--------------------------------------------------------------------------
|
| This opens Paystack's hosted checkout page.
|
*/

export async function startPaystackCheckout(
  plan: CheckoutPlan
): Promise<CheckoutResponse> {
  const checkout =
    await createCheckout(plan);

  if (
    !checkout.authorization_url
  ) {
    throw new Error(
      "Paystack did not return a checkout URL."
    );
  }

  window.location.href =
    checkout.authorization_url;

  return checkout;
}

/*
|--------------------------------------------------------------------------
| Create M-PESA Checkout
|--------------------------------------------------------------------------
*/

export async function createMpesaCheckout(
  plan: CheckoutPlan,
  phone: string
): Promise<MpesaCheckoutResponse> {
  const headers =
    await getAuthorizationHeader();

  const response =
    await fetch(
      `${API_URL}/api/subscription/mpesa`,
      {
        method: "POST",

        headers: {
          ...headers,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          plan,
          phone,
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Unable to initialize M-PESA payment."
    );
  }

  return data as MpesaCheckoutResponse;
}

/*
|--------------------------------------------------------------------------
| Start M-PESA Checkout
|--------------------------------------------------------------------------
|
| M-PESA payments are asynchronous.
|
| Paystack normally returns:
|
| status: "pay_offline"
|
| The customer then completes the M-PESA
| authorization on their phone.
|
*/

export async function startMpesaCheckout(
  plan: CheckoutPlan,
  phone: string
): Promise<MpesaCheckoutResponse> {
  const checkout =
    await createMpesaCheckout(
      plan,
      phone
    );

  return checkout;
}

/*
|--------------------------------------------------------------------------
| Check Premium Status
|--------------------------------------------------------------------------
*/

export async function isPremium(): Promise<boolean> {
  const subscription =
    await getMySubscription();

  if (
    subscription.plan !==
    "premium"
  ) {
    return false;
  }

  if (
    subscription.status !==
      "active" &&
    subscription.status !==
      "trialing"
  ) {
    return false;
  }

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