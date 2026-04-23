import { DAYS_OF_WEEK, SHIFT_PRESETS } from './constants';

type WorkerAIScoreInput = {
  technique: number;
  speed: number;
  hygiene: number;
  warmth: number;
};

type WorkerOnboardingInput = {
  primary_skill?: unknown;
  sub_skills?: unknown;
  years_experience?: unknown;
  profile_photo_url?: unknown;
  home_lat?: unknown;
  home_lng?: unknown;
  home_city?: unknown;
  home_area?: unknown;
  available_days?: unknown;
  preferred_shifts?: unknown;
  min_pay_per_shift?: unknown;
  skill_video_url?: unknown;
  ai_score?: unknown;
  fcm_token?: unknown;
};

type EmployerOnboardingInput = {
  property_name?: unknown;
  property_type?: unknown;
  lat?: unknown;
  lng?: unknown;
  city?: unknown;
  area_locality?: unknown;
  address?: unknown;
  contact_name?: unknown;
  contact_phone?: unknown;
  email?: unknown;
  gstin?: unknown;
};

export class ContractValidationError extends Error {
  details: string[];

  constructor(message: string, details: string[]) {
    super(message);
    this.name = 'ContractValidationError';
    this.details = details;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string, details: string[]): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    details.push(`${field} is required`);
    return '';
  }
  return value.trim();
}

function optionalString(value: unknown, field: string, details: string[]): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    details.push(`${field} must be a string`);
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    details.push(`${field} must not be empty`);
    return undefined;
  }
  return trimmed;
}

function requireNumber(value: unknown, field: string, details: string[]): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    details.push(`${field} must be a valid number`);
    return Number.NaN;
  }
  return numeric;
}

function optionalUrl(value: unknown, field: string, details: string[]): string | undefined {
  const candidate = optionalString(value, field, details);
  if (!candidate) return undefined;
  try {
    new URL(candidate);
    return candidate;
  } catch {
    details.push(`${field} must be a valid URL`);
    return undefined;
  }
}

