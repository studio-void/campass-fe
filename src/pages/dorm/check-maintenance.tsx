import { Link } from '@tanstack/react-router';
import { ArrowRight, UserMinus, UserX, Wrench } from 'lucide-react';

import { Layout } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type InspectionType = {
  id: string;
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  requirements: string[];
};

const INSPECTION_TYPES: InspectionType[] = [
  {
    id: 'retirement_all',
    title: 'Full Room Retirement Inspection',
    description: 'Required when all residents are leaving the room',
    icon: UserX,
    iconColor: 'text-red-600 bg-red-100',
    requirements: [
      'All roommates must be leaving',
      'Complete room clearance required',
      'Final checkout process',
    ],
  },
  {
    id: 'retirement_single',
    title: 'Single Person Retirement Inspection',
    description: 'For when only one person is leaving the room',
    icon: UserMinus,
    iconColor: 'text-orange-600 bg-orange-100',
    requirements: [
      'At least one roommate remaining',
      'Personal belongings clearance',
      'Partial room inspection',
    ],
  },
  {
    id: 'maintenance',
    title: 'Maintenance Inspection',
    description: 'Annual maintenance check for continuing residents',
    icon: Wrench,
    iconColor: 'text-blue-600 bg-blue-100',
    requirements: [
      'Resided for more than one year',
      'No previous retirement inspection',
      'Room condition assessment',
    ],
  },
];

export default function CheckMaintenanceIntroPage() {
  return (
    <Layout>
      <div className="space-y-6 mb-24 w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Retirement & Maintenance Inspection
            </h1>
            <p className="text-muted-foreground">
              Choose the appropriate inspection type for your situation
            </p>
          </div>
        </div>

        {/* Inspection Types */}
        <div className="grid gap-6">
          {INSPECTION_TYPES.map((type) => (
            <Card key={type.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center ${type.iconColor}`}
                  >
                    <type.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {type.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="ml-16">
                  <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {type.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Important Guidelines */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent>
            <h3 className="font-semibold text-amber-800 mb-3">
              Important Guidelines
            </h3>
            <div className="space-y-2 text-sm text-amber-700">
              <p>• Applications must be submitted before 8 PM the day before</p>
              <p>• The last resident cannot apply for single-person checkout</p>
              <p>• Incorrect application type may result in rejection</p>
              <p>• Applications outside official periods are not accepted</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end">
          <Link to="/dorm/check-form">
            <Button size="lg" className="min-w-[200px]">
              Proceed to Application
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
