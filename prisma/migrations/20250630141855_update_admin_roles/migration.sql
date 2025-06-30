-- First, create a new type with the updated values
CREATE TYPE "Role_new" AS ENUM ('DRIVER', 'CUSTOMER', 'ADMIN', 'MODERATOR');

-- Update existing data
UPDATE "User" SET role = 'ADMIN' WHERE role = 'SUPER_ADMIN';
UPDATE "User" SET role = 'MODERATOR' WHERE role = 'LIMITED_ADMIN';

-- Alter the column to use the new type
ALTER TABLE "User" 
  ALTER COLUMN role TYPE "Role_new" 
  USING (role::text::"Role_new");

-- Drop the old type
DROP TYPE "Role";

-- Rename the new type to the original name
ALTER TYPE "Role_new" RENAME TO "Role"; 