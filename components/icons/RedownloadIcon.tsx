import React from 'react';

const RedownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.324 3.437l-1.424 1.424A7.5 7.5 0 0017.5 12.5h-2.188zM4.688 8.576a5.5 5.5 0 019.324-3.437l1.424-1.424A7.5 7.5 0 002.5 7.5h2.188z" clipRule="evenodd" />
        <path d="M12.5 7.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v3a.5.5 0 01-1 0V8h-2.5a.5.5 0 01-.5-.5zM7.5 12.5a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-3a.5.5 0 011 0v2.5H7a.5.5 0 01.5.5z" />
    </svg>
);

export default RedownloadIcon;