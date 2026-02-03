import { useState } from 'react';
import { Chrome, Globe, X, Download } from 'lucide-react';

interface BrowserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const browsers = [
    {
        id: 'chrome',
        name: 'Google Chrome',
        icon: Chrome,
        description: 'Recommended for best experience',
        downloadUrl: '/extensions/minutemaker.crx'
    },
    {
        id: 'edge',
        name: 'Microsoft Edge',
        icon: Globe,
        description: 'Full feature support',
        downloadUrl: '/extensions/minutemaker.crx'
    },
    {
        id: 'firefox',
        name: 'Mozilla Firefox',
        icon: Globe,
        description: 'Coming soon',
        downloadUrl: null,
        disabled: true
    }
];

export default function BrowserSelectModal({ isOpen, onClose }: BrowserModalProps) {
    const [downloading, setDownloading] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleDownload = (browser: typeof browsers[0]) => {
        if (browser.disabled || !browser.downloadUrl) return;

        setDownloading(browser.id);

        // Create download link
        const link = document.createElement('a');
        link.href = browser.downloadUrl;
        link.download = 'minutemaker.crx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
            setDownloading(null);
        }, 2000);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)'
        }}>
            <div style={{
                background: 'linear-gradient(180deg, #1a1a1f 0%, #0f0f12 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '32px',
                maxWidth: '480px',
                width: '90%',
                position: 'relative'
            }}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        padding: '8px'
                    }}
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '600', color: 'white', margin: '0 0 8px' }}>
                        Download Live Recorder
                    </h2>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                        Select your browser to download the extension
                    </p>
                </div>

                {/* Browser Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {browsers.map(browser => {
                        const Icon = browser.icon;
                        const isDisabled = browser.disabled;
                        const isDownloading = downloading === browser.id;

                        return (
                            <button
                                key={browser.id}
                                onClick={() => handleDownload(browser)}
                                disabled={isDisabled}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px 20px',
                                    background: isDisabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    opacity: isDisabled ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={e => {
                                    if (!isDisabled) {
                                        e.currentTarget.style.background = 'rgba(255,107,74,0.1)';
                                        e.currentTarget.style.borderColor = 'rgba(255,107,74,0.3)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = isDisabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                }}
                            >
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '10px',
                                    background: 'rgba(255,107,74,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={22} color="#FF6B4A" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: '500', color: 'white' }}>
                                        {browser.name}
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                                        {browser.description}
                                    </div>
                                </div>
                                {!isDisabled && (
                                    <Download
                                        size={18}
                                        color={isDownloading ? '#4ade80' : 'rgba(255,255,255,0.4)'}
                                        style={{ transition: 'color 0.2s' }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Instructions */}
                <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    background: 'rgba(255,107,74,0.05)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,107,74,0.1)'
                }}>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
                        <strong style={{ color: '#FF6B4A' }}>Installation:</strong><br />
                        1. Download the .crx extension file<br />
                        2. Go to <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>chrome://extensions</code> (or edge://extensions)<br />
                        3. Enable "Developer mode" in the top right<br />
                        4. Drag and drop the .crx file onto the page
                    </p>
                </div>
            </div>
        </div>
    );
}
