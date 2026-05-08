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
        job_title: 'Executive Chef - North Indian Speciality',
        job_description: 'We are looking for an experienced Executive Chef specializing in North Indian cuisine. The ideal candidate should have a strong background in tandoor and curry preparations, team management, and kitchen operations.',
        primary_skill: 'cook',
        secondary_skills_preferred: ['Management', 'Inventory Control'],
        cuisine_preferred: ['North Indian', 'Mughlai'],
        pay_type: 'PER_SHIFT',
        pay_rate: 1200,
        number_of_openings: 1,
        experience_years_min: 5,
        accommodation_provided: true,
        meals_provided: true,
        status: 'BROADCASTING',
        location: { type: 'Point', coordinates: [centerLng, centerLat] },
      },
      {
        employer_id: employerProfile._id,
        lane: 1, 
        job_title: 'Line Cook - Continental Cuisine',
        job_description: 'Seeking a skilled Line Cook for our busy Continental section. Responsibilities include prep work, maintaining station hygiene, and ensuring timely delivery of orders during peak hours.',
        primary_skill: 'cook',
        secondary_skills_preferred: ['Prep work', 'Grilling'],
        cuisine_preferred: ['Continental', 'Italian'],
        pay_type: 'PER_SHIFT',
        pay_min: 700,
        pay_max: 900,
        number_of_openings: 2,
        experience_years_min: 2,
        meals_provided: true,
        status: 'PARTIALLY_FILLED',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: { type: 'Point', coordinates: [centerLng, centerLat + 0.018] },
      },
      {
        employer_id: employerProfile._id,
        lane: 2, 
        job_title: 'South Indian Dosa Specialist',
        job_description: 'Expert Dosa Master required for a premium breakfast outlet. Must be proficient in making various types of dosas and chutneys with high speed and consistency.',
        primary_skill: 'cook',
        secondary_skills_preferred: ['Speed cooking', 'Hygiene standards'],
        cuisine_preferred: ['South Indian'],
        pay_type: 'MONTHLY',
        pay_min: 18000,
        number_of_openings: 3,
        experience_years_min: 3,
        accommodation_provided: true,
        meals_provided: true,
        status: 'BROADCASTING',
        location: { type: 'Point', coordinates: [centerLng + 0.045, centerLat] },
      },
      {
        employer_id: employerProfile._id,
        lane: 2, 
        job_title: 'Assistant Cook - Chinese Section',
        job_description: 'Looking for an Assistant Cook to support our Chinese wok station. Should have basic knowledge of sauces, chopping techniques, and wok handling.',
        primary_skill: 'cook',
        secondary_skills_preferred: ['Knife skills', 'Wok handling'],
        cuisine_preferred: ['Chinese', 'Pan-Asian'],
        pay_type: 'PER_SHIFT',
        pay_rate: 650,
        number_of_openings: 1,
        experience_years_min: 1,
        meals_provided: true,
        status: 'PARTIALLY_FILLED',
        location: { type: 'Point', coordinates: [centerLng - 0.05, centerLat - 0.05] },
      },
      {
        employer_id: employerProfile._id,
        lane: 3, 
        job_title: 'Pastry Chef - Bakery & Cafe',
        job_description: 'Join our cafe as a Pastry Chef. You will be responsible for baking fresh breads, cakes, and pastries daily. Creativity and attention to detail are highly valued.',
        primary_skill: 'cook',
        secondary_skills_preferred: ['Baking', 'Cake decoration'],
        cuisine_preferred: ['Bakery', 'Desserts'],
        pay_type: 'MONTHLY',
        pay_min: 22000,
        pay_max: 28000,
        number_of_openings: 1,
        experience_years_min: 4,
        transport_provided: true,
        meals_provided: true,
        status: 'BROADCASTING',
        location: { type: 'Point', coordinates: [centerLng - 0.08, centerLat + 0.07] },
      },
      {
        employer_id: employerProfile._id,
        lane: 4, 
        job_title: 'Head Chef - Fine Dining Restaurant',
        job_description: 'Leads our culinary team in a high-end fine dining environment. Responsible for menu planning, costing, quality control, and maintaining the highest standards of service.',
        primary_skill: 'cook',
        secondary_skills_preferred: ['Menu planning', 'Leadership'],
        cuisine_preferred: ['Fusion', 'Modern Indian'],
        pay_type: 'MONTHLY',
        pay_rate: 45000,
        number_of_openings: 1,
        experience_years_min: 8,
        accommodation_provided: true,
        meals_provided: true,
        transport_provided: true,
        status: 'BROADCASTING',
        cream_pool_first: true,
        location: { type: 'Point', coordinates: [centerLng, centerLat - 0.12] },
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
