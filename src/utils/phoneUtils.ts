/**
 * Universal Phone & WhatsApp Formatter for Dar al Dawa Medical Center
 * Automatically cleans and standardizes phone inputs across devices.
 */

export const cleanWhatsAppNumber = (input?: string): string => {
  if (!input) return '923001234567';
  let cleaned = input.replace(/\D/g, '');
  if (cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  } else if (cleaned.startsWith('0092')) {
    cleaned = cleaned.substring(2);
  }
  return cleaned || '923001234567';
};

export const formatWhatsAppLink = (input?: string, message?: string): string => {
  const number = cleanWhatsAppNumber(input);
  const textParam = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${number}${textParam}`;
};

export const formatTelLink = (input?: string): string => {
  if (!input) return 'tel:042111327227';
  const clean = input.replace(/\b1122\b/g, '').replace(/[\s-]/g, '');
  return `tel:${clean || '042111327227'}`;
};

export const formatDisplayPhone = (input?: string): string => {
  if (!input) return '042-111-327-227';
  return input.replace(/\b1122\b/g, '').replace(/\s*\/\s*/g, '').trim() || '042-111-327-227';
};

export const cleanPhoneEmergency = (input?: string): string => {
  if (!input) return '042111327227';
  return input.replace(/\b1122\b/g, '').replace(/[\s-]/g, '') || '042111327227';
};
