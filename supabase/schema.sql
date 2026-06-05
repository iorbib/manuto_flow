create extension if not exists "uuid-ossp";

create type event_status as enum (
  'lead',
  'quote_needed',
  'quote_sent',
  'waiting_approval',
  'approved',
  'preparing',
  'ready_to_go',
  'completed',
  'studio_work',
  'glazing',
  'firing',
  'packing',
  'delivered',
  'paid',
  'closed',
  'cancelled'
);

create type event_type as enum (
  'company',
  'therapy_center',
  'school',
  'birthday',
  'community',
  'private',
  'other'
);

create table business_settings (
  id uuid primary key default uuid_generate_v4(),
  vat_rate numeric(5, 4) not null default 0.18,
  default_event_hours numeric(6, 2) not null default 4,
  default_paint_cost numeric(10, 2) not null default 120,
  default_glaze_cost numeric(10, 2) not null default 90,
  default_packaging_cost numeric(10, 2) not null default 80,
  default_firing_cost numeric(10, 2) not null default 160,
  default_logistics_cost numeric(10, 2) not null default 220,
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact_name text not null,
  phone text,
  city text,
  notes text,
  created_at timestamptz not null default now()
);

create table employees (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null check (role in ('owner', 'employee')),
  hourly_rate numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  default_unit_cost_ex_vat numeric(10, 2) not null default 0,
  default_participant_price_inc_vat numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  client_id uuid references clients(id) on delete set null,
  event_date date not null,
  event_time time,
  city text,
  venue text,
  participant_count integer not null default 0,
  event_type event_type not null default 'other',
  custom_event_type text not null default '',
  event_description text not null default '',
  status event_status not null default 'lead',
  product_id uuid references products(id) on delete set null,
  participant_price_inc_vat numeric(10, 2) not null default 0,
  event_hours numeric(6, 2) not null default 4,
  paint_cost numeric(10, 2) not null default 0,
  glaze_cost numeric(10, 2) not null default 0,
  packaging_cost numeric(10, 2) not null default 0,
  firing_cost numeric(10, 2) not null default 0,
  logistics_cost numeric(10, 2) not null default 0,
  extra_expenses numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table event_employee_assignments (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  event_hours numeric(6, 2) not null default 4,
  created_at timestamptz not null default now(),
  unique (event_id, employee_id)
);

create table inventory_items (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  quantity_on_hand integer not null default 0,
  quantity_reserved integer not null default 0,
  reorder_threshold integer not null default 0,
  average_unit_cost_ex_vat numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table inventory_movements (
  id uuid primary key default uuid_generate_v4(),
  inventory_item_id uuid not null references inventory_items(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  movement_type text not null check (movement_type in ('purchase', 'reserve', 'use', 'release', 'adjustment')),
  quantity integer not null,
  unit_cost_ex_vat numeric(10, 2),
  note text,
  created_at timestamptz not null default now()
);

create table quotes (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'sent', 'approved')),
  created_at timestamptz not null default now()
);

create table quote_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid not null references quotes(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity integer not null,
  price_per_participant_inc_vat numeric(10, 2) not null,
  unit_cost_ex_vat numeric(10, 2) not null default 0
);

create table expenses (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  label text not null,
  amount_ex_vat numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create table studio_tasks (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  title text not null,
  status text not null default 'open' check (status in ('open', 'doing', 'done')),
  due_date date,
  created_at timestamptz not null default now()
);

create table daily_support_messages (
  id uuid primary key default uuid_generate_v4(),
  message text not null,
  active_on date,
  created_at timestamptz not null default now()
);

create table supplier_products (
  id uuid primary key default uuid_generate_v4(),
  supplier_name text not null,
  supplier_product_name text not null,
  supplier_category text,
  product_url text,
  price_inc_vat numeric(10, 2),
  price_ex_vat numeric(10, 2),
  vat_rate numeric(5, 4) not null default 0.18,
  matched_product_id uuid references products(id) on delete set null,
  last_checked_at timestamptz
);

create or replace function create_studio_tasks_after_completed()
returns trigger as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    insert into studio_tasks (event_id, title, status, due_date)
    values
      (new.id, 'לספור עבודות', 'open', current_date + 1),
      (new.id, 'גלזורה', 'open', current_date + 2),
      (new.id, 'שריפה', 'open', current_date + 4),
      (new.id, 'בדיקת איכות', 'open', current_date + 5),
      (new.id, 'אריזה', 'open', current_date + 6),
      (new.id, 'תיאום החזרה ללקוח', 'open', current_date + 7);
  end if;

  return new;
end;
$$ language plpgsql;

create trigger events_create_studio_tasks
after update of status on events
for each row
execute function create_studio_tasks_after_completed();

insert into business_settings (vat_rate) values (0.18);

insert into employees (name, role, hourly_rate) values
  ('אלונה', 'owner', 0),
  ('שקד', 'employee', 55),
  ('עמית', 'employee', 55);

insert into products (name, default_unit_cost_ex_vat, default_participant_price_inc_vat) values
  ('צלחת מנה ראשונה', 10, 90),
  ('כוס', 12, 100),
  ('קערת קורנפלקס', 14, 100),
  ('צלחת עיקרית', 18, 120);
