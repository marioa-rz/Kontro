-- Model service bills as an explicit category property instead of inferring
-- them from a payment method or category name in application code.

alter table public.categories
add column if not exists is_service boolean not null default false;

comment on column public.categories.is_service is
  'Whether expense transactions in this category appear as services due.';

alter table public.categories
add constraint categories_service_expense_only
check (not is_service or group_type in ('needs', 'wants'));

-- Preserve the behavior of service categories that users already created.
update public.categories
set is_service = true
where group_type in ('needs', 'wants')
  and lower(trim(name)) in (
    'agua',
    'electricity',
    'internet',
    'luz',
    'recargas telefonicas',
    'recargas telefónicas',
    'servicios basicos',
    'servicios básicos',
    'telefone',
    'teléfono',
    'telefono',
    'utilities'
  );

-- Keep localized defaults correct for users who sign up after this migration.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email, name, terms_accepted)
  values (
    new.id,
    null,
    null,
    coalesce((new.raw_user_meta_data->>'terms_accepted')::boolean, false)
  );

  insert into public.categories (
    user_id,
    name,
    group_type,
    monthly_limit,
    is_default,
    is_service,
    icon
  )
  values
    (new.id, 'Mi gato', 'needs', null, true, false, '🐈'),
    (new.id, 'Universidad', 'needs', null, true, false, '🎓'),
    (new.id, 'Transporte', 'needs', null, true, false, '🚌'),
    (new.id, 'Alimentación', 'needs', null, true, false, '🍽️'),
    (new.id, 'Supermercado', 'needs', null, true, false, '🛒'),
    (new.id, 'Luz', 'needs', null, true, true, '💡'),
    (new.id, 'Recargas telefónicas', 'needs', null, true, true, '📱'),
    (new.id, 'Deudas', 'needs', null, true, false, '🧾'),
    (new.id, 'Gastos personales', 'wants', null, true, false, '✨'),
    (new.id, 'Salud', 'needs', null, true, false, '🩺'),
    (new.id, 'Negocio de uñas', 'needs', null, true, false, '💅'),
    (new.id, 'Entretenimiento', 'wants', null, true, false, '🎬'),
    (new.id, 'Imprevistos y emergencias', 'needs', null, true, false, '🚨'),
    (new.id, 'Suscripciones y aplicaciones', 'wants', null, true, false, '🔁'),
    (new.id, 'Ahorro', 'savings', null, true, false, '💰'),
    (new.id, 'Ingresos', 'income', null, true, false, '💼'),
    (new.id, 'Ingresos del negocio de uñas', 'income', null, true, false, '💅');

  insert into public.payment_methods (
    user_id,
    name,
    type,
    credit_limit
  )
  values
    (new.id, 'Transferencia bancaria', 'bank', null),
    (new.id, 'Efectivo', 'cash', null),
    (new.id, 'Tarjeta de crédito', 'credit', 0),
    (new.id, 'Tarjeta de débito', 'debit', null);

  return new;
end;
$$;
