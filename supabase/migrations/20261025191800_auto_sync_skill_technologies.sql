-- Auto-sync skill technologies to public.technologies whenever skill_groups is inserted or updated.
-- Uses SECURITY DEFINER to bypass RLS issues during automated sync.

CREATE OR REPLACE FUNCTION public.sync_skill_technologies()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tech_item text;
  tech_slug text;
  tech_name text;
  max_order int;
BEGIN
  IF NEW.items_en IS NOT NULL AND NEW.items_en <> '' THEN
    SELECT COALESCE(MAX(sort_order), 0) INTO max_order FROM public.technologies;

    FOR tech_item IN
      SELECT trim(val)
      FROM unnest(regexp_split_to_array(NEW.items_en, '[·•,،;\n|/]+')) AS val
      WHERE trim(val) <> ''
    LOOP
      tech_name := trim(tech_item);
      tech_slug := lower(regexp_replace(tech_name, '[^a-zA-Z0-9]+', '-', 'g'));
      tech_slug := trim(both '-' from tech_slug);

      IF tech_slug <> '' THEN
        IF NOT EXISTS (
          SELECT 1 FROM public.technologies
          WHERE slug = tech_slug OR lower(name) = lower(tech_name)
        ) THEN
          max_order := max_order + 1;
          INSERT INTO public.technologies (slug, name, icon, sort_order)
          VALUES (tech_slug, tech_name, '', max_order);
        END IF;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_skill_technologies ON public.skill_groups;

CREATE TRIGGER trg_sync_skill_technologies
AFTER INSERT OR UPDATE ON public.skill_groups
FOR EACH ROW
EXECUTE FUNCTION public.sync_skill_technologies();
