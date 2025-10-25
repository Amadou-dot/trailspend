'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from './ui/button';

export default function DateRangeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get('range') || '30';

  const ranges = [
    { label: '7 days', value: '7' },
    { label: '30 days', value: '30' },
    { label: '90 days', value: '90' },
    { label: '6 months', value: '180' },
    { label: '1 year', value: '365' },
    { label: 'All time', value: 'all' },
  ];

  const handleRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {ranges.map((range) => (
        <Button
          key={range.value}
          variant={currentRange === range.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleRangeChange(range.value)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}
