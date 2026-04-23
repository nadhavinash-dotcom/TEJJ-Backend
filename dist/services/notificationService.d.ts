interface FlashJobPayload {
    job_id: string;
    job_title: string;
    pay_rate: number;
    skill: string;
}
export declare const notificationService: {
    sendFlashJobNotification(fcmToken: string, workerId: string, payload: FlashJobPayload): Promise<void>;
    notifyMatchConfirmed(matchId: string, employerId: string): Promise<void>;
    sendArrivalReminder(workerId: string, propertyName: string, matchId: string): Promise<void>;
    createInAppNotification(params: {
        user_id: string;
        type: string;
        title: string;
        body: string;
        data?: Record<string, unknown>;
        deep_link?: string;
    }): Promise<void>;
};
export {};
//# sourceMappingURL=notificationService.d.ts.map