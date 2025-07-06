"use client"

import { useState, useMemo } from 'react'
import { SearchAndFilter } from './SearchAndFilter'
import { TableSkeleton } from './ui/loading-skeleton'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { MoreHorizontal, Edit, Trash2, UserCheck, UserX } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface Student {
  id: string
  name: string
  registration_number: string
  course: string
  level_of_study: string
  status: string
  email?: string
  phone?: string
  fee_balance?: number
}

interface EnhancedStudentsTableProps {
  students: Student[]
  isLoading: boolean
  onEdit: (student: Student) => void
  onDelete: (studentId: string) => void
  onStatusChange: (studentId: string, status: string) => void
}

export function EnhancedStudentsTable({
  students,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange
}: EnhancedStudentsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'graduated', label: 'Graduated' }
      ]
    },
    {
      key: 'course',
      label: 'Course',
      options: [
        { value: 'computer_science', label: 'Computer Science' },
        { value: 'information_technology', label: 'Information Technology' },
        { value: 'business_administration', label: 'Business Administration' },
        { value: 'accounting', label: 'Accounting' }
      ]
    },
    {
      key: 'level',
      label: 'Level',
      options: [
        { value: 'year_1', label: 'Year 1' },
        { value: 'year_2', label: 'Year 2' },
        { value: 'year_3', label: 'Year 3' }
      ]
    }
  ]

  const filteredStudents = useMemo(() => {
    let filtered = students

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(student => {
          switch (key) {
            case 'status':
              return student.status === value
            case 'course':
              return student.course.toLowerCase().replace(/\s+/g, '_') === value
            case 'level':
              return student.level_of_study.toLowerCase().includes(value.replace('year_', 'year '))
            default:
              return true
          }
        })
      }
    })

    return filtered
  }, [students, searchQuery, filters])

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
      graduated: 'outline'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={10} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Students ({filteredStudents.length})
          <Button size="sm">Add Student</Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SearchAndFilter
          searchPlaceholder="Search students by name, registration number, or email..."
          filters={filterOptions}
          onSearch={setSearchQuery}
          onFilter={setFilters}
        />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fee Balance</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No students found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{student.name}</p>
                        {student.email && (
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{student.registration_number}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>{student.level_of_study}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>
                      {student.fee_balance ? (
                        <span className={student.fee_balance > 0 ? 'text-red-600' : 'text-green-600'}>
                          KSh {student.fee_balance.toLocaleString()}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(student)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onStatusChange(student.id, student.status === 'active' ? 'inactive' : 'active')}
                          >
                            {student.status === 'active' ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(student.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}