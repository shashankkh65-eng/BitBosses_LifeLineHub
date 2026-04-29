
create or replace function public.generate_donor_id()
returns text language plpgsql security definer set search_path = public as $$
declare
  new_id text;
  exists_count int;
begin
  loop
    new_id := 'DONOR' || lpad(floor(random() * 1000000)::text, 6, '0');
    select count(*) into exists_count from public.donor_profiles where donor_id = new_id;
    exit when exists_count = 0;
  end loop;
  return new_id;
end;
$$;

revoke execute on function public.generate_donor_id() from public, anon, authenticated;
revoke execute on function public.handle_new_donor() from public, anon, authenticated;
