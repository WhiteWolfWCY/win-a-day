import { format } from 'date-fns';
import { enUS, pl } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export const CustomPieTooltip = ({ active, payload }: any) => {
  const t = useTranslations('profile');
  
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const total = payload[0].payload.total;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    const habitForm = value === 1 
      ? t('charts.habit') 
      : t('charts.habits');
    
    return (
      <div className="bg-background/95 border rounded-lg shadow-lg p-2 text-sm">
        <p className="font-medium">
          {`${payload[0].name}: ${value} ${habitForm} (${percentage}%)`}
        </p>
      </div>
    );
  }
  return null;
};

export const CustomLineTooltip = ({ active, payload, label }: any) => {
  const t = useTranslations('profile');
  
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 border rounded-lg shadow-lg p-2">
        <p className="font-medium mb-1">{format(new Date(label), 'PPP')}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${Number(entry.value).toFixed(1)}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
}; 