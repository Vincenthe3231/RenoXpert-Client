import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import { Label, Select } from 'flowbite-react';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/shadcn-ui/Default-Ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ApprovalModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    id: number | undefined;
    name?: string;
    email?: string;
    refetchOnboardingList: () => void;
}

const staffTypeOptions = [
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "staff", label: "Staff" },
];

const ApprovalModal = ({ isOpen, setIsOpen, id, name = '', email = '', refetchOnboardingList }: ApprovalModalProps) => {
    const [selectedUserType, setSelectedUserType] = useState('staff');
    const [isLoading, setIsLoading] = useState(false);

    const handleApprove = async () => {

        setIsLoading(true);

        try {
            const response = await fetch(`/api/onboarding/${id}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userType: selectedUserType }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error', message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Show success toast
            toast({
                title: <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Onboarding Approved</span>
                </div>,
                description: "The onboarding has been approved.",
            });

            setIsOpen(false);
            refetchOnboardingList();

        } catch (error: any) {
            console.error('Error approving onboarding:', error);
            toast({
                title: <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Failed to approve onboarding</span>
                </div>,
                description: "Something went wrong while approving the onboarding.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            transition
            className='fixed inset-0 flex w-screen items-center justify-center bg-black/60 p-4 transition duration-300 ease-out data-[closed]:opacity-0 z-50'>
            <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4'>
                    <DialogPanel
                        transition
                        className='w-full max-w-lg rounded-lg bg-white dark:bg-darkgray p-6 shadow-md dark:dark-shadow-md '>
                        <DialogTitle as='h3' className='text-lg font-semibold text-ld'>
                            Approve Onboarding
                        </DialogTitle>
                        <Alert variant='lightinfo' className='mt-2'>
                            <AlertTitle className='text-info'>Note</AlertTitle>
                            <AlertDescription>
                                Please review the user information before approving this onboarding request.
                            </AlertDescription>
                        </Alert>
                        <div className='mt-4 space-y-4'>
                            <div className='grid grid-cols-[100px_1fr] gap-4 items-center'>
                                <Label htmlFor="name">Name</Label>
                                <p className='text-sm text-darklink dark:text-gray-200'>
                                    {name || 'N/A'}
                                </p>
                            </div>
                            <div className='grid grid-cols-[100px_1fr] gap-4 items-center'>
                                <Label htmlFor="email">Email</Label>
                                <p className='text-sm text-darklink dark:text-gray-200'>
                                    {email || 'N/A'}
                                </p>
                            </div>
                            <div className='grid grid-cols-[100px_1fr] gap-4 items-center'>
                                <Label htmlFor="userType">User Type</Label>
                                <Select
                                    id="userType"
                                    required
                                    className="select-md"
                                    value={selectedUserType}
                                    onChange={(e) => setSelectedUserType(e.target.value)}
                                >
                                    {staffTypeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                        <div className='mt-8 flex justify-end gap-3'>
                            <button
                                className='ui-button-small px-6 bg-success disabled:opacity-50 disabled:cursor-not-allowed'
                                onClick={handleApprove}
                                disabled={isLoading}>
                                {isLoading ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className='ui-button-small bg-error px-6'>
                                Cancel
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default ApprovalModal;