
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import MobileNavigation from './MobileNavigation';

const StickyNavigation = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'job-postings', 'features', 'testimonials', 'about'];
      const scrollPosition = window.scrollY + 100;
      
      // Check if scrolled past hero section
      setIsScrolled(window.scrollY > 50);

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'job-postings', label: 'Job Postings', href: '/student/login' },
    { id: 'submit-job', label: 'Submit a Job', href: '/employer/login' },
    { id: 'apply', label: 'Apply', href: '/student/login' },
    { id: 'admin', label: 'Admin', href: '/admin/login' }
  ];

  // Always render mobile navigation on mobile devices
  if (isMobile) {
    return <MobileNavigation />;
  }

  // Desktop navigation
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-full mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo - Almost Far Left */}
          <div className="flex items-center space-x-3 flex-shrink-0 ml-2">
            <GraduationCap className={`h-6 w-6 transition-colors duration-300 ${
              isScrolled ? 'text-blue-600' : 'text-white'
            }`} />
            <span className={`text-lg font-bold transition-colors duration-300 ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              PV Pathways
            </span>
          </div>
          
          {/* Navigation Items - Close to Right */}
          <div className="hidden md:flex items-center space-x-8 mr-2">
            {navItems.map((item) => (
              item.href.startsWith('#') ? (
                <a
                  key={item.id}
                  href={item.href}
                  className={`text-base font-medium transition-all duration-300 hover:scale-105 ${
                    isScrolled
                      ? activeSection === item.id 
                        ? 'text-blue-600' 
                        : 'text-gray-700 hover:text-blue-600'
                      : activeSection === item.id
                        ? 'text-blue-300'
                        : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`text-base font-medium transition-all duration-300 hover:scale-105 ${
                    isScrolled
                      ? 'text-gray-700 hover:text-blue-600'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StickyNavigation;
