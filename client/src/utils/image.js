const PLACEHOLDER_IMAGE = "/placeholder-property.svg";

export function getSafeImage(imageUrl) {
  return imageUrl || PLACEHOLDER_IMAGE;
}

