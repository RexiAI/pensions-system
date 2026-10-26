/**
 * Source declarations. A source is either a machine endpoint we can fetch and verify
 * (INE `tempus3`, Eurostat dissemination API) or a document/manual publisher whose
 * series must be transcribed into a committed snapshot by an operator.
 *
 * A manual source whose series code has not been resolved is declared `unresolved`:
 * the ingest harness then fails the figures that depend on it instead of inventing a
 * plausible series (10-tasks.md open question 1).
 */
export type SourceClass = 'machine' | 'document';

export interface SourceDeclaration {
  sourceId: string;
  publisher: string;
  dataset: string;
  /** The publisher's own dataset code, matched against a source URL for labelling. */
  datasetCode?: string;
  sourceClass: SourceClass;
  /** Public page a reader can check, even when the series is unresolved. */
  publisherUrl: string;
  /** What an operator must supply when `resolved` is false. */
  requiresManualSnapshot?: string;
}

export const SOURCE_DECLARATIONS: readonly SourceDeclaration[] = [
  {
    sourceId: 'ine-life-expectancy-at-65',
    publisher: 'Instituto Nacional de Estadística (INE)',
    dataset: 'Tablas de mortalidad, tabla 27150, esperanza de vida a los 65 años',
    sourceClass: 'machine',
    publisherUrl: 'https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176993',
  },
  {
    sourceId: 'ine-population-projection-working-age',
    publisher: 'Instituto Nacional de Estadística (INE)',
    dataset: 'Proyecciones de Población, tabla 36643, población de 16 a 64 años',
    sourceClass: 'machine',
    publisherUrl: 'https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176953',
  },
  {
    sourceId: 'eurostat-spr-pns-ben',
    publisher: 'Eurostat',
    dataset: 'spr_pns_ben, beneficiarios de pensiones por tipo de pensión (ESSPROS), España',
    datasetCode: 'spr_pns_ben',
    sourceClass: 'machine',
    publisherUrl: 'https://ec.europa.eu/eurostat/databrowser/view/spr_pns_ben/defaulttable',
  },
  {
    sourceId: 'eurostat-spr-exp-pens',
    publisher: 'Eurostat',
    dataset: 'spr_exp_pens, gasto en pensiones (ESSPROS) como porcentaje del PIB, España',
    datasetCode: 'spr_exp_pens',
    sourceClass: 'machine',
    publisherUrl: 'https://ec.europa.eu/eurostat/databrowser/view/spr_exp_pens/defaulttable',
  },
  {
    sourceId: 'eurostat-lfsi-emp-a',
    publisher: 'Eurostat',
    dataset: 'lfsi_emp_a, personas ocupadas de 15 a 64 años (EPA), España',
    datasetCode: 'lfsi_emp_a',
    sourceClass: 'machine',
    publisherUrl: 'https://ec.europa.eu/eurostat/databrowser/view/lfsi_emp_a/defaulttable',
  },
  {
    sourceId: 'ss-pensioners',
    publisher: 'Seguridad Social (Ministerio de Inclusión, Seguridad Social y Migraciones)',
    dataset: 'Pensiones contributivas en vigor, alta mensual',
    sourceClass: 'document',
    publisherUrl: 'https://www.seg-social.es/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/Estadisticas',
    requiresManualSnapshot:
      'Serie mensual de pensiones contributivas en vigor (número de pensiones) con la tabla y la fecha exactas. Código de serie sin resolver (10-tasks.md, pregunta abierta 1).',
  },
  {
    sourceId: 'ss-affiliates',
    publisher: 'Seguridad Social (Ministerio de Inclusión, Seguridad Social y Migraciones)',
    dataset: 'Afiliados a la Seguridad Social, alta mensual, total sistema',
    sourceClass: 'document',
    publisherUrl: 'https://www.seg-social.es/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/Estadisticas',
    requiresManualSnapshot:
      'Serie mensual de afiliados medios al sistema con la tabla y la fecha exactas. Código de serie sin resolver (10-tasks.md, pregunta abierta 1).',
  },
  {
    sourceId: 'ss-average-contribution-pension',
    publisher: 'Seguridad Social (Ministerio de Inclusión, Seguridad Social y Migraciones)',
    dataset: 'Cotización media y pensión media de la cohorte representativa',
    sourceClass: 'document',
    publisherUrl: 'https://www.seg-social.es/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/Estadisticas',
    requiresManualSnapshot:
      'Cotización mensual media y pensión mensual media de la cohorte, con la tabla y la fecha exactas. Código de serie sin resolver (10-tasks.md, pregunta abierta 1).',
  },
  {
    sourceId: 'igae-social-contributions',
    publisher: 'Intervención General de la Administración del Estado (IGAE)',
    dataset: 'Cuentas del sistema de la Seguridad Social, cotizaciones sociales',
    sourceClass: 'document',
    publisherUrl: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/Paginas/Inicio.aspx',
    requiresManualSnapshot:
      'Cotizaciones sociales del sistema de la Seguridad Social (cuentas de la IGAE) con la línea y la fecha exactas. Código sin resolver (10-tasks.md, pregunta abierta 1).',
  },
  {
    sourceId: 'igae-pension-expenditure',
    publisher: 'Intervención General de la Administración del Estado (IGAE)',
    dataset: 'Cuentas del sistema de la Seguridad Social, gasto en pensiones contributivas',
    sourceClass: 'document',
    publisherUrl: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/Paginas/Inicio.aspx',
    requiresManualSnapshot:
      'Gasto en pensiones contributivas (cuentas de la IGAE) con la línea y la fecha exactas. Código sin resolver (10-tasks.md, pregunta abierta 1).',
  },
  {
    sourceId: 'airef-obligations',
    publisher: 'Autoridad Independiente de Responsabilidad Fiscal (AIReF)',
    dataset: 'Proyecciones de gasto en pensiones, obligaciones acumuladas',
    sourceClass: 'document',
    publisherUrl: 'https://www.airef.es/',
    requiresManualSnapshot:
      'Flujo anual de obligaciones acumuladas (AIReF) con la tabla y la fecha exactas. Código sin resolver (10-tasks.md, pregunta abierta 1).',
  },
  {
    sourceId: 'fondo-de-reserva',
    publisher: 'Seguridad Social — Fondo de Reserva',
    dataset: 'Saldo del Fondo de Reserva de la Seguridad Social',
    sourceClass: 'document',
    publisherUrl: 'https://www.seg-social.es/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/Estadisticas',
    requiresManualSnapshot:
      'Saldo del Fondo de Reserva en una fecha exacta. Código sin resolver (10-tasks.md, pregunta abierta 1).',
  },
] as const;

export function findSource(sourceId: string): SourceDeclaration | undefined {
  return SOURCE_DECLARATIONS.find((s) => s.sourceId === sourceId);
}

export const MACHINE_SOURCE_IDS = SOURCE_DECLARATIONS.filter(
  (s) => s.sourceClass === 'machine',
).map((s) => s.sourceId);

/** A snapshot as committed under `data/snapshots/`, with its raw bytes for hashing. */
export interface SourceSnapshot {
  sourceId: string;
  /** Raw file bytes exactly as committed — the hash is computed over these. */
  bytes: string;
  /** `false` means the series could not be resolved; `payload` must then be absent. */
  resolved: boolean;
  /** ISO-8601 UTC seconds. */
  retrievedAt: string;
  sourceUrl: string[];
  publisher: string;
  dataset: string;
  payload?: unknown;
  /** Present when `resolved` is false: what is missing and who must supply it. */
  unresolvedReason?: string;
}

export type SnapshotMap = ReadonlyMap<string, SourceSnapshot>;
