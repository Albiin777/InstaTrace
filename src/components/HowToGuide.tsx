import React, { useState } from 'react';
import { Check, Info, ChevronDown, ChevronUp, Download, Eye, HelpCircle } from 'lucide-react';

interface GuideStep {
  number: number;
  title: string;
  description: string;
  highlight?: string;
}

export default function HowToGuide() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const steps: GuideStep[] = [
    {
      number: 1,
      title: "Settings & Activity",
      description: "Open the Instagram app on your mobile device or log into Instagram on your computer. Go to your profile page and click on the Hamburger menu (three horizontal lines) in the top right corner to open Settings.",
    },
    {
      number: 2,
      title: "Accounts Center",
      description: "In the Settings & Activity menu, tap the 'Accounts Center' card located at the very top of the list to manage your meta-wide accounts configuration.",
    },
    {
      number: 3,
      title: "Your Information & Permissions",
      description: "Scroll down to the 'Account settings' segment and click on 'Your Information & Permissions'. This is where you can access and request your off-platform data archives.",
    },
    {
      number: 4,
      title: "Download Your Information",
      description: "Click on 'Download Your Information'. Select 'Download or transfer information' to request a brand new backup of your profile details.",
    },
    {
      number: 5,
      title: "Choose Profile",
      description: "Select the specific Instagram profile you wish to analyze from your list of Meta accounts, then click Next.",
    },
    {
      number: 6,
      title: "Export To Device & Options",
      description: "Select 'Some of your information' for an optimized, fast export. Make sure to choose these parameters:",
      highlight: "• Select 'Connections' and UNCHECK all other sections. (This keeps the file size super small and makes the export complete in seconds!)\n• Format: JSON (Required)\n• Date Range: All Time\n• Media Quality: Medium",
    },
    {
      number: 7,
      title: "Start Export",
      description: "Click 'Submit Request' (or 'Request Download'). Instagram will now bundle your connection data into a secure ZIP archive. Because you unchecked heavy media files, this is usually ready in a few minutes!",
    },
    {
      number: 8,
      title: "Download ZIP",
      description: "Instagram will send you an email notification or modern push alert. Go back to the 'Download Your Information' panel in-app and click 'Download' next to the completed request. Enter your password to retrieve the .zip archive.",
    },
    {
      number: 9,
      title: "Upload ZIP into InstaTrace",
      description: "Drag and drop the downloaded ZIP file right here on InstaTrace (or upload the sample demo file above) to analyze followers, mutuals, and non-mutuals instantly, 100% locally in your browser!",
    },
  ];

  const handleToggle = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-6 sm:p-8 lg:p-10 shadow-sm" id="how-to-get-data">
      <div className="mb-8">
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-orange-50 text-xs font-semibold text-[#F58529] border border-orange-100">
          <HelpCircle className="h-3 w-3" />
          <span>Step-by-Step Guide</span>
        </span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#111827]">
          How to download your Instagram Connections
        </h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Follow these quick steps to generate your official Instagram export securely.
        </p>
      </div>

      {/* Pro Hint Box */}
      <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-800 flex items-start space-x-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Pro Export Hack:</span> Unchecking all media options and selecting <span className="font-semibold underline">only 'Connections' (followers and following)</span> makes the export take under <span className="font-semibold underline">1-2 minutes</span> rather than hours, producing a fast, lightweight ZIP file (under 2MB)!
        </div>
      </div>

      {/* Desktop Timeline Layout (Always visible and beautiful on larger screens) */}
      <div className="hidden md:block relative pl-8 border-l-2 border-[#E5E7EB] space-y-8">
        {steps.map((step, idx) => (
          <div key={idx} className="relative group" id={`desktop-step-${step.number}`}>
            {/* Timeline Number indicator */}
            <div className="absolute -left-[45px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-[#E5E7EB] text-xs font-bold text-[#6B7280] group-hover:border-[#DD2A7B] group-hover:text-[#DD2A7B] transition-colors shadow-sm">
              {step.number}
            </div>
            
            <div>
              <h3 className="text-base font-bold text-[#111827] group-hover:text-[#DD2A7B] transition-colors">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm text-[#6B7280] leading-relaxed max-w-3xl">
                {step.description}
              </p>
              {step.highlight && (
                <div className="mt-2 p-3 rounded-xl bg-orange-50/70 border border-orange-100/50 text-xs font-semibold text-orange-950 whitespace-pre-line leading-relaxed">
                  {step.highlight}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Accordion View (Cleaner for smaller screens) */}
      <div className="md:hidden space-y-3" id="mobile-accordion-steps">
        {steps.map((step, idx) => {
          const isOpen = openAccordion === idx;
          return (
            <div 
              key={idx} 
              className={`rounded-2xl border transition-all ${
                isOpen 
                  ? 'bg-white border-[#DD2A7B] shadow-sm' 
                  : 'bg-white border-[#E5E7EB] active:scale-[0.99]'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggle(idx)}
                className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isOpen ? 'bg-[#DD2A7B] text-white' : 'bg-[#FAFAFA] border border-[#E5E7EB] text-[#6B7280]'
                  }`}>
                    {step.number}
                  </div>
                  <span className="font-bold text-sm text-[#111827]">{step.title}</span>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-[#6B7280]" /> : <ChevronDown className="h-4 w-4 text-[#6B7280]" />}
              </button>
              
              {isOpen && (
                <div className="px-4 pb-4 border-t border-[#FAFAFA] pt-3 text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                  {step.description}
                  {step.highlight && (
                    <div className="mt-2.5 p-3 rounded-xl bg-orange-50 border border-orange-100/70 text-xs font-semibold text-orange-900 whitespace-pre-line">
                      {step.highlight}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-[#E5E7EB] pt-6 gap-3">
        <span className="text-xs text-[#6B7280] flex items-center">
          <Check className="h-3.5 w-3.5 text-emerald-500 mr-1.5" />
          Supports official Meta account formats (.zip containing connection .json)
        </span>
        <a 
          href="https://www.instagram.com/download/request/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#DD2A7B] hover:underline"
        >
          <span>Go to Instagram Export Portal</span>
          <Download className="h-3.5 w-3.5" />
        </a>
      </div>

    </div>
  );
}
