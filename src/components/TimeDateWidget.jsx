import React, { useEffect, useState } from 'react';

const TimeDateWidget = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-neon-cyan font-mono select-none">
      <div className="text-4xl font-bold">{dateTime.toLocaleTimeString()}</div>
      <div className="text-sm mt-1">{dateTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
  );
};

export default TimeDateWidget;