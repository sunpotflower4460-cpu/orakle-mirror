
export const clip = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text); return true;
    }
    const el = document.createElement('textarea');
    el.value = text; el.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(el); el.select();
    const ok = document.execCommand('copy'); 
    document.body.removeChild(el); 
    return ok;
  } catch (e) { 
    console.warn('Clipboard copy failed', e); 
    return false; 
  }
};
