grant select on public.asset_runtime_observations to anon, authenticated, service_role;
grant select on public.v_asset_runtime_observation_summary_7d to anon, authenticated, service_role;
grant select on public.v_asset_runtime_family_health_7d to anon, authenticated, service_role;
grant select on public.v_asset_runtime_fallback_hotspots_7d to anon, authenticated, service_role;

grant execute on function public.get_asset_runtime_observation_summary_7d(integer) to anon, authenticated, service_role;
grant execute on function public.get_asset_runtime_family_health_7d(integer) to anon, authenticated, service_role;
grant execute on function public.get_asset_runtime_fallback_hotspots_7d(integer) to anon, authenticated, service_role;
