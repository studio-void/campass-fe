import { useEffect, useState } from 'react';

import { Link } from '@tanstack/react-router';
import { Building2, FileCheck, Package } from 'lucide-react';

import { Layout, UserSchoolLogo } from '@/components';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { School, getUserSchool } from '@/data/get-user';
import { cn } from '@/lib/utils';

export default function DormIndexPage() {
  const [school, setSchool] = useState<School | undefined>(undefined);

  useEffect(() => {
    getUserSchool().then(setSchool);
  }, []);

  const services = [
    {
      title: 'Retirement Maintenance Inspection',
      description: 'Apply for dormitory room inspection before departure',
      icon: FileCheck,
      href: '/dorm/retirement-maintenance',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      hoverColor: 'hover:bg-blue-100',
    },
    {
      title: 'Warehouse Use Application',
      description: 'Request access to dormitory storage facilities',
      icon: Package,
      href: '/dorm/warehouse',
      color: 'bg-green-50 text-green-600 border-green-200',
      hoverColor: 'hover:bg-green-100',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8 mb-24">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {school ? (
                <UserSchoolLogo
                  school={school}
                  size="2xl"
                  display="logo-with-name"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
                    <span className="text-xs text-gray-400">?</span>
                  </div>
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dormitory Services
              </h1>
              <p className="text-lg text-gray-600">
                Make campus life more convenient
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-4xl">
          {services.map((service) => (
            <Link key={service.href} to={service.href} className="block group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'p-3 rounded-lg transition-colors',
                        service.color,
                        service.hoverColor,
                      )}
                    >
                      <service.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {service.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Need Help with Dormitory Services?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our dormitory services are designed to make your campus life
                easier. If you have any questions about the application process
                or need assistance, please contact the dormitory administration
                office.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
