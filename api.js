

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
   * Search for designers by name.
   *
   * @param {string} query
   * @param {number} page
   * @returns {Promise<Array<Object>>}
   */
  async function searchUsers(query, page = 1) {
    const url = `${CONFIG.BASE_URL}/search/users` +
      `?query=${encodeURIComponent(query)}` +
      `&page=${page}` +
      `&per_page=${CONFIG.PER_PAGE}` +
      `&client_id=${CONFIG.ACCESS_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Unsplash designer search failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results.map(mapUserSummary);
  }

  /**
   * Fetch a single designer's public profile.
   *
   * @param {string} username
   * @returns {Promise<Object>}
   */
  async function getUserDetail(username) {
    const url = `${CONFIG.BASE_URL}/users/${encodeURIComponent(username)}` +
      `?client_id=${CONFIG.ACCESS_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Unsplash designer detail failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return mapUserDetail(data);
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
      photographerUsername: photo.user?.username || "",
      likes: photo.likes,
    };
  }

  function mapUserSummary(user) {
    return {
      username: user.username,
      name: user.name || user.username || "Unnamed designer",
      profileUrl: user.links?.html || "#",
      avatarUrl: user.profile_image?.small || "",
      photos: user.total_photos ?? 0,
    };
  }

  function mapUserDetail(user) {
    return {
      username: user.username,
      name: user.name || user.username || "Unnamed designer",
      bio: user.bio || "",
      location: user.location || "",
      profileUrl: user.links?.html || "#",
      portfolioUrl: user.portfolio_url || "",
      avatarUrl: user.profile_image?.large || user.profile_image?.medium || "",
      totalPhotos: user.total_photos ?? 0,
      totalLikes: user.total_likes ?? 0,
      totalCollections: user.total_collections ?? 0,
      instagram: user.instagram_username || "",
      twitter: user.twitter_username || "",
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

  return { searchPhotos, searchUsers, getUserDetail, getPhotoDetail };
})();
