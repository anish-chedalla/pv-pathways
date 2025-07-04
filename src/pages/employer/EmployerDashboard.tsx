
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { EmployerSidebar } from '../../components/EmployerSidebar';
import { PostJobs } from '../../components/employer/PostJobs';
import { MyPostings } from '../../components/employer/MyPostings';
import { Applications } from '../../components/employer/Applications';
import MobileEmployerDropdown from '../../components/MobileEmployerDropdown';
import { useAuth } from '../../contexts/AuthContext';
import { useJobs } from '../../contexts/JobContext';
import { useIsMobile } from '../../hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Building2, CheckCircle, Clock, Users } from 'lucide-react';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const { getJobsByEmployer } = useJobs();
  const [activeSection, setActiveSection] = useState('post-jobs');
  const [totalApplications, setTotalApplications] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>();
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | undefined>();
  const isMobile = useIsMobile();

  const employerJobs = getJobsByEmployer(user?.id || '');

  // Get section titles
  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'post-jobs':
        return 'Post New Job';
      case 'my-postings':
        return 'My Job Postings';
      case 'applications':
        return selectedJobTitle ? `Applications for ${selectedJobTitle}` : 'Applications';
      default:
        return 'Dashboard';
    }
  };

  // Fetch total applications for this employer
  useEffect(() => {
    const fetchApplicationCount = async () => {
      if (!user) return;

      const jobIds = employerJobs.map(job => job.id);
      if (jobIds.length === 0) return;

      try {
        const { count, error } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .in('job_id', jobIds);

        if (error) {
          console.error('Error fetching application count:', error);
          return;
        }

        setTotalApplications(count || 0);
      } catch (error) {
        console.error('Error fetching application count:', error);
      }
    };

    fetchApplicationCount();
  }, [user, employerJobs.length]);

  const stats = {
    total: employerJobs.length,
    approved: employerJobs.filter(job => job.status === 'approved').length,
    pending: employerJobs.filter(job => job.status === 'pending').length,
    applications: totalApplications
  };

  const handleViewApplications = (jobId: string, jobTitle: string) => {
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
    setActiveSection('applications');
  };

  const handleBackToAllApplications = () => {
    setSelectedJobId(undefined);
    setSelectedJobTitle(undefined);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'post-jobs':
        return <PostJobs />;
      case 'my-postings':
        return <MyPostings onViewApplications={handleViewApplications} />;
      case 'applications':
        return (
          <Applications 
            selectedJobId={selectedJobId}
            selectedJobTitle={selectedJobTitle}
            onBackToAllApplications={handleBackToAllApplications}
          />
        );
      default:
        return <PostJobs />;
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <MobileEmployerDropdown 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <div className="pt-16 p-4">
          {/* Section Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{getSectionTitle(activeSection)}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {activeSection === 'post-jobs' && 'Create and publish new job opportunities'}
              {activeSection === 'my-postings' && 'Manage your published job postings'}
              {activeSection === 'applications' && 'Review and manage job applications'}
            </p>
          </div>

          {/* Stats Cards - Mobile Layout */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-600">Total</p>
                  <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-600">Approved</p>
                  <p className="text-lg font-bold text-green-600">{stats.approved}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-600">Pending</p>
                  <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-600">Applications</p>
                  <p className="text-lg font-bold text-purple-600">{stats.applications}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <EmployerSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <SidebarInset>
          <div className="p-6">
            {/* Section Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{getSectionTitle(activeSection)}</h1>
              <p className="text-gray-600 mt-2">
                {activeSection === 'post-jobs' && 'Create and publish new job opportunities'}
                {activeSection === 'my-postings' && 'Manage your published job postings'}
                {activeSection === 'applications' && 'Review and manage job applications'}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Postings</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Applications</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.applications}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default EmployerDashboard;
