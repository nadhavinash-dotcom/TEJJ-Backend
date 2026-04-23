interface DispatchResult {
    success: boolean;
    match_id?: string;
    already_matched?: boolean;
    message?: string;
}
export declare function dispatchAccept(jobId: string, workerId: string): Promise<DispatchResult>;
export declare function broadcastFlashJob(jobId: string): Promise<void>;
export declare function computeSUPS(workerId: string, jobId: string): Promise<number>;
export {};
//# sourceMappingURL=dispatchService.d.ts.map