
import { useState } from 'react';
import emailjs from 'emailjs-com';
import { toast } from 'sonner';

interface EmailParams {
  to_email?: string;
  to_name?: string;
  message?: string;
  subject?: string;
  from_name?: string;
  wallet_address?: string;
  [key: string]: string | undefined;
}

interface EmailServiceConfig {
  serviceId: string;
  templateId: string;
  userId: string;
}

export const useEmailService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (
    params: EmailParams, 
    config: EmailServiceConfig
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Initialize EmailJS with the user ID if it hasn't been initialized
      if (!emailjs.init) {
        emailjs.init(config.userId);
      }

      const response = await emailjs.send(
        config.serviceId,
        config.templateId,
        params
      );

      setLoading(false);
      toast.success('Email sent successfully');
      return { success: true, response };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false);
      toast.error(`Failed to send email: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Predefined email templates for common scenarios
  const sendVoterRegistrationEmail = async (
    userEmail: string, 
    userName: string, 
    walletAddress: string,
    voterDetails: any,
    config: EmailServiceConfig
  ) => {
    const params: EmailParams = {
      to_email: userEmail,
      to_name: userName,
      from_name: 'VoteChain',
      subject: 'VoteChain Registration Confirmation',
      wallet_address: walletAddress,
      message: JSON.stringify(voterDetails),
    };

    const result = await sendEmail(params, config);
    if (result.success) {
      toast.success('Registration confirmation email sent successfully');
    }
    return result;
  };

  const sendOtpEmail = async (
    userEmail: string, 
    userName: string, 
    otp: string,
    config: EmailServiceConfig
  ) => {
    const params: EmailParams = {
      to_email: userEmail,
      to_name: userName,
      from_name: 'VoteChain',
      subject: 'Your VoteChain Verification Code',
      otp: otp,
    };

    const result = await sendEmail(params, config);
    if (result.success) {
      toast.success('OTP sent to your email');
    }
    return result;
  };

  const sendVoteConfirmationEmail = async (
    userEmail: string, 
    userName: string, 
    electionDetails: any,
    candidateVoted: string,
    config: EmailServiceConfig
  ) => {
    const params: EmailParams = {
      to_email: userEmail,
      to_name: userName,
      from_name: 'VoteChain',
      subject: 'Your Vote Has Been Recorded',
      election_name: electionDetails.name,
      candidate_name: candidateVoted,
      timestamp: new Date().toLocaleString(),
    };

    const result = await sendEmail(params, config);
    if (result.success) {
      toast.success('Vote confirmation email sent successfully');
    }
    return result;
  };

  return {
    sendEmail,
    sendVoterRegistrationEmail,
    sendOtpEmail,
    sendVoteConfirmationEmail,
    loading,
    error
  };
};
