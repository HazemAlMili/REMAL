import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MOCK_CLIENTS } from '@/lib/mock-data';
import { Mail, Phone, CalendarDays } from 'lucide-react';

function getClientVariant(status: string) {
  switch (status) {
    case 'vip': return 'success' as const;
    case 'repeat': return 'info' as const;
    default: return 'neutral' as const;
  }
}

export default function ClientsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">العملاء</h1>
          <p className="text-gray-500 font-medium">بطاقات عملاء جاهزة للعرض مع badges لحالات الولاء والتكرار.</p>
        </div>
        <Badge variant="info" className="px-4 py-2 text-sm">{MOCK_CLIENTS.length} عميل ظاهر</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {MOCK_CLIENTS.map((client) => (
          <Card key={client.id}>
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{client.name}</h2>
                <div className="text-sm text-gray-500 mt-1">{client.bookingsCount} حجوزات • آخرها {client.lastBooking}</div>
              </div>
              <Badge variant={getClientVariant(client.status)}>
                {client.status === 'vip' ? 'VIP' : client.status === 'repeat' ? 'Repeat' : 'Active'}
              </Badge>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" /> {client.phone}</div>
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-400" /> {client.email}</div>
              <div className="flex items-center gap-3"><CalendarDays className="w-4 h-4 text-gray-400" /> آخر زيارة: {client.lastBooking}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}