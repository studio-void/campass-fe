import { useEffect, useState } from 'react';

import { Link } from '@tanstack/react-router';
import { ArrowRight, Building2, CheckCircle, Clock, Users } from 'lucide-react';

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

type InspectionType = {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  hoverColor: string;
  details: string[];
};

const INSPECTION_TYPES: InspectionType[] = [
  {
    id: 'retirement',
    title: 'Retirement Inspection',
    description: 'Apply when all residents in the room are discharged',
    icon: Users,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    hoverColor: 'hover:bg-blue-100',
    details: [
      'All roommates must be leaving',
      'Complete room clearance required',
      'Final inspection before departure',
      'Room key return included',
    ],
  },
  {
    id: 'single-retirement',
    title: 'Single Person Retirement',
    description: 'Apply when only one person leaves the room',
    icon: CheckCircle,
    color: 'bg-green-50 text-green-600 border-green-200',
    hoverColor: 'hover:bg-green-100',
    details: [
      'Partial room inspection only',
      'Personal belongings removal',
      'Roommate coordination required',
      'Individual assessment',
    ],
  },
  {
    id: 'maintenance',
    title: 'Maintenance Inspection',
    description:
      'For residents who lived more than a year without retirement inspection',
    icon: Building2,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    hoverColor: 'hover:bg-purple-100',
    details: [
      'Room condition assessment',
      'Maintenance needs evaluation',
      'Not applicable for new students',
      'Annual inspection requirement',
    ],
  },
];

export default function RetirementMaintenanceIntroPage() {
  const [school, setSchool] = useState<School | undefined>(undefined);

  useEffect(() => {
    getUserSchool().then(setSchool);
  }, []);

  return (
    <Layout>
      <div className="space-y-6 mb-24">
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
              Retirement & Maintenance Inspection
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Choose the appropriate inspection type for your situation
            </p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">
                Important Notice
              </h3>
              <p className="text-amber-800 leading-relaxed">
                All applications must be submitted at least before 8 PM the day
                before. Applications received after 8 PM will be processed the
                next business day.
              </p>
            </div>
          </div>
        </div>

        {/* Inspection Types */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Inspection Types
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {INSPECTION_TYPES.map((type) => (
              <Card
                key={type.id}
                className="transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        type.color,
                        type.hoverColor,
                      )}
                    >
                      <type.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {type.details.map((detail, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ready to Apply?
          </h3>
          <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
            Complete your inspection application with our simple form. All
            necessary information and requirements will be provided during the
            application process.
          </p>
          <Link to="/dorm/retirement-form">
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
