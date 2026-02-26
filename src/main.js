import './style.css';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

// --- State Management ---
let entries = JSON.parse(localStorage.getItem('souljournal_entries')) || [];
let currentLang = localStorage.getItem('souljournal_lang') || 'en';
let selectedMood = null;

const TRANSLATIONS = {
  en: {
    title: "SoulJournal",
    newPrompt: "New Prompt",
    placeholder: "What's on your mind today?",
    saveBtn: "Save Entry",
    pastEntries: "Past Entries",
    noEntries: "No entries yet. Start writing your first one!",
    delete: "Delete",
    loadingPrompt: "Loading a thoughtful prompt...",
    prompts: [
      "What made you smile today?",
      "What is one thing you're looking forward to tomorrow?",
      "Describe a challenge you faced today and how you handled it.",
      "What are three things you're grateful for right now?",
      "How are you feeling in this moment, and why?",
      "What is a goal you're working toward?",
      "If you could change one thing about today, what would it be?",
      "What's a lesson you learned recently?",
      "Describe a peaceful moment you experienced today.",
      "What's a quote that inspired you lately?"
    ]
  },
  id: {
    title: "SoulJournal",
    newPrompt: "Prompt Baru",
    placeholder: "Apa yang sedang kamu pikirkan hari ini?",
    saveBtn: "Simpan Tulisan",
    pastEntries: "Tulisan Sebelumnya",
    noEntries: "Belum ada tulisan. Mulai tulis jurnal pertama kamu!",
    delete: "Hapus",
    loadingPrompt: "Memuat pertanyaan yang bermakna...",
    prompts: [
      "Apa yang membuatmu tersenyum hari ini?",
      "Apa satu hal yang kamu nantikan besok?",
      "Ceritakan tantangan yang kamu hadapi hari ini dan bagaimana kamu menanganinya.",
      "Apa tiga hal yang kamu syukuri saat ini?",
      "Bagaimana perasaanmu saat ini, dan mengapa?",
      "Apa tujuan yang sedang kamu usahakan?",
      "Jika kamu bisa mengubah satu hal tentang hari ini, apa itu?",
      "Apa pelajaran yang kamu dapatkan baru-baru ini?",
      "Gambarkan momen damai yang kamu alami hari ini.",
      "Apa kutipan yang menginspirasimu belakangan ini?"
    ]
  }
};

const COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6'  // Violet
];

// --- Selectors ---
const appTitle = document.querySelector('h1');
const promptEl = document.getElementById('current-prompt');
const refreshPromptBtn = document.getElementById('refresh-prompt');
const journalForm = document.getElementById('journal-form');
const journalInput = document.getElementById('journal-input');
const saveBtn = journalForm.querySelector('button');
const pastEntriesTitle = document.querySelector('#history-section h2');
const entriesListEl = document.getElementById('entries-list');
const noEntriesEl = document.getElementById('no-entries');
const langEnBtn = document.getElementById('lang-en');
const langIdBtn = document.getElementById('lang-id');
const moodBtns = document.querySelectorAll('.mood-btn');

// --- Functions ---

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function updateUI() {
  const t = TRANSLATIONS[currentLang];
  appTitle.textContent = t.title;
  refreshPromptBtn.textContent = t.newPrompt;
  journalInput.placeholder = t.placeholder;
  saveBtn.textContent = t.saveBtn;
  pastEntriesTitle.textContent = t.pastEntries;
  if (entries.length === 0) {
    noEntriesEl.textContent = t.noEntries;
  }

  // Update lang toggle active state
  langEnBtn.classList.toggle('active', currentLang === 'en');
  langIdBtn.classList.toggle('active', currentLang === 'id');

  renderEntries();
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('souljournal_lang', lang);
  updateUI();
  setRandomPrompt();
}

function setRandomPrompt() {
  const t = TRANSLATIONS[currentLang];
  promptEl.textContent = getRandomItem(t.prompts);
}

function selectMood(mood) {
  selectedMood = mood;
  moodBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mood === mood);
  });
}

function saveEntries() {
  localStorage.setItem('souljournal_entries', JSON.stringify(entries));
}

function createEntry(content) {
  const entry = {
    id: Date.now(),
    date: new Date().toLocaleDateString(currentLang === 'en' ? 'en-US' : 'id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    content: content,
    color: getRandomItem(COLORS),
    mood: selectedMood
  };

  entries.unshift(entry);
  saveEntries();
  renderEntries();
}

function deleteEntry(id) {
  entries = entries.filter(entry => entry.id !== id);
  saveEntries();
  renderEntries();
}

function renderEntries() {
  const t = TRANSLATIONS[currentLang];
  if (entries.length === 0) {
    noEntriesEl.style.display = 'block';
    noEntriesEl.textContent = t.noEntries;
    entriesListEl.innerHTML = '';
    return;
  }

  noEntriesEl.style.display = 'none';
  entriesListEl.innerHTML = entries.map(entry => `
    <div class="card entry-item fade-in" style="--accent-color: ${entry.color}">
      <div class="entry-header">
        <span>${entry.date} ${entry.mood ? `<span class="entry-mood">${entry.mood}</span>` : ''}</span>
        <button class="entry-delete" onclick="window.handleDelete(${entry.id})">${t.delete}</button>
      </div>
      <div class="entry-content">${entry.content}</div>
    </div>
  `).join('');
}

// --- Event Listeners ---

refreshPromptBtn.addEventListener('click', setRandomPrompt);

langEnBtn.addEventListener('click', () => setLanguage('en'));
langIdBtn.addEventListener('click', () => setLanguage('id'));

moodBtns.forEach(btn => {
  btn.addEventListener('click', () => selectMood(btn.dataset.mood));
});

journalForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const content = journalInput.value.trim();
  if (content) {
    createEntry(content);
    journalInput.value = '';
    selectedMood = null;
    moodBtns.forEach(btn => btn.classList.remove('active'));
    setRandomPrompt();
  }
});

// Expose delete to window for the onclick handler
window.handleDelete = deleteEntry;

// --- Initialization ---
updateUI();
setRandomPrompt();
renderEntries();
