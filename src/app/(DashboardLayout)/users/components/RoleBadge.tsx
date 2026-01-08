import { Badge } from "@/components/ui/badge"
import { Shield, UserCog, User } from "lucide-react"

interface RoleBadgeProps {
  role: string
}

const RoleBadge = ({ role }: RoleBadgeProps) => {
  const normalizedRole = role.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-')
  
  const roleConfig: Record<string, { label: string; variant: string; className: string; icon: React.ReactNode }> = {
    'super-admin': {
      label: 'Super Admin',
      variant: 'outline',
      className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      icon: <Shield size={12} />,
    },
    'superadmin': {
      label: 'Super Admin',
      variant: 'outline',
      className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      icon: <Shield size={12} />,
    },
    'super_admin': {
      label: 'Super Admin',
      variant: 'outline',
      className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      icon: <Shield size={12} />,
    },
    'admin': {
      label: 'Admin',
      variant: 'outline',
      className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      icon: <UserCog size={12} />,
    },
    'staff': {
      label: 'Staff',
      variant: 'outline',
      className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
      icon: <User size={12} />,
    },
  }

  const config = roleConfig[normalizedRole] || {
    label: role,
    variant: 'outline',
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: <User size={12} />,
  }

  return (
    <Badge variant={config.variant as any} className={`gap-1 ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}

export default RoleBadge

