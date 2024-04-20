CREATE TABLE IF NOT EXISTS "keys" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"project_id" uuid NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "active" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "created_at" timestamp (3) DEFAULT now() NOT NULL;