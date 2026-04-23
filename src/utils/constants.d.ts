export declare const SKILL_LIST: readonly [{
    readonly id: "cook";
    readonly label: "Rasoi";
    readonly labelEn: "Cook";
    readonly icon: "🍳";
    readonly keywords: readonly ["cook", "rasoi", "chef", "khana", "cooking"];
}, {
    readonly id: "prep_cook";
    readonly label: "Prep";
    readonly labelEn: "Prep Cook";
    readonly icon: "🔪";
    readonly keywords: readonly ["prep", "cutting", "chopping"];
}, {
    readonly id: "tandoor";
    readonly label: "Tandoor";
    readonly labelEn: "Tandoor Cook";
    readonly icon: "🫓";
    readonly keywords: readonly ["tandoor", "roti", "naan", "bread"];
}, {
    readonly id: "biryani";
    readonly label: "Biryani";
    readonly labelEn: "Biryani Chef";
    readonly icon: "🥘";
    readonly keywords: readonly ["biryani", "pulao", "rice"];
}, {
    readonly id: "baker";
    readonly label: "Baker";
    readonly labelEn: "Baker";
    readonly icon: "🎂";
    readonly keywords: readonly ["baker", "bakery", "cake", "bread", "pastry"];
}, {
    readonly id: "continental";
    readonly label: "Continental";
    readonly labelEn: "Continental Chef";
    readonly icon: "🍝";
    readonly keywords: readonly ["continental", "western", "pasta", "italian"];
}, {
    readonly id: "waiter";
    readonly label: "Waiter";
    readonly labelEn: "Waiter / Server";
    readonly icon: "🍽️";
    readonly keywords: readonly ["waiter", "server", "service", "floor", "serving"];
}, {
    readonly id: "steward";
    readonly label: "Steward";
    readonly labelEn: "Steward";
    readonly icon: "🧹";
    readonly keywords: readonly ["steward", "cleaning", "kitchen cleaning"];
}, {
    readonly id: "runner";
    readonly label: "Runner";
    readonly labelEn: "Food Runner";
    readonly icon: "🏃";
    readonly keywords: readonly ["runner", "delivery", "food runner"];
}, {
    readonly id: "cashier";
    readonly label: "Cashier";
    readonly labelEn: "Cashier";
    readonly icon: "💰";
    readonly keywords: readonly ["cashier", "billing", "cash", "payment"];
}, {
    readonly id: "housekeeper";
    readonly label: "HK";
    readonly labelEn: "Housekeeper";
    readonly icon: "🛏️";
    readonly keywords: readonly ["housekeeper", "housekeeping", "room cleaning", "maid"];
}, {
    readonly id: "laundry";
    readonly label: "Laundry";
    readonly labelEn: "Laundry";
    readonly icon: "🧺";
    readonly keywords: readonly ["laundry", "washing", "ironing", "linen"];
}, {
    readonly id: "cleaner";
    readonly label: "Safai";
    readonly labelEn: "Cleaner";
    readonly icon: "🧽";
    readonly keywords: readonly ["cleaner", "safai", "cleaning", "janitor"];
}, {
    readonly id: "bellboy";
    readonly label: "Bellboy";
    readonly labelEn: "Bellboy";
    readonly icon: "🛎️";
    readonly keywords: readonly ["bellboy", "porter", "luggage", "hotel porter"];
}, {
    readonly id: "valet";
    readonly label: "Valet";
    readonly labelEn: "Valet";
    readonly icon: "🚗";
    readonly keywords: readonly ["valet", "parking", "driver", "car parking"];
}, {
    readonly id: "security";
    readonly label: "Security";
    readonly labelEn: "Security Guard";
    readonly icon: "🔐";
    readonly keywords: readonly ["security", "guard", "security guard", "watchman"];
}, {
    readonly id: "barista";
    readonly label: "Barista";
    readonly labelEn: "Barista";
    readonly icon: "☕";
    readonly keywords: readonly ["barista", "coffee", "cafe", "espresso"];
}, {
    readonly id: "bartender";
    readonly label: "Bartender";
    readonly labelEn: "Bartender";
    readonly icon: "🍸";
    readonly keywords: readonly ["bartender", "bar", "drinks", "cocktail", "mixologist"];
}, {
    readonly id: "banquet";
    readonly label: "Banquet";
    readonly labelEn: "Banquet Staff";
    readonly icon: "🎪";
    readonly keywords: readonly ["banquet", "events", "catering events", "hall"];
}, {
    readonly id: "maintenance";
    readonly label: "Maintenance";
    readonly labelEn: "Maintenance";
    readonly icon: "🔧";
    readonly keywords: readonly ["maintenance", "electrician", "plumber", "repair", "technician"];
}, {
    readonly id: "spa";
    readonly label: "Spa";
    readonly labelEn: "Spa Therapist";
    readonly icon: "💆";
    readonly keywords: readonly ["spa", "massage", "therapist", "wellness", "beauty"];
}, {
    readonly id: "helper";
    readonly label: "Helper";
    readonly labelEn: "Helper";
    readonly icon: "📦";
    readonly keywords: readonly ["helper", "assistant", "support", "all rounder"];
}, {
    readonly id: "nurse";
    readonly label: "Nurse";
    readonly labelEn: "Nurse / Health";
    readonly icon: "🏥";
    readonly keywords: readonly ["nurse", "health", "medical", "first aid"];
}, {
    readonly id: "other";
    readonly label: "Aur";
    readonly labelEn: "Other";
    readonly icon: "➕";
    readonly keywords: readonly ["other", "misc"];
}];
export declare const CUISINE_LIST: readonly [{
    readonly id: "north_indian";
    readonly label: "Uttar Bharatiya";
    readonly labelEn: "North Indian";
    readonly keywords: readonly ["north indian", "dal makhani", "paneer", "maa ki dal"];
}, {
    readonly id: "south_indian";
    readonly label: "Dakshin Bharatiya";
    readonly labelEn: "South Indian";
    readonly keywords: readonly ["south indian", "dosa", "idli", "sambar", "rasam"];
}, {
    readonly id: "biryani_mughlai";
    readonly label: "Biryani / Mughlai";
    readonly labelEn: "Biryani / Mughlai";
    readonly keywords: readonly ["biryani", "mughlai", "kebab", "korma"];
}, {
    readonly id: "chinese";
    readonly label: "Chinese / Indo-Chinese";
    readonly labelEn: "Chinese";
    readonly keywords: readonly ["chinese", "noodles", "manchurian", "hakka"];
}, {
    readonly id: "continental";
    readonly label: "Continental / Western";
    readonly labelEn: "Continental";
    readonly keywords: readonly ["continental", "pasta", "pizza", "western", "european"];
}, {
    readonly id: "tandoor";
    readonly label: "Tandoor Expert";
    readonly labelEn: "Tandoor";
    readonly keywords: readonly ["tandoor", "tandoori", "roti", "naan", "paratha"];
}, {
    readonly id: "bakery";
    readonly label: "Bakery / Pastry";
    readonly labelEn: "Bakery";
    readonly keywords: readonly ["bakery", "pastry", "cake", "bread", "croissant"];
}, {
    readonly id: "mithai";
    readonly label: "Indian Sweets";
    readonly labelEn: "Indian Sweets";
    readonly keywords: readonly ["mithai", "sweets", "halwa", "barfi", "ladoo"];
}, {
    readonly id: "bulk_catering";
    readonly label: "Bulk / Catering";
    readonly labelEn: "Bulk Catering";
    readonly keywords: readonly ["bulk", "catering", "large scale", "mass cooking"];
}, {
    readonly id: "pizza_fast_food";
    readonly label: "Pizza / Fast Food";
    readonly labelEn: "Pizza / Fast Food";
    readonly keywords: readonly ["pizza", "fast food", "burger", "sandwich"];
}];
export declare const LANGUAGES: readonly [{
    readonly code: "hi";
    readonly label: "हिंदी";
    readonly labelEn: "Hindi";
    readonly flag: "🇮🇳";
}, {
    readonly code: "te";
    readonly label: "తెలుగు";
    readonly labelEn: "Telugu";
    readonly flag: "🏳️";
}, {
    readonly code: "ta";
    readonly label: "தமிழ்";
    readonly labelEn: "Tamil";
    readonly flag: "🏳️";
}, {
    readonly code: "kn";
    readonly label: "ಕನ್ನಡ";
    readonly labelEn: "Kannada";
    readonly flag: "🏳️";
}, {
    readonly code: "mr";
    readonly label: "मराठी";
    readonly labelEn: "Marathi";
    readonly flag: "🏳️";
}, {
    readonly code: "bn";
    readonly label: "বাংলা";
    readonly labelEn: "Bengali";
    readonly flag: "🏳️";
}, {
    readonly code: "pa";
    readonly label: "ਪੰਜਾਬੀ";
    readonly labelEn: "Punjabi";
    readonly flag: "🏳️";
}, {
    readonly code: "en";
    readonly label: "English";
    readonly labelEn: "English";
    readonly flag: "🇬🇧";
}];
export declare const HIRING_LANES: {
    readonly L1: {
        readonly id: 1;
        readonly label: "Flash";
        readonly labelHi: "Flash";
        readonly color: "#EF4444";
        readonly window: "0-6 hours";
        readonly icon: "⚡";
    };
    readonly L2: {
        readonly id: 2;
        readonly label: "Same-Day";
        readonly labelHi: "Same-Day";
        readonly color: "#F59E0B";
        readonly window: "6-24 hours";
        readonly icon: "🌅";
    };
    readonly L3: {
        readonly id: 3;
        readonly label: "Contract";
        readonly labelHi: "Contract";
        readonly color: "#3B82F6";
        readonly window: "24-72 hours";
        readonly icon: "📋";
    };
    readonly L4: {
        readonly id: 4;
        readonly label: "Permanent";
        readonly labelHi: "Permanent";
        readonly color: "#8B5CF6";
        readonly window: "3-7 days";
        readonly icon: "🏢";
    };
};
export declare const EMPLOYER_PLANS: {
    readonly FLASH_FREE: {
        readonly name: "Flash Free";
        readonly price: 0;
        readonly post_limit: 3;
        readonly features: readonly ["L1 Flash", "3 posts/month", "Skill video view"];
    };
    readonly STARTER: {
        readonly name: "Starter";
        readonly price: 2999;
        readonly post_limit: 10;
        readonly features: readonly ["All 4 lanes", "10 posts/month", "Interview scheduler", "Pay benchmarking"];
    };
    readonly GROWTH: {
        readonly name: "Growth";
        readonly price: 7999;
        readonly post_limit: 30;
        readonly features: readonly ["30 posts/month", "100 DB unlocks", "Analytics", "Cream Pool", "Retain Basic"];
    };
    readonly PRO: {
        readonly name: "Pro";
        readonly price: 18999;
        readonly post_limit: -1;
        readonly features: readonly ["Unlimited posts", "500 DB unlocks", "Auto-Recruiter", "SLA 60%", "Account Manager"];
    };
};
export declare const SHIFT_PRESETS: readonly [{
    readonly id: "morning";
    readonly label: "Subah";
    readonly labelEn: "Morning";
    readonly from: "06:00";
    readonly to: "14:00";
    readonly icon: "🌅";
}, {
    readonly id: "evening";
    readonly label: "Shaam";
    readonly labelEn: "Evening";
    readonly from: "14:00";
    readonly to: "22:00";
    readonly icon: "🌇";
}, {
    readonly id: "night";
    readonly label: "Raat";
    readonly labelEn: "Night";
    readonly from: "22:00";
    readonly to: "06:00";
    readonly icon: "🌙";
}, {
    readonly id: "any";
    readonly label: "Koi bhi";
    readonly labelEn: "Any Time";
    readonly from: "06:00";
    readonly to: "23:59";
    readonly icon: "🔄";
}];
export declare const PROPERTY_TYPES: readonly [{
    readonly id: "restaurant_standalone";
    readonly label: "🍽️ Restaurant (Standalone)";
}, {
    readonly id: "restaurant_chain";
    readonly label: "🔗 Restaurant (Chain outlet)";
}, {
    readonly id: "hotel_budget";
    readonly label: "🏨 Hotel (Budget — 1-2 star)";
}, {
    readonly id: "hotel_midscale";
    readonly label: "🏨 Hotel (Mid-scale — 3 star)";
}, {
    readonly id: "hotel_luxury";
    readonly label: "💎 Hotel (Luxury / 4-5 star)";
}, {
    readonly id: "cloud_kitchen";
    readonly label: "☁️ Cloud Kitchen / Dark Kitchen";
}, {
    readonly id: "cafe";
    readonly label: "☕ Café / Coffee Shop";
}, {
    readonly id: "bar";
    readonly label: "🍸 Bar / Pub / Lounge";
}, {
    readonly id: "banquet";
    readonly label: "🎪 Banquet Hall / Convention Centre";
}, {
    readonly id: "catering";
    readonly label: "🍱 Catering Company";
}, {
    readonly id: "resort";
    readonly label: "🏖️ Resort / Club";
}, {
    readonly id: "guesthouse";
    readonly label: "🏠 Guesthouse / Service Apartment";
}, {
    readonly id: "hospital_canteen";
    readonly label: "🏥 Hospital / Clinic Canteen";
}, {
    readonly id: "corporate_cafeteria";
    readonly label: "🏢 Corporate Cafeteria";
}, {
    readonly id: "airline_catering";
    readonly label: "✈️ Airline / Railway Catering";
}, {
    readonly id: "school_canteen";
    readonly label: "🏫 School / College Canteen";
}, {
    readonly id: "other";
    readonly label: "Other";
}];
export declare const INDIAN_CITIES: readonly ["Hyderabad", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Kochi", "Coimbatore", "Visakhapatnam", "Nagpur", "Indore", "Bhopal", "Surat"];
export declare const EXPERIENCE_LABELS: Record<number, string>;
export declare const DAYS_OF_WEEK: readonly ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export declare const TRUST_SCORE_FORMULA: {
    readonly SHOW_UP_RATE_WEIGHT: 0.4;
    readonly EMPLOYER_RATING_WEIGHT: 0.3;
    readonly PROFILE_DEPTH_WEIGHT: 0.2;
    readonly CONDUCT_WEIGHT: 0.1;
    readonly MIN_L1_THRESHOLD: 3;
};
export declare const AI_SCORE_FORMULA: {
    readonly TECHNIQUE_WEIGHT: 0.4;
    readonly SPEED_WEIGHT: 0.25;
    readonly HYGIENE_WEIGHT: 0.2;
    readonly WARMTH_WEIGHT: 0.15;
    readonly HUMAN_REVIEW_THRESHOLD: 40;
};
//# sourceMappingURL=constants.d.ts.map