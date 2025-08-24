import { Link } from '@tanstack/react-router';
import { ArrowRight, MapPin } from 'lucide-react';

import { Layout } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function StorageUseIntroPage() {
  return (
    <Layout>
      <div className="space-y-6 mb-24 w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Storage Application</h1>
            <p className="text-muted-foreground">
              Submit your application for dormitory storage
            </p>
          </div>
        </div>

        {/* Available Storage Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Available Storage Locations
            </CardTitle>
            <CardDescription>
              Choose from the following storage facilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">Building A Basement</div>
                  <div className="text-xs text-muted-foreground">
                    Male & Female
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">
                    Building B 4th Floor
                  </div>
                  <div className="text-xs text-muted-foreground">Male Only</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">
                    Building B 5th Floor
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Female Only
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">
                    Building B 6th Floor
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Female Only
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent>
            <h3 className="font-semibold text-amber-800 mb-3">
              Important Guidelines
            </h3>
            <div className="space-y-2 text-sm text-amber-700">
              <p>• Applications must be submitted before 8 PM the day before</p>
              <p>
                • Refrigerator storage only available in old building storages
              </p>
              <p>
                • Students leaving due to absence/graduation must collect all
                items
              </p>
              <p>• Storage duration is limited as specified in the agreement</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end">
          <Link to="/dorm/storage/form">
            <Button size="lg" className="min-w-[200px]">
              Apply for Storage
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
