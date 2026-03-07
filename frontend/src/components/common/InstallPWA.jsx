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
        <div className="animated-border-wrapper transition-all duration-300">
            <div className="animated-border-inner">
                <div className="flex items-center gap-3">
                    <div className="bg-[#111]/5 p-2.5 rounded-full flex-shrink-0 border border-gray-100">
                        <Download className="w-5 h-5 text-[#111]" />
                    </div>
                    <div className="flex flex-col pt-0.5">
                        <h3 className="text-[#111] text-[13px] uppercase tracking-[0.2em] leading-tight flex items-center">
                            <span className="font-light">Cipher</span>
                            <span className="font-semibold text-[#B76E79]">Gate</span>
                        </h3>
                        <p className="text-[#666] text-[9px] mt-1 hidden sm:block uppercase tracking-[0.1em]">App for quick access</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <button
                        onClick={onDismiss}
                        className="p-2 text-gray-400 hover:text-[#111] rounded-full transition-colors hidden sm:block"
                        title="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDismiss}
                        className="text-[#666] text-[10px] uppercase tracking-[0.1em] font-medium hover:text-[#111] px-2 sm:hidden transition-colors"
                    >
                        Later
                    </button>
                    <button
                        onClick={onClick}
                        className="bg-[#111] hover:bg-black text-white px-5 py-2.5 text-[10px] font-semibold tracking-[0.2em] uppercase transition-all duration-500 flex items-center gap-1.5"
                    >
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPWA;

