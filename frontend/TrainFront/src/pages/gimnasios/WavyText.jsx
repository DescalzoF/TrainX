
import React, { useState, useEffect } from "react";

const WavyText = ({ text, replay = true }) => {
    const [animation, setAnimation] = useState(true);

    // Create animation loop effect
    useEffect(() => {
        if (replay) {
            const interval = setInterval(() => {
                setAnimation(prev => !prev);
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [replay]);

    return (
        <div className="wavy-text-container">
            {text.split("").map((letter, index) => (
                <span
                    key={index}
                    className="wavy-letter"
                    style={{
                        display: "inline-block",
                        marginRight: letter === " " ? "0.5em" : "0.05em",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        color: "#4285F4",
                        animation: animation ? `wave 0.5s ease-in-out ${index * 0.05}s` : "none",
                        position: "relative",
                        transformOrigin: "bottom"
                    }}
                >
          {letter}
        </span>
            ))}
        </div>
    );
};

export default WavyText;
