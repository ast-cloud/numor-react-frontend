/** Numbered buttons shown before an ellipsis is used instead. */
export const PAGE_WINDOW = 5;

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

/**
 * The page numbers to render, with `null` standing in for an ellipsis.
 *
 * Both ends stay reachable, and the run nearest the current page is kept
 * contiguous - an ellipsis that hid a single page would take more room than the
 * page it replaced.
 *
 *   buildPageItems(5, 99)  ->  1 2 3 4 5 … 99
 *   buildPageItems(50, 99) ->  1 … 49 50 51 … 99
 *   buildPageItems(97, 99) ->  1 … 95 96 97 98 99
 */
export function buildPageItems(current: number, totalPages: number): (number | null)[] {
  if (totalPages <= 0) return [];

  // Few enough pages that every one of them fits.
  if (totalPages <= PAGE_WINDOW + 2) return range(1, totalPages);

  // Near the start: a leading run, one gap, then the last page.
  if (current <= PAGE_WINDOW) return [...range(1, PAGE_WINDOW), null, totalPages];

  // Near the end: the mirror of the above.
  if (current > totalPages - PAGE_WINDOW) {
    return [1, null, ...range(totalPages - PAGE_WINDOW + 1, totalPages)];
  }

  // Somewhere in the middle: the current page and its immediate neighbours.
  return [1, null, current - 1, current, current + 1, null, totalPages];
}
