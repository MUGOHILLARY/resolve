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

const PAYSTACK_API_URL =
  "https://api.paystack.co";

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