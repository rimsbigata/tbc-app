/**
 * Local Storage Sync Layer
 * Provides optimistic local updates with background Supabase sync
 */

const STORAGE_KEYS = {
  PLAYERS: 'tbc_players',
  COURTS: 'tbc_courts',
  MATCHES: 'tbc_matches',
  FEES: 'tbc_fees',
  PAYMENT_METHODS: 'tbc_payment_methods',
  SESSIONS: 'tbc_sessions',
  SESSION_PARTICIPATIONS: 'tbc_session_participations',
  WINNING_SCORE: 'tbc_winning_score',
  AUTO_ADVANCE: 'tbc_auto_advance',
  LAST_SYNC: 'tbc_last_sync'
};

export interface LocalStorageData {
  players: any[];
  courts: any[];
  matches: any[];
  fees: any[];
  paymentMethods: any[];
  sessions: any[];
  sessionParticipations: any[];
  defaultWinningScore: number;
  autoAdvanceEnabled: boolean;
  lastSync: number | null;
}

/**
 * Load data from local storage
 */
export function loadFromLocalStorage(): LocalStorageData {
  if (typeof window === 'undefined') {
    return {
      players: [],
      courts: [],
      matches: [],
      fees: [],
      paymentMethods: [],
      sessions: [],
      sessionParticipations: [],
      defaultWinningScore: 21,
      autoAdvanceEnabled: true,
      lastSync: null
    };
  }

  try {
    return {
      players: JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYERS) || '[]'),
      courts: JSON.parse(localStorage.getItem(STORAGE_KEYS.COURTS) || '[]'),
      matches: JSON.parse(localStorage.getItem(STORAGE_KEYS.MATCHES) || '[]'),
      fees: JSON.parse(localStorage.getItem(STORAGE_KEYS.FEES) || '[]'),
      paymentMethods: JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS) || '[]'),
      sessions: JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]'),
      sessionParticipations: JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_PARTICIPATIONS) || '[]'),
      defaultWinningScore: parseInt(localStorage.getItem(STORAGE_KEYS.WINNING_SCORE) || '21'),
      autoAdvanceEnabled: JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTO_ADVANCE) || 'true'),
      lastSync: parseInt(localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || '0') || null
    };
  } catch (error) {
    console.error('Error loading from local storage:', error);
    return {
      players: [],
      courts: [],
      matches: [],
      fees: [],
      paymentMethods: [],
      sessions: [],
      sessionParticipations: [],
      defaultWinningScore: 21,
      autoAdvanceEnabled: true,
      lastSync: null
    };
  }
}

/**
 * Save data to local storage
 */
export function saveToLocalStorage(data: Partial<LocalStorageData>) {
  if (typeof window === 'undefined') return;

  try {
    if (data.players !== undefined) localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(data.players));
    if (data.courts !== undefined) localStorage.setItem(STORAGE_KEYS.COURTS, JSON.stringify(data.courts));
    if (data.matches !== undefined) localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(data.matches));
    if (data.fees !== undefined) localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(data.fees));
    if (data.paymentMethods !== undefined) localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(data.paymentMethods));
    if (data.sessions !== undefined) localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
    if (data.sessionParticipations !== undefined) localStorage.setItem(STORAGE_KEYS.SESSION_PARTICIPATIONS, JSON.stringify(data.sessionParticipations));
    if (data.defaultWinningScore !== undefined) localStorage.setItem(STORAGE_KEYS.WINNING_SCORE, data.defaultWinningScore.toString());
    if (data.autoAdvanceEnabled !== undefined) localStorage.setItem(STORAGE_KEYS.AUTO_ADVANCE, JSON.stringify(data.autoAdvanceEnabled));
    if (data.lastSync !== undefined) localStorage.setItem(STORAGE_KEYS.LAST_SYNC, (data.lastSync || Date.now()).toString());
  } catch (error) {
    console.error('Error saving to local storage:', error);
  }
}

/**
 * Clear local storage
 */
export function clearLocalStorage() {
  if (typeof window === 'undefined') return;

  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Update last sync timestamp
 */
export function updateLastSync() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
}

/**
 * Get last sync timestamp
 */
export function getLastSync(): number | null {
  if (typeof window === 'undefined') return null;
  const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  return timestamp ? parseInt(timestamp) : null;
}
