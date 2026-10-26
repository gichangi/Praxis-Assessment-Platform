
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "app_config": {
                  Row: {
                    "key": string,"organisation_id": string,"value": NonNullable<Json>
                  }
                  Insert: {
                    "key": string,"organisation_id": string,"value": NonNullable<Json>
                  }
                  Update: {
                    "key"?: string,"organisation_id"?: string,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "app_config_organisation_id_fkey"
      columns: ["organisation_id"]
isOneToOne: false
      referencedRelation: "organisations"
      referencedColumns: ["id"]
    }
                  ]
                },"assessments": {
                  Row: {
                    "assessed_on": string,"assessors": (string)[],"created_at": string,"created_by": string,"deleted_at": string | null,"device_id": string | null,"district_id": string,"form_version_id": string,"id": string,"language": string,"organisation_id": string,"review_note": string | null,"status": Database["public"]['Enums']["assessment_status"],"submitted_at": string | null,"totals": Json | null,"updated_at": string,"can_edit_assessment": boolean | null,"can_read_assessment": boolean | null
                  }
                  Insert: {
                    "assessed_on"?: string,"assessors"?: (string)[],"created_at"?: string,"created_by": string,"deleted_at"?: string | null,"device_id"?: string | null,"district_id": string,"form_version_id": string,"id": string,"language"?: string,"organisation_id": string,"review_note"?: string | null,"status"?: Database["public"]['Enums']["assessment_status"],"submitted_at"?: string | null,"totals"?: Json | null,"updated_at"?: string
                  }
                  Update: {
                    "assessed_on"?: string,"assessors"?: (string)[],"created_at"?: string,"created_by"?: string,"deleted_at"?: string | null,"device_id"?: string | null,"district_id"?: string,"form_version_id"?: string,"id"?: string,"language"?: string,"organisation_id"?: string,"review_note"?: string | null,"status"?: Database["public"]['Enums']["assessment_status"],"submitted_at"?: string | null,"totals"?: Json | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "assessments_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "assessments_district_id_fkey"
      columns: ["district_id"]
isOneToOne: false
      referencedRelation: "districts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "assessments_form_version_id_fkey"
      columns: ["form_version_id"]
isOneToOne: false
      referencedRelation: "form_versions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "assessments_organisation_id_fkey"
      columns: ["organisation_id"]
isOneToOne: false
      referencedRelation: "organisations"
      referencedColumns: ["id"]
    }
                  ]
                },"attachments": {
                  Row: {
                    "assessment_id": string,"created_at": string,"created_by": string | null,"id": string,"item_key": string | null,"kind": string,"mime_type": string | null,"size_bytes": number | null,"storage_path": string
                  }
                  Insert: {
                    "assessment_id": string,"created_at"?: string,"created_by"?: string | null,"id": string,"item_key"?: string | null,"kind": string,"mime_type"?: string | null,"size_bytes"?: number | null,"storage_path": string
                  }
                  Update: {
                    "assessment_id"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"item_key"?: string | null,"kind"?: string,"mime_type"?: string | null,"size_bytes"?: number | null,"storage_path"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "attachments_assessment_id_fkey"
      columns: ["assessment_id"]
isOneToOne: false
      referencedRelation: "assessments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attachments_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"audit_log": {
                  Row: {
                    "action": string,"actor": string | null,"at": string,"diff": Json | null,"entity": string,"entity_id": string,"id": number
                  }
                  Insert: {
                    "action": string,"actor"?: string | null,"at"?: string,"diff"?: Json | null,"entity": string,"entity_id": string,"id"?: never
                  }
                  Update: {
                    "action"?: string,"actor"?: string | null,"at"?: string,"diff"?: Json | null,"entity"?: string,"entity_id"?: string,"id"?: never
                  }
                  Relationships: [
                    
                  ]
                },"devices": {
                  Row: {
                    "app_version": string | null,"created_at": string,"form_version_ids": (string)[],"id": string,"last_error": string | null,"last_sync_at": string | null,"pending_changes": number,"platform": string | null,"revoked": boolean,"user_id": string
                  }
                  Insert: {
                    "app_version"?: string | null,"created_at"?: string,"form_version_ids"?: (string)[],"id": string,"last_error"?: string | null,"last_sync_at"?: string | null,"pending_changes"?: number,"platform"?: string | null,"revoked"?: boolean,"user_id": string
                  }
                  Update: {
                    "app_version"?: string | null,"created_at"?: string,"form_version_ids"?: (string)[],"id"?: string,"last_error"?: string | null,"last_sync_at"?: string | null,"pending_changes"?: number,"platform"?: string | null,"revoked"?: boolean,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "devices_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"districts": {
                  Row: {
                    "active": boolean,"code": string,"id": string,"name": NonNullable<Json>,"state_id": string
                  }
                  Insert: {
                    "active"?: boolean,"code": string,"id"?: string,"name": NonNullable<Json>,"state_id": string
                  }
                  Update: {
                    "active"?: boolean,"code"?: string,"id"?: string,"name"?: NonNullable<Json>,"state_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "districts_state_id_fkey"
      columns: ["state_id"]
isOneToOne: false
      referencedRelation: "states"
      referencedColumns: ["id"]
    }
                  ]
                },"form_versions": {
                  Row: {
                    "change_note": string | null,"checksum": string | null,"created_at": string,"created_by": string | null,"definition": NonNullable<Json>,"form_id": string,"id": string,"published_at": string | null,"published_by": string | null,"status": Database["public"]['Enums']["version_status"],"updated_at": string,"version": string
                  }
                  Insert: {
                    "change_note"?: string | null,"checksum"?: string | null,"created_at"?: string,"created_by"?: string | null,"definition": NonNullable<Json>,"form_id": string,"id"?: string,"published_at"?: string | null,"published_by"?: string | null,"status"?: Database["public"]['Enums']["version_status"],"updated_at"?: string,"version": string
                  }
                  Update: {
                    "change_note"?: string | null,"checksum"?: string | null,"created_at"?: string,"created_by"?: string | null,"definition"?: NonNullable<Json>,"form_id"?: string,"id"?: string,"published_at"?: string | null,"published_by"?: string | null,"status"?: Database["public"]['Enums']["version_status"],"updated_at"?: string,"version"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "form_versions_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "form_versions_form_id_fkey"
      columns: ["form_id"]
isOneToOne: false
      referencedRelation: "forms"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "form_versions_published_by_fkey"
      columns: ["published_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"forms": {
                  Row: {
                    "created_at": string,"id": string,"key": string,"organisation_id": string,"title": NonNullable<Json>
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"key": string,"organisation_id": string,"title": NonNullable<Json>
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"key"?: string,"organisation_id"?: string,"title"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "forms_organisation_id_fkey"
      columns: ["organisation_id"]
isOneToOne: false
      referencedRelation: "organisations"
      referencedColumns: ["id"]
    }
                  ]
                },"help_articles": {
                  Row: {
                    "body": NonNullable<Json>,"id": string,"organisation_id": string,"published": boolean,"slug": string,"sort": number,"title": NonNullable<Json>,"updated_at": string
                  }
                  Insert: {
                    "body": NonNullable<Json>,"id"?: string,"organisation_id": string,"published"?: boolean,"slug": string,"sort"?: number,"title": NonNullable<Json>,"updated_at"?: string
                  }
                  Update: {
                    "body"?: NonNullable<Json>,"id"?: string,"organisation_id"?: string,"published"?: boolean,"slug"?: string,"sort"?: number,"title"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "help_articles_organisation_id_fkey"
      columns: ["organisation_id"]
isOneToOne: false
      referencedRelation: "organisations"
      referencedColumns: ["id"]
    }
                  ]
                },"memberships": {
                  Row: {
                    "created_at": string,"id": string,"organisation_id": string,"role": Database["public"]['Enums']["app_role"],"state_id": string | null,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"organisation_id": string,"role": Database["public"]['Enums']["app_role"],"state_id"?: string | null,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"organisation_id"?: string,"role"?: Database["public"]['Enums']["app_role"],"state_id"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "memberships_organisation_id_fkey"
      columns: ["organisation_id"]
isOneToOne: false
      referencedRelation: "organisations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "memberships_state_id_fkey"
      columns: ["state_id"]
isOneToOne: false
      referencedRelation: "states"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "memberships_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"organisations": {
                  Row: {
                    "created_at": string,"id": string,"name": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"full_name": string,"id": string,"preferred_language": string
                  }
                  Insert: {
                    "created_at"?: string,"full_name"?: string,"id": string,"preferred_language"?: string
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string,"id"?: string,"preferred_language"?: string
                  }
                  Relationships: [
                    
                  ]
                },"responses": {
                  Row: {
                    "assessment_id": string,"item_key": string,"not_assessed": boolean,"note": string | null,"note_language": string | null,"updated_at": string,"updated_by": string | null,"value": number | null
                  }
                  Insert: {
                    "assessment_id": string,"item_key": string,"not_assessed"?: boolean,"note"?: string | null,"note_language"?: string | null,"updated_at"?: string,"updated_by"?: string | null,"value"?: number | null
                  }
                  Update: {
                    "assessment_id"?: string,"item_key"?: string,"not_assessed"?: boolean,"note"?: string | null,"note_language"?: string | null,"updated_at"?: string,"updated_by"?: string | null,"value"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "responses_assessment_id_fkey"
      columns: ["assessment_id"]
isOneToOne: false
      referencedRelation: "assessments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "responses_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"states": {
                  Row: {
                    "code": string,"id": string,"name": NonNullable<Json>,"organisation_id": string
                  }
                  Insert: {
                    "code": string,"id"?: string,"name": NonNullable<Json>,"organisation_id": string
                  }
                  Update: {
                    "code"?: string,"id"?: string,"name"?: NonNullable<Json>,"organisation_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "states_organisation_id_fkey"
      columns: ["organisation_id"]
isOneToOne: false
      referencedRelation: "organisations"
      referencedColumns: ["id"]
    }
                  ]
                },"support_messages": {
                  Row: {
                    "author_id": string,"body": string,"created_at": string,"id": string,"ticket_id": string
                  }
                  Insert: {
                    "author_id": string,"body": string,"created_at"?: string,"id"?: string,"ticket_id": string
                  }
                  Update: {
                    "author_id"?: string,"body"?: string,"created_at"?: string,"id"?: string,"ticket_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "support_messages_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "support_messages_ticket_id_fkey"
      columns: ["ticket_id"]
isOneToOne: false
      referencedRelation: "support_tickets"
      referencedColumns: ["id"]
    }
                  ]
                },"support_tickets": {
                  Row: {
                    "assessment_id": string | null,"assigned_to": string | null,"created_at": string,"diagnostics": Json | null,"id": string,"organisation_id": string,"status": Database["public"]['Enums']["ticket_status"],"subject": string,"updated_at": string,"user_id": string
                  }
                  Insert: {
                    "assessment_id"?: string | null,"assigned_to"?: string | null,"created_at"?: string,"diagnostics"?: Json | null,"id"?: string,"organisation_id": string,"status"?: Database["public"]['Enums']["ticket_status"],"subject": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "assessment_id"?: string | null,"assigned_to"?: string | null,"created_at"?: string,"diagnostics"?: Json | null,"id"?: string,"organisation_id"?: string,"status"?: Database["public"]['Enums']["ticket_status"],"subject"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "support_tickets_assessment_id_fkey"
      columns: ["assessment_id"]
isOneToOne: false
      referencedRelation: "assessments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "support_tickets_assigned_to_fkey"
      columns: ["assigned_to"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "support_tickets_organisation_id_fkey"
      columns: ["organisation_id"]
isOneToOne: false
      referencedRelation: "organisations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "support_tickets_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"sync_events": {
                  Row: {
                    "at": string,"device_id": string | null,"error": string | null,"id": number,"pulled": number,"pushed": number
                  }
                  Insert: {
                    "at"?: string,"device_id"?: string | null,"error"?: string | null,"id"?: never,"pulled"?: number,"pushed"?: number
                  }
                  Update: {
                    "at"?: string,"device_id"?: string | null,"error"?: string | null,"id"?: never,"pulled"?: number,"pushed"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "sync_events_device_id_fkey"
      columns: ["device_id"]
isOneToOne: false
      referencedRelation: "devices"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "can_edit_assessment":
{ Args: { "a": Database["public"]['Tables']["assessments"]['Row'] }; Returns: boolean
                           },
"can_read_assessment":
{ Args: { "a": Database["public"]['Tables']["assessments"]['Row'] }; Returns: boolean
                           },
"compute_totals":
{ Args: { "p_assessment_id": string }; Returns: Json
                           },
"create_draft_from":
{ Args: { "p_new_version": string,"p_version_id": string }; Returns: {
              "change_note": string | null,
"checksum": string | null,
"created_at": string,
"created_by": string | null,
"definition": NonNullable<Json>,
"form_id": string,
"id": string,
"published_at": string | null,
"published_by": string | null,
"status": Database["public"]['Enums']["version_status"],
"updated_at": string,
"version": string
            }
                          SetofOptions: {
        from: "*"
        to: "form_versions"
        isOneToOne: true
        isSetofReturn: false
      } },
"has_district_role":
{ Args: { "dist": string,"roles": (Database["public"]['Enums']["app_role"])[] }; Returns: boolean
                           },
"has_role":
{ Args: { "org": string,"roles": (Database["public"]['Enums']["app_role"])[] }; Returns: boolean
                           },
"is_member":
{ Args: { "org": string }; Returns: boolean
                           },
"publish_form_version":
{ Args: { "p_checksum": string,"p_note": string,"p_version_id": string }; Returns: {
              "change_note": string | null,
"checksum": string | null,
"created_at": string,
"created_by": string | null,
"definition": NonNullable<Json>,
"form_id": string,
"id": string,
"published_at": string | null,
"published_by": string | null,
"status": Database["public"]['Enums']["version_status"],
"updated_at": string,
"version": string
            }
                          SetofOptions: {
        from: "*"
        to: "form_versions"
        isOneToOne: true
        isSetofReturn: false
      } },
"review_assessment":
{ Args: { "p_decision": string,"p_id": string,"p_note"?: string }; Returns: {
              "assessed_on": string,
"assessors": (string)[],
"created_at": string,
"created_by": string,
"deleted_at": string | null,
"device_id": string | null,
"district_id": string,
"form_version_id": string,
"id": string,
"language": string,
"organisation_id": string,
"review_note": string | null,
"status": Database["public"]['Enums']["assessment_status"],
"submitted_at": string | null,
"totals": Json | null,
"updated_at": string
            }
                          SetofOptions: {
        from: "*"
        to: "assessments"
        isOneToOne: true
        isSetofReturn: false
      } },
"save_translations":
{ Args: { "p_entries": Json,"p_lang": string,"p_version_id": string }; Returns: number
                           },
"submit_assessment":
{ Args: { "p_id": string }; Returns: {
              "assessed_on": string,
"assessors": (string)[],
"created_at": string,
"created_by": string,
"deleted_at": string | null,
"device_id": string | null,
"district_id": string,
"form_version_id": string,
"id": string,
"language": string,
"organisation_id": string,
"review_note": string | null,
"status": Database["public"]['Enums']["assessment_status"],
"submitted_at": string | null,
"totals": Json | null,
"updated_at": string
            }
                          SetofOptions: {
        from: "*"
        to: "assessments"
        isOneToOne: true
        isSetofReturn: false
      } }
          }
          Enums: {
            "app_role": "super_admin"|"form_editor"|"translator"|"manager"|"assessor"|"viewer","assessment_status": "draft"|"submitted"|"returned"|"approved","ticket_status": "open"|"pending"|"closed","version_status": "draft"|"published"|"archived"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"storage": {
          Tables: {
            "buckets": {
                  Row: {
                    "allowed_mime_types": (string)[] | null,"avif_autodetection": boolean | null,"created_at": string | null,"file_size_limit": number | null,"id": string,"lifecycle_configuration": Json | null,"lifecycle_configuration_generation": string | null,"name": string,"owner": string | null,"owner_id": string | null,"public": boolean | null,"type": Database["storage"]['Enums']["buckettype"],"updated_at": string | null,"versioning_status": string
                  }
                  Insert: {
                    "allowed_mime_types"?: (string)[] | null,"avif_autodetection"?: boolean | null,"created_at"?: string | null,"file_size_limit"?: number | null,"id": string,"lifecycle_configuration"?: Json | null,"lifecycle_configuration_generation"?: string | null,"name": string,"owner"?: string | null,"owner_id"?: string | null,"public"?: boolean | null,"type"?: Database["storage"]['Enums']["buckettype"],"updated_at"?: string | null,"versioning_status"?: string
                  }
                  Update: {
                    "allowed_mime_types"?: (string)[] | null,"avif_autodetection"?: boolean | null,"created_at"?: string | null,"file_size_limit"?: number | null,"id"?: string,"lifecycle_configuration"?: Json | null,"lifecycle_configuration_generation"?: string | null,"name"?: string,"owner"?: string | null,"owner_id"?: string | null,"public"?: boolean | null,"type"?: Database["storage"]['Enums']["buckettype"],"updated_at"?: string | null,"versioning_status"?: string
                  }
                  Relationships: [
                    
                  ]
                },"buckets_analytics": {
                  Row: {
                    "created_at": string,"deleted_at": string | null,"format": string,"id": string,"name": string,"type": Database["storage"]['Enums']["buckettype"],"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"deleted_at"?: string | null,"format"?: string,"id"?: string,"name": string,"type"?: Database["storage"]['Enums']["buckettype"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"deleted_at"?: string | null,"format"?: string,"id"?: string,"name"?: string,"type"?: Database["storage"]['Enums']["buckettype"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"buckets_vectors": {
                  Row: {
                    "created_at": string,"id": string,"type": Database["storage"]['Enums']["buckettype"],"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"id": string,"type"?: Database["storage"]['Enums']["buckettype"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"type"?: Database["storage"]['Enums']["buckettype"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"iceberg_namespaces": {
                  Row: {
                    "bucket_name": string,"catalog_id": string,"created_at": string,"id": string,"metadata": NonNullable<Json>,"name": string,"updated_at": string
                  }
                  Insert: {
                    "bucket_name": string,"catalog_id": string,"created_at"?: string,"id"?: string,"metadata"?: NonNullable<Json>,"name": string,"updated_at"?: string
                  }
                  Update: {
                    "bucket_name"?: string,"catalog_id"?: string,"created_at"?: string,"id"?: string,"metadata"?: NonNullable<Json>,"name"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "iceberg_namespaces_catalog_id_fkey"
      columns: ["catalog_id"]
isOneToOne: false
      referencedRelation: "buckets_analytics"
      referencedColumns: ["id"]
    }
                  ]
                },"iceberg_tables": {
                  Row: {
                    "bucket_name": string,"catalog_id": string,"created_at": string,"id": string,"location": string,"name": string,"namespace_id": string,"remote_table_id": string | null,"shard_id": string | null,"shard_key": string | null,"updated_at": string
                  }
                  Insert: {
                    "bucket_name": string,"catalog_id": string,"created_at"?: string,"id"?: string,"location": string,"name": string,"namespace_id": string,"remote_table_id"?: string | null,"shard_id"?: string | null,"shard_key"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "bucket_name"?: string,"catalog_id"?: string,"created_at"?: string,"id"?: string,"location"?: string,"name"?: string,"namespace_id"?: string,"remote_table_id"?: string | null,"shard_id"?: string | null,"shard_key"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "iceberg_tables_catalog_id_fkey"
      columns: ["catalog_id"]
isOneToOne: false
      referencedRelation: "buckets_analytics"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "iceberg_tables_namespace_id_fkey"
      columns: ["namespace_id"]
isOneToOne: false
      referencedRelation: "iceberg_namespaces"
      referencedColumns: ["id"]
    }
                  ]
                },"migrations": {
                  Row: {
                    "executed_at": string | null,"hash": string,"id": number,"name": string
                  }
                  Insert: {
                    "executed_at"?: string | null,"hash": string,"id": number,"name": string
                  }
                  Update: {
                    "executed_at"?: string | null,"hash"?: string,"id"?: number,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"objects": {
                  Row: {
                    "archived_at": string | null,"bucket_id": string | null,"created_at": string | null,"id": string,"is_delete_marker": boolean,"is_versioned": boolean,"last_accessed_at": string | null,"metadata": Json | null,"name": string | null,"owner": string | null,"owner_id": string | null,"path_tokens": (string)[] | null,"updated_at": string | null,"user_metadata": Json | null,"version": string | null
                  }
                  Insert: {
                    "archived_at"?: string | null,"bucket_id"?: string | null,"created_at"?: string | null,"id"?: string,"is_delete_marker"?: boolean,"is_versioned"?: boolean,"last_accessed_at"?: string | null,"metadata"?: Json | null,"name"?: string | null,"owner"?: string | null,"owner_id"?: string | null,"path_tokens"?: never,"updated_at"?: string | null,"user_metadata"?: Json | null,"version"?: string | null
                  }
                  Update: {
                    "archived_at"?: string | null,"bucket_id"?: string | null,"created_at"?: string | null,"id"?: string,"is_delete_marker"?: boolean,"is_versioned"?: boolean,"last_accessed_at"?: string | null,"metadata"?: Json | null,"name"?: string | null,"owner"?: string | null,"owner_id"?: string | null,"path_tokens"?: never,"updated_at"?: string | null,"user_metadata"?: Json | null,"version"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "objects_bucketId_fkey"
      columns: ["bucket_id"]
isOneToOne: false
      referencedRelation: "buckets"
      referencedColumns: ["id"]
    }
                  ]
                },"s3_multipart_uploads": {
                  Row: {
                    "bucket_id": string,"created_at": string,"id": string,"in_progress_size": number,"key": string,"metadata": Json | null,"owner_id": string | null,"upload_signature": string,"user_metadata": Json | null,"version": string
                  }
                  Insert: {
                    "bucket_id": string,"created_at"?: string,"id": string,"in_progress_size"?: number,"key": string,"metadata"?: Json | null,"owner_id"?: string | null,"upload_signature": string,"user_metadata"?: Json | null,"version": string
                  }
                  Update: {
                    "bucket_id"?: string,"created_at"?: string,"id"?: string,"in_progress_size"?: number,"key"?: string,"metadata"?: Json | null,"owner_id"?: string | null,"upload_signature"?: string,"user_metadata"?: Json | null,"version"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
      columns: ["bucket_id"]
isOneToOne: false
      referencedRelation: "buckets"
      referencedColumns: ["id"]
    }
                  ]
                },"s3_multipart_uploads_parts": {
                  Row: {
                    "bucket_id": string,"created_at": string,"etag": string,"id": string,"key": string,"owner_id": string | null,"part_number": number,"size": number,"upload_id": string,"version": string
                  }
                  Insert: {
                    "bucket_id": string,"created_at"?: string,"etag": string,"id"?: string,"key": string,"owner_id"?: string | null,"part_number": number,"size"?: number,"upload_id": string,"version": string
                  }
                  Update: {
                    "bucket_id"?: string,"created_at"?: string,"etag"?: string,"id"?: string,"key"?: string,"owner_id"?: string | null,"part_number"?: number,"size"?: number,"upload_id"?: string,"version"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
      columns: ["bucket_id"]
isOneToOne: false
      referencedRelation: "buckets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
      columns: ["upload_id"]
isOneToOne: false
      referencedRelation: "s3_multipart_uploads"
      referencedColumns: ["id"]
    }
                  ]
                },"vector_indexes": {
                  Row: {
                    "bucket_id": string,"created_at": string,"data_type": string,"dimension": number,"distance_metric": string,"id": string,"metadata_configuration": Json | null,"name": string,"updated_at": string
                  }
                  Insert: {
                    "bucket_id": string,"created_at"?: string,"data_type": string,"dimension": number,"distance_metric": string,"id"?: string,"metadata_configuration"?: Json | null,"name": string,"updated_at"?: string
                  }
                  Update: {
                    "bucket_id"?: string,"created_at"?: string,"data_type"?: string,"dimension"?: number,"distance_metric"?: string,"id"?: string,"metadata_configuration"?: Json | null,"name"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "vector_indexes_bucket_id_fkey"
      columns: ["bucket_id"]
isOneToOne: false
      referencedRelation: "buckets_vectors"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "allow_any_operation":
{ Args: { "expected_operations": (string)[] }; Returns: boolean
                           },
"allow_only_operation":
{ Args: { "expected_operation": string }; Returns: boolean
                           },
"can_insert_object":
{ Args: { "bucketid": string,"metadata": Json,"name": string,"owner": string }; Returns: undefined
                           },
"extension":
{ Args: { "name": string }; Returns: string
                           },
"filename":
{ Args: { "name": string }; Returns: string
                           },
"foldername":
{ Args: { "name": string }; Returns: (string)[]
                           },
"get_common_prefix":
{ Args: { "p_delimiter": string,"p_key": string,"p_prefix": string }; Returns: string
                           },
"get_size_by_bucket":
{ Args: { "delete_markers"?: string,"noncurrent_versions"?: string }; Returns: {
              "bucket_id": string,"size": number
            }[]
                           },
"list_multipart_uploads_with_delimiter":
{ Args: { "bucket_id": string,"delimiter_param": string,"max_keys"?: number,"next_key_token"?: string,"next_upload_token"?: string,"prefix_param": string,"raw_prefix_param"?: string }; Returns: {
              "created_at": string,"id": string,"key": string
            }[]
                           },
"list_objects_with_delimiter":
{ Args: { "_bucket_id": string,"delete_markers"?: string,"delimiter_param": string,"max_keys"?: number,"next_token"?: string,"next_token_archived_at"?: string,"next_token_version"?: string,"noncurrent_versions"?: string,"prefix_param": string,"sort_order"?: string,"start_after"?: string }; Returns: {
              "archived_at": string,"created_at": string,"id": string,"is_delete_marker": boolean,"is_versioned": boolean,"last_accessed_at": string,"metadata": Json,"name": string,"updated_at": string,"version": string
            }[]
                           },
"operation":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"search":
{ Args: { "bucketname": string,"delete_markers"?: string,"levels"?: number,"limits"?: number,"noncurrent_versions"?: string,"offsets"?: number,"prefix": string,"search"?: string,"sortcolumn"?: string,"sortorder"?: string }; Returns: {
              "archived_at": string,"created_at": string,"id": string,"is_delete_marker": boolean,"is_versioned": boolean,"last_accessed_at": string,"metadata": Json,"name": string,"updated_at": string,"version": string
            }[]
                           },
"search_by_timestamp":
{ Args: { "delete_markers"?: string,"noncurrent_versions"?: string,"p_bucket_id": string,"p_level": number,"p_limit": number,"p_prefix": string,"p_sort_column": string,"p_sort_column_after": string,"p_sort_order": string,"p_start_after": string,"p_start_after_version"?: string }; Returns: {
              "archived_at": string,"created_at": string,"id": string,"is_delete_marker": boolean,"is_versioned": boolean,"key": string,"last_accessed_at": string,"metadata": Json,"name": string,"updated_at": string,"version": string
            }[]
                           },
"search_v2":
{ Args: { "bucket_name": string,"delete_markers"?: string,"levels"?: number,"limits"?: number,"noncurrent_versions"?: string,"prefix": string,"sort_column"?: string,"sort_column_after"?: string,"sort_order"?: string,"start_after"?: string,"start_after_archived_at"?: string,"start_after_is_continuation"?: boolean,"start_after_version"?: string }; Returns: {
              "archived_at": string,"created_at": string,"id": string,"is_delete_marker": boolean,"is_versioned": boolean,"key": string,"last_accessed_at": string,"metadata": Json,"name": string,"updated_at": string,"version": string
            }[]
                           }
          }
          Enums: {
            "buckettype": "STANDARD"|"ANALYTICS"|"VECTOR"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "app_role": ["super_admin", "form_editor", "translator", "manager", "assessor", "viewer"],"assessment_status": ["draft", "submitted", "returned", "approved"],"ticket_status": ["open", "pending", "closed"],"version_status": ["draft", "published", "archived"]
          }
        },"storage": {
          Enums: {
            "buckettype": ["STANDARD", "ANALYTICS", "VECTOR"]
          }
        }
} as const

