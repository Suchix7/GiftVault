import React from 'react'

const Spinner = () => {
  return (
    <div className="flex items-center justify-center h-80">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;