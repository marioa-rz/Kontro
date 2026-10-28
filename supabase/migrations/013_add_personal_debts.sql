create table if not exists public.personal_debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  counterparty text,
  principal numeric(14, 2) not null check (principal > 0),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.personal_debt_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  debt_id uuid not null references public.personal_debts(id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  paid_at date not null,
  created_at timestamptz not null default now()
);

create index if not exists personal_debts_user_due_idx
  on public.personal_debts (user_id, due_date)
  where deleted_at is null;

create index if not exists personal_debt_payments_debt_paid_idx
  on public.personal_debt_payments (debt_id, paid_at desc);

alter table public.transactions
  add column if not exists personal_debt_id uuid references public.personal_debts(id) on delete set null;

create index if not exists transactions_user_personal_debt_date_idx
  on public.transactions (user_id, personal_debt_id, date desc)
  where personal_debt_id is not null;

create or replace function private.validate_transaction_owner_refs()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.category_id is not null and not exists (
    select 1 from public.categories where id = new.category_id and user_id = new.user_id
  ) then raise exception 'invalid category for transaction owner'; end if;

  if new.payment_method_id is not null and not exists (
    select 1 from public.payment_methods where id = new.payment_method_id and user_id = new.user_id
  ) then raise exception 'invalid payment method for transaction owner'; end if;

  if new.goal_id is not null and not exists (
    select 1 from public.goals where id = new.goal_id and user_id = new.user_id
  ) then raise exception 'invalid goal for transaction owner'; end if;

  if new.personal_debt_id is not null and not exists (
    select 1 from public.personal_debts where id = new.personal_debt_id and user_id = new.user_id
  ) then raise exception 'invalid personal debt for transaction owner'; end if;

  return new;
end;
$$;

drop trigger if exists transactions_validate_owner_refs on public.transactions;
create trigger transactions_validate_owner_refs
before insert or update of user_id, category_id, payment_method_id, goal_id, personal_debt_id
on public.transactions
for each row execute function private.validate_transaction_owner_refs();

alter table public.personal_debts enable row level security;
alter table public.personal_debts force row level security;
alter table public.personal_debt_payments enable row level security;
alter table public.personal_debt_payments force row level security;

drop policy if exists personal_debts_own_rows on public.personal_debts;
create policy personal_debts_own_rows on public.personal_debts
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists personal_debt_payments_own_rows on public.personal_debt_payments;
create policy personal_debt_payments_own_rows on public.personal_debt_payments
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.personal_debts
      where id = debt_id and user_id = auth.uid()
    )
  );

create or replace function public.record_personal_debt_payment(
  p_debt_id uuid,
  p_user_id uuid,
  p_amount numeric,
  p_paid_at date,
  p_description text,
  p_notes text default null
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_principal numeric;
  v_paid numeric;
  v_payment numeric;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'User mismatch';
  end if;

  if p_amount is null or p_amount <= 0 or p_paid_at is null then
    raise exception 'A positive amount and payment date are required';
  end if;

  select principal into v_principal
  from public.personal_debts
  where id = p_debt_id and user_id = p_user_id and deleted_at is null
  for update;

  if not found then
    return null;
  end if;

  select coalesce(sum(amount), 0) into v_paid
  from public.personal_debt_payments
  where debt_id = p_debt_id and user_id = p_user_id;

  v_payment := least(p_amount, greatest(v_principal - v_paid, 0));

  if v_payment = 0 then
    return 0;
  end if;

  insert into public.personal_debt_payments (user_id, debt_id, amount, paid_at)
  values (p_user_id, p_debt_id, v_payment, p_paid_at);

  insert into public.transactions (
    user_id, date, description, amount, kind, personal_debt_id, notes
  ) values (
    p_user_id, p_paid_at, p_description, v_payment, 'expense', p_debt_id, p_notes
  );

  return v_payment;
end;
$$;

revoke all on function public.record_personal_debt_payment(uuid, uuid, numeric, date, text, text) from public;
grant execute on function public.record_personal_debt_payment(uuid, uuid, numeric, date, text, text) to authenticated;

revoke all on public.personal_debts, public.personal_debt_payments from anon;
grant select, insert, update, delete on public.personal_debts to authenticated;
revoke insert, update, delete on public.personal_debt_payments from authenticated;
grant select on public.personal_debt_payments to authenticated;
