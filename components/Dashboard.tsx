import Link from 'next/link'
import { getAllCustomers } from '@/lib/supabase'
import ShopQR from '@/components/ShopQR'
import ReengageButton from '@/components/ReengageButton'
import DeleteButton from '@/components/DeleteButton'

const BRAND = '#C2410C'
const TIERS = [150, 400, 1000]

function getNextTier(points: number) {
  return TIERS.find(t => t > points) ?? null
}

export default async function Dashboard() {
  const customers = await getAllCustomers()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const now = Date.now()

  return (
    <main className="min-h-screen bg-stone-900 text-white pb-16">

      <div className="border-b border-stone-800 px-5 py-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: BRAND }}
        >
          <span className="text-white text-sm font-black">EA</span>
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight">Ebe Ano Back Office</h1>
          <p className="text-stone-500 text-xs">VIP Rewards Dashboard</p>
        </div>
        <Link
          href="/cashier/scan"
          className="ml-auto text-white font-bold px-4 py-2 rounded-xl text-sm"
          style={{ background: BRAND }}
        >
          Open Scanner
        </Link>
      </div>

      <div className="px-5 py-6 border-b border-stone-800">
        <p className="text-stone-500 text-[10px] uppercase tracking-widest mb-4">Shop QR Code</p>
        <ShopQR registerUrl={baseUrl} />
      </div>

      <div className="px-5 py-6">
        <p className="text-stone-500 text-[10px] uppercase tracking-widest mb-4">
          Members — {customers.length} registered
        </p>

        {customers.length === 0 ? (
          <p className="text-stone-500 text-sm">No members yet. Share the QR to get started.</p>
        ) : (
          <div className="space-y-3">
            {customers.map(c => {
              const daysSince = c.last_visit_at
                ? Math.floor((now - new Date(c.last_visit_at).getTime()) / 86_400_000)
                : null
              const isInactive = daysSince !== null && daysSince >= 15
              const nextTier = getNextTier(c.stamp_count)
              const progress = nextTier ? Math.min(c.stamp_count / nextTier, 1) : 1

              return (
                <div
                  key={c.id}
                  className={`bg-stone-800 rounded-2xl p-4 ${isInactive ? 'ring-1 ring-orange-500/40' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{c.name}</p>
                      <p className="text-stone-400 text-xs truncate">{c.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black" style={{ color: BRAND }}>{c.stamp_count} pts</p>
                      {daysSince !== null ? (
                        <p className={`text-xs ${isInactive ? 'text-orange-400' : 'text-stone-500'}`}>
                          {daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince}d ago`}
                        </p>
                      ) : (
                        <p className="text-xs text-stone-600">No visits yet</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${progress * 100}%`, background: BRAND }}
                      />
                    </div>
                    {nextTier && (
                      <p className="text-stone-600 text-[10px] mt-1">
                        {nextTier - c.stamp_count} pts to next reward
                      </p>
                    )}
                  </div>

                  <ReengageButton uniqueId={c.unique_id} name={c.name} daysSince={daysSince ?? 0} />
                  <DeleteButton uniqueId={c.unique_id} name={c.name} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
