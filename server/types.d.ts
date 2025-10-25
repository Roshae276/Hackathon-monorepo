declare module 'drizzle-orm/neon-serverless' {
  export function drizzle<TSchema extends Record<string, unknown>>(
    config: any
  ): any;
}