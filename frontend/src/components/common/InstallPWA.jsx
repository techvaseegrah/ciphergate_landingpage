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
        <div className="mobile-install-banner transition-all duration-300">
            <div className="banner-content">
                {/* Left side: Icon and Brand Name */}
                <div className="left-group">
                    <Download className="w-5 h-5 text-black" />
                    <span className="brand-name">
                        CIPHERGATE
                    </span>
                </div>

                {/* Right side: Later and Install button */}
                <div className="right-group">
                    <span 
                        onClick={onDismiss}
                        className="later-link"
                    >
                        LATER
                    </span>
                    <button 
                        onClick={onClick}
                        className="install-btn"
                    >
                        INSTALL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPWA;

