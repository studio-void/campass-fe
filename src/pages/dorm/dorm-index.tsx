import { Link } from '@tanstack/react-router';
import { Package, Settings } from 'lucide-react';

import { Layout } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DormIndexPage() {
  return (
    <Layout>
      <div className="space-y-6 mb-24 w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dormitory Services</h1>
            <p className="text-muted-foreground">
              Manage your dormitory applications and reservations
            </p>
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <Link to="/dorm/check-maintenance" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Retirement & Maintenance Inspection
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  Apply for room retirement inspection or maintenance check.
                  Required before leaving dormitory or for annual maintenance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Available 24/7
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    Apply →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dorm/storage" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Storage Application
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  Request to store personal belongings in dormitory storage
                  facilities during semester breaks or transitions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Available 24/7
                  </div>
                  <Button variant="ghost" size="sm" className="text-green-600">
                    Apply →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Important Notice */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">
                  Important Notice
                </h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  All applications must be submitted at least before 8 PM the
                  day before your desired date. Applications received after 8 PM
                  will be processed the following business day.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
