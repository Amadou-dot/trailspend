'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface SpendingPeriodSelectorProps {
  defaultValue?: string;
}

export default function SpendingPeriodSelector({ defaultValue = '30' }: SpendingPeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get('period') || defaultValue;

  const periods = [
    { label: 'This month', value: 'month' },
    { label: 'Last 30 days', value: '30' },
    { label: 'Last 90 days', value: '90' },
    { label: 'Last 6 months', value: '180' },
    { label: 'Last year', value: '365' },
    { label: 'All time', value: 'all' },
  ];

  const handlePeriodChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', value);
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  };

  return (
    <Select value={currentPeriod} onValueChange={handlePeriodChange}>
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {periods.map((period) => (
          <SelectItem key={period.value} value={period.value}>
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
