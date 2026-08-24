

const LensCraftAPI = (() => {
  /**
   * Search for photos 
  
  
   * @param {string} categoryKey - 
   * @param {number} page
   * @returns {Promise<Array<Object>>}
   */
  async function searchPhotos(categoryKey, page = 1) {
    const query = CONFIG.CATEGORIES[categoryKey] || categoryKey;
    const url = `${CONFIG.BASE_URL}/search/photos` +
      `?query=${encodeURIComponent(query)}` +
      `&page=${page}` +
      `&per_page=${CONFIG.PER_PAGE}` +
      `&client_id=${CONFIG.ACCESS_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Unsplash search failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

   
    return data.results.map(mapPhotoSummary);
  }

  /**
   
   * @param {string} photoId
   * @returns {Promise<Object>} 
   */
  async function getPhotoDetail(photoId) {
    const url = `${CONFIG.BASE_URL}/photos/${photoId}` +
      `?client_id=${CONFIG.ACCESS_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Unsplash photo detail failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return mapPhotoDetail(data);
  }

  // ---- internal mappers -------------------------------------------------

  function mapPhotoSummary(photo) {
    return {
      id: photo.id,
      thumbUrl: photo.urls.small,
      fullUrl: photo.urls.regular,
      alt: photo.alt_description || "Untitled photo",
      photographer: photo.user?.name || "Unknown",
      likes: photo.likes,
    };
  }

  function mapPhotoDetail(photo) {
    return {
      id: photo.id,
      fullUrl: photo.urls.regular,
      rawUrl: photo.urls.full,
      alt: photo.alt_description || "Untitled photo",
      description: photo.description || photo.alt_description || "No description provided.",
      photographer: photo.user?.name || "Unknown",
      photographerUsername: photo.user?.username || "",
      photographerProfileUrl: photo.user?.links?.html || "#",
      likes: photo.likes,
      downloads: photo.downloads ?? null,
      tags: (photo.tags || []).map((t) => t.title).filter(Boolean),
      createdAt: photo.created_at,
      location: photo.location?.name || null,
    };
  }

  return { searchPhotos, getPhotoDetail };
})();
