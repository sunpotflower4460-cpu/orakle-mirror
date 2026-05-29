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
  'sidebar.title': 'Archive',
  'sidebar.empty': 'No reflections yet',
  'sidebar.emptyHint': 'Your conversations with the mirror\nwill be quietly recorded here.',
  'subscription.title': 'Subscription',
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
  'subscribe.body': 'The free plan allows up to {limit} uses per day.\nWith a monthly subscription, you can use Oracle Mirror without a daily limit for the duration of your subscription.',
  'subscribe.monthly': '{price} / month',
  'subscribe.autoRenew': 'Auto-renewable monthly subscription',
  'subscribe.cta': 'Subscribe monthly',
  'subscribe.processing': 'Processing…',
  'subscribe.later': 'Not now (return tomorrow)',
  'subscribe.restore': 'Restore purchase',
  'subscribe.unlocked': 'Premium plan activated',
  'subscribe.restored': 'Purchase restored',
  'subscribe.noRestore': 'No purchases to restore',
  'subscribe.purchaseFailed': 'The purchase could not be completed',
  'subscribe.restoreFailed': 'The restore could not be completed',
  'subscribe.subscriptionNote': 'Subscription renews monthly. You can cancel anytime from your App Store account settings.',

  // Help modal
  'help.title': 'Mirror Guide',
  'help.channelsTitle': 'Channels — purpose of the dialogue',
  'help.oraclesTitle': 'Oracles — voices of the mirror',
  'help.disclaimerTitle': '[Disclaimer]',
  'help.disclaimerBody': 'The oracles and card readings in this app are for entertainment and self-reflection. They are not a substitute for professional medical, legal, or financial advice.',
  'help.disclaimerNote': '* Switching personas (regenerating from another view) also counts as one use.',
  'help.terms': 'Terms of Use',
  'help.privacy': 'Privacy Policy',
  'help.support': 'Contact / Support',
  'help.back': 'Return to the mirror',
  'help.language': 'Language',
  'help.deleteAllHistory': 'Delete all conversation history',
  'help.deleteAllHistoryConfirm': 'Delete all conversation history?\nThis cannot be undone.',

  // Error boundary
  'errorBoundary.title': 'An unexpected error occurred',
  'errorBoundary.body': 'Please reload the app.',
  'errorBoundary.reload': 'Reload',

  // Onboarding (first-run)
  'onboarding.concept.title': 'A mirror for your inner voice',
  'onboarding.concept.body': "Oracle Mirror isn't a fortune-teller that hands you answers — it quietly reflects the voice already within you.",
  'onboarding.persona.title': 'Choose your mirror',
  'onboarding.persona.body': 'Three mirrors reflect you in different light.\nYou can switch between them anytime.',
  'onboarding.mode.title': 'How the dialogue flows',
  'onboarding.mode.body': 'Choose one of two ways to receive your answer.',
  'onboarding.ready.title': 'You are ready',
  'onboarding.ready.body': 'Offer the question on your heart, gently, to the mirror.',
  'onboarding.disclaimer': 'Oracle Mirror is for entertainment and self-reflection. It is not intended for medical, legal, financial, or emergency decisions. Please consult a qualified professional when needed.',
  'onboarding.next': 'Next',
  'onboarding.back': 'Back',
  'onboarding.skip': 'Skip',
  'onboarding.begin': 'Open the mirror',
  'onboarding.progress': '{current} / {total}',

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
  'cards.drawnTitle': 'Revealed Cards',

  // Language names
  'language.ja': '日本語',
  'language.en': 'English',
};
