"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTrustScore = computeTrustScore;
exports.computeAIScore = computeAIScore;
exports.computeDignityScore = computeDignityScore;
exports.computeProfileDepthScore = computeProfileDepthScore;
exports.mockAIScore = mockAIScore;
const constants_1 = require("./constants");
function computeTrustScore(params) {
    const { show_up_rate, employer_rating_avg, profile_depth_score, conduct_score } = params;
    const raw = (show_up_rate * constants_1.TRUST_SCORE_FORMULA.SHOW_UP_RATE_WEIGHT) +
        (employer_rating_avg * constants_1.TRUST_SCORE_FORMULA.EMPLOYER_RATING_WEIGHT) +
        (profile_depth_score * constants_1.TRUST_SCORE_FORMULA.PROFILE_DEPTH_WEIGHT) +
        (conduct_score * constants_1.TRUST_SCORE_FORMULA.CONDUCT_WEIGHT);
    return Math.min(Math.max(parseFloat(raw.toFixed(1)), 0), 5);
}
function computeAIScore(params) {
    const { technique, speed, hygiene, warmth } = params;
    const raw = technique * 0.40 +
        speed * 0.25 +
        hygiene * 0.20 +
        warmth * 0.15;
    return parseFloat(raw.toFixed(1));
}
function computeDignityScore(params) {
    const { avg_overall_score, confirmation_rate, whisper_flag_count } = params;
    const confirm_modifier = Math.min(1.0, confirmation_rate / 0.70);
    const whisper_modifier = Math.max(0.5, 1 - (whisper_flag_count * 0.1));
    const raw = avg_overall_score * confirm_modifier * whisper_modifier;
    return Math.min(Math.max(parseFloat(raw.toFixed(1)), 0), 5);
}
function computeProfileDepthScore(worker) {
    const fields = [
        !!worker.profile_photo_url,
        !!worker.skill_video_url,
        (worker.cuisine_specialities?.length ?? 0) > 0,
        !!worker.fssai_certified,
        !!worker.highest_qualification,
        !!worker.english_level,
        !!worker.transport_mode,
    ];
    const filled = fields.filter(Boolean).length;
    return parseFloat((filled / fields.length).toFixed(2));
}
function mockAIScore() {
    const rand = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));
    const technique = rand(2.8, 4.8);
    const speed = rand(2.8, 4.8);
    const hygiene = rand(3.0, 5.0);
    const warmth = rand(2.8, 4.8);
    const overall = computeAIScore({ technique, speed, hygiene, warmth });
    const feedbackOptions = [
        'Aapka kaam achha dikhta hai. Speed aur hygiene strong hain.',
        'Technique solid hai. Warmth aur customer interaction improve kar sakte ho.',
        'Hygiene bahut achha. Knife skills aur speed thodi aur badhao.',
        'Overall strong performance. Keep it up!',
        'Achha presentation. Timing aur speed pe focus karo.',
    ];
    return {
        technique,
        speed,
        hygiene,
        warmth,
        overall,
        feedback: feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)],
    };
}
//# sourceMappingURL=trust-score.js.map