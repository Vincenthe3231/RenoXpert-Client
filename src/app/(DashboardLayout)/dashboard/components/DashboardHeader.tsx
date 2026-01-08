interface DashboardHeaderProps {
  userName?: string | null
}

const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  const firstName = userName?.split(" ")[0] || "Admin"
  
  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome back, {firstName}!</h1>
      <p className="text-muted-foreground mt-1">Here's an overview of your staff onboarding status.</p>
    </div>
  )
}

export default DashboardHeader

