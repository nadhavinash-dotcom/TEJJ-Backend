export declare function computeTrustScore(params: {
    show_up_rate: number;
    employer_rating_avg: number;
    profile_depth_score: number;
    conduct_score: number;
}): number;
export declare function computeAIScore(params: {
    technique: number;
    speed: number;
    hygiene: number;
    warmth: number;
}): number;
export declare function computeDignityScore(params: {
    avg_overall_score: number;
    confirmation_rate: number;
    whisper_flag_count: number;
}): number;
export declare function computeProfileDepthScore(worker: {
    profile_photo_url?: string;
    skill_video_url?: string;
    cuisine_specialities?: string[];
    fssai_certified?: boolean;
    driving_license_number?: string;
    highest_qualification?: string;
    english_level?: string;
    transport_mode?: string;
}): number;
export declare function mockAIScore(): {
    technique: number;
    speed: number;
    hygiene: number;
    warmth: number;
    overall: number;
    feedback: string;
};
//# sourceMappingURL=trust-score.d.ts.map