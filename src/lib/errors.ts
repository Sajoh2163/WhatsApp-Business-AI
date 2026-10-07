export type ErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION" | "EXTERNAL";
export class AppError extends Error {
  code: ErrorCode; status: number;
  constructor(code: ErrorCode, message: string, status = 400) { super(message); this.code = code; this.status = status; }
}
export const toResponse = (e: unknown) => e instanceof AppError
  ? Response.json({ error: { code: e.code, message: e.message } }, { status: e.status })
  : Response.json({ error: { code: "INTERNAL", message: "Something went wrong." } }, { status: 500 });
