import { Document } from 'mongoose';
export interface IWhisperPost extends Document {
    worker_id_hash: string;
    employer_locality: string;
    employer_type: string;
    category: string;
    content: string;
    original_language?: string;
    transcribed_english?: string;
    status: string;
    helpful_count: number;
    created_at: Date;
}
export declare const WhisperPost: import("mongoose").Model<IWhisperPost, {}, {}, {}, Document<unknown, {}, IWhisperPost, {}, {}> & IWhisperPost & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=WhisperPost.d.ts.map