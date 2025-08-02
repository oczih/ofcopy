export const resolveImageUrl = (src: string | null | undefined): string | null => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    if (src.startsWith('/')) return src;
    return '/' + src; // Add leading slash if missing
  };