import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User, Building2 } from 'lucide-react';

export default function Welcome() {
  const heroImageUrl = "https://images.pexels.com/photos/8005396/pexels-photo-8005396.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gray-100">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <h1 className="font-montserrat text-3xl md:text-4xl font-bold text-[#1A3A5F]">
          Turn Leads Into Loyalty — One Handwritten Note at a Time.
        </h1>
        
        <h3 className="font-source-sans-pro text-lg md:text-xl text-[#5D6970] mt-4 max-w-xl">
          Send authentic-looking handwritten notes that build trust, close deals, and earn referrals — in seconds.
        </h3>

        <div className="flex flex-col md:flex-row gap-4 mt-8 w-full max-w-md">
          <Button asChild className="flex-1 bg-[#1A3A5F] hover:bg-[#1A3A5F]/90 text-white h-14 text-lg">
            <Link to={createPageUrl('FreeSampleOffer?role=rep')}>
              <User className="mr-2 h-5 w-5" />
              I'm a Sales Rep
            </Link>
          </Button>
          <Button asChild className="flex-1 bg-[#C75D3A] hover:bg-[#C75D3A]/90 text-white h-14 text-lg">
            <Link to={createPageUrl('FreeSampleOffer?role=owner')}>
              <Building2 className="mr-2 h-5 w-5" />
              I'm an Organization Owner
            </Link>
          </Button>
        </div>

        <p className="font-source-sans-pro italic text-sm text-[#7CAED6] mt-6">
          No credit card required. Start sending your first note in under 2 minutes.
        </p>
      </div>
    </div>
  );
}