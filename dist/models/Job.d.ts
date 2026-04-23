import { Schema, Document } from 'mongoose';
export interface IJob extends Document {
    employer_id: Schema.Types.ObjectId;
    lane: number;
    is_demo_post: boolean;
    job_title: string;
    job_description?: string;
    primary_skill: string;
    secondary_skills_preferred: string[];
    cuisine_preferred: string[];
    pay_rate?: number;
    pay_type: string;
    pay_min?: number;
    pay_max?: number;
    shift_start_time?: Date;
    shift_end_time?: Date;
    shift_duration_hours?: number;
    number_of_openings: number;
    openings_filled: number;
    geofence_radius_m: number;
    location?: {
        type: string;
        coordinates: [number, number];
    };
    uniform_required?: string;
    experience_years_min?: number;
    minimum_qualification?: string;
    killer_questions: unknown[];
    special_instructions?: string;
    accommodation_provided: boolean;
    meals_provided: boolean;
    transport_provided: boolean;
    contract_start_date?: Date;
    contract_duration?: string;
    notice_period_max_days?: number;
    interview_required: boolean;
    interview_format?: string;
    cream_pool_first: boolean;
    status: string;
    expires_at?: Date;
    template_id?: Schema.Types.ObjectId;
    boost_active: boolean;
    boost_count: number;
    pay_vs_market?: number;
    demo_evaluation_criteria: string[];
    demo_hiring_standard?: string;
    demo_fulltime_salary?: number;
    demo_conversion_count: number;
    keywords_extracted: string[];
    created_at: Date;
    updated_at: Date;
}
export declare const Job: import("mongoose").Model<IJob, {}, {}, {}, Document<unknown, {}, IJob, {}, {}> & IJob & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Job.d.ts.map