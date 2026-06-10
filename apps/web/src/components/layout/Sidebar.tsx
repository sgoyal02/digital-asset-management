import { NavLink } from 'react-router-dom';
import file from '../../images/file.svg';
import dashIcon from '../../images/dashboard.svg';
import folder from '../../images/folder.svg';

const menuItems = [
  { to: ".", label: "Dashboard", icon: dashIcon}, 
  { to: "assets", label: "Assets Overview", icon: file },
  { to: "collections", label: "Collections", icon: folder },
];

interface SideBarProp{
    isOpen:boolean
}

const Sidebar = ({isOpen}:SideBarProp) => {
  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-surface border-r border-border z-40 
                  transition-all duration-300 overflow-hidden
                  ${isOpen ? 'w-60' : 'w-20'}`}
     >
      <div className="py-4 px-2">
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "."}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-2 py-2 rounded-md transition-all duration-200 
                  ${isActive ? 'bg-primary-500 text-white': 
                    'text-gray hover:bg-hover hover:text-main-white'}
                    ${isOpen ? 'justify-start' : 'justify-center'}
                    `
                }
              >
                <img src={item.icon} className='w-5 h-5'/>
                {isOpen ? <span>{item.label}</span> : null}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;