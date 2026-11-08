/** Ask the Contact section to open the inline booking calendar (it also scrolls there). */
export const openBooking = () => {
  window.dispatchEvent(new CustomEvent('mfs-book'));
  // if Contact has not mounted its listener yet (it always has), fall back to the anchor
  if (!document.getElementById('contact')) location.hash = '#contact';
};
