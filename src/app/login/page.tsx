import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import bgImg from '@/assets/bg-img.png';
import Image from 'next/image';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className='flex flex-col h-auto lg:flex-row items-center justify-center min-h-screen gap-16'>
      {/* HighBridge Header - Left Section */}
      <div className='hidden lg:block absolute h-full w-full top-0 left-0 -z-10 bg-slate-800 opacity-20'></div>
      <Image
        src={bgImg}
        alt='HighBridge Logo'
        className='w-screen h-screen overflow-hidden hidden lg:block absolute top-0 left-0 -z-20'
      />
      <div className='text-center lg:text-left max-w-md lg:max-w-none lg:w-[500px]'>
        <h1 className='text-4xl font-bold mb-4 lg:text-white'>HighBridge</h1>
        <p className='text-lg lg:text-white mb-6'>Building the Future...</p>
        <p className='lg:text-white'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      {/* Login Card - Right Section */}
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader className='space-y-2'>
          <CardTitle className='text-2xl text-center'>WELCOME BACK!</CardTitle>
          <CardDescription className='text-center'>
            Log in to your Account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <LoginForm />

          {/* Separator */}
          <div className='my-6 relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>
                OR
              </span>
            </div>
          </div>

          {/* Social Logins */}
          <div className='space-y-3'>
            <Button variant='outline' className='w-full'>
              Log in with Google
            </Button>
            <Button variant='outline' className='w-full'>
              Log in with Facebook
            </Button>
            <Button variant='outline' className='w-full'>
              Log in with Apple
            </Button>
          </div>
        </CardContent>

        <div className='text-center pb-6'>
          <p className='text-sm text-zinc-600'>
            New User?{' '}
            <a
              href='/signup'
              className='font-semibold text-black hover:underline'
            >
              SIGN UP HERE
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
