// booking.js


const LensCraftBooking = (() => {
  /**
   * @typedef {Object} Booking
   * @property {string} id
   * @property {string} name
   * @property {string} email
   * @property {string} sessionType 
   * @property {string} date 
   * @property {string} notes
   * @property {string} createdAt 
   */

  function getBookings() {
    const raw = localStorage.getItem(CONFIG.BOOKINGS_STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      console.error("Corrupt bookings data in localStorage — resetting.");
      return [];
    }
  }

  /**
   * Validate and save a new booking.
   * @param {{name: string, email: string, sessionType: string, date: string, notes?: string}} formData
   * @returns {{ok: true, booking: Booking} | {ok: false, errors: string[]}}
   */
  function saveBooking(formData) {
    const errors = validateBooking(formData);
    if (errors.length > 0) {
      return { ok: false, errors };
    }

    const booking = {
      id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      sessionType: formData.sessionType,
      date: formData.date,
      notes: (formData.notes || "").trim(),
      createdAt: new Date().toISOString(),
    };

    const bookings = getBookings();
    bookings.push(booking);
    localStorage.setItem(CONFIG.BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));

    return { ok: true, booking };
  }

  function deleteBooking(bookingId) {
    const bookings = getBookings().filter((b) => b.id !== bookingId);
    localStorage.setItem(CONFIG.BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  }

  function validateBooking(formData) {
    const errors = [];

    if (!formData.name || formData.name.trim().length < 2) {
      errors.push("Please enter your full name.");
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please enter a valid email address.");
    }
    if (!formData.sessionType) {
      errors.push("Please choose a session type.");
    }
    if (!formData.date) {
      errors.push("Please choose a date.");
    } else {
      const chosenDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosenDate < today) {
        errors.push("Please choose a date in the future.");
      }
    }

    return errors;
  }

  return { getBookings, saveBooking, deleteBooking, validateBooking };
})();
