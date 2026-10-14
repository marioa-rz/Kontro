-- Localize onboarding defaults for Kontro's Guatemala-first experience.
-- This replaces the signup function for future users only. Existing user-owned
-- categories and payment methods are intentionally left unchanged.

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
    icon
  )
  values
    (new.id, 'Mi gato', 'needs', null, true, '🐈'),
    (new.id, 'Universidad', 'needs', null, true, '🎓'),
    (new.id, 'Transporte', 'needs', null, true, '🚌'),
    (new.id, 'Alimentación', 'needs', null, true, '🍽️'),
    (new.id, 'Supermercado', 'needs', null, true, '🛒'),
    (new.id, 'Luz', 'needs', null, true, '💡'),
    (new.id, 'Recargas telefónicas', 'needs', null, true, '📱'),
    (new.id, 'Deudas', 'needs', null, true, '🧾'),
    (new.id, 'Gastos personales', 'wants', null, true, '✨'),
    (new.id, 'Salud', 'needs', null, true, '🩺'),
    (new.id, 'Negocio de uñas', 'needs', null, true, '💅'),
    (new.id, 'Entretenimiento', 'wants', null, true, '🎬'),
    (new.id, 'Imprevistos y emergencias', 'needs', null, true, '🚨'),
    (new.id, 'Suscripciones y aplicaciones', 'wants', null, true, '🔁'),
    (new.id, 'Ahorro', 'savings', null, true, '💰'),
    (new.id, 'Ingresos', 'income', null, true, '💼'),
    (new.id, 'Ingresos del negocio de uñas', 'income', null, true, '💅');

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
