export const createUrlSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace any non-alphanumeric characters with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};

export const getProductUrl = (product: { name: string }): string => {
    const slug = createUrlSlug(product.name);
    return `/product/${slug}`;
}; 