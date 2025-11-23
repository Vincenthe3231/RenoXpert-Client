import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import { Label} from 'flowbite-react';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/shadcn-ui/Default-Ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/app/components/shadcn-ui/Default-Ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RejectModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    id: number | undefined;
    name?: string;
    email?: string;
    refetchOnboardingList: () => void;
}

const RejectModal = ({ isOpen, setIsOpen, id, name = '', email = '', refetchOnboardingList }: RejectModalProps) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const queryClient = useQueryClient();

    const rejectMutation = useMutation({
        mutationFn: async (rejectionReason: string) => {
            const response = await fetch(`/api/onboarding/${id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rejectionReason: rejectionReason.trim() }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error', message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return response.json();
        },
        onSuccess: () => {
            // Show success toast
            toast({
                title: <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Onboarding Rejected</span>
                </div>,
                description: "The onboarding has been rejected.",
            });

            setIsOpen(false);
            setRejectionReason('');
            // Invalidate and refetch onboarding list
            queryClient.invalidateQueries({ queryKey: ['onboardingList'] });
            refetchOnboardingList();
        },
        onError: (error: any) => {
            console.error('Error rejecting onboarding:', error);
            toast({
                title: <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Failed to reject onboarding</span>
                </div>,
                description: error.message || "Something went wrong while rejecting the onboarding.",
            });
        },
    });

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            toast({
                title: <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Validation Error</span>
                </div>,
                description: "Please provide a rejection reason.",
            });
            return;
        }

        rejectMutation.mutate(rejectionReason);
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
                        className='w-full max-w-lg rounded-lg bg-white dark:bg-slate-600 p-6 shadow-md dark:dark-shadow-md '>
                        <DialogTitle as='h3' className='text-lg font-semibold text-ld'>
                            Reject Onboarding
                        </DialogTitle>
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
                            <div className='grid grid-cols-[100px_1fr] gap-4 items-start'>
                                <Label htmlFor="rejectionReason">Rejection Reason <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="rejectionReason"
                                    required
                                    rows={4}
                                    placeholder="Please provide a reason for rejecting this onboarding request..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="textarea"
                                />
                            </div>
                        </div>
                        <div className='mt-8 flex justify-end gap-3'>
                            <button
                                className='ui-button-small px-6 bg-error disabled:opacity-50 disabled:cursor-not-allowed'
                                onClick={handleReject}
                                disabled={rejectMutation.isPending || !rejectionReason.trim()}>
                                {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setRejectionReason('');
                                }}
                                className='ui-button-small bg-gray-500 px-6'>
                                Cancel
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default RejectModal;

