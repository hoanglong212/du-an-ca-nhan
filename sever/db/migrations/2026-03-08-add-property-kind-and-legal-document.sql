-- Run this once in MySQL
-- Add columns for detailed property type and legal document

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS property_kind VARCHAR(120) NULL AFTER address_text,
  ADD COLUMN IF NOT EXISTS legal_document VARCHAR(255) NULL AFTER property_kind;
