"use client";

import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PayButtonProps {
  amount: number;
}

export default function PayButton({ amount }: PayButtonProps) {
  const handlePayment = async () => {
    const res = await fetch("http://localhost:4000/payments/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();

    const stripe = await stripePromise;

    if (!stripe) {
      console.error("Stripe failed to load");
      return;
    }

    const result = await (stripe as any).redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (result?.error) {
      console.error(result.error.message);
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
    >
      Pay ${amount}
    </button>
  );
}
