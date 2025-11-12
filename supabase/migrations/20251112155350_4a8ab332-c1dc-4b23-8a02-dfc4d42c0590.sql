-- Insert November bonus lesson
INSERT INTO lessons (
  id,
  title,
  emoji,
  category,
  difficulty,
  duration,
  content,
  order_index,
  lesson_type,
  seasonal_tags,
  priority_boost
) VALUES (
  gen_random_uuid(),
  'Mid-Year Tax Health Check',
  '🩺',
  'Tax Planning',
  'Beginner',
  5,
  '{
    "sections": [
      {
        "title": "Why November Matters",
        "content": "November is the perfect time for a mid-year tax health check. With the tax year halfway through, you can still make strategic decisions to optimize your tax position before year-end."
      },
      {
        "title": "Key Areas to Review",
        "content": "Check your profit projections, review allowable expenses, assess your VAT position if registered, and evaluate pension contributions. This is also a good time to review your record-keeping systems."
      },
      {
        "title": "Year-End Planning Opportunities",
        "content": "Consider timing of major purchases for capital allowances, review salary vs dividend strategy if you run a limited company, and assess whether you''re on track for your annual financial goals."
      }
    ],
    "keyTakeaways": [
      "Mid-year is ideal for tax planning adjustments",
      "Review your profit and expense forecasts",
      "Consider year-end tax optimization strategies",
      "Ensure your record-keeping is up to date"
    ],
    "quiz": [
      {
        "question": "Why is November a good time for tax planning?",
        "options": [
          "It''s the end of the tax year",
          "You still have time to make strategic tax decisions",
          "All tax returns are due in November",
          "HMRC offers special November discounts"
        ],
        "correctAnswer": 1,
        "explanation": "November gives you time to review your position and make adjustments before the tax year ends in April."
      }
    ]
  }'::jsonb,
  998,
  'micro',
  ARRAY['november', 'year_end_planning'],
  5
);