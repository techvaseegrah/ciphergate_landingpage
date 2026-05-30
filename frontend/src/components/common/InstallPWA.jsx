import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPWA = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = e => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const onClick = evt => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }

        promptInstall.prompt();
        promptInstall.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                setIsVisible(false);
            } else {
                console.log('User dismissed the install prompt');
            }
        });
    };

    const onDismiss = () => {
        setIsVisible(false);
    };

    if (!supportsPWA || isInstalled || !isVisible) {
        return null;
    }

    return (
        <div className="pwa-install-popup">
            {/* Close button */}
            <button className="pwa-close-btn" onClick={onDismiss} aria-label="Close">
                <X size={14} />
            </button>

            {/* Top row: logo + title */}
            <div className="pwa-header">
                <div className="pwa-logo-wrap">
                    <img
                        src="/pwa-icon-192.png"
                        alt="CipherGate"
                        className="pwa-logo-img"
                    />
                </div>
                <div className="pwa-title-block">
                    <span className="pwa-title">Install CipherGate</span>
                    <span className="pwa-subtitle">Don't miss important updates.</span>
                </div>
            </div>

            {/* Install button */}
            <button className="pwa-install-btn" onClick={onClick}>
                <Download size={16} />
                Install Application
            </button>
        </div>
    );
};

export default InstallPWA;
