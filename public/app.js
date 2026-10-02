import { QUESTIONS, assess } from './logic.js';

const $ = s => document.querySelector(s);
let i = 0, answers = {};

const RESULTS = {
  red: {
    badge: '🔴 Professional Evaluation Recommended',
    title: 'Your answers indicate a breast change that should be assessed by a healthcare professional.',
    body: `<p>This result does <strong>not</strong> mean that you have breast cancer. Many breast changes have causes other than cancer. However, a new or unusual breast change should not be ignored.</p>
           <p><strong>Recommended next step:</strong> Arrange an appropriate clinical evaluation with a qualified healthcare professional.</p>`,
    btn: ['📍 Find Healthcare Support', '#support'],
  },
  yellow: {
    badge: '🟡 Discuss Your Risk & Screening',
    title: 'You may benefit from discussing your individual breast-cancer risk and screening needs with a healthcare professional.',
    body: `<p>Your answers do not diagnose breast cancer. A healthcare professional can consider your personal and family history and recommend appropriate screening or further assessment.</p>`,
    btn: ['💬 Speak to a Pharmacist / Healthcare Professional', '#support'],
  },
  green: {
    badge: '🟢 No Concerning Findings Reported',
    title: 'No concerning breast symptoms were identified from your answers.',
    body: `<p>Continue to be aware of changes in your breasts and follow screening recommendations appropriate for your age and individual risk.</p>
           <p><strong>Important:</strong> A questionnaire cannot rule out breast cancer. If you notice a new or unusual breast change in the future, seek professional medical advice.</p>`,
    btn: ['📖 Learn About Breast Health', '#breast-health'],
  },
};

function render() {
  const q = QUESTIONS[i];
  $('#q-bar').style.width = `${(i / QUESTIONS.length) * 100}%`;
  $('#q-progress').textContent = `Question ${i + 1} of ${QUESTIONS.length}`;
  $('#q-section').textContent = q.section;
  $('#q-text').textContent = q.text;
  $('#q-why').textContent = q.why ? `Why we ask: ${q.why}` : '';
  $('#q-why').hidden = !q.why;
  $('#q-options').replaceChildren(...q.options.map(([v, text]) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.textContent = text;
    b.setAttribute('aria-pressed', answers[q.id] === v);
    b.onclick = () => {
      answers[q.id] = v;
      if (i < QUESTIONS.length - 1) { i++; render(); } else finish();
    };
    return b;
  }));
  $('#q-back').hidden = i === 0;
  $('#q-text').focus({ preventScroll: true });
}

function finish() {
  const { pathway, reasons } = assess(answers);
  const r = RESULTS[pathway];
  $('#r-card').className = `result ${pathway}`;
  $('#r-badge').textContent = r.badge;
  $('#r-title').textContent = r.title;
  $('#r-body').innerHTML = r.body;
  $('#r-btn').textContent = r.btn[0];
  $('#r-btn').href = r.btn[1];
  $('#r-why').replaceChildren(...(reasons.length ? reasons : ['No warning signs or major risk factors were reported.'])
    .map(t => Object.assign(document.createElement('li'), { textContent: t })));
  $('#r-screening').hidden = answers.q15 !== 'yes';
  $('#no-result').hidden = true;
  $('#result').hidden = false;
  $('#quiz').hidden = true;
  $('#intro').hidden = false;
  $('#start').textContent = 'Retake Assessment →';
  location.hash = 'results';

  if ($('#consent').checked) {
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ answers }),
    }).catch(() => {}); // saving is best-effort; the result is already shown
  }
}

function start() {
  i = 0; answers = {};
  $('#intro').hidden = true;
  $('#quiz').hidden = false;
  render();
  $('#check').scrollIntoView({ behavior: 'smooth' });
}

$('#start').onclick = start;
$('#restart').onclick = start;
$('#q-back').onclick = () => { i--; render(); };

const menu = $('.menu');
menu.onclick = () => menu.setAttribute('aria-expanded', menu.getAttribute('aria-expanded') !== 'true');
document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => menu.setAttribute('aria-expanded', 'false')));
