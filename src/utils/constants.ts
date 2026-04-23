export const SKILL_LIST = [
  { id: 'cook', label: 'Rasoi', labelEn: 'Cook', icon: '🍳', keywords: ['cook', 'rasoi', 'chef', 'khana', 'cooking'] },
  { id: 'prep_cook', label: 'Prep', labelEn: 'Prep Cook', icon: '🔪', keywords: ['prep', 'cutting', 'chopping'] },
  { id: 'tandoor', label: 'Tandoor', labelEn: 'Tandoor Cook', icon: '🫓', keywords: ['tandoor', 'roti', 'naan', 'bread'] },
  { id: 'biryani', label: 'Biryani', labelEn: 'Biryani Chef', icon: '🥘', keywords: ['biryani', 'pulao', 'rice'] },
  { id: 'baker', label: 'Baker', labelEn: 'Baker', icon: '🎂', keywords: ['baker', 'bakery', 'cake', 'bread', 'pastry'] },
  { id: 'continental', label: 'Continental', labelEn: 'Continental Chef', icon: '🍝', keywords: ['continental', 'western', 'pasta', 'italian'] },
  { id: 'waiter', label: 'Waiter', labelEn: 'Waiter / Server', icon: '🍽️', keywords: ['waiter', 'server', 'service', 'floor', 'serving'] },
  { id: 'steward', label: 'Steward', labelEn: 'Steward', icon: '🧹', keywords: ['steward', 'cleaning', 'kitchen cleaning'] },
  { id: 'runner', label: 'Runner', labelEn: 'Food Runner', icon: '🏃', keywords: ['runner', 'delivery', 'food runner'] },
  { id: 'cashier', label: 'Cashier', labelEn: 'Cashier', icon: '💰', keywords: ['cashier', 'billing', 'cash', 'payment'] },
  { id: 'housekeeper', label: 'HK', labelEn: 'Housekeeper', icon: '🛏️', keywords: ['housekeeper', 'housekeeping', 'room cleaning', 'maid'] },
  { id: 'laundry', label: 'Laundry', labelEn: 'Laundry', icon: '🧺', keywords: ['laundry', 'washing', 'ironing', 'linen'] },
  { id: 'cleaner', label: 'Safai', labelEn: 'Cleaner', icon: '🧽', keywords: ['cleaner', 'safai', 'cleaning', 'janitor'] },
  { id: 'bellboy', label: 'Bellboy', labelEn: 'Bellboy', icon: '🛎️', keywords: ['bellboy', 'porter', 'luggage', 'hotel porter'] },
  { id: 'valet', label: 'Valet', labelEn: 'Valet', icon: '🚗', keywords: ['valet', 'parking', 'driver', 'car parking'] },
  { id: 'security', label: 'Security', labelEn: 'Security Guard', icon: '🔐', keywords: ['security', 'guard', 'security guard', 'watchman'] },
  { id: 'barista', label: 'Barista', labelEn: 'Barista', icon: '☕', keywords: ['barista', 'coffee', 'cafe', 'espresso'] },
  { id: 'bartender', label: 'Bartender', labelEn: 'Bartender', icon: '🍸', keywords: ['bartender', 'bar', 'drinks', 'cocktail', 'mixologist'] },
  { id: 'banquet', label: 'Banquet', labelEn: 'Banquet Staff', icon: '🎪', keywords: ['banquet', 'events', 'catering events', 'hall'] },
  { id: 'maintenance', label: 'Maintenance', labelEn: 'Maintenance', icon: '🔧', keywords: ['maintenance', 'electrician', 'plumber', 'repair', 'technician'] },
  { id: 'spa', label: 'Spa', labelEn: 'Spa Therapist', icon: '💆', keywords: ['spa', 'massage', 'therapist', 'wellness', 'beauty'] },
  { id: 'helper', label: 'Helper', labelEn: 'Helper', icon: '📦', keywords: ['helper', 'assistant', 'support', 'all rounder'] },
  { id: 'nurse', label: 'Nurse', labelEn: 'Nurse / Health', icon: '🏥', keywords: ['nurse', 'health', 'medical', 'first aid'] },
  { id: 'other', label: 'Aur', labelEn: 'Other', icon: '➕', keywords: ['other', 'misc'] },
] as const;

