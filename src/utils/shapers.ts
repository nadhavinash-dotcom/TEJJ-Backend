export function shapeWorker(w: any) {
  return {
    id:               w._id,
    full_name:        w.full_name,
    profile_photo_url: w.profile_photo_url,
    primary_skill:    w.primary_skill,
    secondary_skills: w.secondary_skills ?? [],
    years_experience: w.years_experience,
    location: {
      city:          w.city,
      area_locality: w.area_locality,
    },
    status:           w.status,
    scores: {
      trust:    w.trust_score,
      show_up:  w.show_up_rate,
      ai:       w.ai_score ?? null,
      ai_status: w.ai_score_status,
    },
    verified: {
      aadhaar: w.aadhaar_verified,
    },
    availability: {
      days:   w.available_days ?? [],
      from:   w.available_from,
      to:     w.available_to,
      shifts: w.preferred_shifts ?? [],
    },
    preferences: {
      min_pay_per_shift:    w.min_pay_per_shift ?? null,
      min_monthly_salary:   w.min_monthly_salary ?? null,
    },
  };
}

export function shapeEmployer(e: any) {
  return {
    id:                   e._id,
    property_name:        e.property_name,
    property_type:        e.property_type,
    property_segment:     e.property_segment ?? null,
    property_logo_url:    e.property_logo_url ?? null,
    location: {
      city:          e.city,
      area_locality: e.area_locality,
    },
    contact: {
      name:  e.contact_name,
      phone: e.contact_phone,
    },
    plan:                 e.plan,
    badges: {
      verified_employer:  e.verified_employer_badge,
    },
    reputation: {
      dignity_score:      e.dignity_score,
      dignity_state:      e.dignity_state,
      confirmation_rate:  e.confirmation_rate,
    },
    limits: {
      posts_this_month:   e.posts_this_month,
      monthly_post_limit: e.monthly_post_limit,
    },
    gate: {
      blocked: e.confirm_gate_blocked,
    },
    suspended:            e.suspended,
    // Feature flags — used by the frontend to show/hide UI
    features: {
      cream_pool:          e.cream_pool_access,
      database_search:     e.database_search_access,
      analytics:           e.analytics_access,
      interview_scheduler: e.interview_scheduler_access,
      multi_property:      e.multi_property_access,
    },
  };
}


export const UPDATABLE_FIELDS = {
  language: (v: unknown) => typeof v === 'string' && v.trim().length > 0,
  active_role: (v: unknown) => ['worker', 'employer'].includes(v as string),
  fcm_token: (v: unknown) => typeof v === 'string' && v.trim().length > 0,
  notification_permission: (v: unknown) => ['GRANTED', 'DENIED', 'PENDING'].includes(v as string),
  device_type: (v: unknown) => ['ANDROID', 'IOS', 'FEATURE_PHONE'].includes(v as string),
  app_version: (v: unknown) => typeof v === 'string' && v.trim().length > 0,
  last_active: (v: unknown) => !isNaN(Date.parse(v as string)),
} as const;
