
create or replace function increment_performance_count(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.user_usage
  set performance_count = performance_count + 1
  where user_id = increment_performance_count.user_id;
end;
$$;
