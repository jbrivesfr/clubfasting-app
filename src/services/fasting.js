import { supabase } from './supabase'

export const startFast = async (userId, targetHours) => {
  const startTime = new Date().toISOString()
  const { data, error } = await supabase
    .from('fasts')
    .insert([
      {
        user_id: userId,
        start_time: startTime,
        target_hours: targetHours,
        status: 'active'
      }
    ])
    .select()
    .single()

  return { data, error }
}

export const stopFast = async (fastId, endTime, durationHours) => {
  const { data, error } = await supabase
    .from('fasts')
    .update({
      end_time: endTime,
      duration_hours: durationHours,
      status: 'stopped'
    })
    .eq('id', fastId)
    .select()
    .single()

  return { data, error }
}

export const completeFast = async (fastId, endTime, durationHours) => {
  const { data, error } = await supabase
    .from('fasts')
    .update({
      end_time: endTime,
      duration_hours: durationHours,
      status: 'completed'
    })
    .eq('id', fastId)
    .select()
    .single()

  return { data, error }
}

export const getActiveFast = async (userId) => {
  const { data, error } = await supabase
    .from('fasts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('start_time', { ascending: false })
    .maybeSingle()

  return { data, error }
}

export const getFastingHistory = async (userId, limit = 10) => {
  const { data, error } = await supabase
    .from('fasts')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'active')
    .order('end_time', { ascending: false })
    .limit(limit)

  return { data, error }
}

export const getFastingStats = async (userId) => {
  const { count, error: countError } = await supabase
      .from('fasts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['completed', 'stopped']) // Include stopped? Prompt says "total fasts". Usually completed ones.

  // Let's assume stats for completed fasts
  const { data, error } = await supabase
      .from('fasts')
      .select('duration_hours')
      .eq('user_id', userId)
      .eq('status', 'completed')

  if (error || countError) return { error: error || countError }

  const totalFasts = count || 0
  let totalDuration = 0
  let longestFast = 0

  data.forEach(f => {
      if (f.duration_hours) {
          totalDuration += f.duration_hours
          if (f.duration_hours > longestFast) longestFast = f.duration_hours
      }
  })

  const averageDuration = data.length > 0 ? totalDuration / data.length : 0

  return {
      data: {
          totalFasts,
          averageDuration,
          longestFast
      },
      error: null
  }
}
