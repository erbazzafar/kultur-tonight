// components/OtpModal.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { InputOTPDemo } from './otpInput';
import Button from '@mui/material/Button';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    maxWidth: 440,
    bgcolor: 'background.paper',
    borderRadius: '12px',
    boxShadow: 24,
    p: 4,
    outline: 'none',
};

interface OtpModalProps {
    open: boolean;
    handleClose: () => void;
    otp: string;
    setOtp: React.Dispatch<React.SetStateAction<string>>;
    verifyOtp: () => void;
}

export default function OtpModal({ open, handleClose, otp, setOtp, verifyOtp }: OtpModalProps) {
    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>

                {/* Heading */}
                <Typography
                    variant="h6"
                    component="h2"
                    fontWeight={600}
                    textAlign="center"
                    mb={1}
                >
                    Verify Your Email
                </Typography>

                {/* Subtext */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    mb={3}
                >
                    A 6-digit verification code has been sent to your email address. Please enter it below to continue.
                </Typography>

                {/* OTP Input */}
                <Box display="flex" justifyContent="center" mb={3}>
                    <InputOTPDemo otp={otp} setOtp={setOtp} />
                </Box>

                {/* Verify Button */}
                <Button
                    variant="contained"
                    fullWidth
                    className="cursor-pointer group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] mt-4"
                    onClick={verifyOtp}
                >
                    Verify Code
                </Button>

                {/* Resend Line */}
                <Typography
                    variant="body2"
                    align="center"
                    sx={{ mt: 3, color: 'text.secondary' }}
                >
                    Didn’t receive the code?{' '}
                    <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => alert('Resend clicked')}
                    >
                        Resend Email
                    </Typography>
                </Typography>

            </Box>
        </Modal>
    );
}
