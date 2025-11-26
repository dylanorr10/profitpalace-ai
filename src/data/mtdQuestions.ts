export interface MtdQuestion {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const mtdQuestions: MtdQuestion[] = [
  {
    id: "mtd-1",
    statement: "MTD stands for Making Tax Digital",
    isTrue: true,
    explanation: "Correct! MTD is HMRC's initiative to digitise the tax system.",
    difficulty: "easy"
  },
  {
    id: "mtd-2",
    statement: "All self-employed individuals must use MTD software regardless of income",
    isTrue: false,
    explanation: "False. Only those with income over £10,000 per year need to use MTD for Income Tax.",
    difficulty: "medium"
  },
  {
    id: "mtd-3",
    statement: "You can submit VAT returns using spreadsheets under MTD",
    isTrue: false,
    explanation: "False. MTD requires compatible software to submit VAT returns - spreadsheets alone aren't sufficient.",
    difficulty: "medium"
  },
  {
    id: "mtd-4",
    statement: "MTD for VAT is mandatory for all VAT-registered businesses",
    isTrue: true,
    explanation: "Correct! Since April 2022, all VAT-registered businesses must use MTD.",
    difficulty: "easy"
  },
  {
    id: "mtd-5",
    statement: "You need to keep digital records for at least 3 years under MTD",
    isTrue: false,
    explanation: "False. Digital records must be kept for at least 6 years (or 5 years plus current year).",
    difficulty: "hard"
  },
  {
    id: "mtd-6",
    statement: "Bridging software can connect non-compatible accounting systems to HMRC",
    isTrue: true,
    explanation: "Correct! Bridging software acts as a connector between your existing software and HMRC's systems.",
    difficulty: "medium"
  },
  {
    id: "mtd-7",
    statement: "You can manually type figures into HMRC's portal under MTD",
    isTrue: false,
    explanation: "False. MTD requires digital submission through compatible software - no manual entry.",
    difficulty: "easy"
  },
  {
    id: "mtd-8",
    statement: "MTD aims to reduce errors in tax reporting",
    isTrue: true,
    explanation: "Correct! One of MTD's main goals is to reduce errors through digital record-keeping.",
    difficulty: "easy"
  },
  {
    id: "mtd-9",
    statement: "Paper receipts are no longer acceptable evidence under MTD",
    isTrue: false,
    explanation: "False. You can still have paper receipts, but the records you submit must be kept digitally.",
    difficulty: "medium"
  },
  {
    id: "mtd-10",
    statement: "MTD for Corporation Tax is already mandatory",
    isTrue: false,
    explanation: "False. MTD for Corporation Tax is planned but not yet mandatory (as of 2024).",
    difficulty: "hard"
  },
  {
    id: "mtd-11",
    statement: "Quarterly updates are required under MTD for Income Tax",
    isTrue: true,
    explanation: "Correct! You need to submit quarterly updates plus an End of Period Statement.",
    difficulty: "medium"
  },
  {
    id: "mtd-12",
    statement: "Free software options are available for MTD compliance",
    isTrue: true,
    explanation: "Correct! Some software providers offer free versions for simple businesses.",
    difficulty: "easy"
  },
  {
    id: "mtd-13",
    statement: "You can be exempt from MTD if you're over 65",
    isTrue: false,
    explanation: "False. Age alone doesn't exempt you - only religious objections or digital exclusion qualify.",
    difficulty: "hard"
  },
  {
    id: "mtd-14",
    statement: "MTD requires real-time reporting to HMRC",
    isTrue: false,
    explanation: "False. It's not real-time - you submit quarterly updates and annual returns on set deadlines.",
    difficulty: "medium"
  },
  {
    id: "mtd-15",
    statement: "Compatible MTD software must connect directly to HMRC via API",
    isTrue: true,
    explanation: "Correct! MTD software must use HMRC's APIs to submit returns digitally.",
    difficulty: "hard"
  }
];
