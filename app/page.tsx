import RegisterForm from '@/components/RegisterForm'

const BRAND = '#C2410C'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="flex justify-center mb-8">
          <div
            className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-lg"
            style={{ background: BRAND }}
          >
            <span className="text-white text-4xl font-black">EA</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Ebe Ano VIP Rewards</h1>
          <p className="text-stone-500 text-sm">
            Spend to earn points. Unlock exclusive rewards.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <RegisterForm />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { pts: '150 pts', reward: 'Fried Plantain', emoji: '🍌' },
            { pts: '400 pts', reward: 'Guinness',       emoji: '🍺' },
            { pts: '1000 pts', reward: 'Main Dish',     emoji: '🍽️' },
          ].map(r => (
            <div key={r.pts} className="bg-white/70 rounded-2xl p-3 text-center shadow-sm">
              <div className="text-2xl mb-1">{r.emoji}</div>
              <div className="text-xs font-bold" style={{ color: BRAND }}>{r.pts}</div>
              <div className="text-xs text-stone-400">Free {r.reward}</div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
