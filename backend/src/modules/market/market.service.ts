import { prisma } from '../../database/prisma.js';
import { checksum, parseMarketCsv } from '../../integrations/market-etl.js';

export async function importOfficialCsv(source: 'MAG_SIPA' | 'INEC', sourceUrl: string, csv: string) {
  const hash = checksum(csv); const existing = await prisma.marketImport.findUnique({ where: { source_checksum: { source, checksum: hash } } });
  if (existing) return { import: existing, inserted: 0, duplicate: true };
  const rows = parseMarketCsv(csv);
  const record = await prisma.marketImport.create({ data: { source, sourceUrl, checksum: hash, records: { create: rows.map((row) => ({ ...row, observedAt: new Date(row.observedAt) })) } }, include: { _count: { select: { records: true } } } });
  return { import: record, inserted: record._count.records, duplicate: false };
}
