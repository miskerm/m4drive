'use client'

const STORAGE_KEY = 'drivoprep.device.id'

function describeDevice(userAgent: string, deviceId: string) {
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /OPR\//.test(userAgent)
      ? 'Opera'
      : /Chrome\//.test(userAgent)
        ? 'Chrome'
        : /Firefox\//.test(userAgent)
          ? 'Firefox'
          : /Safari\//.test(userAgent)
            ? 'Safari'
            : 'Browser'

  const os = /Android/.test(userAgent)
    ? 'Android'
    : /iPhone|iPad|iPod/.test(userAgent)
      ? 'iOS'
      : /Windows/.test(userAgent)
        ? 'Windows'
        : /Mac OS X/.test(userAgent)
          ? 'macOS'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : 'Unknown OS'

  const suffix = deviceId.slice(-4)
  return suffix ? `${browser} · ${os} · ${suffix}` : `${browser} · ${os}`
}

function createDeviceId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch {
    // fall through to the random id below
  }
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * A stable per-browser identity. Stored in localStorage so the same device is
 * recognised across logins, while a different browser or phone gets a new id.
 */
export function getDeviceIdentity() {
  const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent
  let deviceId = ''

  try {
    deviceId = window.localStorage.getItem(STORAGE_KEY) ?? ''
    if (!deviceId) {
      deviceId = createDeviceId()
      window.localStorage.setItem(STORAGE_KEY, deviceId)
    }
  } catch {
    if (!deviceId) deviceId = createDeviceId()
  }

  return { deviceId, label: describeDevice(userAgent, deviceId), userAgent }
}
