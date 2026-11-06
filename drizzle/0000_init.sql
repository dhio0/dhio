CREATE TABLE "certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"issuer" text NOT NULL,
	"issued" text NOT NULL,
	"credential_id" text,
	"id_label" text,
	"verify_url" text,
	"file_url" text,
	"image" jsonb,
	"grade" text,
	"courses" jsonb,
	"summary" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"ip" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"tagline" text NOT NULL,
	"year" text NOT NULL,
	"kind" text NOT NULL,
	"problem" text NOT NULL,
	"approach" text NOT NULL,
	"evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stack" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cover" jsonb,
	"showcase" text,
	"pipeline" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"org" text NOT NULL,
	"org_note" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"type" text DEFAULT 'work' NOT NULL,
	"title" text NOT NULL,
	"start" text NOT NULL,
	"end" text,
	"summary" text NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "login_attempts_ip_at" ON "login_attempts" USING btree ("ip","at");