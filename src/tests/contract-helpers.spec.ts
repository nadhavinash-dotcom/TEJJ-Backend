import assert from 'node:assert/strict';

import {
  buildProfileRoutingState,
  deriveLaneExpiry,
  normalizeEmployerOnboardingPayload,
  normalizeWorkerOnboardingPayload,
} from '../utils/contract-helpers';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run('normalizeWorkerOnboardingPayload maps frontend worker onboarding into model fields', () => {
  const result = normalizeWorkerOnboardingPayload({
    primary_skill: 'cook',
    sub_skills: ['tandoor', 'north-indian'],
    years_experience: 4,
    profile_photo_url: 'https://cdn.example.com/photo.jpg',
    home_lat: 17.385,
    home_lng: 78.4867,
    home_city: 'Hyderabad',
    home_area: 'Banjara Hills',
    available_days: ['Mon', 'Tue'],
    preferred_shifts: ['morning', 'evening'],
    min_pay_per_shift: 900,
    skill_video_url: 'https://cdn.example.com/video.mp4',
    ai_score: { technique: 80, speed: 70, hygiene: 90, warmth: 60 },
    fcm_token: 'token-1',
  });

  assert.equal(result.primary_skill, 'cook');
  assert.deepEqual(result.secondary_skills, ['tandoor', 'north-indian']);
  assert.deepEqual(result.home_location, {
    type: 'Point',
    coordinates: [78.4867, 17.385],
  });
  assert.equal(result.city, 'Hyderabad');
  assert.equal(result.area_locality, 'Banjara Hills');
  assert.equal(result.ai_score, 75);
  assert.equal(result.ai_score_technique, 80);
  assert.equal(result.ai_score_speed, 70);
  assert.equal(result.ai_score_hygiene, 90);
  assert.equal(result.ai_score_warmth, 60);
});

run('normalizeEmployerOnboardingPayload maps frontend employer onboarding into model fields', () => {
  const result = normalizeEmployerOnboardingPayload({
    property_name: 'Hotel Sunrise',
    property_type: 'hotel',
    lat: 28.6139,
    lng: 77.209,
    city: 'Delhi',
    area_locality: 'Connaught Place',
    address: '12 Market Road',
    contact_name: 'Asha',
    contact_phone: '+919999999999',
    email: 'asha@example.com',
    gstin: '29ABCDE1234F1Z5',
  });

  assert.equal(result.property_name, 'Hotel Sunrise');
  assert.equal(result.location_address, '12 Market Road');
  assert.deepEqual(result.location, {
    type: 'Point',
    coordinates: [77.209, 28.6139],
  });
  assert.equal(result.email, 'asha@example.com');
  assert.equal(result.gstin, '29ABCDE1234F1Z5');
});

run('deriveLaneExpiry uses tighter windows for faster lanes', () => {
  const now = new Date('2026-04-23T10:00:00.000Z');

  const lane1 = deriveLaneExpiry({ lane: 1, now, shiftStartTime: '2026-04-23T13:00:00.000Z' });
  const lane2 = deriveLaneExpiry({ lane: 2, now, shiftStartTime: '2026-04-23T18:00:00.000Z' });
  const lane3 = deriveLaneExpiry({ lane: 3, now });
  const lane4 = deriveLaneExpiry({ lane: 4, now });

  assert.equal(lane1.toISOString(), '2026-04-23T13:30:00.000Z');
  assert.equal(lane2.toISOString(), '2026-04-23T18:00:00.000Z');
  assert.equal(lane3.toISOString(), '2026-04-30T10:00:00.000Z');
  assert.equal(lane4.toISOString(), '2026-05-23T10:00:00.000Z');
});

run('buildProfileRoutingState returns onboarding when profile does not exist', () => {
  assert.deepEqual(
    buildProfileRoutingState({ role: 'worker', hasProfile: false }),
    {
      role: 'worker',
      profile_exists: false,
      next_route: '/(worker)/onboarding/role',
    }
  );

  assert.deepEqual(
    buildProfileRoutingState({ role: 'employer', hasProfile: true }),
    {
      role: 'employer',
      profile_exists: true,
      next_route: '/(employer)/(tabs)/dashboard',
    }
  );
});
