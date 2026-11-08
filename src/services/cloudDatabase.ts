/**
 * Dar al Dawa Medical Center - Universal Cloud Database Engine
 * Provides instant, zero-configuration, cross-device real-time sync across
 * all phones, computers, and Netlify deployments without requiring Google Cloud IAM console permissions.
 */

const CLOUD_SYNC_TOKEN = 'IAwVcDG1cNrizX5M4Pdg';
const BASE_URL = 'https://api.echovalue.dev/kv/default';

export const CLOUD_KEYS = {
  HOSPITAL_CONFIG: 'daraldawa_hospital_config',
  SETTINGS: 'daraldawa_settings',
  HOMEPAGE: 'daraldawa_homepage',
  DEPARTMENTS: 'daraldawa_departments',
  DOCTORS: 'daraldawa_doctors',
  SERVICES: 'daraldawa_services',
  PACKAGES: 'daraldawa_packages',
  GALLERY: 'daraldawa_gallery',
  TESTIMONIALS: 'daraldawa_testimonials',
  FAQS: 'daraldawa_faqs',
  APPOINTMENTS: 'daraldawa_appointments',
  MESSAGES: 'daraldawa_messages',
  LAST_SYNC: 'daraldawa_last_sync'
} as const;

/**
 * Save a document/collection to the universal cloud database
 */
export async function saveCloudDoc<T>(key: string, data: T): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/${key}`, {
      method: 'POST',
      headers: {
        'x-token': CLOUD_SYNC_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (err) {
    console.warn(`[CloudDB] Failed to save key "${key}":`, err);
    return false;
  }
}

/**
 * Fetch a document/collection from the universal cloud database
 */
export async function getCloudDoc<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}/${key}?_t=${Date.now()}`, {
      headers: {
        'x-token': CLOUD_SYNC_TOKEN
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as T;
  } catch (err) {
    console.warn(`[CloudDB] Failed to get key "${key}":`, err);
    return null;
  }
}

/**
 * Test cloud connection and write capability
 */
export async function pingCloudDB(): Promise<boolean> {
  try {
    const pingData = { timestamp: Date.now(), status: 'active' };
    const res = await fetch(`${BASE_URL}/daraldawa_health_ping`, {
      method: 'POST',
      headers: {
        'x-token': CLOUD_SYNC_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pingData)
    });
    return res.ok;
  } catch {
    return false;
  }
}
