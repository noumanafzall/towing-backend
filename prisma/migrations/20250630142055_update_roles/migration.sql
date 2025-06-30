-- Add a temporary column for the role
ALTER TABLE "User" ADD COLUMN temp_role text;

-- Copy current roles to the temporary column
UPDATE "User" SET temp_role = role::text;

-- Update the roles in the temporary column
UPDATE "User" SET temp_role = 'ADMIN' WHERE temp_role = 'SUPER_ADMIN';
UPDATE "User" SET temp_role = 'MODERATOR' WHERE temp_role = 'LIMITED_ADMIN';

-- Drop the current role column and enum
ALTER TABLE "User" DROP COLUMN role;
DROP TYPE "Role";

-- Create the new role enum
CREATE TYPE "Role" AS ENUM ('DRIVER', 'CUSTOMER', 'ADMIN', 'MODERATOR');

-- Add the new role column
ALTER TABLE "User" ADD COLUMN role "Role" NOT NULL DEFAULT 'CUSTOMER';

-- Copy the roles from the temporary column
UPDATE "User" SET role = temp_role::text::"Role";

-- Drop the temporary column
ALTER TABLE "User" DROP COLUMN temp_role; 