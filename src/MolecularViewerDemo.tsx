import { useState } from 'react';
import MolecularViewer from './MolecularViewer';
import './App.css';

function MolecularViewerDemo() {
    const [selectedReaction, setSelectedReaction] = useState('vinegar-baking-soda');
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(1.0);

    const reactions = [
        { id: 'vinegar-baking-soda', name: '🌋 Vinegar + Baking Soda', safe: true },
        { id: 'hydrogen-peroxide-yeast', name: '🐘 Hydrogen Peroxide + Yeast', safe: true },
        { id: 'bleach-ammonia', name: '☠️ Bleach + Ammonia (TOXIC)', safe: false },
    ];

    return (
        <div className="app" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)', minHeight: '100vh', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ color: '#64ffda', textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem' }}>
                    🧬 3D Molecular Viewer
                </h1>

                {/* Reaction Selector */}
                <div style={{
                    background: '#1a1f3a',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '2px solid #2d3561'
                }}>
                    <h3 style={{ color: '#64ffda', marginBottom: '1rem' }}>Select Reaction:</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {reactions.map(reaction => (
                            <button
                                key={reaction.id}
                                onClick={() => setSelectedReaction(reaction.id)}
                                style={{
                                    flex: 1,
                                    minWidth: '200px',
                                    padding: '1rem',
                                    background: selectedReaction === reaction.id
                                        ? 'linear-gradient(135deg, #64ffda 0%, #4db8c4 100%)'
                                        : '#0d1128',
                                    color: selectedReaction === reaction.id ? '#0d1128' : '#fff',
                                    border: selectedReaction === reaction.id ? 'none' : '1px solid #2d3561',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {reaction.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3D Viewer */}
                <div style={{
                    background: '#1a1f3a',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '2px solid #2d3561'
                }}>
                    <MolecularViewer
                        reactionId={selectedReaction}
                        isPlaying={isPlaying}
                        speed={speed}
                    />
                </div>

                {/* Controls */}
                <div style={{
                    background: '#1a1f3a',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '2px solid #2d3561'
                }}>
                    <h3 style={{ color: '#64ffda', marginBottom: '1rem' }}>Animation Controls:</h3>

                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Play/Pause */}
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            style={{
                                padding: '0.75rem 2rem',
                                background: isPlaying
                                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                        </button>

                        {/* Speed Control */}
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <label style={{ color: '#64ffda', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Speed: {speed}x
                            </label>
                            <input
                                type="range"
                                min="0.5"
                                max="4"
                                step="0.5"
                                value={speed}
                                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    borderRadius: '4px',
                                    background: '#0d1128',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem', color: '#8892b0' }}>
                                <span>0.5x (Slow)</span>
                                <span>1.0x (Normal)</span>
                                <span>2.0x (Fast)</span>
                                <span>4.0x (Very Fast)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div style={{
                    background: '#1a1f3a',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginTop: '2rem',
                    border: '2px solid #2d3561'
                }}>
                    <h3 style={{ color: '#64ffda', marginBottom: '1rem' }}>🎮 How to Use:</h3>
                    <ul style={{ color: '#8892b0', lineHeight: '1.8' }}>
                        <li><strong>Rotate:</strong> Click and drag (or swipe on mobile)</li>
                        <li><strong>Zoom:</strong> Scroll mouse wheel (or pinch on mobile)</li>
                        <li><strong>Select Atom:</strong> Click any sphere to see element properties</li>
                        <li><strong>Animation:</strong> Watch molecules transform from reactants to products</li>
                        <li><strong>Speed:</strong> Adjust slider to slow down or speed up the reaction</li>
                    </ul>
                </div>

                {/* Legend */}
                <div style={{
                    background: '#1a1f3a',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginTop: '2rem',
                    border: '2px solid #2d3561'
                }}>
                    <h3 style={{ color: '#64ffda', marginBottom: '1rem' }}>🎨 Atom Color Legend:</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                        {[
                            { symbol: 'C', name: 'Carbon', color: '#000000' },
                            { symbol: 'H', name: 'Hydrogen', color: '#FFFFFF' },
                            { symbol: 'O', name: 'Oxygen', color: '#FF0000' },
                            { symbol: 'N', name: 'Nitrogen', color: '#0000FF' },
                            { symbol: 'Na', name: 'Sodium', color: '#FFFF00' },
                            { symbol: 'Cl', name: 'Chlorine', color: '#00FF00' },
                        ].map(atom => (
                            <div key={atom.symbol} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    background: atom.color,
                                    border: atom.color === '#FFFFFF' || atom.color === '#FFFF00' ? '2px solid #2d3561' : 'none',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                }} />
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{atom.symbol}</div>
                                    <div style={{ color: '#8892b0', fontSize: '0.85rem' }}>{atom.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MolecularViewerDemo;
