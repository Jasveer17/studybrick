import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import 'katex/dist/katex.min.css';

const MathRenderer = ({ children, block = false }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            // If children is a string, set it as text content first
            if (typeof children === 'string') {
                containerRef.current.textContent = children;
            }

            // Use auto-render to parse the mixed content
            renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true }
                ],
                throwOnError: false,
                strict: false
            });
        }
    }, [children]);

    return <span ref={containerRef} className={block ? 'block my-2' : ''}>{typeof children !== 'string' ? children : null}</span>;
};

export default MathRenderer;
