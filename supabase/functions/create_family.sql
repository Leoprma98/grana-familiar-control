
-- This SQL function will be used to create families without RLS restrictions
CREATE OR REPLACE FUNCTION public.create_family(family_code VARCHAR)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the permissions of the creator
SET search_path = public
AS $$
DECLARE
  new_family_record families;
BEGIN
  -- Insert the new family record
  INSERT INTO families(code)
  VALUES (family_code)
  RETURNING * INTO new_family_record;
  
  -- Return the new family record as json
  RETURN row_to_json(new_family_record);
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_family(VARCHAR) TO authenticated;
