-- Run this once on your MySQL database.
-- It enables manual amenities and allows properties without coordinates.

ALTER TABLE properties
  MODIFY COLUMN lat DECIMAL(10,7) NULL,
  MODIFY COLUMN lng DECIMAL(10,7) NULL,
  MODIFY COLUMN status ENUM('available', 'sold', 'rented', 'hidden') NOT NULL DEFAULT 'available';

CREATE TABLE IF NOT EXISTS property_amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  amenity_text VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_property_amenities_property
    FOREIGN KEY (property_id) REFERENCES properties(id)
    ON DELETE CASCADE,
  INDEX idx_property_amenities_property (property_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4;
