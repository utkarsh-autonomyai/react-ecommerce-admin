import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Box,
  ChevronLeft,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Package,
  ShoppingCart,
  Star,
  Tag,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type NavItem = {
  to: string;
  icon: ReactNode;
  label: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { to: '/products', icon: <Package size={20} />, label: 'Products' },
      {
        to: '/categories',
        icon: <FolderTree size={20} />,
        label: 'Categories',
      },
      { to: '/inventory', icon: <Warehouse size={20} />, label: 'Inventory' },
    ],
  },
  {
    title: 'Sales',
    items: [
      { to: '/orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
      { to: '/payments', icon: <CreditCard size={20} />, label: 'Payments' },
      { to: '/coupons', icon: <Tag size={20} />, label: 'Coupons' },
    ],
  },
  {
    title: 'Customers',
    items: [
      { to: '/users', icon: <Users size={20} />, label: 'Users' },
      { to: '/reviews', icon: <Star size={20} />, label: 'Reviews' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { to: '/shipping', icon: <Truck size={20} />, label: 'Shipping' },
      {
        to: '/notifications',
        icon: <MessageSquare size={20} />,
        label: 'Notifications',
      },
    ],
  },
];

type SidebarProps = {
  isCollapsed: boolean;
  onToggle: () => void;
};

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  return (
    <aside
      className={cn(
        'bg-sidebar text-sidebar-foreground flex h-screen flex-col border-r transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className='flex h-14 items-center border-b px-4'>
        {!isCollapsed && (
          <div className='flex items-center gap-2'>
            <Box size={24} className='text-primary' />
            <span className='text-lg font-semibold'>Admin</span>
          </div>
        )}
        {isCollapsed && <Box size={24} className='text-primary mx-auto' />}
      </div>

      <nav className='flex-1 overflow-y-auto p-2'>
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className='mb-4'>
            {!isCollapsed && (
              <p
                className='text-muted-foreground mb-1 px-3 text-xs font-medium uppercase
  tracking-wider'
              >
                {group.title}
              </p>
            )}
            {isCollapsed && <div className='bg-border mx-auto mb-1 h-px w-8' />}

            {group.items.map((item) => (
              <NavLink key={item.to} item={item} isCollapsed={isCollapsed} />
            ))}
          </div>
        ))}
      </nav>

      <div className='border-t p-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onToggle}
          className='w-full justify-center'
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            size={20}
            className={cn(
              'transition-transform duration-300',
              isCollapsed && 'rotate-180',
            )}
          />
        </Button>
      </div>
    </aside>
  );
};

type NavLinkProps = {
  item: NavItem;
  isCollapsed: boolean;
};

const NavLink = ({ item, isCollapsed }: NavLinkProps) => {
  const linkContent = (
    <Link
      to={item.to}
      activeOptions={{
        exact: item.to === '/',
        includeSearch: false,
      }}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isCollapsed && 'justify-center px-0',
      )}
      activeProps={{
        className: 'bg-accent text-accent-foreground',
      }}
    >
      {item.icon}
      {!isCollapsed && <span>{item.label}</span>}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side='right'>{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
};
