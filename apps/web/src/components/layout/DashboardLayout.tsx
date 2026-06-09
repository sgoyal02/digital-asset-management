import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useEffect, useState } from 'react';

const DashboardLayout = () => {
    const [isOpen, setOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {  //for open-hide auto
        setOpen(false);
      } else {
        setOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
    
  return (
    <div className="min-h-screen bg-base text-main-white">
      <Header toggleSidebar={() => setOpen(!isOpen)}/>
      <div className="flex pt-16">
        <Sidebar isOpen={isOpen}/>
        <main className={`flex-1 p-6 md:p-8 min-h-[calc(100vh-4rem)] transition-all duration-300
          ${isOpen ? 'ml-64' : 'ml-20'}`}>
          <Outlet/>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;