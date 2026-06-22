import { render, screen } from '@testing-library/react';

import { toDataFrame, FieldType } from '@grafana/data';

import { GraphMetaInfo } from './GraphMetaInfo';

function graphFrame(refId: string, bytes?: number) {
  return toDataFrame({
    refId,
    fields: [
      { name: 'Time', type: FieldType.time, values: [0] },
      { name: 'Value', type: FieldType.number, values: [1] },
    ],
    meta:
      bytes === undefined ? undefined : { stats: [{ displayName: 'Bytes processed', unit: 'decbytes', value: bytes }] },
  });
}

describe('GraphMetaInfo', () => {
  it('renders the formatted bytes processed stat', () => {
    render(<GraphMetaInfo data={[graphFrame('A', 11188007)]} />);

    expect(screen.getByText('Bytes processed:')).toBeInTheDocument();
    expect(screen.getByText('11.2 MB')).toBeInTheDocument();
  });

  it('sums the stat across queries, deduping by refId', () => {
    render(<GraphMetaInfo data={[graphFrame('A', 1000000), graphFrame('A', 1000000), graphFrame('B', 1000000)]} />);

    expect(screen.getByText('2 MB')).toBeInTheDocument();
  });

  it('renders nothing when no frame carries the stat', () => {
    const { container } = render(<GraphMetaInfo data={[graphFrame('A')]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
