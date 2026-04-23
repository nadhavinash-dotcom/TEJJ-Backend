import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        uid: string;
        userId: string;
        phone: string;
    };
}
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function adminAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.d.ts.map