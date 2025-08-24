import { Link } from '@tanstack/react-router';
import { ClipboardCheck, Package, Shield } from 'lucide-react';

import { Layout } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const AdminHomePage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6 mb-24 w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage campus services and user requests
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg overflow-hidden bg-neutral-200">
              <img
                src="/images/schools/gist.svg"
                alt="GIST"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-lg font-semibold">GIST Admin</div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/admin/dorm-check" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ClipboardCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Dormitory Inspections
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  Manage dormitory retirement and maintenance inspection
                  requests from students. Review, approve, and schedule
                  inspections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    Manage →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/dorm-storage" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Storage Management
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  Handle student storage requests for dormitory facilities.
                  Approve applications and manage storage allocations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" className="text-green-600">
                    Manage →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/school-certificate" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      School Certificates
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  Review and process student school certificate verification
                  requests. Approve or reject applications with appropriate
                  feedback.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" className="text-orange-600">
                    Review →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
};
