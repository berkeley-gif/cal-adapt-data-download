// pages/index.tsx

import React from 'react';

import './../../styles/components/loading-spinner.scss'

const LoadingSpinner: React.FC = () => {
    return (
        <div className="lds-default">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
};

export default LoadingSpinner;