import { definitionFor, definitionVocabularyProblems, isDefinitionId } from '../manifest/definitions';
import type { DefinitionId } from '../manifest/definitions';
import { validateManifest } from '../manifest/validate';
import { FIGURE_AVAILABILITY } from './types';
import type { DerivedFigure, FigureAvailability } from './types';

export type FigureProblemCode =
  | 'unknown-availability'
  | 'computed-without-value'
  | 'unavailable-with-value'
  | 'manifest-invalid'
  | 'missing-manifest'
  | 'missing-definition'
  | 'unknown-definition'
  | 'definition-mismatch'
  | 'definition-vocabulary';

export interface FigureProblem {
  figureId: string;
  code: FigureProblemCode;
  detail: string;
}

export interface FigureValidationDeps {
  fileExists(path: string): boolean;
}

export function isAvailability(value: unknown): value is FigureAvailability {
  return typeof value === 'string' && (FIGURE_AVAILABILITY as readonly string[]).includes(value);
}

function valueProblem(
  figureId: string,
  availability: FigureAvailability,
  value: unknown,
): FigureProblem | null {
  if (availability === 'computed' && value === null) {
    return { figureId, code: 'computed-without-value', detail: 'computed figure carries no value' };
  }
  if (availability === 'unavailable' && value !== null) {
    return { figureId, code: 'unavailable-with-value', detail: 'unavailable figure carries a headline value' };
  }
  return null;
}

function availabilityProblems(figure: Partial<DerivedFigure>): FigureProblem[] {
  const figureId = String(figure.figureId ?? 'unknown');
  if (!isAvailability(figure.availability)) {
    return [{ figureId, code: 'unknown-availability', detail: String(figure.availability) }];
  }
  const problem = valueProblem(figureId, figure.availability, figure.value);
  return problem ? [problem] : [];
}

function manifestProblems(candidate: unknown, deps: FigureValidationDeps): FigureProblem[] {
  const figure = candidate as Partial<DerivedFigure>;
  const figureId = String(figure.figureId ?? 'unknown');
  if (figure.manifest === undefined || figure.manifest === null) {
    return [{ figureId, code: 'missing-manifest', detail: 'no manifest object' }];
  }
  const validation = validateManifest(figure.manifest, deps);
  if (validation.ok) return [];
  return [
    {
      figureId,
      code: 'manifest-invalid',
      detail: validation.problems.map((problem) => `${problem.field}:${problem.code}`).join(', '),
    },
  ];
}

function definitionIdProblems(figureId: string, definitionId: unknown): FigureProblem[] {
  if (typeof definitionId !== 'string' || definitionId.trim() === '') {
    return [{ figureId, code: 'missing-definition', detail: 'no definitionId' }];
  }
  if (!isDefinitionId(definitionId)) {
    return [{ figureId, code: 'unknown-definition', detail: definitionId }];
  }
  return [];
}

function definitionTextProblems(figureId: string, definitionId: DefinitionId, text: unknown): FigureProblem[] {
  if (typeof text !== 'string' || text.trim() === '') {
    return [{ figureId, code: 'missing-definition', detail: 'no definition string' }];
  }
  const banned = definitionVocabularyProblems(text);
  if (banned.length > 0) {
    return [{ figureId, code: 'definition-vocabulary', detail: banned.join(', ') }];
  }
  if (text !== definitionFor(definitionId).definition) {
    return [
      {
        figureId,
        code: 'definition-mismatch',
        detail: `${definitionId} does not carry its published definition`,
      },
    ];
  }
  return [];
}

function manifestDefinitionProblems(
  figureId: string,
  definitionId: DefinitionId,
  manifest: { definitionId?: unknown } | undefined,
): FigureProblem[] {
  if (manifest?.definitionId === definitionId) return [];
  return [
    { figureId, code: 'definition-mismatch', detail: 'manifest records a different definitionId' },
  ];
}

/**
 * The definition invariant (T1, AC-001-77, AC-001-78, AC-001-92): a figure names a definition
 * from the closed set, publishes that definition's canonical instrument string, and its
 * manifest records the same `definitionId`. A mismatch is rejected, never emitted as current.
 */
function definitionProblems(candidate: unknown): FigureProblem[] {
  const figure = candidate as Partial<DerivedFigure>;
  const figureId = String(figure.figureId ?? 'unknown');
  const identity = definitionIdProblems(figureId, figure.definitionId);
  if (identity.length > 0 || !isDefinitionId(figure.definitionId)) return identity;
  return [
    ...definitionTextProblems(figureId, figure.definitionId, figure.definition),
    ...manifestDefinitionProblems(figureId, figure.definitionId, figure.manifest),
  ];
}

/**
 * The `availability` invariants (T1, AC-001-74), with no loophole: a `computed` figure must
 * carry a value and a complete manifest, and an `unavailable` figure must carry no value.
 * `unavailable` is a state of "no value exists", never a path to publish one without a
 * manifest or a citation.
 */
export function validateDerivedFigure(
  candidate: unknown,
  deps: FigureValidationDeps,
): FigureProblem[] {
  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
    return [{ figureId: 'unknown', code: 'unknown-availability', detail: 'not a figure object' }];
  }
  return [
    ...availabilityProblems(candidate as Partial<DerivedFigure>),
    ...manifestProblems(candidate, deps),
    ...definitionProblems(candidate),
  ];
}
