import type { Venue } from '@/lib/supabase'

export function getPosterRewardLine(venue: Venue): string | null {
  const rewards = venue.rewards
  if (!rewards || rewards.length === 0) return null

  const topReward = rewards[rewards.length - 1]
  const icon = venue.stamp_icon ? `${venue.stamp_icon} ` : ''
  return `${topReward.stamp} ${icon}stamps → ${topReward.label}`
}
