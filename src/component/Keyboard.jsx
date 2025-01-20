import React from 'react';

const Keyboard = ({ currentKey }) => {
    const rows = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
        [' ']
    ];

    return (
        <div className="inline-block bg-gray-100 rounded-lg p-4 md:p-8 shadow-lg mt-10">
            <div className="flex flex-col items-center space-y-4">
                {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex space-x-2 md:space-x-3 justify-center">
                        {row.map((key) => (
                            <div
                                key={key}
                                className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-lg text-base md:text-lg font-bold
                                ${key === ' ' ? `min-w-[300px] rounded` : ''}
                                ${currentKey === key ? 'bg-[#476730] text-white scale-110 animate-pulse' : 'bg-gray-200'}`}
                            >
                                {key === ' ' ? 'Space' : key.toUpperCase()}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>

    );
};

export default Keyboard;