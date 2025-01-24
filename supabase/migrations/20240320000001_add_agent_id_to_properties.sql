alter table "public"."properties" add column "agent_id" uuid references "public"."agents"("id");

-- Add comment to the column
comment on column "public"."properties"."agent_id" is 'The ID of the agent responsible for this property'; 