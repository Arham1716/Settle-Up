"use client";

import { Suspense } from "react";
import BudgetClient from "./budget-client";

export default function BudgetPage() {
  return (
    <Suspense fallback={<p className="text-white/60">Loading...</p>}>
      <BudgetClient />
    </Suspense>
  );
}
