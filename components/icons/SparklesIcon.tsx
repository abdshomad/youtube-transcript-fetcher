import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2l4.45.222a1 1 0 01.53 1.745l-3.2 2.81.95 4.516a1 1 0 01-1.482 1.054L12 15.333l-3.89 2.152a1 1 0 01-1.482-1.054l.95-4.516-3.2-2.81a1 1 0 01.53-1.745l4.45-.222L11.033 2.744A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
);

export default SparklesIcon;
