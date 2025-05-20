/**
 * Ensures that an image URL is absolute (includes the domain)
 * @param {string} url - The image URL or path
 * @returns {string} - The absolute URL
 */
export const getAbsoluteImageUrl = (url) => {
  if (!url) return '';
  
  // If the URL already starts with http:// or https://, it's already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If the URL starts with a slash, it's a relative URL from the root
  if (url.startsWith('/')) {
    return `http://localhost:8000${url}`;
  }
  
  // Otherwise, it's a relative URL from the current path
  return `http://localhost:8000/${url}`;
};
