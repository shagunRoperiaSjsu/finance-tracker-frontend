import { AppShellNavbar, NavLink, Stack, ThemeIcon } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  IconDashboard, 
  IconSettings, 
  IconLogout,
  IconWallet,
  IconReportMoney 
} from '@tabler/icons-react';

function AppNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { 
      label: 'Dashboard', 
      icon: IconDashboard, 
      path: '/dashboard',
      onClick: () => navigate('/dashboard')
    },
    { 
      label: 'Transactions', 
      icon: IconWallet, 
      path: '/transactions',
      onClick: () => navigate('/transactions')
    },
    { 
      label: 'Reports', 
      icon: IconReportMoney, 
      path: '/reports',
      onClick: () => navigate('/reports')
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <AppShellNavbar p="md">
      <Stack justify="space-between" h="100%">
        <Stack>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={
                <ThemeIcon variant={location.pathname === item.path ? 'filled' : 'light'} size="sm">
                  <item.icon size="1rem" />
                </ThemeIcon>
              }
              active={location.pathname === item.path}
              onClick={item.onClick}
            />
          ))}
        </Stack>

        <NavLink
          label="Logout"
          color="red"
          leftSection={
            <ThemeIcon color="red" variant="light" size="sm">
              <IconLogout size="1rem" />
            </ThemeIcon>
          }
          onClick={handleLogout}
        />
      </Stack>
    </AppShellNavbar>
  );
}

export default AppNavbar;