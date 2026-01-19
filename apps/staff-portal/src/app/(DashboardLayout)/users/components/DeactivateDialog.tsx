import { Button } from "@/components/ui/button"
import { Dialog, DialogFooter, DialogHeader, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Ban } from "lucide-react"

interface DeactivateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onDeactivate: () => Promise<void> | void
    userName: string
    isLoading?: boolean
}

const DeactivateDialog = ({
    open,
    onOpenChange,
    onDeactivate,
    userName,
    isLoading = false,
}: DeactivateDialogProps) => {
    const handleClose = () => {
        if (isLoading) return
        onOpenChange(false)
    }

    const handleDeactivate = async () => {
        try {
            await onDeactivate()
            onOpenChange(false)
        } catch (error) {
            // Error is surfaced by the parent handler via toast; keep dialog open.
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent 
                className="max-w-lg bg-background dark:bg-darkgray border-2 border-border shadow-2xl"
            >
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 dark:bg-purple-500/10 rounded-lg text-purple-500">
                            <Ban size={20} />
                        </div>
                        <DialogTitle className="text-lg font-bold text-foreground">
                            Deactivate User
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Are you sure you want to deactivate <span className="font-medium text-foreground">{userName}</span>? 
                        This will prevent them from accessing the system. You can reactivate them later if needed.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="grid grid-cols-2 gap-4 sm:grid-cols-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="w-full"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeactivate}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Deactivating...' : 'Confirm Deactivation'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeactivateDialog

