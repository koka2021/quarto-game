import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw, HelpCircle } from 'lucide-react';

export default function QuartoGame() {
  // コマの生成（4つの特徴：高さ、色、形、穴）
  const generatePieces = () => {
    const pieces = [];
    let id = 0;
    for (let tall = 0; tall <= 1; tall++) {
      for (let dark = 0; dark <= 1; dark++) {
        for (let square = 0; square <= 1; square++) {
          for (let hole = 0; hole <= 1; hole++) {
            pieces.push({
              id: id++,
              tall: tall === 1,
              dark: dark === 1,
              square: square === 1,
              hole: hole === 1,
            });
          }
        }
      }
    }
    return pieces;
  };

  const [board, setBoard] = useState(Array(16).fill(null));
  const [availablePieces, setAvailablePieces] = useState(generatePieces());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gamePhase, setGamePhase] = useState('select');
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [showRules, setShowRules] = useState(false);

  const checkWin = (boardState) => {
    const lines = [
      [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
      [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
      [0, 5, 10, 15], [3, 6, 9, 12]
    ];

    for (const line of lines) {
      const pieces = line.map(i => boardState[i]).filter(p => p !== null);
      if (pieces.length === 4) {
        const attrs = ['tall', 'dark', 'square', 'hole'];
        for (const attr of attrs) {
          const allSame = pieces.every(p => p[attr] === pieces[0][attr]);
          if (allSame) {
            return { winner: true, line };
          }
        }
      }
    }
    return { winner: false, line: null };
  };

  const handlePieceSelect = (piece) => {
    if (gamePhase === 'select' && !winner) {
      setSelectedPiece(piece);
      setGamePhase('place');
    }
  };

  const handleBoardClick = (index) => {
    if (gamePhase === 'place' && board[index] === null && selectedPiece && !winner) {
      const newBoard = [...board];
      newBoard[index] = selectedPiece;
      setBoard(newBoard);

      const result = checkWin(newBoard);
      if (result.winner) {
        setWinner(currentPlayer);
        setWinningLine(result.line);
        return;
      }

      const newAvailable = availablePieces.filter(p => p.id !== selectedPiece.id);
      if (newAvailable.length === 0) {
        setWinner('draw');
        return;
      }

      setAvailablePieces(newAvailable);
      setSelectedPiece(null);
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      setGamePhase('select');
    }
  };

  const resetGame = () => {
    setBoard(Array(16).fill(null));
    setAvailablePieces(generatePieces());
    setSelectedPiece(null);
    setCurrentPlayer(1);
    setGamePhase('select');
    setWinner(null);
    setWinningLine(null);
  };

  const Piece = ({ piece, size = 'normal', isSelected = false, onClick = null }) => {
    if (!piece) return null;

    const containerSize = size === 'small' ? 'w-14 h-20' : size === 'board' ? 'w-16 h-24' : 'w-20 h-28';
    const pieceWidth = size === 'small' ? 'w-12' : size === 'board' ? 'w-14' : 'w-16';
    const pieceHeight = piece.tall ? (size === 'small' ? 'h-16' : size === 'board' ? 'h-20' : 'h-24') : (size === 'small' ? 'h-10' : size === 'board' ? 'h-12' : 'h-14');
    
    const darkColors = piece.dark 
      ? 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500';
    
    const topColor = piece.dark
      ? 'bg-gradient-to-br from-gray-600 to-gray-700'
      : 'bg-gradient-to-br from-yellow-300 to-amber-400';
    
    const borderRadius = piece.square ? 'rounded-md' : 'rounded-full';
    const topBorderRadius = piece.square ? 'rounded-md' : 'rounded-full';
    
    const shadow = isSelected 
      ? 'shadow-2xl ring-4 ring-blue-400 ring-offset-2' 
      : 'shadow-lg hover:shadow-xl';

    return (
      <div
        onClick={onClick}
        className={`${containerSize} flex items-end justify-center ${onClick ? 'cursor-pointer hover:scale-105' : ''} transition-all duration-200`}
      >
        <div className="relative" style={{ perspective: '1000px' }}>
          {/* メインボディ */}
          <div 
            className={`${pieceWidth} ${pieceHeight} ${darkColors} ${borderRadius} ${shadow} relative transition-all duration-200`}
            style={{
              transform: 'rotateX(5deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* 上面 */}
            <div 
              className={`absolute top-0 left-0 right-0 ${pieceWidth} h-3 ${topColor} ${topBorderRadius} flex items-center justify-center`}
              style={{
                transform: 'translateY(-2px) rotateX(90deg)',
                transformOrigin: 'top'
              }}
            >
              {piece.hole && (
                <div className="w-4 h-4 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full shadow-inner border border-gray-500" />
              )}
            </div>
            
            {/* 正面の穴 */}
            {piece.hole && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-5 h-5 bg-gradient-to-br from-gray-900 to-black rounded-full shadow-2xl" 
                  style={{
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)'
                  }}
                />
              </div>
            )}

            {/* ハイライト効果 */}
            <div 
              className={`absolute top-2 left-2 right-2 h-1/3 ${borderRadius} opacity-30`}
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)'
              }}
            />
            
            {/* 底面の影 */}
            <div 
              className={`absolute bottom-0 left-0 right-0 h-2 bg-black opacity-20 ${borderRadius} blur-sm`}
              style={{
                transform: 'translateY(100%)'
              }}
            />
          </div>

          {/* 台座の影 */}
          <div 
            className="absolute bottom-0 left-1/2 w-16 h-2 bg-black opacity-10 rounded-full blur-md"
            style={{
              transform: 'translateX(-50%) translateY(8px)'
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 mb-2 drop-shadow-lg">
            クワトロ (Quarto)
          </h1>
          <p className="text-gray-300 text-lg">4つの特徴を揃えよう！</p>
        </div>

        {/* Game Info */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-2xl p-4 mb-6 border border-slate-600">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`px-6 py-3 rounded-lg font-bold transition-all ${currentPlayer === 1 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105' : 'bg-slate-600 text-gray-300'}`}>
                プレイヤー1
              </div>
              <div className={`px-6 py-3 rounded-lg font-bold transition-all ${currentPlayer === 2 ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/50 scale-105' : 'bg-slate-600 text-gray-300'}`}>
                プレイヤー2
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRules(!showRules)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition shadow-lg flex items-center gap-2"
              >
                <HelpCircle size={20} />
                ルール
              </button>
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-lg flex items-center gap-2"
              >
                <RotateCcw size={20} />
                リセット
              </button>
            </div>
          </div>

          {/* Phase Indicator */}
          <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-600">
            {!winner && (
              <p className="text-center font-semibold text-gray-200">
                {gamePhase === 'select' ? (
                  <>プレイヤー{currentPlayer}：相手が置くコマを選んでください</>
                ) : (
                  <>プレイヤー{currentPlayer}：選ばれたコマをボードに置いてください</>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Rules */}
        {showRules && (
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-2xl p-6 mb-6 border border-slate-600">
            <h3 className="text-2xl font-bold mb-3 text-yellow-400">ゲームのルール</h3>
            <div className="space-y-2 text-gray-200">
              <p><strong className="text-yellow-300">目的：</strong>縦・横・斜めのいずれかで、4つのコマの共通の特徴を揃える</p>
              <p><strong className="text-yellow-300">コマの特徴：</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>高さ：高い or 低い</li>
                <li>色：濃い（黒） or 薄い（金）</li>
                <li>形：四角 or 丸</li>
                <li>穴：穴あり or 穴なし</li>
              </ul>
              <p><strong className="text-yellow-300">特別なルール：</strong>相手が置くコマを自分が選びます！</p>
              <p className="text-red-400 font-semibold">⚠️ コマを置いた後に勝利条件を満たしていたら、置いたプレイヤーが勝利！</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Board */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 rounded-2xl shadow-2xl p-8 border-4 border-amber-700">
              <div 
                className="grid grid-cols-4 gap-3 p-6 rounded-xl relative"
                style={{
                  background: 'linear-gradient(135deg, #92400e 0%, #78350f 50%, #451a03 100%)',
                  boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)'
                }}
              >
                {board.map((piece, index) => (
                  <div
                    key={index}
                    onClick={() => handleBoardClick(index)}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center relative
                      ${gamePhase === 'place' && !piece && !winner ? 'cursor-pointer hover:bg-amber-700/50' : ''}
                      ${winningLine && winningLine.includes(index) ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-2xl shadow-yellow-500/50' : 'bg-gradient-to-br from-amber-700 to-amber-800'}
                      transition-all duration-300
                    `}
                    style={{
                      boxShadow: winningLine && winningLine.includes(index) 
                        ? '0 0 30px rgba(250, 204, 21, 0.8), inset 0 2px 10px rgba(0,0,0,0.3)'
                        : 'inset 0 2px 8px rgba(0,0,0,0.4)'
                    }}
                  >
                    {piece && <Piece piece={piece} size="board" />}
                  </div>
                ))}
              </div>

              {/* Selected Piece Display */}
              {selectedPiece && gamePhase === 'place' && (
                <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-blue-500 shadow-lg shadow-blue-500/30">
                  <p className="text-center text-sm text-blue-300 mb-3 font-semibold">置くコマ：</p>
                  <div className="flex justify-center">
                    <Piece piece={selectedPiece} isSelected={true} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Available Pieces */}
          <div>
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-2xl p-6 border border-slate-600">
              <h3 className="text-lg font-bold mb-4 text-yellow-400">利用可能なコマ</h3>
              <div className="grid grid-cols-4 gap-2">
                {availablePieces.map(piece => (
                  <Piece
                    key={piece.id}
                    piece={piece}
                    size="small"
                    isSelected={selectedPiece?.id === piece.id}
                    onClick={gamePhase === 'select' && !winner ? () => handlePieceSelect(piece) : null}
                  />
                ))}
              </div>
              <p className="text-center text-sm text-gray-300 mt-4">
                残り：{availablePieces.length}個
              </p>
            </div>
          </div>
        </div>

        {/* Winner Modal */}
        {winner && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl border-2 border-yellow-500">
              <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4 drop-shadow-lg" />
              {winner === 'draw' ? (
                <>
                  <h2 className="text-4xl font-bold text-yellow-400 mb-4 drop-shadow-lg">引き分け！</h2>
                  <p className="text-gray-300 mb-6 text-lg">すべてのコマが使われました</p>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-bold text-yellow-400 mb-4 drop-shadow-lg">
                    プレイヤー{winner}の勝利！
                  </h2>
                  <p className="text-gray-300 mb-6 text-lg">4つの共通の特徴を揃えました！</p>
                </>
              )}
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition font-semibold shadow-lg shadow-purple-500/50"
              >
                もう一度プレイ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}