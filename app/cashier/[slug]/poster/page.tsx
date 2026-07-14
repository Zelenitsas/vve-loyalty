import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import QRCode from 'qrcode'
import { getVenueBySlug } from '@/lib/supabase'
import { getPosterRewardLine } from '@/lib/poster'
import PosterView from '@/components/PosterView'

export default async function PosterPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const venue = await getVenueBySlug(slug)
  if (!venue) notFound()

  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get(`cashier_${slug}`)?.value === 'true'
  if (!isLoggedIn) redirect(`/cashier/${slug}`)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const registerUrl = `${baseUrl}/register/${venue.slug}`
  const qrDataUrl = await QRCode.toDataURL(registerUrl, { width: 600, margin: 2, color: { dark: '#1c1917', light: '#ffffff' } })
  const rewardLine = getPosterRewardLine(venue)

  return <PosterView venue={venue} qrDataUrl={qrDataUrl} rewardLine={rewardLine} />
}
