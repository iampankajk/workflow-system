import { SignupForm } from '@/components/SignupForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import bgImg from '@/assets/bg-img.png';

export default function SignupPage() {
  return (
    <div className='flex flex-col lg:flex-row items-center justify-center min-h-screen  p-8 gap-16'>
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

      <Card className='w-full max-w-md mx-4'>
        <CardHeader>
          <CardTitle className='text-2xl text-center'>
            Create an Account
          </CardTitle>
          <CardDescription className='text-center'>
            Register to start creating and managing your workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  );
}
