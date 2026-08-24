

document.addEventListener("DOMContentLoaded", () => {
  // ---- state ------
  let currentPhotos = [];   // last-loaded gallery results
  let currentIndex = -1;    // index into currentPhotos
  let currentCategory = "portrait";
  let swipeCleanup = null;

  // ---- element refs 
  const galleryGrid = document.getElementById("gallery-grid");
  const galleryView = document.getElementById("gallery-view");
  const detailView = document.getElementById("detail-view");
  const detailContent = document.getElementById("detail-content");
  const detailCloseBtn = document.getElementById("detail-close-btn");
  const categoryButtons = document.querySelectorAll("[data-category]");
  const bookingForm = document.getElementById("booking-form");
  const bookingFeedback = document.getElementById("booking-feedback");
  const bookingList = document.getElementById("booking-list");

  // ---- gallery / drill-down --------

  async function loadCategory(categoryKey) {
    currentCategory = categoryKey;
    LensCraftRender.renderLoading(galleryGrid);

    try {
      currentPhotos = await LensCraftAPI.searchPhotos(categoryKey);
      LensCraftRender.renderGallery(galleryGrid, currentPhotos, openDetail);
    } catch (err) {
      LensCraftRender.renderError(galleryGrid, err.message);
    }
  }

  async function openDetail(photoId) {
    currentIndex = currentPhotos.findIndex((p) => p.id === photoId);
    showView(detailView);

    LensCraftRender.renderLoading(detailContent);

    try {
      const detail = await LensCraftAPI.getPhotoDetail(photoId);
      LensCraftRender.renderPhotoDetail(detailContent, detail);
      setupDetailGestures();
    } catch (err) {
      LensCraftRender.renderError(detailContent, err.message);
    }
  }

  function setupDetailGestures() {
    if (swipeCleanup) swipeCleanup(); // remove past liusteners

    swipeCleanup = LensCraftGestures.attachSwipe(detailView, {
      onSwipeLeft: showNextPhoto,
      onSwipeRight: showPrevPhoto,
      onSwipeDown: closeDetail,
    });
  }

  function showNextPhoto() {
    if (currentIndex < currentPhotos.length - 1) {
      openDetail(currentPhotos[currentIndex + 1].id);
    }
  }

  function showPrevPhoto() {
    if (currentIndex > 0) {
      openDetail(currentPhotos[currentIndex - 1].id);
    }
  }

  function closeDetail() {
    if (swipeCleanup) swipeCleanup();
    showView(galleryView);
  }

  function showView(viewEl) {
    [galleryView, detailView].forEach((v) => v.classList.add("hidden"));
    viewEl.classList.remove("hidden");
  }

  // ---- booking ------

  function renderBookingList() {
    const bookings = LensCraftBooking.getBookings();
    if (!bookingList) return;

    if (bookings.length === 0) {
      bookingList.innerHTML = `<p>No sessions booked yet.</p>`;
      return;
    }

    bookingList.innerHTML = bookings
      .map(
        (b) => `
        <div class="booking-item" data-booking-id="${b.id}">
          <strong>${b.sessionType}</strong> — ${b.date}<br>
          ${b.name} (${b.email})
          <button type="button" class="booking-item__cancel" data-cancel-id="${b.id}">Cancel</button>
        </div>`
      )
      .join("");
  }

  function handleBookingSubmit(e) {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(bookingForm).entries());
    const result = LensCraftBooking.saveBooking(formData);

    if (!result.ok) {
      bookingFeedback.textContent = result.errors.join(" ");
      bookingFeedback.className = "booking-feedback booking-feedback--error";
      return;
    }

    bookingFeedback.textContent = "Session booked! We'll be in touch to confirm.";
    bookingFeedback.className = "booking-feedback booking-feedback--success";
    bookingForm.reset();
    renderBookingList();
  }

  // ---- wire up events --------
  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => loadCategory(btn.dataset.category));
  });

  if (detailCloseBtn) detailCloseBtn.addEventListener("click", closeDetail);

  if (bookingForm) bookingForm.addEventListener("submit", handleBookingSubmit);

  if (bookingList) {
    bookingList.addEventListener("click", (e) => {
      const cancelId = e.target.dataset.cancelId;
      if (cancelId) {
        LensCraftBooking.deleteBooking(cancelId);
        renderBookingList();
      }
    });
  }

  // ---- init ----------------
  loadCategory(currentCategory);
  renderBookingList();
});
