ALTER TABLE "keys" ALTER COLUMN "project_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "keys" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "created_at" SET NOT NULL;