import { useAuth } from '../../hooks/AuthContext';
import logo from '../../../src/assets/logo.svg';
import type { HeaderProp } from '../../utils/types';


const Header = ({toggleSidebar}:HeaderProp) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-surface border-b border-border h-16 flex items-center px-6 fixed w-full z-50">
      <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
              <img src={logo} alt='Logo' className="h-6 w-6"/>
            <h5 className="text-xl font-semibold tracking-tight">Assets Platform</h5>
            <button className="ml-5 p-1 hover:bg-hover border border-primary-400 rounded-sm 
            transition-colors hover:cursor-pointer"
            onClick={()=>toggleSidebar()}
          >
            <svg width={"25px"} height={"25px"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="items-center px-3.5 py-1 text-xs font-medium bg-linear-to-r bg-gradient-background 
                     text-muted rounded-full shadow-md shadow-primary-200/30 hidden sm:inline-flex
                      border border-primary-400/30 capitalize ">
                  {user?.role}
                </span>
                {user?.name ? <span className="font-medium hidden sm:inline">{user?.name}</span> : null}
          </div>

          <div className="w-9 h-9 bg-primary-600/20 border border-primary-400 rounded-full flex items-center justify-center font-semibold text-primary-300">
            { user?.name ? user.name[0]?.toUpperCase() : "U"}
          </div>
          <button
            onClick={logout}
            className="hover:cursor-pointer flex items-center gap-1 px-1 py-1 text-error hover:border hover:bg-error-light/20 rounded-sm transition-colors text-sm font-medium"
          >
             <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            <span className="md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );

};

export default Header;