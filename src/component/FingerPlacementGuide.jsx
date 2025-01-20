import React, { useState, useEffect } from 'react';

const FingerPlacementGuide = () => {
    const [activeKey, setActiveKey] = useState(null);

    const fingerPlacement = {
        Q: 'Left Pinky',
        W: 'Left Ring Finger',
        E: 'Left Middle Finger',
        R: 'Left Index Finger',
        T: 'Left Index Finger',
        Y: 'Right Index Finger',
        U: 'Right Index Finger',
        I: 'Right Middle Finger',
        O: 'Right Ring Finger',
        P: 'Right Pinky',
        A: 'Left Pinky',
        S: 'Left Ring Finger',
        D: 'Left Middle Finger',
        F: 'Left Index Finger',
        G: 'Left Index Finger',
        H: 'Right Index Finger',
        J: 'Right Index Finger',
        K: 'Right Middle Finger',
        L: 'Right Ring Finger',
        ';': 'Right Pinky',
        Z: 'Left Pinky',
        X: 'Left Ring Finger',
        C: 'Left Middle Finger',
        V: 'Left Index Finger',
        B: 'Left Index Finger',
        N: 'Right Index Finger',
        M: 'Right Index Finger',
        ',': 'Right Middle Finger',
        '.': 'Right Ring Finger',
        '/': 'Right Pinky',
        ' ': 'Thumb',
    };

    const handleMouseEnter = (key) => {
        setActiveKey(key);
    };

    const handleMouseLeave = () => {
        setActiveKey(null);
    };

    const handleKeyDown = (event) => {
        const key = event.key.toUpperCase();
        if (fingerPlacement[key]) {
            setActiveKey(key);
        }
    };

    const handleKeyUp = () => {
        setActiveKey(null);
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return (
        <div className="text-center mt-10 px-4">
            <h3 className="text-2xl md:text-3xl font-extrabold mb-4 border-b-2 border-gray-300 pb-2">
                Interactive Typing Guide
            </h3>
            <p className="text-gray-600 mb-8 text-sm md:text-base">
                Hover over a key or press a key to see the recommended finger placement:
            </p>

            <div className="inline-block bg-gray-100 rounded-lg p-4 md:p-8 shadow-lg">
                <div className="flex flex-col items-center space-y-4 md:space-y-6">
                    {['QWERTYUIOP', 'ASDFGHJKL;', 'ZXCVBNM,./', ' '].map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="flex space-x-2 md:space-x-3 justify-center"
                        >
                            {row.split('').map((key) => (
                                <button
                                    key={key}
                                    onMouseEnter={() => handleMouseEnter(key)}
                                    onMouseLeave={handleMouseLeave}
                                    className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-lg text-base md:text-lg font-bold 
                                        ${activeKey === key
                                            ? 'bg-[#476730] text-white transform scale-105'
                                            : 'bg-gray-200 hover:bg-gray-300'
                                        } 
                                        ${key === ' ' ? `min-w-[300px] rounded` : ''}
                                        transition-all shadow-sm hover:shadow-md`}
                                    aria-label={`Key ${key}`}
                                >
                                    {key === ' ' ? 'Space' : key}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 text-lg md:text-xl font-semibold min-h-8">
                {activeKey ? (
                    <p>
                        <span className="font-bold text-[#476730]">{activeKey}</span> - Use the{' '}
                        <span className="italic text-gray-600">{fingerPlacement[activeKey]}</span>
                    </p>
                ) : (
                    <p></p>
                )}
            </div>

        </div>
    );
};

export default FingerPlacementGuide;

