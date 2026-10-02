// Shared by the browser (app.js) and the API (functions/api/submit.js) — single source of truth.

const YNU = [['yes', 'Yes'], ['no', 'No'], ['unsure', "I'm not sure"]];
const YNUP = [...YNU, ['na', 'Prefer not to say']];

export const QUESTIONS = [
  // Section A — About You
  { id: 'q1', section: 'About You', text: 'What is your age?',
    why: 'Age is relevant to breast-cancer risk and screening recommendations.',
    options: [['u25', 'Under 25'], ['25-39', '25–39'], ['40-49', '40–49'], ['50-59', '50–59'], ['60+', '60 or older'], ['na', 'Prefer not to say']] },
  { id: 'q2', section: 'About You', text: 'Have you ever been diagnosed with breast cancer?', options: YNU },

  // Section B — Symptoms
  { id: 'q3', section: 'Symptoms', text: 'Have you noticed a new lump or swelling in your breast or underarm?', options: YNU },
  { id: 'q4', section: 'Symptoms', text: 'Have you noticed a new change in the size or shape of one breast?', options: YNU },
  { id: 'q5', section: 'Symptoms', text: 'Have you noticed a change in the skin of your breast, such as dimpling, puckering, thickening, or an unusual texture?', options: YNU },
  { id: 'q6', section: 'Symptoms', text: 'Have you noticed a new change in the appearance or position of your nipple, such as new inversion?', options: YNU },
  { id: 'q7', section: 'Symptoms', text: 'Have you noticed unusual nipple discharge, particularly bloody or spontaneous discharge?', options: YNU },
  { id: 'q8', section: 'Symptoms', text: 'Have you noticed persistent redness, swelling, or another unusual change in one breast?', options: YNU },
  { id: 'q9', section: 'Symptoms', text: 'Have you noticed a persistent change in one area of your breast that is unusual for you?', options: YNU },

  // Section C — Risk Factors
  { id: 'q10', section: 'Risk Factors', text: 'Has a close family member, such as your mother, sister, or daughter, had breast or ovarian cancer?', options: YNUP },
  { id: 'q11', section: 'Risk Factors', text: 'Have you ever been told that you have a genetic mutation associated with increased breast-cancer risk, such as BRCA1 or BRCA2?', options: YNUP },
  { id: 'q12', section: 'Risk Factors', text: 'Have you previously had a breast biopsy or been diagnosed with a condition that increases breast-cancer risk?', options: YNUP },
  { id: 'q13', section: 'Risk Factors', text: 'Have you ever received radiation treatment to the chest area at a young age?', options: YNUP },

  // Section D — Screening & Awareness
  { id: 'q14', section: 'Screening & Awareness', text: 'When was your last breast-cancer screening examination, if you have had one?',
    options: [['lt1', 'Within the last year'], ['1-2', '1–2 years ago'], ['gt2', 'More than 2 years ago'], ['never', 'I have never had one'], ['unsure', "I'm not sure"], ['na', 'Not applicable']] },
  { id: 'q15', section: 'Screening & Awareness', text: 'Would you like to receive information about breast-cancer screening and when to discuss it with a healthcare professional?',
    options: [['yes', 'Yes'], ['no', 'No']] },
];

const SYMPTOMS = ['q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];
const RISKS = ['q10', 'q11', 'q12', 'q13'];
const label = id => QUESTIONS.find(q => q.id === id).text;

export function valid(a) {
  return !!a && typeof a === 'object' &&
    QUESTIONS.every(q => q.options.some(([v]) => v === a[q.id]));
}

// Rule-based, evidence-informed triage. Never a diagnosis, never a percentage.
// Returns { pathway: 'red' | 'yellow' | 'green', reasons: string[] }
export function assess(a) {
  const reasons = [];
  const yes = SYMPTOMS.filter(q => a[q] === 'yes');
  const unsure = SYMPTOMS.filter(q => a[q] === 'unsure');
  const risks = RISKS.filter(q => a[q] === 'yes');
  const overdue = ['40-49', '50-59', '60+'].includes(a.q1) && ['gt2', 'never'].includes(a.q14);

  yes.forEach(q => reasons.push(`You reported: “${label(q)}”`));
  unsure.forEach(q => reasons.push(`You were not sure about: “${label(q)}” — if you are unsure whether a change is new, have it checked.`));
  risks.forEach(q => reasons.push(`Risk factor reported: “${label(q)}”`));
  if (overdue) reasons.push('Based on your age, it may be time to discuss whether you are due for breast screening.');
  if (a.q2 === 'yes') reasons.push('You reported a previous breast-cancer diagnosis — please follow the follow-up plan from your care team.');

  const pathway = yes.length ? 'red'
    : (unsure.length || risks.length || overdue || a.q2 === 'yes') ? 'yellow'
    : 'green';
  return { pathway, reasons };
}
