import QRCode from 'qrcode'
import { headers } from 'next/headers'
import type { Customer } from '@/lib/supabase'

const BRAND = '#C2410C'

const TIERS = [
  { points: 150,  reward: 'Free Fried Plantain',  emoji: '🍌' },
  { points: 400,  reward: 'Free Nigerian Guinness', emoji: '🍺' },
  { points: 1000, reward: 'Free Main Dish',         emoji: '🍽️' },
]

export default async function CustomerCardView({
  customer,
  uniqueId,
}: {
  customer: Customer
  uniqueId: string
}) {
  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const scanUrl = `${proto}://${host}/scan/${uniqueId}`
  const qrDataUrl = await QRCode.toDataURL(scanUrl, { width: 280, margin: 2 })

  const { stamp_count: totalPoints, name } = customer
  const nextTier = TIERS.find(t => t.points > totalPoints)
  const ptsToNext = nextTier ? nextTier.points - totalPoints : 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo badge */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: BRAND }}
          >
            <span className="text-white text-3xl font-black">EA</span>
          </div>
        </div>

        {/* Points balance */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-stone-800">Hi, {name}! 🇳🇬</h1>
          <p className="text-stone-500 text-sm mt-1">Your VIP Points Balance</p>
          <p className="text-6xl font-black mt-2" style={{ color: BRAND }}>{totalPoints}</p>
          <p className="text-stone-400 text-sm font-semibold uppercase tracking-widest">points</p>
          {nextTier && (
            <p className="text-xs text-stone-400 mt-2">
              {ptsToNext} more points to your next reward
            </p>
          )}
          {!nextTier && (
            <p className="text-sm font-semibold mt-2" style={{ color: BRAND }}>
              🎉 All rewards unlocked — you&apos;re a VIP!
            </p>
          )}
        </div>

        {/* Tier rewards */}
        <div className="bg-white rounded-3xl shadow-md p-5 mb-4 space-y-3">
          <p className="text-[10px] text-stone-400 uppercase tracking-widest text-center font-semibold mb-4">
            Reward Menu
          </p>
          {TIERS.map((tier) => {
            const unlocked = totalPoints >= tier.points
            const progress = Math.min(totalPoints / tier.points, 1)
            return (
              <div key={tier.points} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tier.emoji}</span>
                    <div>
                      <p className={`text-sm font-bold ${unlocked ? 'text-stone-800' : 'text-stone-400'}`}>
                        {tier.reward}
                      </p>
                      <p className="text-xs text-stone-400">{tier.points} pts</p>
                    </div>
                  </div>
                  {unlocked ? (
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                      style={{ background: BRAND }}
                    >
                      UNLOCKED ✓
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400 font-semibold">
                      {tier.points - totalPoints} pts away
                    </span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress * 100}%`, background: BRAND }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* QR code */}
        <div className="bg-white rounded-3xl shadow-md p-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Your QR Code" className="w-48 h-48 mx-auto mb-3" />
          <p className="text-stone-400 text-sm font-medium">Show this at the till to earn points</p>
        </div>

        <p className="text-center text-stone-400 text-xs mt-4">
          Bookmark this page — it&apos;s your VIP card.
        </p>
      </div>
    </main>
  )
}
