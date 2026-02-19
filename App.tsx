import React, { useState, useEffect } from 'react';
import { GameState, PlayerStats, LocationData, SHOP_ITEMS, SkinType } from './types';
import Game3D from './components/Game3D';
import { scoutLocation } from './services/gemini';
import { ShoppingCart, Play, MapPin, Trophy, ShieldAlert, Coins, Car, Loader2 } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [stats, setStats] = useState<PlayerStats>({
    money: 1000,
    speedLevel: 1,
    skin: SkinType.CLASSIC,
    highScore: 0
  });
  
  const [locationQuery, setLocationQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('polyChaseStats');
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem('polyChaseStats', JSON.stringify(stats));
  }, [stats]);

  const handleStartMission = async () => {
    if (!locationQuery.trim()) return;
    setIsLoading(true);
    const data = await scoutLocation(locationQuery);
    setCurrentLocation(data);
    setIsLoading(false);
    setGameState(GameState.PLAYING);
    setCurrentScore(0);
  };

  const handleGameOver = (finalScore: number) => {
    setGameState(GameState.GAME_OVER);
    // Convert score to money (e.g., 10% of score)
    const earned = Math.floor(finalScore / 10);
    setStats(prev => ({
      ...prev,
      money: prev.money + earned,
      highScore: Math.max(prev.highScore, finalScore)
    }));
  };

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (stats.money >= item.cost) {
      setStats(prev => {
        const newStats = { ...prev, money: prev.money - item.cost };
        
        if (item.id === 'speed') {
          if (prev.speedLevel < (item.maxLevel || 5)) {
             newStats.speedLevel = prev.speedLevel + 1;
          } else {
             return prev; // Maxed out
          }
        } else if (item.type === 'skin' && item.skinId) {
          newStats.skin = item.skinId;
        }
        
        return newStats;
      });
    }
  };

  // --- RENDERERS ---

  if (gameState === GameState.PLAYING) {
    return (
      <div className="relative w-full h-full">
        {/* HUD */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
           <div className="bg-black/50 backdrop-blur text-white p-4 rounded-lg border border-white/10">
              <div className="text-sm text-gray-400">MISSION TARGET</div>
              <div className="font-bold text-lg text-yellow-400">{currentLocation?.name}</div>
              <div className="text-xs text-gray-300 max-w-[200px]">{currentLocation?.address}</div>
           </div>
           <div className="bg-black/50 backdrop-blur text-white p-2 rounded-lg border border-white/10 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-mono text-xl">{currentScore}</span>
           </div>
        </div>

        <Game3D 
          speedLevel={stats.speedLevel} 
          skin={stats.skin} 
          onGameOver={handleGameOver} 
          onScoreUpdate={setCurrentScore}
        />
        
        {/* Mobile Controls Hint */}
        <div className="absolute bottom-10 left-0 right-0 text-center text-white/30 text-sm pointer-events-none">
          WASD or Arrows to Drive
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900 pointer-events-none" />

      {/* Main Container */}
      <div className="z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Col: Menu/Stats */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600 drop-shadow-lg">
              POLY CHASE
            </h1>
            <p className="text-slate-400 text-lg">World Heist Simulator</p>
          </div>

          <div className="flex gap-4">
             <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex-1">
                <div className="text-xs text-slate-400 uppercase">Cash</div>
                <div className="text-2xl font-mono text-green-400 flex items-center gap-2">
                  <Coins className="w-5 h-5" /> ${stats.money}
                </div>
             </div>
             <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex-1">
                <div className="text-xs text-slate-400 uppercase">High Score</div>
                <div className="text-2xl font-mono text-yellow-400 flex items-center gap-2">
                  <Trophy className="w-5 h-5" /> {stats.highScore}
                </div>
             </div>
          </div>

          {gameState === GameState.GAME_OVER && (
             <div className="bg-red-500/20 border border-red-500/50 p-6 rounded-xl animate-pulse">
                <h2 className="text-2xl font-bold text-red-100 flex items-center gap-2">
                  <ShieldAlert /> BUSTED
                </h2>
                <p className="text-red-200">The cops caught you. You earned ${Math.floor(currentScore / 10)}.</p>
                <button 
                  onClick={() => setGameState(GameState.MENU)}
                  className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-500 rounded font-bold transition-colors w-full"
                >
                  Continue
                </button>
             </div>
          )}

          {gameState === GameState.MENU && (
            <div className="space-y-4">
               <button 
                 onClick={() => setGameState(GameState.MISSION_SELECT)}
                 className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-xl rounded-xl transition-transform hover:scale-105 flex items-center justify-center gap-2"
               >
                 <Play className="fill-current" /> START HEIST
               </button>
               <button 
                 onClick={() => setGameState(GameState.SHOP)}
                 className="w-full py-4 bg-slate-700 hover:bg-slate-600 font-bold text-xl rounded-xl transition-colors flex items-center justify-center gap-2"
               >
                 <ShoppingCart /> BLACK MARKET
               </button>
            </div>
          )}

          {gameState === GameState.MISSION_SELECT && (
             <div className="bg-slate-800/90 p-6 rounded-xl border border-slate-600 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="text-yellow-400" /> Select Target
                </h2>
                <p className="text-sm text-slate-300">
                  Use our AI network to find a target location for the heist.
                </p>
                <input 
                  type="text"
                  placeholder="e.g. Bank in Tokyo, Museum in Paris..."
                  className="w-full bg-slate-900 border border-slate-700 p-4 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartMission()}
                />
                
                {currentLocation && (
                   <div className="p-4 bg-slate-900 rounded border border-slate-700">
                      <div className="font-bold text-yellow-400">{currentLocation.name}</div>
                      <div className="text-xs text-gray-400">{currentLocation.address}</div>
                      {currentLocation.mapUri && (
                         <a href={currentLocation.mapUri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 block">
                            View Intel on Maps
                         </a>
                      )}
                      <p className="mt-2 text-sm italic text-slate-300">"{currentLocation.description}"</p>
                   </div>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={() => setGameState(GameState.MENU)}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleStartMission}
                    disabled={isLoading || !locationQuery}
                    className="flex-[2] py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Launch Mission"}
                  </button>
                </div>
             </div>
          )}
        </div>

        {/* Right Col: Shop Preview / Visuals */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-white/5 p-6 relative overflow-hidden flex flex-col">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Car className="text-blue-400" /> GARAGE
            </h2>
            
            {gameState === GameState.SHOP ? (
               <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                  {SHOP_ITEMS.map(item => {
                    const isOwned = item.type === 'skin' && stats.skin === item.skinId;
                    const isMaxed = item.id === 'speed' && stats.speedLevel >= (item.maxLevel || 5);
                    const canAfford = stats.money >= item.cost;

                    return (
                      <div key={item.id} className="bg-slate-900/80 p-4 rounded-lg border border-slate-700 flex justify-between items-center group hover:border-blue-500 transition-colors">
                         <div>
                            <div className="font-bold">{item.name}</div>
                            <div className="text-xs text-slate-400">{item.description}</div>
                            {item.id === 'speed' && (
                               <div className="text-xs text-blue-400 mt-1">Current Level: {stats.speedLevel} / {item.maxLevel}</div>
                            )}
                         </div>
                         <button 
                           onClick={() => handleBuy(item)}
                           disabled={isOwned || isMaxed || !canAfford}
                           className={`px-4 py-2 rounded font-bold text-sm 
                             ${isOwned || isMaxed 
                               ? 'bg-slate-700 text-slate-400' 
                               : canAfford 
                                 ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                                 : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                         >
                            {isOwned ? 'OWNED' : isMaxed ? 'MAXED' : `$${item.cost}`}
                         </button>
                      </div>
                    );
                  })}
                  <button 
                    onClick={() => setGameState(GameState.MENU)}
                    className="w-full mt-4 py-3 border border-slate-600 hover:bg-slate-700 rounded-lg font-bold"
                  >
                    Close Shop
                  </button>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <div className="w-48 h-48 bg-slate-900/50 rounded-full flex items-center justify-center mb-4 border-4 border-slate-700">
                     {stats.skin === SkinType.CLASSIC && <div className="w-20 h-20 bg-blue-600 rounded shadow-[0_0_30px_rgba(37,99,235,0.5)]"></div>}
                     {stats.skin === SkinType.GOLD && <div className="w-20 h-20 bg-yellow-500 rounded shadow-[0_0_30px_rgba(234,179,8,0.5)]"></div>}
                     {stats.skin === SkinType.NEON && <div className="w-20 h-20 bg-teal-400 rounded shadow-[0_0_30px_rgba(45,212,191,0.8)] animate-pulse"></div>}
                     {stats.skin === SkinType.STEALTH && <div className="w-20 h-20 bg-gray-800 rounded border border-gray-600"></div>}
                  </div>
                  <p>Current Vehicle Config</p>
                  <p className="text-sm text-slate-600">Speed Lvl {stats.speedLevel} • {stats.skin.toUpperCase()} Class</p>
               </div>
            )}
        </div>

      </div>
    </div>
  );
}
