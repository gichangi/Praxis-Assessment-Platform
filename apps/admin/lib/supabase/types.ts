import type { Database } from "@assessment/api-types";

// The generated Database["public"]["Functions"] contains Args that reference
// Database["public"]["Tables"][...]["Row"] creating a circular type that prevents
// TypeScript from evaluating Database["public"] extends GenericSchema. This shim
// strips Functions to a safe form so the Supabase client infers table types correctly.
export type PublicSchema = {
  Tables: Database["public"]["Tables"];
  Views: Database["public"]["Views"];
  Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>;
  Enums: Database["public"]["Enums"];
  CompositeTypes: Database["public"]["CompositeTypes"];
};