function ensureStringArray(value: unknown, field: string, details: string[]): string[] {
  if (!Array.isArray(value)) {
    details.push(`${field} must be an array`);
    return [];
  }
  const normalized = value
    .filter((entry) => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (normalized.length !== value.length) {
    details.push(`${field} must contain only non-empty strings`);
  }

  return normalized;
}

function assertNoValidationErrors(details: string[], message: string) {
  if (details.length > 0) {
    throw new ContractValidationError(message, details);
  }
}

function validateDayValues(days: string[], field: string, details: string[]) {
  const allowed = new Set(DAYS_OF_WEEK);
  const invalid = days.filter((day) => !allowed.has(day as (typeof DAYS_OF_WEEK)[number]));
  if (invalid.length > 0) {
    details.push(`${field} contains unsupported values: ${invalid.join(', ')}`);
  }
}

function validateShiftValues(shifts: string[], field: string, details: string[]) {
  const allowed = new Set<string>(SHIFT_PRESETS.map((shift) => shift.id));
  const invalid = shifts.filter((shift) => !allowed.has(shift));
  if (invalid.length > 0) {
    details.push(`${field} contains unsupported values: ${invalid.join(', ')}`);
  }
}

function normalizeAIScore(value: unknown, details: string[]) {
  if (value === undefined || value === null) {
    return {};
  }
  if (!isRecord(value)) {
    details.push('ai_score must be an object');
    return {};
  }

  const score = value as WorkerAIScoreInput;
  const technique = requireNumber(score.technique, 'ai_score.technique', details);
  const speed = requireNumber(score.speed, 'ai_score.speed', details);
  const hygiene = requireNumber(score.hygiene, 'ai_score.hygiene', details);
  const warmth = requireNumber(score.warmth, 'ai_score.warmth', details);

  const components = [technique, speed, hygiene, warmth];
  if (components.some((component) => Number.isNaN(component))) {
    return {};
  }

  const average = Math.round(components.reduce((sum, scorePart) => sum + scorePart, 0) / components.length);
  return {
    ai_score: average,
    ai_score_technique: technique,
    ai_score_speed: speed,
    ai_score_hygiene: hygiene,
    ai_score_warmth: warmth,
    ai_score_status: 'SCORED' as const,
  };
}

export function normalizeWorkerOnboardingPayload(input: WorkerOnboardingInput) {
  const details: string[] = [];

  const primarySkill = requireString(input.primary_skill, 'primary_skill', details);
  const yearsExperience = requireNumber(input.years_experience, 'years_experience', details);
  const homeLat = requireNumber(input.home_lat, 'home_lat', details);
  const homeLng = requireNumber(input.home_lng, 'home_lng', details);
  const homeCity = requireString(input.home_city, 'home_city', details);
  const homeArea = requireString(input.home_area, 'home_area', details);
  const minPayPerShift = requireNumber(input.min_pay_per_shift, 'min_pay_per_shift', details);
  const availableDays = ensureStringArray(input.available_days, 'available_days', details);
  const preferredShifts = ensureStringArray(input.preferred_shifts, 'preferred_shifts', details);

  if (!Number.isNaN(yearsExperience) && yearsExperience < 0) {
    details.push('years_experience must be zero or more');
  }
  if (!Number.isNaN(minPayPerShift) && minPayPerShift <= 0) {
    details.push('min_pay_per_shift must be greater than zero');
  }
  if (!Number.isNaN(homeLat) && (homeLat < -90 || homeLat > 90)) {
    details.push('home_lat must be between -90 and 90');
  }
  if (!Number.isNaN(homeLng) && (homeLng < -180 || homeLng > 180)) {
    details.push('home_lng must be between -180 and 180');
  }
  if (availableDays.length === 0) {
    details.push('available_days must contain at least one day');
  }
  if (preferredShifts.length === 0) {
    details.push('preferred_shifts must contain at least one shift');
  }

  validateDayValues(availableDays, 'available_days', details);
  validateShiftValues(preferredShifts, 'preferred_shifts', details);

  const secondarySkills = ensureStringArray(input.sub_skills ?? [], 'sub_skills', details);
  const profilePhotoUrl = optionalUrl(input.profile_photo_url, 'profile_photo_url', details);
  const skillVideoUrl = optionalUrl(input.skill_video_url, 'skill_video_url', details);
  const fcmToken = optionalString(input.fcm_token, 'fcm_token', details);

  const aiScoreFields = normalizeAIScore(input.ai_score, details);

  assertNoValidationErrors(details, 'Invalid worker onboarding payload');

  return {
    primary_skill: primarySkill,
    secondary_skills: secondarySkills,
    years_experience: yearsExperience,
    profile_photo_url: profilePhotoUrl,
    home_location: {
      type: 'Point' as const,
      coordinates: [homeLng, homeLat] as [number, number],
    },
    city: homeCity,
    area_locality: homeArea,
    available_days: availableDays,
    preferred_shifts: preferredShifts,
    min_pay_per_shift: minPayPerShift,
    skill_video_url: skillVideoUrl,
    fcm_token: fcmToken,
    ...aiScoreFields,
  };
}

export function normalizeEmployerOnboardingPayload(input: EmployerOnboardingInput) {
  const details: string[] = [];

  const propertyName = requireString(input.property_name, 'property_name', details);
  const propertyType = requireString(input.property_type, 'property_type', details);
  const lat = requireNumber(input.lat, 'lat', details);
  const lng = requireNumber(input.lng, 'lng', details);
  const city = requireString(input.city, 'city', details);
  const areaLocality = requireString(input.area_locality, 'area_locality', details);
  const address = requireString(input.address, 'address', details);
  const contactName = requireString(input.contact_name, 'contact_name', details);
  const contactPhone = requireString(input.contact_phone, 'contact_phone', details);
  const email = optionalString(input.email, 'email', details);
  const gstin = optionalString(input.gstin, 'gstin', details);

  if (!Number.isNaN(lat) && (lat < -90 || lat > 90)) {
    details.push('lat must be between -90 and 90');
  }
  if (!Number.isNaN(lng) && (lng < -180 || lng > 180)) {
    details.push('lng must be between -180 and 180');
  }
  if (email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      details.push('email must be a valid email address');
    }
  }
  if (gstin) {
    const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/;
    if (!gstinPattern.test(gstin)) {
      details.push('gstin must be a valid GSTIN');
    }
  }

  assertNoValidationErrors(details, 'Invalid employer onboarding payload');

  return {
    property_name: propertyName,
    property_type: propertyType,
    location: {
      type: 'Point' as const,
      coordinates: [lng, lat] as [number, number],
    },
    city,
    area_locality: areaLocality,
    location_address: address,
    contact_name: contactName,
    contact_phone: contactPhone,
    email,
    gstin,
  };
}

export function deriveLaneExpiry(params: {
  lane: number;
  now?: Date;
  shiftStartTime?: string | Date;
}) {
  const now = params.now ?? new Date();
  const shiftStart = params.shiftStartTime ? new Date(params.shiftStartTime) : undefined;

  if (params.lane === 1) {
    return shiftStart && !Number.isNaN(shiftStart.getTime())
      ? new Date(shiftStart.getTime() + 30 * 60 * 1000)
      : new Date(now.getTime() + 6 * 60 * 60 * 1000);
  }

  if (params.lane === 2) {
    return shiftStart && !Number.isNaN(shiftStart.getTime())
      ? shiftStart
      : new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  if (params.lane === 3) {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
}

export function buildProfileRoutingState(params: {
  role: 'worker' | 'employer';
  hasProfile: boolean;
}) {
  return {
    role: params.role,
    profile_exists: params.hasProfile,
    next_route: params.hasProfile
      ? params.role === 'worker'
        ? '/(worker)/(tabs)/feed'
        : '/(employer)/(tabs)/dashboard'
      : params.role === 'worker'
        ? '/(worker)/onboarding/role'
        : '/(employer)/onboarding/property',
  };
}
