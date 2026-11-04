-- Leaderboard function: returns top 25 users per path, ranked by weekly XP
-- SECURITY DEFINER so it can aggregate across all users while RLS stays on.
-- Only alias + stats are returned — no emails, no IDs beyond what profiles expose.

CREATE OR REPLACE FUNCTION get_leaderboard(p_path text)
RETURNS TABLE (
  rank        bigint,
  alias       text,
  path        text,
  weekly_xp   bigint,
  total_xp    bigint,
  streak      integer
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY COALESCE(weekly.xp, 0) DESC, up.total_xp DESC) AS rank,
    COALESCE(up.alias, 'Anonymous') AS alias,
    COALESCE(up.archetype, p_path)  AS path,
    COALESCE(weekly.xp, 0)          AS weekly_xp,
    COALESCE(up.total_xp, 0)        AS total_xp,
    COALESCE(up.current_streak, 0)  AS streak
  FROM user_profiles up
  LEFT JOIN (
    SELECT
      wl.user_id,
      SUM(wl.xp_earned)::bigint AS xp
    FROM workout_logs wl
    WHERE wl.date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY wl.user_id
  ) weekly ON weekly.user_id = up.user_id
  WHERE (p_path = 'all' OR COALESCE(up.archetype, 'hero') = p_path)
  ORDER BY weekly_xp DESC, total_xp DESC
  LIMIT 25;
$$;

-- Grant execute to authenticated users only (anon cannot call this)
REVOKE ALL ON FUNCTION get_leaderboard(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_leaderboard(text) TO authenticated;
