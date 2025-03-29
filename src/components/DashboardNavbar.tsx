'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircle, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  const navItems = [
    { name: 'Workflows', href: '/dashboard' },
    { name: 'Create Workflow', href: '/dashboard/create' },
  ];

  const userInitials = currentUser?.email
    ? currentUser.email.substring(0, 2).toUpperCase()
    : 'U';

  return (
    <header className='border-b bg-white dark:bg-zinc-900'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex items-center'>
            <Link href='/dashboard' className='flex items-center'>
              <span className='text-xl font-bold'>Workflow Manager</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-4'>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href
                    ? 'text-primary bg-primary/10'
                    : 'text-zinc-700 hover:text-primary hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className='flex items-center'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative h-10 w-10 rounded-full'
                >
                  <Avatar>
                    <AvatarFallback className='bg-primary text-primary-foreground'>
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <div className='flex items-center justify-start gap-2 p-2'>
                  <div className='flex flex-col space-y-1 leading-none'>
                    {currentUser?.email && (
                      <p className='font-medium'>{currentUser.email}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href='/dashboard/profile'
                    className='cursor-pointer w-full flex items-center'
                  >
                    <UserCircle className='mr-2 h-4 w-4' />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => logout()}
                  className='cursor-pointer text-red-600 focus:text-red-600'
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <div className='flex md:hidden ml-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className='text-zinc-700 hover:text-primary dark:text-zinc-300'
              >
                {isMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className='md:hidden py-2 border-t'>
            <nav className='flex flex-col space-y-2 py-2'>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.href
                      ? 'text-primary bg-primary/10'
                      : 'text-zinc-700 hover:text-primary hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
