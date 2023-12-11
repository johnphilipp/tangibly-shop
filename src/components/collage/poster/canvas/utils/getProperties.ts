export function getProperties(n: number) {
  return (function () {
    if (n <= 25) {
      return { cellMargin: 28, strokeWidth: 28 };
    } else if (n <= 50) {
      return { cellMargin: 24, strokeWidth: 24 };
    } else if (n <= 100) {
      return { cellMargin: 20, strokeWidth: 20 };
    } else if (n <= 200) {
      return { cellMargin: 16, strokeWidth: 16 };
    } else if (n <= 400) {
      return { cellMargin: 14, strokeWidth: 14 };
    } else if (n <= 600) {
      return { cellMargin: 12, strokeWidth: 12 };
    } else {
      return { cellMargin: 10, strokeWidth: 10 };
    }
  })();
}
