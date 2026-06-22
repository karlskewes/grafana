import { type DataFrame, formattedValueToString, getValueFormat } from '@grafana/data';
import { t } from '@grafana/i18n';

import { MetaInfoText } from '../MetaInfoText';

// Display name set by the Prometheus/Mimir backend (promlib) for the
// bytes-processed query stat parsed from the Server-Timing header. Matched
// literally because the backend attaches the stat without tagging a headline.
const BYTES_PROCESSED_STAT = 'Bytes processed';

interface Props {
  data: DataFrame[];
}

export function GraphMetaInfo({ data }: Props) {
  let totalBytes = 0;
  let unit = 'decbytes';
  const queriesVisited: Record<string, boolean> = {};

  for (const frame of data) {
    const { refId } = frame; // Stats are per query, keeping track by refId
    if (refId && !queriesVisited[refId]) {
      const stat = frame.meta?.stats?.find((s) => s.displayName === BYTES_PROCESSED_STAT);
      if (stat) {
        totalBytes += stat.value;
        if (stat.unit) {
          unit = stat.unit;
        }
      }
      queriesVisited[refId] = true;
    }
  }

  if (totalBytes <= 0) {
    return null;
  }

  return (
    <MetaInfoText
      metaItems={[
        {
          label: t('graph.meta-info.bytes-processed', 'Bytes processed'),
          value: formattedValueToString(getValueFormat(unit)(totalBytes)),
        },
      ]}
    />
  );
}
