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
| Handles:
|
| - Initial successful card payments
| - M-PESA successful payments
| - Subscription creation
| - Recurring card payments
| - Failed recurring payments
| - Subscription cancellation
| - Subscription disabling
| - Invoice events
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Find Resolve subscription/user
|--------------------------------------------------------------------------
|
| Identification order:
|
| 1. Resolve metadata user_id
| 2. Paystack subscription code
| 3. Paystack customer code
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
  | 1. Resolve user ID from metadata
  |--------------------------------------------------------------------------
  */

  const metadataUserId =
    typeof metadata?.user_id ===
      "string" &&
    metadata.user_id.length > 0
      ? metadata.user_id
      : null;

  if (metadataUserId) {
    return {
      subscription:
        null,

      userId:
        metadataUserId,

      source:
        "metadata",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | 2. Paystack subscription code
  |--------------------------------------------------------------------------
  */

  const subscriptionCode =
    event.data
      ?.subscription_code ??
    event.data
      ?.subscription
      ?.subscription_code ??
    null;

  if (
    typeof subscriptionCode ===
      "string" &&
    subscriptionCode.length > 0
  ) {
    const subscription =
      await getSubscriptionByProviderSubscriptionId(
        subscriptionCode
      );

    if (subscription) {
      return {
        subscription,

        userId:
          subscription.user_id,

        source:
          "provider_subscription",
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | 3. Paystack customer code
  |--------------------------------------------------------------------------
  */

  const customerCode =
    event.data
      ?.customer
      ?.customer_code ??
    event.data
      ?.customer_code ??
    event.data
      ?.subscription
      ?.customer
      ?.customer_code ??
    null;

  if (
    typeof customerCode ===
      "string" &&
    customerCode.length > 0
  ) {
    const subscription =
      await getSubscriptionByProviderCustomerId(
        customerCode
      );

    if (subscription) {
      return {
        subscription,

        userId:
          subscription.user_id,

        source:
          "provider_customer",
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Could not identify user
  |--------------------------------------------------------------------------
  */

  return {
    subscription:
      null,

    userId:
      null,

    source:
      "none",
  };
}

/*
|--------------------------------------------------------------------------
| Determine Resolve Premium plan
|--------------------------------------------------------------------------
|
| Metadata is preferred because it is the most
| reliable source for both card and M-PESA.
|
|--------------------------------------------------------------------------
*/

function determineResolvePlan(
  event: PaystackWebhookEvent
): "monthly" | "yearly" {
  const metadata =
    event.data?.metadata;

  /*
  |--------------------------------------------------------------------------
  | Resolve metadata
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
  | Paystack plan fallback
  |--------------------------------------------------------------------------
  */

  const planCode =
    event.data
      ?.plan
      ?.plan_code ??
    event.data
      ?.plan_object
      ?.plan_code ??
    event.data
      ?.subscription
      ?.plan
      ?.plan_code ??
    null;

  if (
    planCode ===
    process.env
      .PAYSTACK_YEARLY_PLAN_CODE
  ) {
    return "yearly";
  }

  return "monthly";
}

/*
|--------------------------------------------------------------------------
| Get payment method
|--------------------------------------------------------------------------
*/

function getPaymentMethod(
  event: PaystackWebhookEvent
): string | null {
  const metadata =
    event.data?.metadata;

  if (
    typeof metadata?.payment_method ===
      "string"
  ) {
    return metadata.payment_method;
  }

  /*
  |--------------------------------------------------------------------------
  | Paystack channel fallback
  |--------------------------------------------------------------------------
  */

  if (
    event.data?.channel ===
    "mobile_money"
  ) {
    return "mpesa";
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Get customer code
|--------------------------------------------------------------------------
*/

function getCustomerCode(
  event: PaystackWebhookEvent
): string | null {
  const customerCode =
    event.data
      ?.customer
      ?.customer_code ??
    event.data
      ?.customer_code ??
    event.data
      ?.subscription
      ?.customer
      ?.customer_code ??
    null;

  return (
    typeof customerCode ===
      "string" &&
    customerCode.length > 0
      ? customerCode
      : null
  );
}

/*
|--------------------------------------------------------------------------
| Get subscription code
|--------------------------------------------------------------------------
*/

function getSubscriptionCode(
  event: PaystackWebhookEvent
): string | null {
  const subscriptionCode =
    event.data
      ?.subscription_code ??
    event.data
      ?.subscription
      ?.subscription_code ??
    null;

  return (
    typeof subscriptionCode ===
      "string" &&
    subscriptionCode.length > 0
      ? subscriptionCode
      : null
  );
}

/*
|--------------------------------------------------------------------------
| Get next payment date
|--------------------------------------------------------------------------
*/

function getNextPaymentDate(
  event: PaystackWebhookEvent
): string | null {
  const nextPaymentDate =
    event.data
      ?.next_payment_date ??
    event.data
      ?.subscription
      ?.next_payment_date ??
    null;

  return (
    typeof nextPaymentDate ===
      "string" &&
    nextPaymentDate.length > 0
      ? nextPaymentDate
      : null
  );
}

/*
|--------------------------------------------------------------------------
| Calculate M-PESA Premium period
|--------------------------------------------------------------------------
|
| M-PESA is a one-time payment.
|
| Monthly:
|     +1 month
|
| Yearly:
|     +1 year
|
|--------------------------------------------------------------------------
*/

function getMpesaPeriodEnd(
  plan:
    | "monthly"
    | "yearly",
  startDate: Date
): string {
  const endDate =
    new Date(
      startDate.getTime()
    );

  if (
    plan ===
    "monthly"
  ) {
    endDate.setMonth(
      endDate.getMonth() + 1
    );
  } else {
    endDate.setFullYear(
      endDate.getFullYear() + 1
    );
  }

  return endDate.toISOString();
}

/*
|--------------------------------------------------------------------------
| MAIN WEBHOOK HANDLER
|--------------------------------------------------------------------------
*/

export async function handlePaystackWebhook(
  req: Request,
  res: Response
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | RAW BODY
    |--------------------------------------------------------------------------
    |
    | Paystack signature verification requires
    | the exact raw request body.
    |
    |--------------------------------------------------------------------------
    */

    const rawBody =
      req.body as Buffer;

    if (
      !Buffer.isBuffer(
        rawBody
      )
    ) {
      console.error(
        "❌ Paystack webhook body is not a Buffer."
      );

      return res.sendStatus(
        400
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY SIGNATURE
    |--------------------------------------------------------------------------
    */

    const signature =
      req.headers[
        "x-paystack-signature"
      ] as
        | string
        | undefined;

    const isValid =
      verifyPaystackWebhookSignature(
        rawBody,
        signature
      );

    if (!isValid) {
      console.error(
        "❌ Invalid Paystack webhook signature."
      );

      return res.sendStatus(
        401
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PARSE EVENT
    |--------------------------------------------------------------------------
    */

    let event:
      PaystackWebhookEvent;

    try {
      event =
        JSON.parse(
          rawBody.toString(
            "utf8"
          )
        ) as PaystackWebhookEvent;
    } catch (error) {
      console.error(
        "❌ Failed to parse Paystack webhook JSON:",
        error
      );

      return res.sendStatus(
        400
      );
    }

    console.log(
      "📥 Paystack webhook received:",
      event.event
    );

    /*
    |--------------------------------------------------------------------------
    | BASIC VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!event.event) {
      console.warn(
        "⚠️ Paystack webhook has no event type."
      );

      return res.sendStatus(
        200
      );
    }

    /*
    |--------------------------------------------------------------------------
    | COMMON IDENTIFIERS
    |--------------------------------------------------------------------------
    */

    const customerCode =
      getCustomerCode(
        event
      );

    const subscriptionCode =
      getSubscriptionCode(
        event
      );

    const nextPaymentDate =
      getNextPaymentDate(
        event
      );

    const paymentMethod =
      getPaymentMethod(
        event
      );

    /*
    |--------------------------------------------------------------------------
    | RESOLVE USER LOOKUP
    |--------------------------------------------------------------------------
    */

    const resolved =
      await findResolveSubscription(
        event
      );

    console.log(
      "🔎 Paystack webhook Resolve lookup:",
      {
        event:
          event.event,

        userId:
          resolved.userId,

        source:
          resolved.source,

        paymentMethod,

        customerCode,

        subscriptionCode,

        reference:
          event.data?.reference,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | CHARGE.SUCCESS
    |--------------------------------------------------------------------------
    |
    | This handles BOTH:
    |
    | 1. Card Premium payments
    | 2. M-PESA Premium payments
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

      if (
        !resolved.userId
      ) {
        console.warn(
          "⚠️ Paystack charge.success could not be associated with a Resolve user.",
          {
            reference:
              event.data
                ?.reference,

            email:
              event.data
                ?.customer
                ?.email,

            customerCode,

            subscriptionCode,

            paymentMethod,
          }
        );

        /*
        |--------------------------------------------------------------------------
        | Acknowledge event
        |--------------------------------------------------------------------------
        */

        return res.sendStatus(
          200
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Determine plan
      |--------------------------------------------------------------------------
      */

      const plan =
        determineResolvePlan(
          event
        );

      const now =
        new Date();

      /*
      |--------------------------------------------------------------------------
      | M-PESA PAYMENT
      |--------------------------------------------------------------------------
      |
      | M-PESA is a one-time payment.
      |
      | Therefore we calculate the Premium
      | expiry ourselves rather than relying
      | on Paystack's recurring subscription
      | next_payment_date.
      |
      |--------------------------------------------------------------------------
      */

      if (
        paymentMethod ===
        "mpesa"
      ) {
        const currentPeriodEnd =
          getMpesaPeriodEnd(
            plan,
            now
          );

        /*
        |--------------------------------------------------------------------------
        | Update Resolve subscription
        |--------------------------------------------------------------------------
        */

        await updateSubscription(
          resolved.userId,
          {
            provider:
              "paystack",

            provider_customer_id:
              customerCode,

            /*
            |--------------------------------------------------------------------------
            | M-PESA does not create the same
            | recurring subscription code as
            | a card subscription.
            |
            | We store the Paystack transaction
            | reference here so the transaction
            | remains identifiable.
            |--------------------------------------------------------------------------
            */

            provider_subscription_id:
              event.data
                ?.reference ??
              null,

            plan:
              "premium",

            status:
              "active",

            current_period_start:
              now.toISOString(),

            current_period_end:
              currentPeriodEnd,

            cancel_at_period_end:
              false,
          }
        );

        console.log(
          "📱✅ Resolve Premium activated via M-PESA:",
          {
            userId:
              resolved.userId,

            plan,

            reference:
              event.data
                ?.reference,

            amount:
              event.data
                ?.amount,

            currency:
              event.data
                ?.currency,

            currentPeriodEnd,

            lookupSource:
              resolved.source,
          }
        );

        return res.sendStatus(
          200
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CARD PAYMENT
      |--------------------------------------------------------------------------
      |
      | Existing recurring Paystack
      | subscription behavior.
      |
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
        "💳✅ Resolve Premium activated/renewed via card:",
        {
          userId:
            resolved.userId,

          plan,

          reference:
            event.data
              ?.reference,

          customerCode,

          subscriptionCode,

          nextPaymentDate,

          lookupSource:
            resolved.source,
        }
      );

      return res.sendStatus(
        200
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SUBSCRIPTION.CREATE
    |--------------------------------------------------------------------------
    |
    | Paystack sends this for recurring
    | card subscriptions.
    |
    |--------------------------------------------------------------------------
    */

    if (
      event.event ===
      "subscription.create"
    ) {
      if (
        resolved.userId
      ) {
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
              event.data
                ?.customer
                ?.email,
          }
        );
      }

      return res.sendStatus(
        200
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SUBSCRIPTION.NOT_RENEW
    |--------------------------------------------------------------------------
    */

    if (
      event.event ===
      "subscription.not_renew"
    ) {
      if (
        resolved.userId
      ) {
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

      return res.sendStatus(
        200
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SUBSCRIPTION.DISABLE
    |--------------------------------------------------------------------------
    */

    if (
      event.event ===
      "subscription.disable"
    ) {
      if (
        resolved.userId
      ) {
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

      return res.sendStatus(
        200
      );
    }

    /*
    |--------------------------------------------------------------------------
    | INVOICE.PAYMENT_FAILED
    |--------------------------------------------------------------------------
    */

    if (
      event.event ===
      "invoice.payment_failed"
    ) {
      if (
        resolved.userId
      ) {
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
              event.data
                ?.reference,
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

      return res.sendStatus(
        200
      );
    }

    /*
    |--------------------------------------------------------------------------
    | INVOICE.CREATE
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
            event.data
              ?.amount,

          currency:
            event.data
              ?.currency,
        }
      );

      return res.sendStatus(
        200
      );
    }

    /*
    |--------------------------------------------------------------------------
    | INVOICE.UPDATE
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
            event.data
              ?.status,

          amount:
            event.data
              ?.amount,
        }
      );

      return res.sendStatus(
        200
      );
    }

    /*
    |--------------------------------------------------------------------------
    | UNKNOWN / INFORMATIONAL EVENT
    |--------------------------------------------------------------------------
    */

    console.log(
      "ℹ️ Paystack event acknowledged:",
      event.event
    );

    return res.sendStatus(
      200
    );
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
    | Paystack can retry the webhook when
    | Resolve reports a server-side failure.
    |
    |--------------------------------------------------------------------------
    */

    return res.sendStatus(
      500
    );
  }
}