export const CUISINE_LIST = [
  { id: 'north_indian', label: 'Uttar Bharatiya', labelEn: 'North Indian', keywords: ['north indian', 'dal makhani', 'paneer', 'maa ki dal'] },
  { id: 'south_indian', label: 'Dakshin Bharatiya', labelEn: 'South Indian', keywords: ['south indian', 'dosa', 'idli', 'sambar', 'rasam'] },
  { id: 'biryani_mughlai', label: 'Biryani / Mughlai', labelEn: 'Biryani / Mughlai', keywords: ['biryani', 'mughlai', 'kebab', 'korma'] },
  { id: 'chinese', label: 'Chinese / Indo-Chinese', labelEn: 'Chinese', keywords: ['chinese', 'noodles', 'manchurian', 'hakka'] },
  { id: 'continental', label: 'Continental / Western', labelEn: 'Continental', keywords: ['continental', 'pasta', 'pizza', 'western', 'european'] },
  { id: 'tandoor', label: 'Tandoor Expert', labelEn: 'Tandoor', keywords: ['tandoor', 'tandoori', 'roti', 'naan', 'paratha'] },
  { id: 'bakery', label: 'Bakery / Pastry', labelEn: 'Bakery', keywords: ['bakery', 'pastry', 'cake', 'bread', 'croissant'] },
  { id: 'mithai', label: 'Indian Sweets', labelEn: 'Indian Sweets', keywords: ['mithai', 'sweets', 'halwa', 'barfi', 'ladoo'] },
  { id: 'bulk_catering', label: 'Bulk / Catering', labelEn: 'Bulk Catering', keywords: ['bulk', 'catering', 'large scale', 'mass cooking'] },
  { id: 'pizza_fast_food', label: 'Pizza / Fast Food', labelEn: 'Pizza / Fast Food', keywords: ['pizza', 'fast food', 'burger', 'sandwich'] },
] as const;

