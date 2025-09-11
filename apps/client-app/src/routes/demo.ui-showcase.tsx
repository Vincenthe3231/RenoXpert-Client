import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { Checkbox } from '@repo/ui/components/checkbox'
import { Switch } from '@repo/ui/components/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui/components/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/components/popover'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/tabs'
import { Progress } from '@repo/ui/components/progress'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu'
import { Badge } from '@repo/ui/components/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/ui/components/breadcrumb'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@repo/ui/components/navigation-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/components/sheet'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table'
import { Toaster, toast } from '@repo/ui/components/sonner'
import { ModeToggle } from '../components/mode-toggle'

export const Route = createFileRoute('/demo/ui-showcase')({
  component: UIShowcase,
})

function UIShowcase() {
  const [progress, setProgress] = useState(45)
  const [checked, setChecked] = useState(false)
  const [enabled, setEnabled] = useState(true)

  return (
    <div className="min-h-screen bg-background p-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                UI Components Showcase
              </h1>
              <p className="text-lg text-muted-foreground">
                A comprehensive showcase of available UI components from the
                design system.
              </p>
            </div>
            <ModeToggle />
          </div>
        </div>

        {/* Button Variants Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Button Components
          </h2>

          <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              Button Variants
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              Button Sizes
            </h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">🎯</Button>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              Button States
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button className="opacity-50">Loading...</Button>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              Interactive Examples
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => alert('Primary action clicked!')}
                variant="default"
              >
                Primary Action
              </Button>
              <Button
                onClick={() => alert('Secondary action clicked!')}
                variant="outline"
              >
                Secondary Action
              </Button>
              <Button
                onClick={() => alert('Destructive action clicked!')}
                variant="destructive"
              >
                Delete Item
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              Dropdown-menu Examples
            </h3>
            <div className="flex flex-wrap gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>Open</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Item 1</DropdownMenuItem>
                  <DropdownMenuItem>Item 2</DropdownMenuItem>
                  <DropdownMenuItem>Item 3</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>

        {/* Inputs & Forms */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Inputs & Form Controls
          </h2>
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-card-foreground mb-4">
                Text Inputs
              </h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="you@example.com"
                    type="email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" placeholder="••••••••" type="password" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-card-foreground mb-4">
                Checkbox & Switch
              </h3>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => setChecked(Boolean(v))}
                  />
                  <span className="text-sm text-card-foreground">
                    Subscribe to newsletter
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={enabled} onCheckedChange={setEnabled} />
                  <span className="text-sm text-card-foreground">
                    Enable notifications
                  </span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-card-foreground mb-4">
                Select
              </h3>
              <div className="flex items-center gap-3">
                <Label>Favorite fruit</Label>
                <Select defaultValue="apple">
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="grape">Grape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Overlays */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Overlays
          </h2>
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog title</DialogTitle>
                    <DialogDescription>
                      Short explanation about what this dialog does.
                    </DialogDescription>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    Here is some dialog content.
                  </p>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover for tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>Helpful tip text</TooltipContent>
              </Tooltip>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost">Open Popover</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="text-sm">
                    This is a popover with any content.
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </section>

        {/* Navigation & Tabs */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Tabs</h2>
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <Tabs defaultValue="account" className="w-full">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              <TabsContent value="account" className="mt-4">
                <div className="text-sm text-card-foreground">
                  Account settings go here.
                </div>
              </TabsContent>
              <TabsContent value="password" className="mt-4">
                <div className="text-sm text-card-foreground">
                  Change your password here.
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Feedback */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Progress
          </h2>
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-4">
            <Progress value={progress} />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setProgress((p) => Math.max(0, p - 10))}
              >
                -10%
              </Button>
              <Button
                size="sm"
                onClick={() => setProgress((p) => Math.min(100, p + 10))}
              >
                +10%
              </Button>
            </div>
          </div>
        </section>

        {/* Layout & Display */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Cards</h2>
          <div className="bg-card rounded-lg shadow-sm border">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Card title</CardTitle>
                <CardDescription>
                  Short description of the content.
                </CardDescription>
                <CardAction>
                  <Button size="sm" variant="outline">
                    Action
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="py-6">
                <p className="text-sm text-card-foreground">
                  Card content area. Use this to wrap any content.
                </p>
              </CardContent>
              <CardFooter className="border-t py-4">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="outline" className="ml-2">
                  Secondary
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Badges */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Badges
          </h2>
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              Badge Variants
            </h3>
            <div className="flex flex-wrap gap-4">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Breadcrumbs
          </h2>
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              Navigation Breadcrumb
            </h3>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/components">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </section>

        {/* Navigation Menu */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Navigation Menu
          </h2>
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              Dropdown Navigation
            </h3>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
                      <NavigationMenuLink>
                        <div className="text-sm font-medium leading-none">
                          Introduction
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Re-usable components built using Radix UI and Tailwind
                          CSS.
                        </p>
                      </NavigationMenuLink>
                      <NavigationMenuLink>
                        <div className="text-sm font-medium leading-none">
                          Installation
                        </div>
                        <p className="text-sm text-muted-foreground">
                          How to install dependencies and structure your app.
                        </p>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
                      <NavigationMenuLink>
                        <div className="text-sm font-medium leading-none">
                          Button
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Displays a button or a component that looks like a
                          button.
                        </p>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </section>

        {/* Sheet */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Sheet</h2>
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              Side Panel
            </h3>
            <div className="flex gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Edit profile</SheetTitle>
                    <SheetDescription>
                      Make changes to your profile here. Click save when you're
                      done.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value="Pedro Duarte" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" value="@peduarte" />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </section>

        {/* Sonner Toast */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Toast Notifications
          </h2>
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              Sonner Toast
            </h3>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  toast('Event has been created', {
                    description: 'Sunday, December 03, 2023 at 9:00 AM',
                    action: {
                      label: 'Undo',
                      onClick: () => console.log('Undo'),
                    },
                  })
                }
              >
                Show Toast
              </Button>
              <Button
                variant="default"
                onClick={() =>
                  toast.success(
                    'Success! Your action was completed successfully.',
                    {
                      description:
                        'The operation completed without any issues.',
                    },
                  )
                }
              >
                Success Toast
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  toast.error('Error! Something went wrong.', {
                    description:
                      'Please try again or contact support if the problem persists.',
                  })
                }
              >
                Error Toast
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Click the buttons above to see different types of Sonner toast
              notifications with descriptions.
            </p>
          </div>
        </section>

        {/* Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Table</h2>
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              Data Table
            </h3>
            <Table>
              <TableCaption>
                A list of your recent users and their status.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">John Doe</TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell>john@example.com</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Jane Smith</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Inactive</Badge>
                  </TableCell>
                  <TableCell>jane@example.com</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Bob Johnson</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Suspended</Badge>
                  </TableCell>
                  <TableCell>bob@example.com</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Code Examples Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Code Examples
          </h2>

          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              Import and Usage
            </h3>
            <div className="bg-muted text-muted-foreground p-4 rounded-md font-mono text-sm overflow-x-auto">
              <pre>{`import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { Checkbox } from '@repo/ui/components/checkbox'
import { Switch } from '@repo/ui/components/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/components/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs'
import { Progress } from '@repo/ui/components/progress'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/card'
import { Badge } from '@repo/ui/components/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@repo/ui/components/breadcrumb'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@repo/ui/components/navigation-menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@repo/ui/components/sheet'
import { Toaster } from '@repo/ui/components/sonner'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/components/table'

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// With click handlers
<Button onClick={() => console.log('clicked')}>
  Log Click
</Button>

// Input
<Label htmlFor='email'>Email</Label>
<Input id='email' placeholder='you@example.com' />

// Checkbox & Switch
<Checkbox />
<Switch />

// Select
<Select defaultValue='apple'>
  <SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger>
  <SelectContent>
    <SelectItem value='apple'>Apple</SelectItem>
  </SelectContent>
</Select>

// Dialog
<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>

// Badge
<Badge variant="default">Default</Badge>
<Badge variant="destructive">Error</Badge>

// Breadcrumb
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>

// Table
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell><Badge>Active</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>`}</pre>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm">
          <p>
            This showcase demonstrates the available UI components in the design
            system.
          </p>
          <p className="mt-2">
            Components are built with Radix UI primitives and styled with
            Tailwind CSS.
          </p>
        </div>
      </div>
    </div>
  )
}
