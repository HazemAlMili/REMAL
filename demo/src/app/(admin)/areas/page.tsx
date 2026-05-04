import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MOCK_AREAS } from '@/lib/mock-data';
import { MapPinned, Building2, CheckCircle2 } from 'lucide-react';

export default function AreasPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">المناطق</h1>
          <p className="text-gray-500 font-medium">نظرة سريعة على المناطق القابلة للحجز في الديمو.</p>
        </div>
        <Badge variant="info" className="px-4 py-2 text-sm">{MOCK_AREAS.length} مناطق</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_AREAS.map((area) => (
          <Card key={area.id} className="overflow-hidden">
            <img src={area.imageUrl} alt={area.name} className="h-44 w-full object-cover rounded-xl mb-5" />
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{area.name}</h2>
                <p className="text-sm text-gray-500 mt-1 line-clamp-3">{area.description}</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> {area.unitsCount} وحدة</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> جاهزة للحجز</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}