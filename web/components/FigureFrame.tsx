import type { ReactNode } from 'react';

export interface FigureFrameProps {
  figureNumber: number;
  titleId: string;
  label: string;
  title: string;
  caption: string;
  /** The published definition that produced the value (T1): visible on every plate. */
  definition: string;
  definitionLabel: string;
  /** Reason line for a `null-value` plate: the figure exists, this deployment has no value. */
  note: string | null;
  limit: string;
  limitLabel: string;
  children: ReactNode;
}

/**
 * Shared figure grammar: label, level-2 title, caption, definition, body, limit line. The
 * title is a real heading inside the `<figcaption>` so a screen-reader user can navigate
 * figure by figure (D5) while the caption keeps its semantic role for cross-references.
 */
export function FigureFrame({
  figureNumber,
  titleId,
  label,
  title,
  caption,
  definition,
  definitionLabel,
  note,
  limit,
  limitLabel,
  children,
}: FigureFrameProps) {
  return (
    <figure className="plate" id={`fig-0${figureNumber}`} aria-labelledby={titleId}>
      <figcaption className="plate__caption">
        <span className="plate__label">
          {label} {String(figureNumber).padStart(2, '0')}
        </span>
        <h2 className="plate__title" id={titleId}>
          {title}
        </h2>
        <span className="plate__finding">{caption}</span>
        <span className="plate__definition">
          <span className="plate__definition-label">{definitionLabel}</span> {definition}
        </span>
        {note ? <span className="plate__note">{note}</span> : null}
      </figcaption>
      {children}
      <p className="plate__limit">
        <span className="plate__limit-label">{limitLabel}</span> {limit}
      </p>
    </figure>
  );
}
