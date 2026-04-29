import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from './config/database';
import { User } from './models/User';
import { Worker } from './models/Worker';
import { Employer } from './models/Employer';
import { Job } from './models/Job';

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectDatabase();

    console.log('Clearing old seed data (optional)...');
    // For safety, maybe just create random phone numbers so we don't accidentally drop real data if the DB isn't empty.
    const workerPhone = `+9199999${Math.floor(10000 + Math.random() * 90000)}`;
    const employerPhone = `+9188888${Math.floor(10000 + Math.random() * 90000)}`;

    console.log(`Creating Worker User with phone: ${workerPhone}`);
    const workerUser = new User({
      phone_number: workerPhone,
      firebase_uid: `test_worker_uid_${Date.now()}`,
      has_worker: true,
      has_employer: false,
      active_role: 'worker',
      notification_permission: 'GRANTED',
    });
    await workerUser.save();

    console.log(`Creating Employer User with phone: ${employerPhone}`);
    const employerUser = new User({
      phone_number: employerPhone,
      firebase_uid: `test_employer_uid_${Date.now()}`,
      has_worker: false,
      has_employer: true,
      active_role: 'employer',
      notification_permission: 'GRANTED',
    });
    await employerUser.save();

    console.log('Creating Worker Profile...');
    const workerProfile = new Worker({
      user_id: workerUser._id,
      full_name: 'Test Worker',
      gender: 'Male',
      primary_skill: 'Chef',
      state_of_origin: 'Delhi',
      years_experience: 5,
      trust_score: 80,
      status: 'ACTIVE',
      home_location: {
        type: 'Point',
        coordinates: [78.563583, 17.365361] // 17°21'55.3"N 78°33'48.9"E (Hyderabad area)
      }
    });
    await workerProfile.save();

    console.log('Creating Employer Profile...');
    const employerProfile = new Employer({
      user_id: employerUser._id,
      property_name: 'Test Restaurant',
      property_type: 'Restaurant',
      contact_name: 'Test Owner',
      contact_phone: employerPhone,
      location: {
        type: 'Point',
        coordinates: [78.563583, 17.365361]
      },
      plan: 'PRO'
    });
    await employerProfile.save();

    const centerLng = 78.4754325;
    const centerLat = 17.4432856;

    // 1 degree of Lat/Lng is roughly 111km. 
    // To stay within 15km, we offset by maximum ~0.10 degrees.

    const jobs = [
      {
        employer_id: employerProfile._id,
        lane: 1, 
        job_title: 'Match 1: Exact Center Cook',
        primary_skill: 'cook', // Must be exact match to query
        pay_type: 'PER_SHIFT',
        pay_rate: 600, // Satisfies pay_rate >= 500
        number_of_openings: 1,
        status: 'BROADCASTING', // Satisfies status in array
        // expires_at omitted -> satisfies { expires_at: { $exists: false } }
        location: { type: 'Point', coordinates: [centerLng, centerLat] }, // 0km away
      },
      {
        employer_id: employerProfile._id,
        lane: 1, 
        job_title: 'Match 2: Cook 2km North',
        primary_skill: 'cook',
        pay_type: 'PER_SHIFT',
        pay_min: 550, // Satisfies pay_min >= 500
        pay_max: 800,
        number_of_openings: 2,
        status: 'PARTIALLY_FILLED', // Satisfies status in array
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days -> satisfies gt current date
        location: { type: 'Point', coordinates: [centerLng, centerLat + 0.018] }, // ~2km away
      },
      {
        employer_id: employerProfile._id,
        lane: 2, 
        job_title: 'Match 3: Cook 5km East',
        primary_skill: 'cook',
        pay_type: 'MONTHLY',
        pay_min: 15000, // Satisfies pay_min >= 500
        number_of_openings: 3,
        status: 'BROADCASTING',
        location: { type: 'Point', coordinates: [centerLng + 0.045, centerLat] }, // ~5km away
      },
      {
        employer_id: employerProfile._id,
        lane: 2, 
        job_title: 'Match 4: Cook 8km South-West',
        primary_skill: 'cook',
        pay_type: 'PER_SHIFT',
        pay_rate: 750, // Satisfies pay_rate >= 500
        number_of_openings: 1,
        status: 'PARTIALLY_FILLED',
        location: { type: 'Point', coordinates: [centerLng - 0.05, centerLat - 0.05] }, // ~7.5km away
      },
      {
        employer_id: employerProfile._id,
        lane: 3, 
        job_title: 'Match 5: Cook 12km North-West',
        primary_skill: 'cook',
        pay_type: 'MONTHLY',
        pay_min: 12000, // Satisfies pay_min >= 500
        pay_max: 18000,
        number_of_openings: 1,
        status: 'BROADCASTING',
        location: { type: 'Point', coordinates: [centerLng - 0.08, centerLat + 0.07] }, // ~12km away
      },
      {
        employer_id: employerProfile._id,
        lane: 4, 
        job_title: 'Match 6: Premium Cook 14km South',
        primary_skill: 'cook',
        pay_type: 'MONTHLY',
        pay_rate: 25000, // Satisfies pay_rate >= 500
        number_of_openings: 1,
        status: 'BROADCASTING',
        cream_pool_first: true,
        location: { type: 'Point', coordinates: [centerLng, centerLat - 0.12] }, // ~13.5km away
      }
    ];

    for (const jobData of jobs) {
      const job = new Job(jobData);
      await job.save();
      console.log(`Created Job: ${job.job_title} in Lane ${job.lane}`);
    }

    console.log('Seed data created successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await disconnectDatabase();
    console.log('Disconnected from database.');
  }
}

seed();
