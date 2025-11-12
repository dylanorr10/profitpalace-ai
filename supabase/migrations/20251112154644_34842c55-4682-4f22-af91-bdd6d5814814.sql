-- Insert seasonal bonus lessons for UK tax calendar events

-- Self Assessment Season Lessons (Dec-Jan)
INSERT INTO lessons (
  title, category, difficulty, duration, emoji, content, order_index, 
  seasonal_tags, quiz_required, lesson_type
) VALUES 
(
  'Self Assessment Sprint: Last-Minute Checklist',
  'Tax Planning',
  'Beginner',
  10,
  '📋',
  '{"sections": [{"type": "text", "content": "Racing against the January 31st deadline? This sprint guide covers the essential steps to complete your Self Assessment quickly and correctly. No time to waste!"}], "keyTakeaways": ["Gather all income sources", "Claim eligible expenses", "Check for common mistakes", "Submit before penalty date"]}',
  100,
  ARRAY['self_assessment_deadline'],
  false,
  'micro'
),
(
  'Gathering Receipts: Where Did I Put That Invoice?',
  'Record Keeping',
  'Beginner',
  8,
  '🧾',
  '{"sections": [{"type": "text", "content": "Learn the fastest way to organize your receipts and invoices for Self Assessment. Digital tools, filing systems, and quick-scan methods to find everything you need."}], "keyTakeaways": ["Digital scanning methods", "Quick filing systems", "HMRC acceptable formats", "Missing receipt solutions"]}',
  101,
  ARRAY['self_assessment_deadline'],
  false,
  'micro'
),
(
  'Common Self Assessment Mistakes to Avoid',
  'Tax Planning',
  'Intermediate',
  12,
  '⚠️',
  '{"sections": [{"type": "text", "content": "HMRC sees the same mistakes every year. Learn what triggers investigations, how to avoid penalties, and the top errors that could cost you money."}], "keyTakeaways": ["Mathematical errors", "Missed income sources", "Incorrect expense claims", "National Insurance mistakes"]}',
  102,
  ARRAY['self_assessment_deadline'],
  false,
  'micro'
),

-- Tax Year End Lessons (March - April 5)
(
  'Year-End Tax Planning: Make Every Penny Count',
  'Tax Planning',
  'Intermediate',
  15,
  '💰',
  '{"sections": [{"type": "text", "content": "The tax year ends April 5th. Strategic moves you can make NOW to reduce your tax bill: pension contributions, dividend timing, capital allowances, and more."}], "keyTakeaways": ["Pension contribution strategies", "Dividend vs salary optimization", "Capital allowances deadlines", "Spouse income splitting"]}',
  103,
  ARRAY['tax_year_end'],
  false,
  'micro'
),
(
  'Dividend vs Salary: Optimizing Before April 5th',
  'Tax Planning',
  'Advanced',
  12,
  '🎯',
  '{"sections": [{"type": "text", "content": "Limited company directors: Learn how to optimize your dividend vs salary split before the tax year ends. Maximize take-home pay while minimizing tax."}], "keyTakeaways": ["Salary vs dividend tax rates", "NI thresholds", "Personal allowance usage", "Year-end timing strategies"]}',
  104,
  ARRAY['tax_year_end'],
  false,
  'micro'
),
(
  'Capital Allowances: Don''t Miss This Deadline',
  'Tax Planning',
  'Intermediate',
  10,
  '🏢',
  '{"sections": [{"type": "text", "content": "Bought equipment this year? Claim capital allowances before April 5th. Annual Investment Allowance can save thousands in tax - but only if you claim it in time."}], "keyTakeaways": ["Annual Investment Allowance", "Qualifying purchases", "Writing down allowances", "Claim timing strategies"]}',
  105,
  ARRAY['tax_year_end'],
  false,
  'micro'
),

-- New Tax Year Lessons (April 6 - May)
(
  'New Tax Year Setup: What Changes This Year?',
  'Tax Planning',
  'Beginner',
  12,
  '🌸',
  '{"sections": [{"type": "text", "content": "The 2025/26 tax year starts April 6th. Learn about new tax rates, allowances, thresholds, and rule changes that affect your business this year."}], "keyTakeaways": ["New tax rates and bands", "Updated allowances", "Threshold changes", "New HMRC rules"]}',
  106,
  ARRAY['new_tax_year'],
  false,
  'micro'
),
(
  'Update Your Accounting Software for 2025/26',
  'Systems',
  'Beginner',
  8,
  '💻',
  '{"sections": [{"type": "text", "content": "New tax year means updating your accounting software. Quick guide to changing tax rates, VAT settings, and ensuring your system is ready for 2025/26."}], "keyTakeaways": ["Software tax rate updates", "VAT setting changes", "New tax year setup", "Testing your system"]}',
  107,
  ARRAY['new_tax_year'],
  false,
  'micro'
),
(
  'Tax Allowances: What You Can Claim This Year',
  'Tax Planning',
  'Intermediate',
  14,
  '📊',
  '{"sections": [{"type": "text", "content": "Comprehensive guide to all tax allowances available in 2025/26: personal allowance, trading allowance, capital gains exemption, and more."}], "keyTakeaways": ["Personal allowance £12,570", "Trading allowance £1,000", "Capital gains £3,000", "Dividend allowance updates"]}',
  108,
  ARRAY['new_tax_year'],
  false,
  'micro'
),

-- VAT Quarter End Lessons (Quarterly)
(
  'VAT Return Quick Guide: Common Items',
  'VAT',
  'Intermediate',
  10,
  '📋',
  '{"sections": [{"type": "text", "content": "Quarter ending soon? This quick guide covers the most commonly missed VAT items: zero-rated vs exempt, partial exemption, and what you can claim back."}], "keyTakeaways": ["Zero-rated vs exempt goods", "Input VAT recovery", "Partial exemption rules", "Common mistakes to avoid"]}',
  109,
  ARRAY['vat_quarter'],
  false,
  'micro'
),
(
  'MTD-Ready: Your VAT Submission Checklist',
  'VAT',
  'Intermediate',
  12,
  '✅',
  '{"sections": [{"type": "text", "content": "Making Tax Digital checklist for your VAT return. Ensure your software is compliant, your digital links work, and your submission will be accepted first time."}], "keyTakeaways": ["MTD software requirements", "Digital link compliance", "Pre-submission checks", "Bridging software options"]}',
  110,
  ARRAY['vat_quarter', 'mtd'],
  false,
  'micro'
),

-- MTD Threshold Lessons
(
  'Making Tax Digital: Is It Time?',
  'VAT',
  'Intermediate',
  15,
  '💻',
  '{"sections": [{"type": "text", "content": "Approaching £85k turnover? Understand when you need to register for MTD, how it works, and what software you''ll need. Better to prepare early than panic later."}], "keyTakeaways": ["£85k registration threshold", "MTD requirements", "Timeline for registration", "Voluntary registration benefits"]}',
  111,
  ARRAY['mtd'],
  false,
  'micro'
),
(
  'MTD Software: Which One''s Right for You?',
  'Systems',
  'Intermediate',
  10,
  '⚙️',
  '{"sections": [{"type": "text", "content": "Compare popular MTD-compliant software: Xero, QuickBooks, FreeAgent, and more. Features, pricing, and which one suits your business type best."}], "keyTakeaways": ["Software comparison", "Pricing structures", "Feature requirements", "Migration process"]}',
  112,
  ARRAY['mtd'],
  false,
  'micro'
);
