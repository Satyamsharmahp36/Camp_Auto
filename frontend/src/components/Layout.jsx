import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Zap, Activity } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/create', icon: PlusCircle, label: 'Create Campaign' },
  { path: '/triggers', icon: Zap, label: 'Triggers' },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f2847]/90 backdrop-blur-xl border-b border-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e88e5] to-[#1565c0] flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Optmyzr</h1>
                <p className="text-xs text-[#90caf9]">Event Automation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#1e88e5]/20 text-[#90caf9] border border-[#1e88e5]/40'
                        : 'text-[#94a3b8] hover:text-white hover:bg-[#1e3a5f]/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
