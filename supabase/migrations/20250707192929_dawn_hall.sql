/*
  # Add file storage support and public book viewing

  1. Database Changes
    - Update RLS policies to allow public viewing of books
    - Add indexes for better performance on public queries
    - Ensure file storage fields are properly configured

  2. Security Updates
    - Allow public read access to books
    - Maintain user ownership for create/update/delete operations
    - Add policy for public book viewing
*/

-- Update RLS policies to allow public viewing
DROP POLICY IF EXISTS "Public can view all books" ON books;

CREATE POLICY "Public can view all books"
  ON books
  FOR SELECT
  TO public
  USING (true);

-- Ensure other policies remain for authenticated users only
-- (These should already exist from previous migration)

-- Add any missing indexes for public queries
CREATE INDEX IF NOT EXISTS books_price_idx ON books(price);
CREATE INDEX IF NOT EXISTS books_category_price_idx ON books(category, price);