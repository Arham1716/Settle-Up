import { Suspense } from 'react';
import ExpensesClient from './expenses-client';

export default function ExpensesPage({ searchParams }: { searchParams: { groupId?: string } }) {
  return (
    <Suspense fallback={<p className="text-white/60">Loading...</p>}>
      <ExpensesClient searchParams={Promise.resolve(searchParams)} />
    </Suspense>
  );
}
