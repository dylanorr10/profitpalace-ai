-- Create glossary tables and populate with essential terms

-- Create enum for glossary categories
CREATE TYPE glossary_category AS ENUM (
  'tax',
  'expenses',
  'structure',
  'dates',
  'compliance',
  'general'
);

-- Create glossary terms table
CREATE TABLE public.glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  simple_explanation TEXT NOT NULL,
  example TEXT,
  category glossary_category NOT NULL,
  related_lesson_ids UUID[],
  industry_specific JSONB DEFAULT '{}'::jsonb,
  synonyms TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user glossary bookmarks table
CREATE TABLE public.user_glossary_bookmarks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  term_id UUID REFERENCES glossary_terms(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, term_id)
);

-- Enable RLS
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_glossary_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for glossary_terms (public read)
CREATE POLICY "Anyone can view glossary terms"
  ON public.glossary_terms
  FOR SELECT
  USING (true);

-- RLS Policies for bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON public.user_glossary_bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON public.user_glossary_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.user_glossary_bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_glossary_terms_category ON glossary_terms(category);
CREATE INDEX idx_glossary_terms_term ON glossary_terms(term);
CREATE INDEX idx_glossary_bookmarks_user ON user_glossary_bookmarks(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_glossary_terms_updated_at
  BEFORE UPDATE ON glossary_terms
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert essential glossary terms (50 most important)
INSERT INTO glossary_terms (term, simple_explanation, definition, example, category, synonyms) VALUES
('Self Assessment', 'The tax return system for self-employed people and others with income outside PAYE.', 'A process where you report your income and expenses to HMRC annually, and they calculate your tax bill. Due 31 January for online filing.', 'Sarah is a freelance designer earning £45,000. She files her Self Assessment in January, reports her income and £8,000 expenses. HMRC calculates she owes £7,432 in tax.', 'tax', ARRAY['tax return', 'SA100']),

('UTR', 'Unique Taxpayer Reference - your personal tax ID number from HMRC.', 'A 10-digit number that HMRC assigns when you register as self-employed or set up a company. Used on all tax correspondence and returns.', 'When John registered as self-employed, HMRC sent him UTR: 1234567890. He uses this number to file his tax return and contact HMRC.', 'compliance', ARRAY['Unique Taxpayer Reference', 'tax reference']),

('National Insurance', 'Payments that build your entitlement to state pension and certain benefits.', 'Contributions made by employees and self-employed people. Class 1 (employees), Class 2 (self-employed flat rate £3.45/week), Class 4 (self-employed 6-9% on profits).', 'Emma earns £35,000 profit as sole trader. She pays Class 2 NI (£179/year) and Class 4 NI (£1,539/year). Total NI: £1,718.', 'tax', ARRAY['NI', 'NIC']),

('VAT', 'Value Added Tax - a consumption tax charged on most goods and services.', 'Currently 20% standard rate. Must register if turnover exceeds £90,000. Charge VAT on sales, reclaim VAT on business purchases, pay difference to HMRC quarterly.', 'Builder charges customer £12,000 + £2,400 VAT = £14,400 total. Pays suppliers £5,000 + £1,000 VAT. Keeps £12,000, pays HMRC £1,400 (£2,400 - £1,000).', 'tax', ARRAY['Value Added Tax', 'sales tax']),

('Corporation Tax', 'Tax that Limited Companies pay on their profits.', 'Currently 19% for profits up to £50,000, 25% above £250,000. Companies pay Corporation Tax, directors take salary and dividends. Due 9 months and 1 day after accounting year-end.', 'Tech Ltd makes £60,000 profit. Corporation Tax: £60,000 × 19% = £11,400. Remaining £48,600 can be paid as dividends to directors.', 'tax', ARRAY['CT', 'company tax']),

('PAYE', 'Pay As You Earn - the system for deducting tax from employee wages.', 'Employers calculate and deduct income tax and National Insurance from employee pay before paying them. Report to HMRC via RTI, pay monthly by 22nd.', 'Company pays employee £2,500 gross. Deducts £260 tax and £169 NI. Pays employee £2,071 net. Pays HMRC £260 + £169 + £191 employer NI = £620 by 22nd of next month.', 'compliance', ARRAY['Pay As You Earn', 'payroll tax']),

('Sole Trader', 'Self-employed individual running business in their own name.', 'Simplest business structure. You and the business are the same legal entity. Report profits on Self Assessment. Personally liable for business debts. Easy to set up, less admin.', 'James starts dog-walking. Registers as sole trader with HMRC. Earns £18,000, pays tax via Self Assessment. If business has debts, his personal assets are at risk.', 'structure', ARRAY['self-employed', 'sole proprietor']),

('Limited Company', 'Separate legal entity owned by shareholders, run by directors.', 'Company is separate from owners. Limited liability protects personal assets. Pays Corporation Tax on profits. More admin: accounts, Companies House filing, PAYE if paying salary.', 'Sarah sets up Design Ltd. Company makes £50k profit, pays £9,500 Corporation Tax. Sarah (director) takes £12,570 salary + £37,430 dividends. Her house is protected if company fails.', 'structure', ARRAY['Ltd', 'Ltd Co', 'private limited']),

('Allowable Expense', 'Business costs you can deduct from income to reduce your tax bill.', 'Expenses that are wholly and exclusively for business purposes. Reduces taxable profit. Must keep receipts. Includes: equipment, travel, office costs, professional fees.', 'Consultant earns £50,000, spends £8,000 on allowable expenses (laptop, travel, accountant). Taxable profit: £42,000 instead of £50,000. Tax saving: £1,600-£3,200 depending on rate.', 'expenses', ARRAY['deduction', 'business expense', 'tax-deductible']),

('Capital Allowances', 'Tax relief for business equipment and assets you purchase.', 'Alternative to depreciation for tax purposes. Annual Investment Allowance: 100% relief on first £1m of equipment. Cars have special rules based on emissions.', 'Builder buys £25,000 van. Claims 100% capital allowance (£25,000) via AIA. Tax relief: £5,000 (20%) or £10,000 (40%) depending on tax rate. All claimed in year of purchase.', 'tax', ARRAY['AIA', 'Annual Investment Allowance']),

('Tax Year', 'The 12-month period HMRC uses to calculate your tax bill.', 'Runs 6 April to 5 April the following year. Tax year 2024/25 means 6 April 2024 to 5 April 2025. Self Assessment for 2024/25 due 31 January 2026.', 'Business starts September 2024. First tax year: 6 April 2024 to 5 April 2025 (includes Sept-April). Tax return due 31 Jan 2026 covering this period.', 'dates', ARRAY['fiscal year', 'tax period']),

('Accounting Year End', 'The date your business accounts close for annual reporting.', 'You choose this date (often 31 March, 31 Dec, or 5 April). Limited Companies must file accounts to Companies House within 9 months. Not the same as tax year.', 'Design Ltd uses 31 December year-end. Accounts for year ending 31 Dec 2024 must be filed with Companies House by 30 September 2025. Corporation Tax due 1 October 2025.', 'dates', ARRAY['year-end', 'financial year-end']),

('Payment on Account', 'Advance payments towards next year tax bill, due in January and July.', 'If tax bill exceeds £1,000, pay half towards next year on 31 Jan and half on 31 July. Based on previous year tax. Doubles effective tax bill in year 2.', 'Year 1 tax: £10,000. On 31 Jan pay £10,000 + £5,000 PoA = £15,000 total. Then £5,000 again on 31 July. Year 2: balancing payment plus new PoA.', 'tax', ARRAY['PoA', 'advance payment']),

('Making Tax Digital', 'HMRC system requiring digital records and software for tax submissions.', 'MTD for VAT is mandatory for all VAT-registered businesses. MTD for Income Tax starts April 2026 for sole traders over £50,000. Must use compatible software.', 'VAT-registered business must use Xero, QuickBooks or similar to submit VAT returns. Paper or manual online submissions no longer allowed. Penalties for non-compliance.', 'compliance', ARRAY['MTD', 'digital tax']),

('Turnover', 'Total sales or income before deducting any expenses.', 'Also called revenue or gross income. Not profit. All money coming into business from sales of goods or services. Used for VAT threshold (£90,000).', 'Cafe has sales of £120,000 per year. Expenses: £80,000. Turnover is £120,000. Profit is £40,000. Must VAT register as turnover exceeds £90,000 threshold.', 'general', ARRAY['revenue', 'sales', 'gross income']),

('Profit', 'What remains after deducting allowable expenses from income.', 'Income minus expenses equals profit. This is what you pay tax on, not turnover. Track monthly to understand business health. Different from cash in bank.', 'Freelancer invoices £55,000 (turnover), expenses £12,000. Profit: £43,000. This is taxable amount. Tax due: approximately £8,400 (20%) or £12,500 (40%) depending on rate.', 'general', ARRAY['net income', 'net profit', 'taxable profit']),

('CIS', 'Construction Industry Scheme - tax deduction system for construction.', 'Contractors deduct 20% (or 30% unregistered) from subcontractor payments and pay to HMRC. Subcontractor claims deductions against their tax bill. Monthly filing required.', 'Builder (contractor) pays electrician (subcontractor) £2,000. Deducts 20% (£400), pays electrician £1,600. Pays HMRC £400 by 22nd. Electrician claims £400 against tax bill.', 'compliance', ARRAY['Construction Industry Scheme']),

('Dividend', 'Payment to Limited Company shareholders from after-tax profits.', 'More tax-efficient than salary for Ltd Co directors. First £500 tax-free (2024/25). Then taxed at 8.75% (basic), 33.75% (higher), 39.35% (additional). No NI on dividends.', 'Director takes £12,570 salary (tax-free) + £37,430 dividends. Total £50,000. Tax: £3,233 vs £11,768 as sole trader. Saves £8,535 annually.', 'tax', ARRAY['dividend payment', 'distribution']),

('Employer NI', 'National Insurance that employers pay on top of employee wages.', 'Currently 13.8% on earnings above £9,100 per year. This is additional cost on top of salary. No maximum. Part of total employment cost.', 'Employee salary: £30,000. Employer NI: (£30,000 - £9,100) × 13.8% = £2,884. Total employment cost: £32,884 plus pension contributions.', 'tax', ARRAY['employers national insurance', 'secondary NI']),

('RTI', 'Real Time Information - reporting employee pay to HMRC on or before payday.', 'Every time you pay employees, submit Full Payment Submission (FPS) to HMRC via payroll software. Late submission penalties: £100-£400 monthly depending on employee count.', 'Pay 3 employees on 25th of month. Payroll software submits FPS on 25th showing gross pay, tax, NI deductions. HMRC knows immediately what is owed. Pay HMRC by 22nd of next month.', 'compliance', ARRAY['Real Time Information', 'payroll reporting']),

('Personal Allowance', 'Amount you can earn tax-free each year before paying income tax.', '£12,570 for 2024/25. Everyone gets this. Reduces by £1 for every £2 earned over £100,000. Disappears completely at £125,140. Use efficiently in tax planning.', 'Earnings £45,000. First £12,570 tax-free, remaining £32,430 taxed at 20% = £6,486 tax. With £125,000 income, Personal Allowance is zero, creating 60% tax trap.', 'tax', ARRAY['tax-free allowance', 'personal tax allowance']),

('Bookkeeping', 'Recording all business financial transactions regularly.', 'Track income, expenses, VAT, payments. Essential for tax returns, business decisions, and legal compliance. Use software (Xero, QuickBooks) or spreadsheets. Reconcile monthly.', 'Consultant records every invoice sent, expense paid, and bank transaction in Xero monthly. Takes 2 hours/month. At year-end, accounts ready in days not weeks. Tax return easy.', 'general', ARRAY['record keeping', 'accounting']),

('Bank Reconciliation', 'Checking your accounting records match your actual bank balance.', 'Monthly task. Compare transactions in accounting software to bank statement. Find and fix discrepancies. Essential for accurate books. Most errors found here.', 'Software shows £12,450, bank shows £12,680. Reconciliation finds £230 missing supplier payment. Add to software, now balanced. Without reconciliation, accounts would be wrong.', 'general', ARRAY['bank rec', 'reconciliation']),

('Invoice', 'Bill you send to customers requesting payment for goods or services.', 'Must include: your details, customer details, unique number, date, description, amount, VAT if registered, payment terms. Legal document for business transactions.', 'Designer invoices client: Invoice #045, 15 Jan 2025, Logo design £800 + VAT £160 = £960 total. Payment terms: 14 days. Due 29 Jan. Professional invoice improves payment speed.', 'general', ARRAY['bill', 'sales invoice']),

('Receipt', 'Proof of purchase for business expenses.', 'Essential for claiming expenses. Must show: supplier name, date, description, amount, VAT breakdown if claiming VAT. Digital photos acceptable. Keep 6 years. No receipt = cannot claim.', 'Buy office supplies £45. Receipt shows: Staples, 12 Jan 2025, printer paper £30, pens £15, VAT £9. Take photo with app, auto-imports to accounting software. Claimable evidence secured.', 'expenses', ARRAY['proof of purchase', 'expense receipt']),

('Working Capital', 'Money available to run daily business operations.', 'Current assets minus current liabilities. Essentially cash or near-cash available. Too little causes cash flow crisis. Too much means inefficient use of funds.', 'Business has £15,000 in bank, £8,000 owed by customers, £5,000 owed to suppliers. Working capital: £15,000 + £8,000 - £5,000 = £18,000. This funds daily operations.', 'general', ARRAY['operating capital', 'cash flow']),

('Margin', 'Difference between selling price and cost, expressed as percentage.', 'Gross margin: (Revenue - Cost of Sales) ÷ Revenue × 100. Indicates profitability. Industry benchmarks vary. Track monthly to spot problems early.', 'Product costs £40 to make, sells for £100. Gross margin: (£100 - £40) ÷ £100 = 60%. This margin must cover overheads (rent, salaries) and leave profit.', 'general', ARRAY['profit margin', 'gross margin']),

('Overhead', 'Fixed business costs not directly tied to production or sales.', 'Rent, salaries, insurance, utilities, software subscriptions. Must be paid regardless of sales volume. Control overheads to improve profitability.', 'Online shop monthly overheads: website hosting £30, packaging supplies £200, insurance £40, accounting software £20. Total £290. Must be covered by profit margin on sales.', 'expenses', ARRAY['fixed costs', 'operating expenses']),

('Gross Profit', 'Revenue minus Cost of Sales before deducting overheads.', 'Shows profitability of core business activity before accounting for operating expenses. Used to calculate gross margin. Higher is better.', 'Restaurant revenue £100,000, food costs £35,000. Gross profit: £65,000 (65% margin). Still need to pay rent, salaries, utilities from this. Net profit lower.', 'general', ARRAY['gross income', 'contribution margin']),

('Net Profit', 'Final profit after all expenses, the bottom line.', 'Gross profit minus all operating expenses, interest, tax. What actually goes to owners. This is taxable profit for sole traders. For companies, profit before tax and dividends.', 'Revenue £100,000, COGS £40,000, overheads £35,000. Gross profit: £60,000. Net profit: £60,000 - £35,000 = £25,000. This is taxable. Owner can draw this.', 'general', ARRAY['bottom line', 'net income', 'profit after tax']),

('Cash Flow', 'Movement of money in and out of business.', 'Different from profit. Can be profitable but cash-poor if customers owe you. Forecast weekly. Positive cash flow = money in exceeds money out. Negative = opposite.', 'Profitable £50k but only £2k in bank. Customers owe £30k, suppliers owed £5k. Cash flow problem despite profit. Need to chase debts or arrange overdraft urgently.', 'general', ARRAY['cashflow', 'cash movement']),

('Accruals', 'Expenses incurred but not yet paid or invoiced.', 'Year-end adjustment. Accountant agreed £1,200 fee in March but invoices in April. Accrue £1,200 in March accounts. Matches expense to correct period. Reduces profit appropriately.', 'Accountant does year-end work March 2025, invoices May 2025. Accrue £1,200 in March 2025 accounts to match expense to correct year. Important for accurate profit.', 'general', ARRAY['accrued expenses', 'provisions']),

('Prepayments', 'Expenses paid in advance for future periods.', 'Insurance covering 12 months paid upfront. Only expense the portion used in current period. Rest is prepayment (asset). Ensures accurate profit matching.', 'Pay £1,200 insurance April 2024-March 2025. Year-end 31 Dec 2024. Used 9 months (£900), prepaid 3 months (£300). Reduce expense by £300, add prepayment asset. Accurate profit.', 'general', ARRAY['prepaid expenses', 'deferred costs']),

('Depreciation', 'Accounting method of spreading asset cost over useful life.', 'For accounts, not tax (tax uses capital allowances). £10,000 van, 5-year life = £2,000 depreciation per year in accounts. Reduces profit each year. Non-cash expense.', 'Buy £20,000 equipment, 4-year life. Depreciation: £5,000/year in accounts. Tax: claim capital allowances instead (often 100% first year via AIA). Two different calculations.', 'general', ARRAY['amortization', 'asset depreciation']),

('Credit Control', 'Managing customer payments to minimize late payment.', 'Invoice immediately, clear payment terms, chase on due date, stop work for persistent late payers. Good credit control improves cash flow dramatically.', 'Customers averaging 45 days payment. Implement credit control: invoice same day, call on day 30. New average: 25 days. Releases £8,000 working capital for business use.', 'general', ARRAY['debt collection', 'receivables management']),

('Overdraft', 'Agreed borrowing facility on business bank account.', 'Arrange before needed. Typical: £5k-£50k, 8-15% interest. Safety net for temporary cash flow gaps. Only pay interest when used. Better than unauthorized overdraft or bounced payments.', 'Arrange £15,000 overdraft (costs nothing until used). July: big tax bill causes temporary shortfall, use £8,000 overdraft for 3 weeks. Interest: ~£40. Prevents crisis.', 'general', ARRAY['bank overdraft', 'credit facility']),

('Companies House', 'UK registrar of companies - where all Limited Companies must register.', 'All Ltd Companies must file annual accounts and confirmation statement. Deadlines: 9 months for accounts, 14 days for certain changes. Late filing: automatic penalties starting £150.', 'Design Ltd year-end 31 Dec 2024. Must file accounts at Companies House by 30 Sept 2025. Also annual confirmation statement. Late filing penalty: £150 immediately, escalates if longer.', 'compliance', ARRAY['registrar of companies']),

('Director', 'Person appointed to run a Limited Company.', 'Legal responsibilities to run company properly. Can be employee (takes salary) or not. Usually also shareholder. Personally liable for wrongful trading. Must file accounts and returns.', 'Sarah sets up Design Ltd. She is director and 100% shareholder. Runs the company, makes decisions, legally responsible. Takes £12,570 salary plus dividends as tax-efficient extraction.', 'structure', ARRAY['company director', 'board member']),

('Shareholder', 'Owner of shares in a Limited Company.', 'Owns company in proportion to shares held. Entitled to dividends from profits. Usually directors are also shareholders in small companies. Limited liability protects personal assets.', 'Tech Ltd has 100 shares. John owns 60, Emma owns 40. John is 60% shareholder, Emma 40%. £10,000 dividends paid: John gets £6,000, Emma £4,000. Both liable only for share value.', 'structure', ARRAY['stockholder', 'equity holder']),

('Confirmation Statement', 'Annual filing to Companies House confirming company details are correct.', 'Due within 14 days of anniversary of incorporation or last statement. Confirms: directors, shareholders, registered address, SIC codes. £13 filing fee online. Penalties for late filing.', 'Company incorporated 5 March 2024. First confirmation statement due by 19 March 2025. Online filing takes 10 minutes, £13 fee. Confirms all details current. Late: £150+ penalties.', 'compliance', ARRAY['annual return', 'Companies House filing']),

('Registered Office', 'Official address of Limited Company on public record.', 'Must be UK address. All official mail sent here. Public on Companies House. Can be home address, accountant, or service address. Can change with fee.', 'Tech Ltd uses accountant office as registered address (£50/year service). Keeps home address private. All Companies House and HMRC letters sent there. Accountant forwards promptly.', 'structure', ARRAY['registered address', 'official address']),

('SIC Code', 'Standard Industrial Classification - codes describing company business activity.', 'Required on Companies House filing. Determines: industry statistics, some regulations, understanding business type. Multiple codes allowed. Choose most accurate.', 'Freelance designer sets up Ltd Company. Chooses SIC code 74100 (specialised design activities). This appears on public Companies House record describing business nature.', 'structure', ARRAY['business classification', 'industry code']),

('Goodwill', 'Intangible value of business beyond physical assets.', 'Brand reputation, customer relationships, location. Relevant when buying/selling business. Accountants value for business sale. Not normally on books until sale.', 'Cafe has £20,000 equipment, loyal customers, prime location, strong reputation. Business valued at £80,000. Goodwill: £60,000 (£80,000 - £20,000 assets). Buyer pays for intangibles.', 'general', ARRAY['business value', 'intangible assets']),

('Stock', 'Goods held for resale or materials for production.', 'Must value at year-end for accounts. Closing stock reduces Cost of Sales, increasing profit. Value at lower of cost or market value. Critical for accurate profit calculation.', 'Builder has £6,000 materials stock at year-end. Bought £50,000 materials during year. Cost of Sales: £44,000 (£50k - £6k closing stock). Missing this understates profit and tax.', 'general', ARRAY['inventory', 'stock-in-trade']),

('Cost of Sales', 'Direct costs of producing goods or services sold.', 'For manufacturers: materials, direct labor. For retailers: stock purchased. Appears before gross profit on P&L. Turnover minus CoS = Gross Profit.', 'Builder turnover £100,000. Materials £35,000, subcontractors £20,000. Cost of Sales: £55,000. Gross profit: £45,000 (45% margin). Overheads come off this to get net profit.', 'general', ARRAY['COGS', 'direct costs', 'cost of goods sold']),

('P&L', 'Profit and Loss statement showing income and expenses.', 'Also called income statement. Shows: turnover, cost of sales, gross profit, expenses, net profit. Usually covers one year. Essential for understanding business performance.', 'Annual P&L: Sales £120,000, CoS £48,000, Gross profit £72,000, Overheads £38,000, Net profit £34,000. Tax due on £34,000. Shows business made 28% net margin.', 'general', ARRAY['profit and loss', 'income statement', 'P&L account']),

('Balance Sheet', 'Snapshot of business assets, liabilities and equity at point in time.', 'Assets (what you own) = Liabilities (what you owe) + Equity (net worth). Shows financial position. Ltd Companies must file this with accounts. Different from P&L (which shows period).', 'Year-end balance sheet: Assets £50,000 (£15,000 bank, £20,000 equipment, £15,000 owed by customers), Liabilities £12,000 (suppliers owed), Equity £38,000 (net worth).', 'general', ARRAY['statement of financial position']),

('Equity', 'Net worth of business - assets minus liabilities.', 'For sole traders: capital account. For companies: share capital plus retained profits. Increases with profits, decreases with losses or drawings. Owners stake in business.', 'Company has £80,000 assets, £30,000 liabilities. Equity: £50,000. This belongs to shareholders. Represents: original investment plus accumulated profits not paid as dividends.', 'general', ARRAY['net worth', 'owners equity', 'capital']);

-- Add trigger to search synonyms
CREATE INDEX idx_glossary_synonyms ON glossary_terms USING GIN(synonyms);