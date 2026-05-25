import type { ja } from './ja';

// English locale dictionary. Must mirror every key in `ja` (enforced by the type below).
// Tone goal: keep the calm, poetic, meditative voice of the app — not a literal translation.
export const en: Record<keyof typeof ja, string> = {
  // Accessibility (aria-label / title)
  'a11y.archive': 'Archive',
  'a11y.newRoom': 'New conversation',
  'a11y.deleteRoom': 'Delete conversation',
  'a11y.menu': 'Menu',
  'a11y.help': 'Help',
  'a11y.share': 'Share',
  'a11y.modeSelect': 'Select mode',
  'a11y.switchPersona': 'Switch to {name}',
  'a11y.selectPersona': 'Select {name}',
  'a11y.closeError': 'Dismiss error',
  'a11y.messageInput': 'Message input',
  'a11y.send': 'Send',
  'a11y.close': 'Close',
  'a11y.copyText': 'Copy text',
  'a11y.regenerateWith': 'Regenerate with {name}',
  'a11y.regenerateWithTitle': 'Regenerate from {name}’s view (uses 1)',

  // Sidebar / subscription
  'sidebar.empty': 'No reflections yet',
  'subscription.unlimited': 'Infinite guidance (unlocked)',
  'subscription.remainingToday': 'Remaining today',
  'subscription.remainingCount': '{count} left',
  'subscription.unlockPremium': 'Unlock Premium',

  // Status
  'status.receiving': 'Receiving the flow…',
  'status.received': 'The oracle has spoken',

  // Input
  'input.locked': 'Today’s oracle has closed',
  'input.placeholder': 'Offer your question to the mirror…',

  // Toast
  'toast.copied': 'Copied',
  'toast.copyFailed': 'Copy failed',
  'toast.questionNotFound': 'The original question could not be found',

  // Error
  'error.connection': 'A disturbance interrupted the connection',

  // Share
  'share.text': 'Through a pure mirror, hear your inner voice.',
  'share.dialogTitle': 'Share Oracle Mirror',

  // Subscribe modal
  'subscribe.priceLoading': 'Loading…',
  'subscribe.priceUnknown': 'Unavailable',
  'subscribe.priceError': 'Could not verify',
  'subscribe.title': 'Today’s guidance\nends here',
  'subscribe.body': 'The free mirror reflects {limit} times a day.\nWith a monthly plan,\nyour connection to the cosmos opens forever,\nand the oracle answers without limit.',
  'subscribe.monthly': '{price} / month',
  'subscribe.autoRenew': '(auto-renews)',
  'subscribe.cta': 'Unlock infinite guidance',
  'subscribe.processing': 'Processing…',
  'subscribe.later': 'Not now (return tomorrow)',
  'subscribe.restore': 'Restore purchase',
  'subscribe.unlocked': 'Infinite guidance unlocked',
  'subscribe.restored': 'Purchase restored',
  'subscribe.noRestore': 'No purchases to restore',
  'subscribe.purchaseFailed': 'The purchase could not be completed',
  'subscribe.restoreFailed': 'The restore could not be completed',

  // Help modal
  'help.channelsTitle': 'Channels — purpose of the dialogue',
  'help.oraclesTitle': 'Oracles — voices of the mirror',
  'help.disclaimerTitle': '[Disclaimer]',
  'help.disclaimerBody': 'The oracles and card readings in this app are for entertainment and self-reflection. They are not a substitute for professional medical, legal, or financial advice.',
  'help.disclaimerNote': '* Switching personas (regenerating from another view) also counts as one use.',
  'help.terms': 'Terms of Use',
  'help.privacy': 'Privacy Policy',
  'help.back': 'Return to the mirror',
  'help.language': 'Language',

  // Error boundary
  'errorBoundary.title': 'An unexpected error occurred',
  'errorBoundary.body': 'Please reload the app.',
  'errorBoundary.reload': 'Reload',

  // Personas (display)
  'persona.lumina.title': 'Embracing Love',
  'persona.zenith.title': 'Piercing Truth',
  'persona.archivist.title': 'Cosmic Perspective',
  'persona.lumina.guidance': 'A mirror of acceptance and healing. It gently holds your emotions and offers reassurance.',
  'persona.zenith.guidance': 'A mirror of conviction and protection. It cuts through hesitation and points to what must be done now.',
  'persona.archivist.guidance': 'A mirror of objectivity and intellect. It reads cosmic laws and symbols from a higher vantage.',

  // Modes (display)
  'mode.pure.name': 'Pure Channel',
  'mode.card.name': 'Card Reading',
  'mode.pure.guidance': 'Let go of logic and receive poetic, abstract messages. For when you want to immerse in feeling.',
  'mode.card.guidance': 'Draw inspiration from symbols (cards) and let their resonance become words.',

  // Language names
  'language.ja': '日本語',
  'language.en': 'English',
};
