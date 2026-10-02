export function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private mode or a full disk can reject storage. The in-memory copy still works for this visit.
  }
}

export function readSession(key: string): unknown {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

export function writeSession(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Session storage is a convenience. The form still works if it cannot be saved.
  }
}

export function clearSession(key: string) {
  try {
    sessionStorage.removeItem(key)
  } catch {
    // Ignore storage failures; the order flow does not depend on clearing the draft.
  }
}
