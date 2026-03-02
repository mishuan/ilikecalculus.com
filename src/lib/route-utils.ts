const WORKS_SLIDESHOW_PATH_PATTERN = /^\/works\/[^/]+\/[^/]+\/?$/;

export function isWorksSlideshowPath(pathname: string) {
  return WORKS_SLIDESHOW_PATH_PATTERN.test(pathname);
}
