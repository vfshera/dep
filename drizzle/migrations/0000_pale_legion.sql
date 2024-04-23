CREATE TABLE IF NOT EXISTS "keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"project_id" integer NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"working_dir" text NOT NULL,
	"active" boolean DEFAULT false,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "keys" ADD CONSTRAINT "keys_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
