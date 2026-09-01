
const LensCraftRender = (() => {


  
  function renderGallery(container, photos, onPhotoTap) {
    container.innerHTML = "";

    if (!photos || photos.length === 0) {
      container.appendChild(renderEmptyState());
      return;
    }

    const fragment = document.createDocumentFragment();

    photos.forEach((photo) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "photo-card";
      card.dataset.photoId = photo.id;
      card.setAttribute("aria-label", `View details for photo by ${photo.photographer}`);

      card.innerHTML = `
        <img class="photo-card__img" src="${photo.thumbUrl}" alt="${escapeHtml(photo.alt)}" loading="lazy">
        <div class="photo-card__meta">
          <span class="photo-card__photographer">${escapeHtml(photo.photographer)}</span>
          <span class="photo-card__likes">♥ ${photo.likes}</span>
        </div>
      `;

      card.addEventListener("click", () => onPhotoTap(photo.id));
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  }

  /**
   .
   * @param {HTMLElement} container
   * @param {Object} detail - from LensCraftAPI.getPhotoDetail
   */
  function renderPhotoDetail(container, detail) {
    container.innerHTML = `
      <img class="detail__img" src="${detail.fullUrl}" alt="${escapeHtml(detail.alt)}">
      <div class="detail__body">
        <h2 class="detail__photographer">${escapeHtml(detail.photographer)}</h2>
        <p class="detail__description">${escapeHtml(detail.description)}</p>
        <ul class="detail__stats">
          <li>♥ ${detail.likes} likes</li>
          ${detail.downloads !== null ? `<li>${detail.downloads} downloads</li>` : ""}
          ${detail.location ? `<li>📍 ${escapeHtml(detail.location)}</li>` : ""}
        </ul>
        ${detail.tags.length ? renderTags(detail.tags) : ""}
        <a class="detail__credit" href="${detail.photographerProfileUrl}" target="_blank" rel="noopener">
          View photographer's profile
        </a>
      </div>
    `;
  }

  function renderTags(tags) {
    const items = tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
    return `<div class="detail__tags">${items}</div>`;
  }

  function renderEmptyState() {
    const el = document.createElement("p");
    el.className = "empty-state";
    el.textContent = "No photos found for this category yet — try another one.";
    return el;
  }

  function renderLoading(container) {
    container.innerHTML = `<p class="loading-state">Loading photos…</p>`;
  }

  function renderError(container, message) {
    container.innerHTML = `<p class="error-state">Something went wrong: ${escapeHtml(message)}</p>`;
  }


  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  return { renderGallery, renderPhotoDetail, renderLoading, renderError };
})();
