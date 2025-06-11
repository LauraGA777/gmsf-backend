import { type Request, type Response, type NextFunction } from "express";
import { type AnyZodObject } from "zod";
import { ApiError } from "../errors/apiError";

export const validate = (schema: AnyZodObject, source: "body" | "query" | "params") =>
    (req: Request, res: Response, next: NextFunction) => {
        console.log(`Middleware: Validando [${source}]...`);
        try {
            const dataToValidate = req[source];
            console.log(`Middleware: Datos a validar:`, dataToValidate);
            schema.parse(dataToValidate);
            console.log(`Middleware: Validación exitosa.`);
            next();
        } catch (error: any) {
            console.error("Middleware: Error de validación Zod:", error);
            const messages = error.errors.map((err: any) => err.message);
            const apiError = new ApiError(`Validation error: ${messages.join(", ")}`, 400);
            next(apiError);
        }
    }; 