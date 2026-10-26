import { z } from "zod";

export const I18n = z.record(z.string().min(2).max(8), z.string());
const Key = z.string().regex(/^[a-z][a-z0-9_]{1,62}$/, "lower_snake_case, 2–63 chars");

export const Level = z.object({
  value: z.number().int(),
  label: I18n,
  description: I18n.nullable().optional(),
});
export const Scale = z.object({ key: Key, title: I18n.optional(), levels: z.array(Level).min(2) });

const Condition = z.object({
  item: Key,
  op: z.enum(["eq", "neq", "gte", "lte"]),
  value: z.union([z.number(), z.boolean(), z.string()]),
});

export const Item = z.object({
  key: Key,
  type: z.enum(["scale", "single_choice", "yes_no", "number", "text", "photo", "gps"]),
  scale: Key.optional(),
  group: Key.optional(),
  title: I18n,
  guidance: I18n.nullable().optional(),
  prompt: I18n.nullable().optional(),
  required: z.boolean().default(false),
  weight: z.number().positive().default(1),
  include_in_total: z.boolean().default(true),
  visible_if: Condition.nullable().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  unit: z.string().optional(),
  multiline: z.boolean().optional(),
});

export const Section = z.object({
  key: Key,
  title: I18n,
  description: I18n.nullable().optional(),
  groups: z.array(z.object({ key: Key, title: I18n })).default([]),
  items: z.array(Item).min(1),
});

export const FormDefinition = z.object({
  schema_version: z.literal(1),
  form_key: Key,
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  default_language: z.string(),
  languages: z.array(z.string()).min(1),
  title: I18n,
  scoring: z.object({
    method: z.literal("sum"),
    exclude_not_assessed: z.boolean().default(true),
    show_percentage: z.boolean().default(true),
  }),
  scales: z.array(Scale),
  sections: z.array(Section).min(1),
});
export type FormDefinition = z.infer<typeof FormDefinition>;
