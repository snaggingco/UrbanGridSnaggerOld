import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Sample data for demonstration
const monthlyData = [
  { name: 'Jan', inspections: 45, movein: 22 },
  { name: 'Feb', inspections: 52, movein: 28 },
  { name: 'Mar', inspections: 49, movein: 30 },
  { name: 'Apr', inspections: 63, movein: 35 },
  { name: 'May', inspections: 55, movein: 40 },
  { name: 'Jun', inspections: 67, movein: 45 },
  { name: 'Jul', inspections: 70, movein: 50 },
  { name: 'Aug', inspections: 72, movein: 55 },
  { name: 'Sep', inspections: 80, movein: 60 },
  { name: 'Oct', inspections: 65, movein: 48 },
  { name: 'Nov', inspections: 75, movein: 52 },
  { name: 'Dec', inspections: 85, movein: 65 },
];

const serviceData = [
  { name: 'Inspection Services', value: 540 },
  { name: 'Deep Cleaning', value: 280 },
  { name: 'Pest Control', value: 110 },
  { name: 'Fit-out Services', value: 95 },
  { name: 'Handyman & Maintenance', value: 130 },
  { name: 'AC Cleaning', value: 75 },
  { name: 'Packers & Movers', value: 90 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#45B39D', '#F5B041'];

export default function AdminAnalytics() {
  return (
    <AdminLayout title="Analytics" description="Business performance metrics and insights">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Monthly Service Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="inspections" name="Inspection Services" fill="#4CAF50" />
                  <Bar dataKey="movein" name="Move-in Services" fill="#2196F3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="inspections" name="Inspection Revenue (K AED)" stroke="#4CAF50" strokeWidth={2} />
                  <Line type="monotone" dataKey="movein" name="Move-in Revenue (K AED)" stroke="#2196F3" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}