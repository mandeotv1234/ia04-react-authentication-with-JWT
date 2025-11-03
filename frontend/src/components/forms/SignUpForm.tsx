import  { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useRegisterMutation } from '../../hooks/useRegisterMutation';
import type { RegisterPayload } from '../../api/userApi';
import { Link } from 'react-router-dom';


type FormValues = RegisterPayload;

export default function SignUpForm() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  const mutation = useRegisterMutation();
  const watchPassword = watch('password');

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (mutation.isSuccess) {
      setShowSuccess(true);
      reset();
      
      const timer = setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Registration successful! Please log in.' }
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [mutation.isSuccess, navigate, reset]);

  const passwordValidation = {
    required: 'Password is required',
    minLength: { 
      value: 6, 
      message: 'Password must be at least 6 characters long' 
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: 'Password must contain uppercase, lowercase, number and special character'
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(watchPassword || '');
  
  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  const getErrorMessage = (error: any): string => {
    if (!error) return 'Something went wrong. Please try again.';
    
    if (typeof error === 'string') return error;
    
    if (error?.response?.data) {
      const responseData = error.response.data;
      
      if (responseData.message && typeof responseData.message === 'object' && responseData.message.message) {
        return responseData.message.message;
      }
      
      if (responseData.message && typeof responseData.message === 'string') {
        return responseData.message;
      }
    }
    
    if (error?.message && typeof error.message === 'string') {
      return error.message;
    }
    
    return 'Something went wrong. Please try again.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join us today and get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
          {mutation.isPending && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Creating your account...</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              disabled={mutation.isPending}
              {...register('email', {
                required: 'Email is required',
                pattern: { 
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                  message: 'Please enter a valid email address' 
                },
              })}
              error={errors.email?.message}
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                disabled={mutation.isPending}
                {...register('password', passwordValidation)}
                error={errors.password?.message}
              />
              
              {watchPassword && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 2 ? 'text-red-600' :
                      passwordStrength <= 3 ? 'text-yellow-600' :
                      passwordStrength <= 4 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 font-medium">Password requirements:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center transition-colors ${watchPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 transition-colors ${watchPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      6+ characters
                    </div>
                    <div className={`flex items-center transition-colors ${/[A-Z]/.test(watchPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 transition-colors ${/[A-Z]/.test(watchPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Uppercase
                    </div>
                    <div className={`flex items-center transition-colors ${/[a-z]/.test(watchPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 transition-colors ${/[a-z]/.test(watchPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Lowercase
                    </div>
                    <div className={`flex items-center transition-colors ${/\d/.test(watchPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 transition-colors ${/\d/.test(watchPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Number
                    </div>
                    <div className={`flex items-center transition-colors ${/[@$!%*?&]/.test(watchPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 transition-colors ${/[@$!%*?&]/.test(watchPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Special char
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              isLoading={mutation.isPending} 
              disabled={mutation.isPending}
              className="w-full"
              size="lg"
            >
              {mutation.isPending ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>

          {mutation.isError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top duration-300">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-red-800 text-sm font-medium">Registration Failed</h4>
                  <p className="text-red-700 text-sm mt-1">
                    {getErrorMessage(mutation.error)}
                  </p>
                  {mutation.failureCount > 0 && (
                    <p className="text-red-600 text-xs mt-1">
                      Attempt {mutation.failureCount} failed. {mutation.failureCount < 3 ? 'Retrying...' : 'Please try again later.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {showSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-in slide-in-from-top duration-300">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <span className="text-green-800 text-sm font-medium">
                    Account created successfully!
                  </span>
                  <p className="text-green-700 text-xs mt-1">
                    Redirecting to login page...
                  </p>
                </div>
              </div>
            </div>
          )}

       <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>

        </form>
      </div>
    </div>
  );
}