export function getProperties(n: number) {
  return (function () {
    if (n <= 25) {
      return { cellMargin: 14, strokeWidth: 14 };
    } else if (n <= 50) {
      return { cellMargin: 12, strokeWidth: 12 };
    } else if (n <= 100) {
      return { cellMargin: 10, strokeWidth: 10 };
    } else if (n <= 200) {
      return { cellMargin: 8, strokeWidth: 8 };
    } else if (n <= 400) {
      return { cellMargin: 7, strokeWidth: 7 };
    } else if (n <= 600) {
      return { cellMargin: 6, strokeWidth: 6 };
    } else {
      return { cellMargin: 5, strokeWidth: 5 };
    }
  })();
}
