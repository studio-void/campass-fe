import { Card } from '@/components/ui/card';

function WikiIndexPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="h-40 flex items-center justify-center cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-transform">
        Left Side Content
      </Card>
      <Card className="h-40 flex items-center justify-center cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-transform">
        Right Side Content
      </Card>
    </div>
  );
}

export default WikiIndexPage;