export const LANGUAGES = [
  { code: 'hi', label: 'हिंदी', labelEn: 'Hindi', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', labelEn: 'Telugu', flag: '🏳️' },
  { code: 'ta', label: 'தமிழ்', labelEn: 'Tamil', flag: '🏳️' },
  { code: 'kn', label: 'ಕನ್ನಡ', labelEn: 'Kannada', flag: '🏳️' },
  { code: 'mr', label: 'मराठी', labelEn: 'Marathi', flag: '🏳️' },
  { code: 'bn', label: 'বাংলা', labelEn: 'Bengali', flag: '🏳️' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', labelEn: 'Punjabi', flag: '🏳️' },
  { code: 'en', label: 'English', labelEn: 'English', flag: '🇬🇧' },
] as const;

export const HIRING_LANES = {
  L1: { id: 1, label: 'Flash', labelHi: 'Flash', color: '#EF4444', window: '0-6 hours', icon: '⚡' },
  L2: { id: 2, label: 'Same-Day', labelHi: 'Same-Day', color: '#F59E0B', window: '6-24 hours', icon: '🌅' },
  L3: { id: 3, label: 'Contract', labelHi: 'Contract', color: '#3B82F6', window: '24-72 hours', icon: '📋' },
  L4: { id: 4, label: 'Permanent', labelHi: 'Permanent', color: '#8B5CF6', window: '3-7 days', icon: '🏢' },
} as const;

export const EMPLOYER_PLANS = {
  FLASH_FREE: { name: 'Flash Free', price: 0, post_limit: 3, features: ['L1 Flash', '3 posts/month', 'Skill video view'] },
  STARTER: { name: 'Starter', price: 2999, post_limit: 10, features: ['All 4 lanes', '10 posts/month', 'Interview scheduler', 'Pay benchmarking'] },
  GROWTH: { name: 'Growth', price: 7999, post_limit: 30, features: ['30 posts/month', '100 DB unlocks', 'Analytics', 'Cream Pool', 'Retain Basic'] },
  PRO: { name: 'Pro', price: 18999, post_limit: -1, features: ['Unlimited posts', '500 DB unlocks', 'Auto-Recruiter', 'SLA 60%', 'Account Manager'] },
} as const;

export const SHIFT_PRESETS = [
  { id: 'morning', label: 'Subah', labelEn: 'Morning', from: '06:00', to: '14:00', icon: '🌅' },
  { id: 'evening', label: 'Shaam', labelEn: 'Evening', from: '14:00', to: '22:00', icon: '🌇' },
  { id: 'night', label: 'Raat', labelEn: 'Night', from: '22:00', to: '06:00', icon: '🌙' },
  { id: 'any', label: 'Koi bhi', labelEn: 'Any Time', from: '06:00', to: '23:59', icon: '🔄' },
] as const;

export const PROPERTY_TYPES = [
  { id: 'restaurant_standalone', label: '🍽️ Restaurant (Standalone)' },
  { id: 'restaurant_chain', label: '🔗 Restaurant (Chain outlet)' },
  { id: 'hotel_budget', label: '🏨 Hotel (Budget — 1-2 star)' },
  { id: 'hotel_midscale', label: '🏨 Hotel (Mid-scale — 3 star)' },
  { id: 'hotel_luxury', label: '💎 Hotel (Luxury / 4-5 star)' },
  { id: 'cloud_kitchen', label: '☁️ Cloud Kitchen / Dark Kitchen' },
  { id: 'cafe', label: '☕ Café / Coffee Shop' },
  { id: 'bar', label: '🍸 Bar / Pub / Lounge' },
  { id: 'banquet', label: '🎪 Banquet Hall / Convention Centre' },
  { id: 'catering', label: '🍱 Catering Company' },
  { id: 'resort', label: '🏖️ Resort / Club' },
  { id: 'guesthouse', label: '🏠 Guesthouse / Service Apartment' },
  { id: 'hospital_canteen', label: '🏥 Hospital / Clinic Canteen' },
  { id: 'corporate_cafeteria', label: '🏢 Corporate Cafeteria' },
  { id: 'airline_catering', label: '✈️ Airline / Railway Catering' },
  { id: 'school_canteen', label: '🏫 School / College Canteen' },
  { id: 'other', label: 'Other' },
] as const;

export const INDIAN_CITIES = [
  'Hyderabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi',
  'Coimbatore', 'Visakhapatnam', 'Nagpur', 'Indore', 'Bhopal', 'Surat',
] as const;

export const EXPERIENCE_LABELS: Record<number, string> = {
  0: 'Fresher — abhi seekh raha hun',
  1: '1 saal — thoda seekha hai',
  2: '2 saal — achha kaam aata hai',
  3: '3 saal — experienced hun',
  4: '4 saal — senior level',
  6: '5+ saal — ustad hun',
};

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const TRUST_SCORE_FORMULA = {
  SHOW_UP_RATE_WEIGHT: 0.40,
  EMPLOYER_RATING_WEIGHT: 0.30,
  PROFILE_DEPTH_WEIGHT: 0.20,
  CONDUCT_WEIGHT: 0.10,
  MIN_L1_THRESHOLD: 3.0,
} as const;

export const AI_SCORE_FORMULA = {
  TECHNIQUE_WEIGHT: 0.40,
  SPEED_WEIGHT: 0.25,
  HYGIENE_WEIGHT: 0.20,
  WARMTH_WEIGHT: 0.15,
  HUMAN_REVIEW_THRESHOLD: 40,
} as const;
