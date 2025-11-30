create extension if not exists pgcrypto;

create table if not exists "User" (
  "id" uuid primary key default gen_random_uuid(),
  "clerkId" text unique not null,
  "email" text unique not null,
  "role" text not null check ("role" in ('customer','admin')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "Product" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "description" text not null,
  "price" numeric(10,2) not null,
  "category" text not null,
  "imageUrl" text not null,
  "stock" integer not null default 0,
  "isActive" boolean not null default true
);

create table if not exists "Order" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" uuid not null references "User"("id") on delete cascade,
  "status" text not null,
  "totalAmount" numeric(10,2) not null,
  "stripeId" text,
  "createdAt" timestamptz not null default now()
);

create table if not exists "OrderItem" (
  "id" uuid primary key default gen_random_uuid(),
  "orderId" uuid not null references "Order"("id") on delete cascade,
  "productId" uuid not null references "Product"("id") on delete restrict,
  "quantity" integer not null,
  "unitPrice" numeric(10,2) not null
);

create table if not exists "LoyaltyHistory" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" uuid not null references "User"("id") on delete cascade,
  "pointsDelta" integer not null,
  "reason" text not null,
  "createdAt" timestamptz not null default now()
);

create index if not exists product_is_active_idx on "Product"("isActive");
create index if not exists order_user_idx on "Order"("userId");
create index if not exists order_item_order_idx on "OrderItem"("orderId");
create index if not exists order_item_product_idx on "OrderItem"("productId");

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new."updatedAt" = now();
  return new;
end
$$;

drop trigger if exists user_set_updated_at on "User";
create trigger user_set_updated_at before update on "User" for each row execute function set_updated_at();

create or replace function current_clerk_id() returns text language sql stable as $$
  select coalesce(((current_setting('request.jwt.claims', true))::jsonb ->> 'sub'), null)
$$;

create or replace function current_is_admin() returns boolean language sql stable as $$
  select exists (
    select 1 from "User" u where u."clerkId" = current_clerk_id() and u."role" = 'admin'
  )
$$;

alter table "User" enable row level security;
alter table "Product" enable row level security;
alter table "Order" enable row level security;
alter table "OrderItem" enable row level security;
alter table "LoyaltyHistory" enable row level security;

drop policy if exists users_select_self_or_admin on "User";
create policy users_select_self_or_admin on "User"
  for select using (current_is_admin() or "clerkId" = current_clerk_id());

drop policy if exists users_insert_admin on "User";
create policy users_insert_admin on "User"
  for insert with check (current_is_admin());

drop policy if exists users_update_admin on "User";
create policy users_update_admin on "User"
  for update using (current_is_admin()) with check (current_is_admin());

drop policy if exists users_delete_admin on "User";
create policy users_delete_admin on "User"
  for delete using (current_is_admin());

drop policy if exists products_select_public_or_admin on "Product";
create policy products_select_public_or_admin on "Product"
  for select using (current_is_admin() or "isActive" = true);

drop policy if exists products_write_admin on "Product";
create policy products_write_admin on "Product"
  for insert with check (current_is_admin());
create policy products_update_admin on "Product"
  for update using (current_is_admin()) with check (current_is_admin());
create policy products_delete_admin on "Product"
  for delete using (current_is_admin());

drop policy if exists orders_select_owner_or_admin on "Order";
create policy orders_select_owner_or_admin on "Order"
  for select using (
    current_is_admin() or exists(
      select 1 from "User" u where u."id" = "Order"."userId" and u."clerkId" = current_clerk_id()
    )
  );

drop policy if exists orders_insert_owner_or_admin on "Order";
create policy orders_insert_owner_or_admin on "Order"
  for insert with check (
    current_is_admin() or exists(
      select 1 from "User" u where u."id" = "Order"."userId" and u."clerkId" = current_clerk_id()
    )
  );

drop policy if exists orders_update_admin on "Order";
create policy orders_update_admin on "Order"
  for update using (current_is_admin()) with check (current_is_admin());

drop policy if exists orders_delete_admin on "Order";
create policy orders_delete_admin on "Order"
  for delete using (current_is_admin());

drop policy if exists order_items_select_owner_or_admin on "OrderItem";
create policy order_items_select_owner_or_admin on "OrderItem"
  for select using (
    current_is_admin() or exists(
      select 1 from "Order" o join "User" u on u."id" = o."userId"
      where o."id" = "OrderItem"."orderId" and u."clerkId" = current_clerk_id()
    )
  );

drop policy if exists order_items_insert_owner_or_admin on "OrderItem";
create policy order_items_insert_owner_or_admin on "OrderItem"
  for insert with check (
    current_is_admin() or exists(
      select 1 from "Order" o join "User" u on u."id" = o."userId"
      where o."id" = "OrderItem"."orderId" and u."clerkId" = current_clerk_id()
    )
  );

drop policy if exists order_items_update_admin on "OrderItem";
create policy order_items_update_admin on "OrderItem"
  for update using (current_is_admin()) with check (current_is_admin());

drop policy if exists order_items_delete_admin on "OrderItem";
create policy order_items_delete_admin on "OrderItem"
  for delete using (current_is_admin());

drop policy if exists loyalty_select_owner_or_admin on "LoyaltyHistory";
create policy loyalty_select_owner_or_admin on "LoyaltyHistory"
  for select using (
    current_is_admin() or exists(
      select 1 from "User" u where u."id" = "LoyaltyHistory"."userId" and u."clerkId" = current_clerk_id()
    )
  );

drop policy if exists loyalty_insert_admin on "LoyaltyHistory";
create policy loyalty_insert_admin on "LoyaltyHistory"
  for insert with check (current_is_admin());

drop policy if exists loyalty_update_admin on "LoyaltyHistory";
create policy loyalty_update_admin on "LoyaltyHistory"
  for update using (current_is_admin()) with check (current_is_admin());

drop policy if exists loyalty_delete_admin on "LoyaltyHistory";
create policy loyalty_delete_admin on "LoyaltyHistory"
  for delete using (current_is_admin());