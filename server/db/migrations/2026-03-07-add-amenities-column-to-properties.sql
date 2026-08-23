-- Run this once in MySQL
-- Add amenities directly inside properties table (JSON text)

ALTER TABLE properties
  ADD COLUMN amenities TEXT NULL AFTER status;
