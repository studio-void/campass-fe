import { useEffect, useState } from 'react';

import { Link } from '@tanstack/react-router';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Warehouse,
} from 'lucide-react';

import { Layout, UserSchoolLogo } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { School, getUserSchool } from '@/data/get-user';
import { cn } from '@/lib/utils';

type ProcessStep = {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  hoverColor: string;
  requirements: {
    label: string;
    value: string;
    icon: any;
  }[];
};

const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'storage',
    title: 'Store Luggage',
    subtitle: 'During the semester',
    icon: Package,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    hoverColor: 'hover:bg-blue-100',
    requirements: [
      {
        label: 'Time',
        value: '10 minutes before office hours end',
        icon: Clock,
      },
      {
        label: 'Location',
        value: 'Old building underground warehouse only',
        icon: MapPin,
      },
      {
        label: 'Method',
        value: 'Written pledge in dormitory (no proxy required)',
        icon: CheckCircle,
      },
      {
        label: 'Period',
        value: 'Until 2 weeks before semester ends',
        icon: Calendar,
      },
    ],
  },
  {
    id: 'retrieval',
    title: 'Retrieve Luggage',
    subtitle: 'During vacation',
    icon: Warehouse,
    color: 'bg-green-50 text-green-600 border-green-200',
    hoverColor: 'hover:bg-green-100',
    requirements: [
      {
        label: 'Time',
        value: 'Pre-announced warehouse opening hours',
        icon: Clock,
      },
      {
        label: 'Location',
        value: 'Desired warehouse for your belongings',
        icon: MapPin,
      },
      {
        label: 'Method',
        value: 'Fill out luggage form & written pledge',
        icon: CheckCircle,
      },
      {
        label: 'Period',
        value: 'As stated in warehouse pledge',
        icon: Calendar,
      },
    ],
  },
];

export default function WarehouseUseIntroPage() {
  const [school, setSchool] = useState<School | undefined>(undefined);

  useEffect(() => {
    getUserSchool().then(setSchool);
  }, []);

  return (
    <Layout>
      <div className="space-y-8 mb-24">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {school ? (
              <UserSchoolLogo
                school={school}
                size="xl"
                display="logo-with-name"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
                  <span className="text-xs text-gray-400">?</span>
                </div>
                <div className="h-7 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Warehouse Use Application
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Store your belongings safely during semester breaks
            </p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">
                Application Deadline
              </h3>
              <p className="text-amber-800 leading-relaxed">
                All applications must be submitted at least before 8 PM the day
                before. Applications received after 8 PM will be processed the
                next business day.
              </p>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Warehouse Usage Process
          </h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {PROCESS_STEPS.map((step, index) => (
              <Card
                key={step.id}
                className="transition-all duration-200 hover:shadow-lg border-2 hover:border-primary/20"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'p-3 rounded-lg transition-colors',
                        step.color,
                        step.hoverColor,
                      )}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <span className="text-lg font-medium text-gray-500">
                          {index + 1}.
                        </span>
                        {step.title}
                      </CardTitle>
                      <CardDescription className="text-base font-medium text-primary">
                        {step.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {step.requirements.map((req, reqIndex) => (
                      <div key={reqIndex} className="flex items-start gap-3">
                        <div className="p-1.5 bg-gray-100 rounded-lg mt-0.5">
                          <req.icon className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {req.label}
                          </div>
                          <div className="text-gray-600 text-sm leading-relaxed">
                            {req.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Special Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Important Notes
              </h3>
              <ul className="space-y-1 text-blue-800 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Refrigerator storage is only available in old office
                  warehouses
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Students leaving due to absence/graduation must remove all
                  belongings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  All items must be retrieved within the specified period
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 text-center border border-green-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ready to Reserve Warehouse Space?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Submit your warehouse use application and secure storage space for
            your belongings during the break period.
          </p>
          <Link to="/dorm/warehouse/form">
            <Button size="lg" className="px-8">
              Start Application
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
