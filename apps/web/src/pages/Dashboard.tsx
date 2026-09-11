import {
  Flame,
  Clock3,
  Target,
  Shield,
  Check,
  Crown,
  Smartphone,
} from "lucide-react";

import { useState } from "react";

import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import InsightCard from "../components/dashboard/InsightCard";
import WeeklyChart from "../components/dashboard/WeeklyChart";
import QuickActions from "../components/dashboard/QuickActions";
import RecoveryScore from "../components/dashboard/RecoveryScore";
import RecentActivity from "../components/dashboard/RecentActivity";

import { useDashboardStore } from "../store/dashboardStore";
import { useStreakStore } from "../store/streakStore";

import { useSubscription } from "../hooks/useSubscription";
import PremiumGate from "../components/premium/PremiumGate";

import {
  startPaystackCheckout,
  startMpesaCheckout,
} from "../services/subscriptionService";

export default function Dashboard() {
  const streak = useStreakStore(
    (state) => state.streak
  );

  const {
    focusTime,
    urgesResisted,
    blockedSites,
  } = useDashboardStore();

  /*
   * ------------------------------------------------------------------
   * Premium Subscription
   * ------------------------------------------------------------------
   */

  const {
    subscription,
    isPremium,
    loading: subscriptionLoading,
    error: subscriptionError,
    refreshSubscription,
  } = useSubscription();

  /*
   * ------------------------------------------------------------------
   * Card Checkout
   * ------------------------------------------------------------------
   */

  const [checkoutPlan, setCheckoutPlan] =
    useState<
      "monthly" | "yearly" | null
    >(null);

  const [checkoutError, setCheckoutError] =
    useState<string | null>(null);

  /*
   * ------------------------------------------------------------------
   * M-PESA Checkout
   * ------------------------------------------------------------------
   */

  const [mpesaPlan, setMpesaPlan] =
    useState<
      "monthly" | "yearly" | null
    >(null);

  const [mpesaPhone, setMpesaPhone] =
    useState("");

  const [mpesaError, setMpesaError] =
    useState<string | null>(null);

  const [mpesaMessage, setMpesaMessage] =
    useState<string | null>(null);

  /*
   * ------------------------------------------------------------------
   * Card Checkout Handler
   * ------------------------------------------------------------------
   */

  async function handleCheckout(
    plan: "monthly" | "yearly"
  ) {
    try {
      setCheckoutError(null);

      setCheckoutPlan(plan);

      await startPaystackCheckout(
        plan
      );
    } catch (error: any) {
      console.error(
        "❌ Resolve Premium checkout failed:",
        error
      );

      setCheckoutError(
        error?.message ??
          "Unable to start Premium checkout. Please try again."
      );

      setCheckoutPlan(null);
    }
  }

  /*
   * ------------------------------------------------------------------
   * M-PESA Checkout Handler
   * ------------------------------------------------------------------
   */

  async function handleMpesaCheckout(
    plan: "monthly" | "yearly"
  ) {
    try {
      setMpesaError(null);

      setMpesaMessage(null);

      /*
       * Basic phone validation.
       *
       * The backend performs the final
       * Kenyan phone normalization/validation.
       */

      const cleanPhone =
        mpesaPhone.trim();

      if (!cleanPhone) {
        setMpesaError(
          "Please enter your M-PESA phone number."
        );

        return;
      }

      const phoneDigits =
        cleanPhone.replace(
          /\D/g,
          ""
        );

      const isValidKenyanPhone =
        /^(?:254|0)?7\d{8}$/.test(
          phoneDigits
        ) ||
        /^2541\d{8}$/.test(
          phoneDigits
        ) ||
        /^01\d{8}$/.test(
          phoneDigits
        );

      if (!isValidKenyanPhone) {
        setMpesaError(
          "Please enter a valid Kenyan M-PESA number, for example 0712345678."
        );

        return;
      }

      setMpesaPlan(plan);

      const checkout =
        await startMpesaCheckout(
          plan,
          cleanPhone
        );

      /*
       * Paystack normally returns
       * "pay_offline" for M-PESA.
       */

      setMpesaMessage(
        checkout.display_text ||
          "M-PESA payment started. Please check your phone and complete the payment authorization."
      );

      console.log(
        "📱 Resolve M-PESA payment initialized:",
        {
          plan,
          reference:
            checkout.reference,
          status:
            checkout.status,
        }
      );
    } catch (error: any) {
      console.error(
        "❌ Resolve M-PESA payment failed:",
        error
      );

      setMpesaError(
        error?.message ??
          "Unable to start M-PESA payment. Please try again."
      );
    } finally {
      setMpesaPlan(null);
    }
  }

  return (
    <div className="space-y-6">

      {/* ------------------------------------------------------------------ */}
      {/* Welcome                                                            */}
      {/* ------------------------------------------------------------------ */}

      <WelcomeBanner />

      {/* ------------------------------------------------------------------ */}
      {/* PREMIUM SUBSCRIPTION                                               */}
      {/* ------------------------------------------------------------------ */}

      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-sm">

        <div className="mb-5 flex items-center justify-between">

          <div>

            <div className="flex items-center gap-2">

              <Crown
                size={20}
                className="text-amber-400"
              />

              <h2 className="text-lg font-semibold text-white">
                Resolve Membership
              </h2>

            </div>

            <p className="mt-1 text-sm text-slate-400">
              Your Resolve Premium membership and subscription status.
            </p>

          </div>

          {!subscriptionLoading &&
            !subscriptionError && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isPremium
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {isPremium
                  ? "PREMIUM"
                  : "FREE"}
              </span>
            )}

        </div>

        {/* -------------------------------------------------------------- */}
        {/* Loading                                                        */}
        {/* -------------------------------------------------------------- */}

        {subscriptionLoading ? (

          <div className="rounded-xl bg-slate-800 p-4">

            <p className="text-sm text-slate-400">
              Checking your subscription...
            </p>

          </div>

        ) : subscriptionError ? (

          /* ------------------------------------------------------------ */
          /* Subscription Error                                           */
          /* ------------------------------------------------------------ */

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">

            <p className="text-sm font-medium text-red-400">
              Failed to load subscription
            </p>

            <p className="mt-1 text-sm text-red-300/80">
              {subscriptionError}
            </p>

            <button
              type="button"
              onClick={
                refreshSubscription
              }
              className="mt-3 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
            >
              Try Again
            </button>

          </div>

        ) : (

          <>

            {/* -------------------------------------------------------- */}
            {/* Current Subscription                                      */}
            {/* -------------------------------------------------------- */}

            <div className="grid gap-4 sm:grid-cols-3">

              {/* Plan */}

              <div className="rounded-xl bg-slate-800 p-4">

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Plan
                </p>

                <p className="mt-2 text-xl font-semibold capitalize text-white">
                  {subscription?.plan ??
                    "Unknown"}
                </p>

              </div>

              {/* Status */}

              <div className="rounded-xl bg-slate-800 p-4">

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Status
                </p>

                <p className="mt-2 text-xl font-semibold capitalize text-white">
                  {subscription?.status ??
                    "Unknown"}
                </p>

              </div>

              {/* Premium Access */}

              <div className="rounded-xl bg-slate-800 p-4">

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Premium Access
                </p>

                <p
                  className={`mt-2 text-xl font-semibold ${
                    isPremium
                      ? "text-emerald-400"
                      : "text-slate-300"
                  }`}
                >
                  {isPremium
                    ? "Enabled"
                    : "Not Enabled"}
                </p>

              </div>

            </div>

            {/* -------------------------------------------------------- */}
            {/* Premium Member                                            */}
            {/* -------------------------------------------------------- */}

            {isPremium ? (

              <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">

                    <Crown
                      size={22}
                      className="text-emerald-400"
                    />

                  </div>

                  <div>

                    <h3 className="font-semibold text-emerald-400">
                      Resolve Premium is active
                    </h3>

                    <p className="mt-1 text-sm text-emerald-300/80">
                      You have full access to your Premium features.
                    </p>

                    {subscription?.current_period_end && (
                      <p className="mt-2 text-xs text-emerald-300/60">
                        Current period ends{" "}
                        {new Date(
                          subscription.current_period_end
                        ).toLocaleDateString()}
                      </p>
                    )}

                  </div>

                </div>

              </div>

            ) : (

              /* ------------------------------------------------------ */
              /* Premium Pricing                                         */
              /* ------------------------------------------------------ */

              <div className="mt-6">

                <div className="mb-5">

                  <h3 className="text-xl font-bold text-white">
                    Upgrade to Resolve Premium
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Unlock the full Resolve recovery experience.
                  </p>

                </div>

                {/* -------------------------------------------------- */}
                {/* Card Checkout Error                                  */}
                {/* -------------------------------------------------- */}

                {checkoutError && (

                  <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">

                    <p className="text-sm font-medium text-red-400">
                      Card payment could not be started
                    </p>

                    <p className="mt-1 text-sm text-red-300/80">
                      {checkoutError}
                    </p>

                  </div>

                )}

                {/* -------------------------------------------------- */}
                {/* M-PESA Error                                        */}
                {/* -------------------------------------------------- */}

                {mpesaError && (

                  <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">

                    <p className="text-sm font-medium text-red-400">
                      M-PESA payment could not be started
                    </p>

                    <p className="mt-1 text-sm text-red-300/80">
                      {mpesaError}
                    </p>

                  </div>

                )}

                {/* -------------------------------------------------- */}
                {/* M-PESA Success / Pending Message                   */}
                {/* -------------------------------------------------- */}

                {mpesaMessage && (

                  <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">

                    <div className="flex items-start gap-3">

                      <Smartphone
                        size={20}
                        className="mt-0.5 shrink-0 text-emerald-400"
                      />

                      <div>

                        <p className="text-sm font-semibold text-emerald-400">
                          M-PESA payment started
                        </p>

                        <p className="mt-1 text-sm text-emerald-300/80">
                          {mpesaMessage}
                        </p>

                        <p className="mt-2 text-xs text-emerald-300/60">
                          Complete the payment from the M-PESA prompt on your phone. Resolve will activate Premium after Paystack confirms the payment.
                        </p>

                      </div>

                    </div>

                  </div>

                )}

                {/* ================================================== */}
                {/* CARD PLANS                                         */}
                {/* ================================================== */}

                <div className="grid gap-5 md:grid-cols-2">

                  {/* ------------------------------------------------ */}
                  {/* Monthly Card Plan                                */}
                  {/* ------------------------------------------------ */}

                  <div className="relative rounded-2xl border border-slate-700 bg-slate-800 p-6">

                    <div className="mb-5">

                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                        Monthly
                      </p>

                      <div className="mt-2 flex items-end gap-1">

                        <span className="text-4xl font-bold text-white">
                          $6.99
                        </span>

                        <span className="mb-1 text-sm text-slate-400">
                          / month
                        </span>

                      </div>

                    </div>

                    <div className="space-y-3">

                      <div className="flex items-center gap-2 text-sm text-slate-300">

                        <Check
                          size={17}
                          className="text-emerald-400"
                        />

                        Full Premium access

                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-300">

                        <Check
                          size={17}
                          className="text-emerald-400"
                        />

                        Advanced recovery insights

                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-300">

                        <Check
                          size={17}
                          className="text-emerald-400"
                        />

                        Premium statistics

                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-300">

                        <Check
                          size={17}
                          className="text-emerald-400"
                        />

                        AI Coach access

                      </div>

                    </div>

                    <button
                      type="button"
                      disabled={
                        checkoutPlan !==
                          null ||
                        mpesaPlan !== null
                      }
                      onClick={() =>
                        handleCheckout(
                          "monthly"
                        )
                      }
                      className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {checkoutPlan ===
                      "monthly"
                        ? "Opening Paystack..."
                        : "Pay by Card"}
                    </button>

                  </div>

                  {/* ------------------------------------------------ */}
                  {/* Yearly Card Plan                                 */}
                  {/* ------------------------------------------------ */}

                  <div className="relative rounded-2xl border border-emerald-500/50 bg-slate-800 p-6">

                    {/* Best Value */}

                    <div className="absolute right-4 top-4 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                      BEST VALUE
                    </div>

                    <div className="mb-5 pr-24">

                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                        Yearly
                      </p>

                      <div className="mt-2 flex items-end gap-1">

                        <span className="text-4xl font-bold text-white">
                          $72.99
                        </span>

                        <span className="mb-1 text-sm text-slate-400">
                          / year
                        </span>

                      </div>

                    </div>

                    <div className="space-y-3">

                      <div className="flex items-center gap-2 text-sm text-slate-300">

                        <Check
                          size={17}
                          className="text-emerald-400"
                        />

                        Full Premium access

                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-300">

                        <Check
                          size={17}
                          className="text-emerald-400"
                        />

                        Advanced recovery insights

                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-300">

                        <Check
                          size={17}
                          className="text-emerald-400"
                        />

                        Premium statistics

                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-300">

                        <Check
                          size={17}
                          className="text-emerald-400"
                        />

                        AI Coach access

                      </div>

                    </div>

                    <button
                      type="button"
                      disabled={
                        checkoutPlan !==
                          null ||
                        mpesaPlan !== null
                      }
                      onClick={() =>
                        handleCheckout(
                          "yearly"
                        )
                      }
                      className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {checkoutPlan ===
                      "yearly"
                        ? "Opening Paystack..."
                        : "Pay by Card"}
                    </button>

                  </div>

                </div>

                {/* ================================================== */}
                {/* M-PESA PAYMENT                                     */}
                {/* ================================================== */}

                <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800 p-6">

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">

                      <Smartphone
                        size={22}
                        className="text-emerald-400"
                      />

                    </div>

                    <div>

                      <h3 className="font-semibold text-white">
                        Pay with M-PESA
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Pay directly from your Kenyan M-PESA account.
                      </p>

                    </div>

                  </div>

                  {/* ------------------------------------------------ */}
                  {/* Phone Number                                     */}
                  {/* ------------------------------------------------ */}

                  <div className="mt-5">

                    <label
                      htmlFor="mpesa-phone"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      M-PESA phone number
                    </label>

                    <input
                      id="mpesa-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="0712345678"
                      value={mpesaPhone}
                      onChange={(event) =>
                        setMpesaPhone(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Enter the Kenyan number registered to your M-PESA account.
                    </p>

                  </div>

                  {/* ------------------------------------------------ */}
                  {/* M-PESA Plans                                     */}
                  {/* ------------------------------------------------ */}

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">

                    {/* Monthly M-PESA */}

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Monthly M-PESA
                      </p>

                      <p className="mt-2 text-2xl font-bold text-white">
                        KES 899
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        1 month Premium access
                      </p>

                      <button
                        type="button"
                        disabled={
                          mpesaPlan !==
                            null ||
                          checkoutPlan !==
                            null
                        }
                        onClick={() =>
                          handleMpesaCheckout(
                            "monthly"
                          )
                        }
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Smartphone
                          size={17}
                        />

                        {mpesaPlan ===
                        "monthly"
                          ? "Starting M-PESA..."
                          : "Pay KES 899"}
                      </button>

                    </div>

                    {/* Yearly M-PESA */}

                    <div className="rounded-xl border border-emerald-500/40 bg-slate-900 p-4">

                      <div className="flex items-center justify-between gap-3">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Yearly M-PESA
                        </p>

                        <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-400">
                          SAVE
                        </span>

                      </div>

                      <p className="mt-2 text-2xl font-bold text-white">
                        KES 9,449
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        1 year Premium access
                      </p>

                      <button
                        type="button"
                        disabled={
                          mpesaPlan !==
                            null ||
                          checkoutPlan !==
                            null
                        }
                        onClick={() =>
                          handleMpesaCheckout(
                            "yearly"
                          )
                        }
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Smartphone
                          size={17}
                        />

                        {mpesaPlan ===
                        "yearly"
                          ? "Starting M-PESA..."
                          : "Pay KES 9,449"}
                      </button>

                    </div>

                  </div>

                  {/* ------------------------------------------------ */}
                  {/* M-PESA Information                               */}
                  {/* ------------------------------------------------ */}

                  <div className="mt-5 rounded-xl bg-slate-900/70 p-4">

                    <p className="text-xs leading-5 text-slate-500">
                      M-PESA payments are one-time Premium purchases. They do not automatically renew. After starting the payment, follow the M-PESA prompt on your phone and enter your M-PESA PIN there. Resolve will never ask you for your M-PESA PIN.
                    </p>

                  </div>

                </div>

                <p className="mt-4 text-center text-xs text-slate-500">
                  Secure payments powered by Paystack.
                </p>

              </div>
            )}

          </>

        )}

      </section>

      {/* ------------------------------------------------------------------ */}
      {/* PREMIUM GATE TEST                                                  */}
      {/* ------------------------------------------------------------------ */}

      <PremiumGate>

        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">

              <Shield
                size={24}
                className="text-emerald-400"
              />

            </div>

            <div>

              <h2 className="text-lg font-semibold text-emerald-400">
                Premium Feature Unlocked
              </h2>

              <p className="mt-1 text-sm text-emerald-300/80">
                You have access to this Premium feature.
              </p>

            </div>

          </div>

        </section>

      </PremiumGate>

      {/* ------------------------------------------------------------------ */}
      {/* DASHBOARD STATISTICS                                               */}
      {/* ------------------------------------------------------------------ */}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <InsightCard
          icon={
            <Flame size={22} />
          }
          title="Recovery Streak"
          value={`${streak} Days`}
          subtitle="Keep building your momentum"
          trend="+2 this week"
          progress={
            (streak / 30) * 100
          }
          progressColor="bg-orange-500"
        />

        <InsightCard
          icon={
            <Clock3 size={22} />
          }
          title="Focus Time"
          value={focusTime}
          subtitle="Today's productive time"
          trend="+18%"
          progress={80}
        />

        <InsightCard
          icon={
            <Target size={22} />
          }
          title="Urges Resisted"
          value={String(
            urgesResisted
          )}
          subtitle="Strong decisions this week"
          trend="+5"
          progress={65}
          progressColor="bg-emerald-500"
        />

        <InsightCard
          icon={
            <Shield size={22} />
          }
          title="Blocked Sites"
          value={String(
            blockedSites
          )}
          subtitle="Protected this month"
          trend="100%"
          progress={100}
          progressColor="bg-cyan-500"
        />

      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CHARTS & QUICK ACTIONS                                             */}
      {/* ------------------------------------------------------------------ */}

      <section className="grid gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2">
          <WeeklyChart />
        </div>

        <QuickActions />

      </section>

      {/* ------------------------------------------------------------------ */}
      {/* BOTTOM SECTION                                                     */}
      {/* ------------------------------------------------------------------ */}

      <section className="grid gap-6 lg:grid-cols-2">

        <RecoveryScore />

        <RecentActivity />

      </section>

    </div>
  );
}