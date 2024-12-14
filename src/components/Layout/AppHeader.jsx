import { AppShellHeader, Burger, Text, Group, Box, Avatar, Menu, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AppHeader({ opened, setOpened }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <AppShellHeader>
      <Group h="100%" px="md" justify="space-between">
        <Group>
          {isMobile && (
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              size="sm"
            />
          )}
          <Text size="lg" fw={700}>Finance Tracker</Text>
        </Group>

        {user && (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group>
                  <Avatar color="blue" radius="xl">
                    {user.name?.charAt(0) || 'U'}
                  </Avatar>
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>{user.name}</Text>
                    <Text c="dimmed" size="xs">{user.email}</Text>
                  </Box>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              {/* Remove Profile and Settings */}
              {/* <Menu.Item>Profile</Menu.Item>
              <Menu.Item>Settings</Menu.Item> */}
              <Menu.Divider />
              <Menu.Item color="red" onClick={handleLogout}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    </AppShellHeader>
  );
}

export default AppHeader;
