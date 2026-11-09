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
  const textParam = message ? `&text=${encodeURIComponent(message)}` : '';
  // api.whatsapp.com/send carries phone directly as query param so number is never lost
  return `https://api.whatsapp.com/send?phone=${number}${textParam}`;
};

/**
 * Universally triggers WhatsApp on the VERY FIRST click across iOS, Android, and Desktop.
 * Prevents mobile browsers from opening a blank _blank tab that blocks the WhatsApp native intent.
 */
export const triggerWhatsApp = (input?: string, message?: string, event?: React.SyntheticEvent) => {
  if (event) {
    try {
      event.preventDefault();
      event.stopPropagation();
    } catch {
      // ignore
    }
  }

  const number = cleanWhatsAppNumber(input);
  const text = message || 'Hello Dar al Dawa Medical Center Lahore, I have an inquiry';
  const encodedText = encodeURIComponent(text);

  // Check if user is on mobile or tablet device
  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    // 1st Priority on Mobile: whatsapp://send opens native app instantly on 1st click
    const nativeScheme = `whatsapp://send?phone=${number}&text=${encodedText}`;
    const webFallback = `https://api.whatsapp.com/send?phone=${number}&text=${encodedText}`;

    // Directly trigger native app handoff
    window.location.href = nativeScheme;

    // Safety fallback: if native app isn't installed, redirect to web endpoint after 1.2s
    setTimeout(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        window.location.href = webFallback;
      }
    }, 1200);
  } else {
    // Desktop: Open api.whatsapp.com directly in a new tab
    const desktopUrl = `https://api.whatsapp.com/send?phone=${number}&text=${encodedText}`;
    window.open(desktopUrl, '_blank', 'noopener,noreferrer');
  }
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
