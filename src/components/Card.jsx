import React from 'react';
import './Card.css';

/**
 * Card Component with glassmorphism effect
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hover - Enable hover effect
 */
const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
