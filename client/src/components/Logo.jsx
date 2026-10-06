import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-yellow-500 text-white p-2.5 sm:p-3 rounded-2xl">
        <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
    </div>
  );
}