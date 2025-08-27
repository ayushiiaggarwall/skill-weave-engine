-- Update course plans for better display
UPDATE courses 
SET plans = ARRAY[
  'Master no-code fundamentals and choose the right tools',
  'Design and build complete web applications',
  'Integrate databases, APIs, and third-party services',
  'Implement user authentication and payments',
  'Launch your MVP and gather user feedback'
]
WHERE id = 'ac154f74-871e-408a-b37c-a93b642b374b';