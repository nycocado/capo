export function buildDocumentUrl(path: string, sectionName?: string): string {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const docsPath = '/documents';
  const sectionEnv = sectionName ?? process.env.DOC_SECTION;
  const section = sectionEnv
    ? sectionEnv.startsWith('/')
      ? sectionEnv
      : `/${sectionEnv}`
    : '';

  return `${baseUrl}${docsPath}${section}/${path}`;
}
