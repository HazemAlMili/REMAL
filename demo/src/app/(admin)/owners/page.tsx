import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MOCK_OWNERS } from '@/lib/mock-data';
import { Phone, Percent, Building2, Wallet } from 'lucide-react';

function getPayoutVariant(status: string) {
  return status === 'ready' ? 'warning' as const : 'success' as const;
}

export default function OwnersPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">الملاك</h1>
          <p className="text-gray-500 font-medium">سريعة وواضحة، مع badges للعمولة وحالة الصرف.</p>
        </div>
        <Badge variant="success" className="px-4 py-2 text-sm">{MOCK_OWNERS.length} مالك نشط</Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {MOCK_OWNERS.map((owner) => (
          <Card key={owner.id}>
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{owner.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{owner.unitCount} وحدات مرتبطة</p>
              </div>
              <Badge variant={getPayoutVariant(owner.payoutStatus)}>{owner.payoutStatus === 'ready' ? 'جاهز للصرف' : 'تم التحويل'}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-1 text-gray-500"><Phone className="w-4 h-4" /> الهاتف</div>
                <div className="font-semibold text-gray-900">{owner.phone}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-1 text-gray-500"><Percent className="w-4 h-4" /> العمولة</div>
                <div className="font-semibold text-gray-900">{owner.commissionRate}%</div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm text-gray-600">
              <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> {owner.unitCount} وحدات</span>
              <span className="flex items-center gap-2"><Wallet className="w-4 h-4" /> {owner.status === 'active' ? 'نشط' : 'متوقف'}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}