import type {
  Request,
  Response,
} from "express";

import {
  verifyPaystackWebhookSignature,
} from "../services/paystackService.js";

import {
  getSubscriptionByProviderCustomerId,
  getSubscriptionByProviderSubscriptionId,
  updateSubscription,
} from "../services/subscriptionService.js";

type PaystackWebhookEvent = {
  event?: string;
  data?: any;
};

/*
|--------------------------------------------------------------------------
| Resolve Paystack Webhook Controller
|--------------------------------------------------------------------------
|
| Paystack sends webhook events for:
|
| - Initial successful payments
| - Subscription creation
| - Recurring successful payments
| - Failed recurring payments
| - Non-renewing subscriptions
| - Disabled subscriptions
|
| The webhook must:
|
| 1. Verify the Paystack signature.
| 2. Identify the Resolve user.
| 3. Update the subscription state.
| 4. Return HTTP 200 when the event has been handled.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Find Resolve subscription from Paystack event
|--------------------------------------------------------------------------
|
| Identification order:
|
| 1. Resolve metadata user_id
| 2. Paystack subscription code
| 3. Paystack customer code
|
| This is important because recurring Paystack events may not contain
| the original Resolve metadata.
|
|--------------------------------------------------------------------------
*/

async function findResolveSubscription(
  event: PaystackWebhookEvent
) {
  const metadata =
    event.data?.metadata;

  /*
  |--------------------------------------------------------------------------
  | 1. Resolve user_id from metadata
  |--------------------------------------------------------------------------
  */

  const metadataUserId =
    typeof metadata?.user_id === "string" &&
    metadata.user_id.length > 0
      ? metadata.user_id
      : null;

  if (metadataUserId) {
    return {
      subscription: null,
      userId: metadataUserId,
      source: "metadata",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | 2. Paystack subscription code
  |--------------------------------------------------------------------------
  */

  const subscriptionCode =
    event.data?.subscription_code ??
    event.data?.subscription?.subscription_code ??
    event.data?.subscription?.subscription_code;

  if (
    typeof subscriptionCode === "string" &&
    subscriptionCode.length > 0
  ) {
    const subscription =
      await getSubscriptionByProviderSubscriptionId(
        subscriptionCode
      );

    if (subscription) {
      return {
        subscription,
        userId: subscription.user_id,
        source: "provider_subscription",
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | 3. Paystack customer code
  |--------------------------------------------------------------------------
  */

  const customerCode =
    event.data?.customer?.customer_code ??
    event.data?.customer_code ??
    event.data?.subscription?.customer?.customer_code;

  if (
    typeof customerCode === "string" &&
    customerCode.length > 0
  ) {
    const subscription =
      await getSubscriptionByProviderCustomerId(
        customerCode
      );

    if (subscription) {
      return {
        subscription,
        userId: subscription.user_id,
        source: "provider_customer",
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Could not identify user
  |--------------------------------------------------------------------------
  */

  return {
    subscription: null,
    userId: null,
    source: "none",
  };
}

/*
|--------------------------------------------------------------------------
| Determine Resolve billing plan
|--------------------------------------------------------------------------
*/

function determineResolvePlan(
  event: PaystackWebhookEvent
): "monthly" | "yearly" {
  const metadata =
    event.data?.metadata;

  /*
  |--------------------------------------------------------------------------
  | Prefer Resolve metadata
  |--------------------------------------------------------------------------
  */

  if (
    metadata?.resolve_plan ===
    "yearly"
  ) {
    return "yearly";
  }

  if (
    metadata?.resolve_plan ===
    "monthly"
  ) {
    return "monthly";
  }

  /*
  |--------------------------------------------------------------------------
  | Fall back to Paystack plan code
  |--------------------------------------------------------------------------
  */

  const planCode =
    event.data?.plan?.plan_code ??
    event.data?.plan_object?.plan_code ??
    event.data?.subscription?.plan?.plan_code ??
    null;

  if (
    planCode ===
    process.env.PAYSTACK_YEARLY_PLAN_CODE
  ) {
    return "yearly";
  }

  return "monthly";
}

/*
|--------------------------------------------------------------------------
| Extract Paystack customer code
|--------------------------------------------------------------------------
*/

function getCustomerCode(
  event: PaystackWebhookEvent
): string | null {
  const customerCode =
    event.data?.customer?.customer_code ??
    event.data?.customer_code ??
    event.data?.subscription?.customer?.customer_code ??
    null;

  return typeof customerCode === "string" &&
    customerCode.length > 0
    ? customerCode
    : null;
}

/*
|--------------------------------------------------------------------------
| Extract Paystack subscription code
|--------------------------------------------------------------------------
*/

function getSubscriptionCode(
  event: PaystackWebhookEvent
): string | null {
  const subscriptionCode =
    event.data?.subscription_code ??
    event.data?.subscription?.subscription_code ??
    null;

  return typeof subscriptionCode === "string" &&
    subscriptionCode.length > 0
    ? subscriptionCode
    : null;
}

/*
|--------------------------------------------------------------------------
| Extract next payment date
|--------------------------------------------------------------------------
*/

function getNextPaymentDate(
  event: PaystackWebhookEvent
): string | null {
  const nextPaymentDate =
    event.data?.next_payment_date ??
    event.data?.subscription?.next_payment_date ??
    null;

  return typeof nextPaymentDate === "string" &&
    nextPaymentDate.length > 0
    ? nextPaymentDate
    : null;
}

/*
|--------------------------------------------------------------------------
| Main webhook handler
|--------------------------------------------------------------------------
*/

export async function handlePaystackWebhook(
  req: Request,
  res: Response
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Raw body
    |--------------------------------------------------------------------------
    |
    | The Paystack signature is generated from the exact raw request body.
    |
    |--------------------------------------------------------------------------
    */

    const rawBody =
      req.body as Buffer;

    if (!Buffer.isBuffer(rawBody)) {
      console.error(
        "❌ Paystack webhook body is not a Buffer."
      );

      return res.sendStatus(400);
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Paystack signature
    |--------------------------------------------------------------------------
    */

    const signature =
      req.headers[
        "x-paystack-signature"
      ] as string | undefined;

    const isValid =
      verifyPaystackWebhookSignature(
        rawBody,
        signature
      );

    if (!isValid) {
      console.error(
        "❌ Invalid Paystack webhook signature."
      );

      return res.sendStatus(401);
    }

    /*
    |--------------------------------------------------------------------------
    | Parse event
    |--------------------------------------------------------------------------
    */

    let event: PaystackWebhookEvent;

    try {
      event =
        JSON.parse(
          rawBody.toString("utf8")
        ) as PaystackWebhookEvent;
    } catch (error) {
      console.error(
        "❌ Failed to parse Paystack webhook JSON:",
        error
      );

      return res.sendStatus(400);
    }

    console.log(
      "📥 Paystack webhook received:",
      event.event
    );

    /*
    |--------------------------------------------------------------------------
    | Basic event validation
    |--------------------------------------------------------------------------
    */

    if (!event.event) {
      console.warn(
        "⚠️ Paystack webhook has no event type."
      );

      return res.sendStatus(200);
    }

    /*
    |--------------------------------------------------------------------------
    | Extract common Paystack identifiers
    |--------------------------------------------------------------------------
    */

    const customerCode =
      getCustomerCode(event);

    const subscriptionCode =
      getSubscriptionCode(event);

    const nextPaymentDate =
      getNextPaymentDate(event);

    /*
    |--------------------------------------------------------------------------
    | Identify Resolve user
    |--------------------------------------------------------------------------
    */

    const resolved =
      await findResolveSubscription(
        event
      );

    console.log(
      "🔎 Paystack webhook Resolve lookup:",
      {
        event: event.event,
        userId: resolved.userId,
        source: resolved.source,
        customerCode,
        subscriptionCode,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | CHARGE.SUCCESS
    |--------------------------------------------------------------------------
    |
    | This occurs:
    |
    | - After the initial Premium payment.
    | - During recurring Premium payments.
    |
    | A successful charge means Premium should be active.
    |
    |--------------------------------------------------------------------------
    */

    if (
      event.event ===
      "charge.success"
    ) {
      /*
      |--------------------------------------------------------------------------
      | Cannot identify Resolve user
      |--------------------------------------------------------------------------
      */

      if (!resolved.userId) {
        console.warn(
          "⚠️ Paystack charge.success could not be associated with a Resolve user.",
          {
            reference:
              event.data?.reference,
            email:
              event.data?.customer?.email,
            customerCode,
            subscriptionCode,
          }
        );

        /*
        | Return 200 so Paystack does not repeatedly retry an event
        | that Resolve cannot associate with an account.
        */

        return res.sendStatus(200);
      }

      const plan =
        determineResolvePlan(event);

      const now =
        new Date();

      /*
      |--------------------------------------------------------------------------
      | Update Premium subscription
      |--------------------------------------------------------------------------
      */

      await updateSubscription(
        resolved.userId,
        {
          provider:
            "paystack",

          provider_customer_id:
            customerCode,

          provider_subscription_id:
            subscriptionCode,

          plan:
            "premium",

          status:
            "active",

          current_period_start:
            now.toISOString(),

          current_period_end:
            nextPaymentDate,

          cancel_at_period_end:
            false,
        }
      );

      console.log(
        "✅ Resolve Premium activated/renewed:",
        {
          userId:
            resolved.userId,

          plan,

          reference:
            event.data?.reference,

          customerCode,

          subscriptionCode,

          nextPaymentDate,

          lookupSource:
            resolved.source,
        }
      );

      return res.sendStatus(200);
    }

    /*
    |--------------------------------------------------------------------------
    | SUBSCRIPTION.CREATE
    |--------------------------------------------------------------------------
    |
    | Paystack sends this when a recurring subscription is created.
    |
    | We synchronize the Paystack identifiers with Resolve.
    |
    |--------------------------------------------------------------------------
    */

    if (
      event.event ===
      "subscription.create"
    ) {
      /*
      |--------------------------------------------------------------------------
      | If we already know the Resolve user, synchronize identifiers.
      |--------------------------------------------------------------------------
      */

      if (resolved.userId) {
        await updateSubscription(
          resolved.userId,
          {
            provider:
              "paystack",

            provider_customer_id:
              customerCode,

            provider_subscription_id:
              subscriptionCode,
          }
        );

        console.log(
          "📋 Resolve Paystack subscription synchronized:",
          {
            userId:
              resolved.userId,

            customerCode,

            subscriptionCode,

            lookupSource:
              resolved.source,
          }
        );
      } else {
        console.warn(
          "⚠️ Paystack subscription.create could not be associated with a Resolve user.",
          {
            customerCode,
            subscriptionCode,
            email:
              event.data?.customer?.email,
          }
        );
      }

      return res.sendStatus(200);
    }

    /*
    |--------------------------------------------------------------------------
    | SUBSCRIPTION.NOT_RENEW
    |--------------------------------------------------------------------------
    |
    | The customer has requested cancellation/non-renewal.
    |
    | Premium should normally remain available until the current
    | billing period ends.
    |
    | Therefore:
    |
    | cancel_at_period_end = true
    |
    | We do NOT immediately remove Premium.
    |
    |--------------------------------------------------------------------------
    */

    if (
      event.event ===
      "subscription.not_renew"
    ) {
      if (resolved.userId) {
        await updateSubscription(
          resolved.userId,
          {
            cancel_at_period_end:
              true,
          }
        );

        console.log(
          "⚠️ Resolve Premium marked to cancel at period end:",
          {
            userId:
              resolved.userId,

            subscriptionCode,

            customerCode,
          }
        );
      } else {
        console.warn(
          "⚠️ Could not identify Resolve user for subscription.not_renew.",
          {
            subscriptionCode,
            customerCode,
          }
        );
      }

      return res.sendStatus(200);
    }

    /*
    |--------------------------------------------------------------------------
    | SUBSCRIPTION.DISABLE
    |--------------------------------------------------------------------------
    |
    | The Paystack subscription has actually been disabled.
    |
    | Premium is therefore removed.
    |
    |--------------------------------------------------------------------------
    */

    if (
      event.event ===
      "subscription.disable"
    ) {
      if (resolved.userId) {
        await updateSubscription(
          resolved.userId,
          {
            status:
              "expired",

            cancel_at_period_end:
              false,
          }
        );

        console.log(
          "🛑 Resolve Premium subscription disabled:",
          {
            userId:
              resolved.userId,

            subscriptionCode,

            customerCode,
          }
        );
      } else {
        console.warn(
          "⚠️ Could not identify Resolve user for subscription.disable.",
          {
            subscriptionCode,
            customerCode,
          }
        );
      }

      return res.sendStatus(200);
    }

    /*
    |--------------------------------------------------------------------------
    | INVOICE.PAYMENT_FAILED
    |--------------------------------------------------------------------------
    |
    | A recurring payment failed.
    |
    | We mark the subscription as past_due rather than immediately
    | deleting Premium access.
    |
    | This gives the billing system an opportunity to recover the payment.
    |
    |--------------------------------------------------------------------------
    */

    if (
      event.event ===
      "invoice.payment_failed"
    ) {
      if (resolved.userId) {
        await updateSubscription(
          resolved.userId,
          {
            status:
              "past_due",
          }
        );

        console.warn(
          "⚠️ Resolve Premium payment marked past_due:",
          {
            userId:
              resolved.userId,

            subscriptionCode,

            customerCode,

            reference:
              event.data?.reference,
          }
        );
      } else {
        console.warn(
          "⚠️ Could not identify Resolve user for invoice.payment_failed.",
          {
            subscriptionCode,
            customerCode,
          }
        );
      }

      return res.sendStatus(200);
    }

    /*
    |--------------------------------------------------------------------------
    | INVOICE.CREATE
    |--------------------------------------------------------------------------
    |
    | Paystack creates an invoice before attempting a recurring charge.
    |
    | No subscription status change is required here.
    |
    |--------------------------------------------------------------------------
    */

    if (
      event.event ===
      "invoice.create"
    ) {
      console.log(
        "🧾 Paystack invoice created:",
        {
          userId:
            resolved.userId,

          subscriptionCode,

          customerCode,

          amount:
            event.data?.amount,

          currency:
            event.data?.currency,
        }
      );

      return res.sendStatus(200);
    }

    /*
    |--------------------------------------------------------------------------
    | INVOICE.UPDATE
    |--------------------------------------------------------------------------
    |
    | Paystack may send updated invoice information after payment
    | processing.
    |
    |--------------------------------------------------------------------------
    */

    if (
      event.event ===
      "invoice.update"
    ) {
      console.log(
        "🧾 Paystack invoice updated:",
        {
          userId:
            resolved.userId,

          subscriptionCode,

          customerCode,

          status:
            event.data?.status,

          amount:
            event.data?.amount,
        }
      );

      return res.sendStatus(200);
    }

    /*
    |--------------------------------------------------------------------------
    | Unknown / informational event
    |--------------------------------------------------------------------------
    */

    console.log(
      "ℹ️ Paystack event acknowledged:",
      event.event
    );

    return res.sendStatus(200);
  } catch (error) {
    console.error(
      "❌ Paystack webhook processing error:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | HTTP 500
    |--------------------------------------------------------------------------
    |
    | A server error tells Paystack that processing failed and allows
    | Paystack to retry according to its webhook retry mechanism.
    |
    |--------------------------------------------------------------------------
    */

    return res.sendStatus(500);
  }
}