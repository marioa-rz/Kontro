alter table public.transactions
  add column if not exists goal_id uuid references public.goals(id) on delete set null;

create index if not exists transactions_user_id_goal_id_date_idx
  on public.transactions (user_id, goal_id, date desc)
  where goal_id is not null;

create or replace function public.record_goal_contribution(
  p_goal_id uuid,
  p_user_id uuid,
  p_amount numeric,
  p_date date,
  p_description text,
  p_notes text default null
)
returns numeric
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_remaining numeric;
  v_contribution numeric;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'User mismatch';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  if p_date is null or nullif(btrim(p_description), '') is null then
    raise exception 'Date and description are required';
  end if;

  select greatest(target_amount - current_amount, 0)
    into v_remaining
  from public.goals
  where id = p_goal_id and user_id = p_user_id
  for update;

  if not found then
    return null;
  end if;

  if v_remaining = 0 then
    return 0;
  end if;

  v_contribution := least(p_amount, v_remaining);

  insert into public.transactions (
    user_id,
    date,
    description,
    amount,
    kind,
    goal_id,
    notes
  ) values (
    p_user_id,
    p_date,
    p_description,
    v_contribution,
    'saving',
    p_goal_id,
    p_notes
  );

  update public.goals
  set current_amount = current_amount + v_contribution
  where id = p_goal_id and user_id = p_user_id;

  return v_contribution;
end;
$$;

revoke all on function public.record_goal_contribution(uuid, uuid, numeric, date, text, text) from public;
grant execute on function public.record_goal_contribution(uuid, uuid, numeric, date, text, text) to authenticated;
