export type Product = {
  id: number;
  name: string;
  href: string;
  kind: string;
  imageSrc: string;
  imageAlt: string;
  price: string;
  color: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Collage",
    href: "/collage/mug",
    kind: "mug",
    imageSrc: "/products/collage/mug.png",
    imageAlt: "Your GPS tracks merged into a collage",
    price: "€15",
    color: "Your GPS tracks merged into a unique collage",
  },
  {
    id: 2,
    name: "Heatmap",
    kind: "mug",
    href: "/heatmap/mug",
    imageSrc: "/products/heatmap/mug.png",
    imageAlt: "Your activity time plotted as a heatmap",
    price: "€15",
    color: "Your activity time plotted as a unique heatmap",
  },
  {
    id: 1,
    name: "Collage",
    href: "/collage/poster",
    kind: "poster",
    imageSrc: "/products/collage/poster.png",
    imageAlt: "Your GPS tracks merged into a collage",
    price: "€15",
    color: "Your GPS tracks merged into a unique collage",
  },
  {
    id: 2,
    name: "Heatmap",
    kind: "poster",
    href: "/heatmap/poster",
    imageSrc: "/products/heatmap/poster.png",
    imageAlt: "Your activity time plotted as a heatmap",
    price: "€15",
    color: "Your activity time plotted as a unique heatmap",
  },
];

export const productMapping = {};
