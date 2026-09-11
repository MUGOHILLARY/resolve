import crypto from "node:crypto";

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    customer?: {
      email?: string;
      customer_code?: string;
    };
    plan?: {
      plan_code?: string;
      name?: string;
    };
    metadata?: Record<string, unknown>;
  };
};

/**
 * Paystack response for a mobile-money charge.
 *
 * For M-PESA, Paystack may initially return a
 * `pay_offline` status while the customer completes
 * authorization on their phone.
 */
type PaystackMpesaChargeResponse = {
  status: boolean;
  message: string;
  data?: {
    amount: number;
    currency: string;
    reference: string;
    status: string;
    display_text?: string;
    channel?: string;
    gateway_response?: string;
    paid_at?: string | null;
    metadata?: Record<string, unknown>;
    customer?: {
      email?: string;
      customer_code?: string;
    };
  };
};

export type MpesaPlan =
  | "monthly"
  | "yearly";

const PAYSTACK_API_URL =
  "https://api.paystack.co";

/**
 * Resolve M-PESA prices in Kenyan Shillings.
 *
 * These are one-time payments.
 *
 * Monthly: KES 899
 * Yearly:  KES 9,449
 */
const MPESA_PRICES_KES: Record<
  MpesaPlan,
  number
> = {
  monthly: 899,
  yearly: 9449,
};

function getSecretKey(): string {
  const key =
    process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not configured."
    );
  }

  return key;
}

/**
 * Generic Paystack API request helper.
 */
async function paystackRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${PAYSTACK_API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        Authorization:
          `Bearer ${getSecretKey()}`,
        "Content-Type":
          "application/json",
        ...(options.headers || {}),
      },
    }
  );

  const data =
    (await response.json()) as T;

  if (!response.ok) {
    console.error(
      "❌ Paystack API error:",
      data
    );

    throw new Error(
      `Paystack API request failed with status ${response.status}.`
    );
  }

  return data;
}

/**
 * Get the Paystack plan code configured for
 * the selected recurring card subscription.
 *
 * These are separate from the M-PESA prices.
 */
export function getPaystackPlanCode(
  plan: "monthly" | "yearly"
): string {
  const code =
    plan === "monthly"
      ? process.env
          .PAYSTACK_MONTHLY_PLAN_CODE
      : process.env
          .PAYSTACK_YEARLY_PLAN_CODE;

  if (!code) {
    throw new Error(
      `Paystack ${plan} plan code is not configured.`
    );
  }

  return code;
}

/**
 * Initialize a normal Paystack recurring
 * card subscription.
 *
 * Existing working Resolve checkout flow.
 */
export async function initializePaystackTransaction(
  email: string,
  plan: "monthly" | "yearly",
  userId: string
) {
  const planCode =
    getPaystackPlanCode(plan);

  const callbackUrl =
    process.env.PAYSTACK_CALLBACK_URL;

  if (!callbackUrl) {
    throw new Error(
      "PAYSTACK_CALLBACK_URL is not configured."
    );
  }

  const response =
    await paystackRequest<PaystackInitializeResponse>(
      "/transaction/initialize",
      {
        method: "POST",

        body: JSON.stringify({
          email,

          plan: planCode,

          callback_url: callbackUrl,

          metadata: {
            user_id: userId,
            resolve_plan: plan,
            payment_method: "card",
            resolve_product:
              "resolve_premium",
          },
        }),
      }
    );

  if (
    !response.status ||
    !response.data?.authorization_url ||
    !response.data?.reference
  ) {
    throw new Error(
      response.message ||
        "Unable to initialize Paystack transaction."
    );
  }

  return response.data;
}

/**
 * Return the M-PESA price in Kenyan Shillings.
 *
 * Paystack expects monetary amounts in the
 * smallest currency unit, so callers should
 * multiply this value by 100 when charging.
 */
export function getMpesaPrice(
  plan: MpesaPlan
): number {
  return MPESA_PRICES_KES[plan];
}

/**
 * Normalize a Kenyan mobile number into
 * international +254 format.
 *
 * Supported examples:
 *
 * 0712345678
 * 712345678
 * 254712345678
 * +254712345678
 */
function normalizeKenyanPhone(
  phone: string
): string {
  const cleaned =
    phone.trim().replace(
      /[\s()-]/g,
      ""
    );

  if (
    cleaned.startsWith("+254")
  ) {
    return cleaned;
  }

  if (
    cleaned.startsWith("254")
  ) {
    return `+${cleaned}`;
  }

  if (
    cleaned.startsWith("0")
  ) {
    return `+254${cleaned.slice(1)}`;
  }

  if (
    cleaned.startsWith("7") ||
    cleaned.startsWith("1")
  ) {
    return `+254${cleaned}`;
  }

  throw new Error(
    "Enter a valid Kenyan M-PESA phone number, for example 0712345678."
  );
}

/**
 * Initialize an M-PESA payment through
 * Paystack's Charge API.
 *
 * IMPORTANT:
 * This is a one-time payment.
 * It is NOT a recurring subscription.
 */
export async function initializeMpesaCharge(
  email: string,
  phone: string,
  plan: MpesaPlan,
  userId: string
) {
  const normalizedPhone =
    normalizeKenyanPhone(phone);

  const amountKes =
    getMpesaPrice(plan);

  /*
   * Paystack expects the amount in the
   * smallest currency unit.
   *
   * KES 899  -> 89900
   * KES 9449 -> 944900
   */
  const amountInKobo =
    amountKes * 100;

  const response =
    await paystackRequest<PaystackMpesaChargeResponse>(
      "/charge",
      {
        method: "POST",

        body: JSON.stringify({
          email,

          amount: amountInKobo,

          currency: "KES",

          mobile_money: {
            phone: normalizedPhone,
            provider: "mpesa",
          },

          metadata: {
            user_id: userId,

            resolve_plan: plan,

            payment_method: "mpesa",

            resolve_product:
              "resolve_premium",

            amount_kes: amountKes,
          },
        }),
      }
    );

  if (
    !response.status ||
    !response.data?.reference
  ) {
    throw new Error(
      response.message ||
        "Unable to initialize M-PESA payment."
    );
  }

  console.log(
    "📱 Paystack M-PESA charge initialized:",
    {
      userId,
      plan,
      amountKes,
      reference:
        response.data.reference,
      status:
        response.data.status,
      gatewayResponse:
        response.data.gateway_response,
    }
  );

  return response.data;
}

/**
 * Verify a Paystack transaction by reference.
 *
 * This remains useful for payment-result
 * verification in addition to webhooks.
 */
export async function verifyPaystackTransaction(
  reference: string
) {
  const response =
    await paystackRequest<PaystackVerifyResponse>(
      `/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",
      }
    );

  return response;
}

/**
 * Verify a Paystack webhook signature.
 *
 * Paystack signs the raw webhook body using
 * HMAC-SHA512 and the Paystack secret key.
 */
export function verifyPaystackWebhookSignature(
  rawBody: Buffer,
  signature: string | undefined
): boolean {
  if (!signature) {
    return false;
  }

  const expectedSignature =
    crypto
      .createHmac(
        "sha512",
        getSecretKey()
      )
      .update(rawBody)
      .digest("hex");

  const expectedBuffer =
    Buffer.from(
      expectedSignature,
      "utf8"
    );

  const receivedBuffer =
    Buffer.from(
      signature,
      "utf8"
    );

  /*
   * timingSafeEqual throws when the buffers
   * have different lengths. Check first.
   */
  if (
    expectedBuffer.length !==
    receivedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );
}