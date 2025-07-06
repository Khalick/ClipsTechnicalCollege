"use client"

import { useState } from 'react'
import { Menu, X, Home, CreditCard, BookOpen, FileText, Calendar, User } from 'lucide-react'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import { Badge } from './ui/badge'
import Link from 'next/link'

interface NavigationItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
  children?: NavigationItem[]
}

interface MobileNavigationProps {
  userType: 'student' | 'admin'
  currentPath?: string
}

export function MobileNavigation({ userType, currentPath = '' }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const studentNavItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/',
      icon: <Home className="h-4 w-4" />
    },
    {
      label: 'Finance',
      href: '/student/finance',
      icon: <CreditCard className="h-4 w-4" />,
      children: [
        { label: 'Fee Statement', href: '/student/fee-statement', icon: <FileText className="h-4 w-4" /> },
        { label: 'Payment History', href: '/student/payments', icon: <CreditCard className="h-4 w-4" /> }
      ]
    },
    {
      label: 'Academics',
      href: '/student/academics',
      icon: <BookOpen className="h-4 w-4" />,
      children: [
        { label: 'Unit Registration', href: '/student/units', icon: <BookOpen className="h-4 w-4" /> },
        { label: 'Exam Card', href: '/student/exam-card', icon: <FileText className="h-4 w-4" /> },
        { label: 'Results', href: '/student/results', icon: <FileText className="h-4 w-4" /> }
      ]
    },
    {
      label: 'Timetable',
      href: '/student/timetable',
      icon: <Calendar className="h-4 w-4" />
    },
    {
      label: 'Profile',
      href: '/student/profile',
      icon: <User className="h-4 w-4" />
    }
  ]

  const adminNavItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: <Home className="h-4 w-4" />
    },
    {
      label: 'Students',
      href: '/admin/students',
      icon: <User className="h-4 w-4" />,
      badge: '245'
    },
    {
      label: 'Finance',
      href: '/admin/finance',
      icon: <CreditCard className="h-4 w-4" />,
      children: [
        { label: 'Fee Management', href: '/admin/fees', icon: <CreditCard className="h-4 w-4" /> },
        { label: 'Payment Records', href: '/admin/payments', icon: <FileText className="h-4 w-4" /> }
      ]
    },
    {
      label: 'Academics',
      href: '/admin/academics',
      icon: <BookOpen className="h-4 w-4" />,
      children: [
        { label: 'Units', href: '/admin/units', icon: <BookOpen className="h-4 w-4" /> },
        { label: 'Allocations', href: '/admin/allocations', icon: <FileText className="h-4 w-4" /> }
      ]
    },
    {
      label: 'Reports',
      href: '/admin/reports',
      icon: <FileText className="h-4 w-4" />
    }
  ]

  const navItems = userType === 'student' ? studentNavItems : adminNavItems

  const NavItem = ({ item, level = 0 }: { item: NavigationItem; level?: number }) => {
    const isActive = currentPath === item.href
    const hasChildren = item.children && item.children.length > 0

    return (
      <div className={`${level > 0 ? 'ml-4' : ''}`}>
        <Link
          href={item.href}
          onClick={() => setIsOpen(false)}
          className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          }`}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </div>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </Link>
        
        {hasChildren && (
          <div className="mt-2 space-y-1">
            {item.children!.map((child, index) => (
              <NavItem key={index} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {userType === 'student' ? 'Student Portal' : 'Admin Portal'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <NavItem key={index} item={item} />
                ))}
              </div>
            </nav>
            
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setIsOpen(false)
                  // Handle logout
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}