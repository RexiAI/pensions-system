export interface ReadoutStripProps {
  id: string;
  label: string;
  items: ReadonlyArray<{ label: string; value: string }>;
}

/** Always-visible readout above the plot: nothing about a figure is hover-only. */
export function ReadoutStrip({ id, label, items }: ReadoutStripProps) {
  return (
    <dl className="readout" id={id} aria-label={label}>
      {items.map((item) => (
        <div className="readout__item" key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
