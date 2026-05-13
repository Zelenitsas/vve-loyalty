'use client'

import { useActionState } from 'react'
import { addPointsAction } from '@/app/actions'
import type { Customer } from '@/lib/supabase'

const BRAND = '#C2410C'

const AMOUNTS = [
  { label: '+€15', points: 150 },
  { label: '+€30', points: 300 },
  { label: '+€50', points: 500 },
  { label: '+€100', points: 1000 },
]

export default function CashierView({
  customer,
  uniqueId,
}: {
  customer: Customer
  uniqueId: string
}) {
  const boundAction = addPointsAction.bind(null, uniqueId)
  const [state, action, isPending] = useActionState(boundAction, null)

  if (state?.success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: BRAND }}>
        <div className="text-center text-white">
          <div className="text-[96px] leading-none mb-4">✓</div>
          <h1 className="text-5xl font-black mb-3">POINTS ADDED!</h1>
          <p className="text-2xl font-semibold">+{state.pointsAdded} pts for {state.name}</p>
          <p className="text-xl opacity-80 mt-2">Total: <strong>{state.newTotal} pts</strong></p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6">
      <div className="text-center text-white mb-8">
        <p className="text-stone-400 text-xs uppercase tracking-widest mb-2">Adding points for</p>
        <h1 className="text-4xl font-bold mb-2">{customer.name}</h1>
        <p className="text-3xl font-black" style={{ color: BRAND }}>
          {customer.stamp_count} pts
        </p>
      </div>

      <p className="text-stone-500 text-xs uppercase tracking-widest mb-4">Select spend amount</p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {AMOUNTS.map(({ label, points }) => (
          <form key={points} action={action}>
            <input type="hidden" name="points" value={points} />
            <button
              type="submit"
              disabled={isPending}
              style={{ background: BRAND }}
              className="w-full text-white font-black text-2xl py-10 rounded-3xl shadow-lg active:scale-95 transition-transform disabled:opacity-50 flex flex-col items-center justify-center"
            >
              {label}
              <span className="text-sm font-semibold opacity-75 mt-1">+{points} pts</span>
            </button>
          </form>
        ))}
      </div>

      {state?.error && (
        <p className="text-red-400 text-sm mt-6 text-center">{state.error}</p>
      )}
    </div>
  )
}
