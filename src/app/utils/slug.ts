import prisma from './prisma';

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateUniqueSlug = async (title: string, currentGearId?: string): Promise<string> => {
  const baseSlug = slugify(title) || 'gear';
  let candidateSlug = baseSlug;
  let counter = 0;

  while (counter < 20) {
    const existing = await prisma.gear.findFirst({
      where: { slug: candidateSlug },
      select: { id: true },
    });

    if (!existing || (currentGearId && existing.id === currentGearId)) {
      return candidateSlug;
    }

    const randomHash = Math.random().toString(36).substring(2, 6);
    candidateSlug = `${baseSlug}-${randomHash}`;
    counter++;
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
};
