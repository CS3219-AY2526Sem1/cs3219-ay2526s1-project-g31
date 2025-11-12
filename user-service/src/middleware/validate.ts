import { NextFunction, Request, Response } from 'express';
import { ZodError, z } from 'zod';
import { $ZodIssue } from 'zod/v4/core';

/**
 * AI Assistance Disclosure
 * Tool: ChatGPT
 * Scope: Debugged schema logic.
 * Author review: Validated correctness.
 */

export type ValidationTargets = {
    body?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
};

export const validate = (schemas: ValidationTargets) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) {
                const parsed = schemas.body.parse(req.body);
                // attach parsed to request for downstream usage
                (req as any).validatedBody = parsed;
            }
            if (schemas.query) {
                const parsed = schemas.query.parse(req.query);
                (req as any).validatedQuery = parsed;
            }
            if (schemas.params) {
                const parsed = schemas.params.parse(req.params);
                (req as any).validatedParams = parsed;
            }
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: err.issues.map((i: $ZodIssue) => ({ path: i.path.join('.'), message: i.message }))
                });
            }
            next(err as any);
        }
    };
