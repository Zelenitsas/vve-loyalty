'use client'

import Link from 'next/link'
import type { Venue } from '@/lib/supabase'

export default function PosterView({
  venue,
  qrDataUrl,
  rewardLine,
}: {
  venue: Venue
  qrDataUrl: string
  rewardLine: string | null
}) {
  return (
    <main className="min-h-screen bg-stone-100 flex flex-col items-center py-10 print:bg-white print:py-0 print:block">
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { background: white; }
        }
      `}</style>

      <div className="print:hidden w-full max-w-[210mm] flex items-center justify-between px-2 mb-6">
        <Link href={`/cashier/${venue.slug}`} className="text-stone-500 text-sm hover:text-stone-800">
          ← Back to dashboard
        </Link>
        <button
          onClick={() => window.print()}
          className="text-white font-bold px-5 py-2.5 rounded-xl text-sm"
          style={{ background: venue.brand_color }}
        >
          Print poster
        </button>
      </div>

      <div
        className="bg-white shadow-xl print:shadow-none flex flex-col items-center justify-between"
        style={{ width: '210mm', height: '297mm', padding: '20mm' }}
      >
        <div className="flex flex-col items-center">
          {venue.logo_url ? (
            <img
              src={venue.logo_url}
              alt={venue.name}
              style={{ maxWidth: '160px', maxHeight: '160px', objectFit: 'contain' }}
            />
          ) : (
            <p className="text-4xl font-bold" style={{ color: venue.brand_color }}>
              {venue.name}
            </p>
          )}

          <p className="mt-10 text-5xl font-extrabold text-center text-stone-900">
            Scan to join {venue.name}&apos;s rewards
          </p>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="Scan to join" style={{ width: '90mm', height: '90mm' }} />

        <div className="flex flex-col items-center">
          {rewardLine && (
            <p className="text-4xl font-extrabold text-center text-stone-900">
              {rewardLine}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
