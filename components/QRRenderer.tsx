import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QRCodeConfig, QRFrame } from '../types';
import { FRAMES, FONT_FAMILIES } from './framesData';

interface QRRendererProps {
  config: QRCodeConfig;
  svgRef?: React.RefObject<SVGSVGElement>;
  className?: string;
}

export const QRRenderer: React.FC<QRRendererProps> = ({ config, svgRef, className = '' }) => {
  const activeFrame = FRAMES.find(f => f.id === config.frameId) || FRAMES[0];
  const frameColor = config.frameColor || config.fgColor;
  const frameTextColor = config.frameTextColor || '#ffffff';
  const frameText = config.frameText !== undefined ? config.frameText : (activeFrame.defaultText || 'ESCANÉAME');
  const frameFontFamily = FONT_FAMILIES[config.frameFont || 'sans'];

  // Proportional logo size (percentage of QR base size 1024)
  const logoPercentage = config.logoSize || 22;
  const computedLogoSize = Math.round(1024 * (logoPercentage / 100));

  // Determine if we are rendering in Full Card / Flyer Mode
  if (config.showCard) {
    return (
      <CardQRRenderer
        config={config}
        activeFrame={activeFrame}
        frameColor={frameColor}
        frameTextColor={frameTextColor}
        frameText={frameText}
        frameFontFamily={frameFontFamily}
        computedLogoSize={computedLogoSize}
        svgRef={svgRef}
        className={className}
      />
    );
  }

  // STANDARD / FRAMED QR RENDERING
  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={activeFrame.viewBox}
      className={className}
      style={{ overflow: 'visible' }}
    >
      {/* Background */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill={config.bgColor}
        rx={activeFrame.borderRadius || 0}
      />

      {/* Frame Visual Elements based on ID */}
      {renderFrameShape(activeFrame, config, frameColor, frameTextColor, frameText, frameFontFamily)}

      {/* Inner QR Code SVG */}
      <svg
        x={activeFrame.qrX}
        y={activeFrame.qrY}
        width={activeFrame.qrSize}
        height={activeFrame.qrSize}
        viewBox="0 0 1024 1024"
      >
        <QRCodeSVG
          value={config.value || 'https://neoqr-studio.vercel.app'}
          size={1024}
          level={config.level || 'H'}
          fgColor={config.fgColor}
          bgColor="transparent"
          marginSize={config.includeMargin ? 2 : 0}
          imageSettings={config.logoUrl ? {
            src: config.logoUrl,
            height: computedLogoSize,
            width: computedLogoSize,
            excavate: true,
          } : undefined}
        />
        {/* Optional Logo Backdrop glow/circle */}
        {config.logoUrl && config.logoBackground && (
          <circle
            cx="512"
            cy="512"
            r={(computedLogoSize / 2) + 12}
            fill="#ffffff"
            opacity="0.95"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </svg>
    </svg>
  );
};

// HELPER FOR FRAME SHAPES
function renderFrameShape(
  frame: QRFrame,
  config: QRCodeConfig,
  frameColor: string,
  frameTextColor: string,
  frameText: string,
  fontFamily: string
) {
  switch (frame.id) {
    case 'bottom-banner':
      return (
        <g>
          {/* Border around QR card */}
          <rect
            x="3"
            y="3"
            width="94"
            height="122"
            rx="8"
            fill="none"
            stroke={frameColor}
            strokeWidth="3.5"
          />
          {/* Bottom Banner with Arrow */}
          <path
            d="M 6 96 L 43 96 L 50 90 L 57 96 L 94 96 A 5 5 0 0 1 97 101 L 97 119 A 5 5 0 0 1 92 124 L 8 124 A 5 5 0 0 1 3 119 L 3 101 A 5 5 0 0 1 6 96 Z"
            fill={frameColor}
          />
          <text
            x="50"
            y="113"
            fill={frameTextColor}
            fontSize="9"
            fontWeight="bold"
            letterSpacing="0.8"
            fontFamily={fontFamily}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {frameText}
          </text>
        </g>
      );

    case 'bottom-pill':
      return (
        <g>
          {/* Outer Rounded Container */}
          <rect
            x="3"
            y="3"
            width="94"
            height="120"
            rx="14"
            fill="none"
            stroke={frameColor}
            strokeWidth="3"
          />
          {/* Floating Pill Badge */}
          <rect
            x="10"
            y="94"
            width="80"
            height="22"
            rx="11"
            fill={frameColor}
          />
          <text
            x="50"
            y="105"
            fill={frameTextColor}
            fontSize="8.5"
            fontWeight="bold"
            letterSpacing="0.6"
            fontFamily={fontFamily}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {frameText}
          </text>
        </g>
      );

    case 'top-banner':
      return (
        <g>
          {/* Outer frame */}
          <rect
            x="3"
            y="3"
            width="94"
            height="120"
            rx="8"
            fill="none"
            stroke={frameColor}
            strokeWidth="3.5"
          />
          {/* Header block with downward arrow */}
          <path
            d="M 3 8 A 5 5 0 0 1 8 3 L 92 3 A 5 5 0 0 1 97 8 L 97 26 A 4 4 0 0 1 93 30 L 57 30 L 50 36 L 43 30 L 7 30 A 4 4 0 0 1 3 26 Z"
            fill={frameColor}
          />
          <text
            x="50"
            y="16"
            fill={frameTextColor}
            fontSize="9"
            fontWeight="bold"
            letterSpacing="0.8"
            fontFamily={fontFamily}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {frameText}
          </text>
        </g>
      );

    case 'chat-bubble':
      return (
        <g>
          {/* Outer chat bubble outline */}
          <rect
            x="3"
            y="3"
            width="94"
            height="96"
            rx="16"
            fill="none"
            stroke={frameColor}
            strokeWidth="3.5"
          />
          {/* Chat bubble tail & badge */}
          <path
            d="M 20 98 L 20 108 L 34 98 Z"
            fill={frameColor}
          />
          <rect
            x="8"
            y="102"
            width="84"
            height="20"
            rx="10"
            fill={frameColor}
          />
          <text
            x="50"
            y="112"
            fill={frameTextColor}
            fontSize="8"
            fontWeight="bold"
            letterSpacing="0.6"
            fontFamily={fontFamily}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {frameText}
          </text>
        </g>
      );

    case 'smartphone':
      return (
        <g>
          {/* Smartphone outer body */}
          <rect
            x="4"
            y="3"
            width="92"
            height="128"
            rx="18"
            fill="none"
            stroke={frameColor}
            strokeWidth="4"
          />
          {/* Notch / Speaker */}
          <rect
            x="38"
            y="8"
            width="24"
            height="4"
            rx="2"
            fill={frameColor}
          />
          <circle cx="68" cy="10" r="1.5" fill={frameColor} />
          {/* Screen boundary divider */}
          <line x1="8" y1="16" x2="92" y2="16" stroke={frameColor} strokeWidth="1" strokeDasharray="2,2" opacity="0.3" />
          {/* Bottom Button / Bar */}
          <rect
            x="12"
            y="102"
            width="76"
            height="18"
            rx="9"
            fill={frameColor}
          />
          <text
            x="50"
            y="111"
            fill={frameTextColor}
            fontSize="7.5"
            fontWeight="bold"
            letterSpacing="0.5"
            fontFamily={fontFamily}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {frameText}
          </text>
        </g>
      );

    case 'clipboard':
      return (
        <g>
          {/* Main Card */}
          <rect
            x="4"
            y="10"
            width="92"
            height="114"
            rx="8"
            fill="none"
            stroke={frameColor}
            strokeWidth="3.5"
          />
          {/* Top Clip */}
          <rect
            x="34"
            y="3"
            width="32"
            height="12"
            rx="4"
            fill={frameColor}
          />
          <rect
            x="42"
            y="5"
            width="16"
            height="4"
            rx="2"
            fill={config.bgColor}
          />
          {/* Bottom Pill */}
          <rect
            x="10"
            y="102"
            width="80"
            height="18"
            rx="6"
            fill={frameColor}
          />
          <text
            x="50"
            y="111"
            fill={frameTextColor}
            fontSize="8"
            fontWeight="bold"
            letterSpacing="0.5"
            fontFamily={fontFamily}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {frameText}
          </text>
        </g>
      );

    case 'polaroid':
      return (
        <g>
          {/* Polaroid Outer Border */}
          <rect
            x="3"
            y="3"
            width="94"
            height="120"
            rx="4"
            fill="none"
            stroke={frameColor}
            strokeWidth="3.5"
          />
          {/* Inner Photo Separator Line */}
          <line
            x1="6"
            y1="96"
            x2="94"
            y2="96"
            stroke={frameColor}
            strokeWidth="2"
            opacity="0.4"
          />
          {/* Caption text */}
          <text
            x="50"
            y="110"
            fill={frameColor}
            fontSize="8.5"
            fontWeight="bold"
            fontFamily={fontFamily}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {frameText}
          </text>
        </g>
      );

    case 'circle-badge':
      return (
        <g>
          {/* Outer Big Circle */}
          <circle
            cx="50"
            cy="45"
            r="44"
            fill="none"
            stroke={frameColor}
            strokeWidth="3.5"
          />
          {/* Bottom Overlapping Pill */}
          <rect
            x="10"
            y="94"
            width="80"
            height="22"
            rx="11"
            fill={frameColor}
          />
          <text
            x="50"
            y="105"
            fill={frameTextColor}
            fontSize="8.5"
            fontWeight="bold"
            letterSpacing="0.6"
            fontFamily={fontFamily}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {frameText}
          </text>
        </g>
      );

    case 'tech-brackets':
      return (
        <g>
          {/* Top Left */}
          <path d="M 6 22 L 6 8 A 2 2 0 0 1 8 6 L 22 6" fill="none" stroke={frameColor} strokeWidth="4" strokeLinecap="round" />
          {/* Top Right */}
          <path d="M 78 6 L 92 6 A 2 2 0 0 1 94 8 L 94 22" fill="none" stroke={frameColor} strokeWidth="4" strokeLinecap="round" />
          {/* Bottom Left */}
          <path d="M 6 78 L 6 92 A 2 2 0 0 0 8 94 L 22 94" fill="none" stroke={frameColor} strokeWidth="4" strokeLinecap="round" />
          {/* Bottom Right */}
          <path d="M 78 94 L 92 94 A 2 2 0 0 0 94 92 L 94 78" fill="none" stroke={frameColor} strokeWidth="4" strokeLinecap="round" />
          {/* Minor HUD lines */}
          <line x1="50" y1="4" x2="50" y2="8" stroke={frameColor} strokeWidth="2" />
          <line x1="50" y1="92" x2="50" y2="96" stroke={frameColor} strokeWidth="2" />
        </g>
      );

    case 'simple-border':
      return (
        <rect
          x="3"
          y="3"
          width="94"
          height="94"
          rx="12"
          fill="none"
          stroke={frameColor}
          strokeWidth="3.5"
        />
      );

    default:
      return null;
  }
}

// FULL CARD / FLYER / INSTRUCTIONS RENDERER
interface CardQRRendererProps {
  config: QRCodeConfig;
  activeFrame: QRFrame;
  frameColor: string;
  frameTextColor: string;
  frameText: string;
  frameFontFamily: string;
  computedLogoSize: number;
  svgRef?: React.RefObject<SVGSVGElement>;
  className?: string;
}

const CardQRRenderer: React.FC<CardQRRendererProps> = ({
  config,
  activeFrame,
  frameColor,
  frameTextColor,
  frameText,
  frameFontFamily,
  computedLogoSize,
  svgRef,
  className = ''
}) => {
  const cardBg = config.cardBgColor || config.bgColor || '#ffffff';
  const cardText = config.cardTextColor || config.fgColor || '#1e293b';
  const cardTitle = config.cardTitle || '¡Escanea este código QR!';
  const cardSubtitle = config.cardSubtitle || 'Apunta la cámara de tu smartphone para acceder al instante.';
  const cardInstructions = config.cardInstructions || '1. Abre tu cámara • 2. Enfoca el código • 3. Toca el enlace';
  const cardCta = config.cardCta || 'Acceso rápido y seguro';
  const position = config.cardPosition || 'bottom';

  if (position === 'flyer') {
    // Elegant Poster / Flyer Format (300 x 440)
    return (
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 450"
        className={className}
        style={{ overflow: 'visible' }}
      >
        {/* Card Background with Soft Border */}
        <rect x="0" y="0" width="320" height="450" rx="24" fill={cardBg} />
        <rect x="4" y="4" width="312" height="442" rx="20" fill="none" stroke={frameColor} strokeWidth="3" opacity="0.8" />

        {/* Decorative Header Bar */}
        <path d="M 4 24 A 20 20 0 0 1 24 4 L 296 4 A 20 20 0 0 1 316 24 L 316 64 L 4 64 Z" fill={frameColor} />
        
        {/* Badge in Header */}
        <rect x="90" y="52" width="140" height="24" rx="12" fill={cardBg} stroke={frameColor} strokeWidth="2" />
        <text x="160" y="68" fill={frameColor} fontSize="10" fontWeight="900" letterSpacing="1" fontFamily={frameFontFamily} textAnchor="middle">
          {frameText.toUpperCase()}
        </text>

        {/* Title & Subtitle */}
        <text x="160" y="102" fill={cardText} fontSize="17" fontWeight="bold" fontFamily={frameFontFamily} textAnchor="middle">
          {cardTitle}
        </text>
        <text x="160" y="122" fill={cardText} fontSize="9.5" opacity="0.8" fontFamily={frameFontFamily} textAnchor="middle">
          {cardSubtitle}
        </text>

        {/* Center QR Box with frame styling */}
        <g transform="translate(65, 140)">
          <rect x="-8" y="-8" width="206" height="206" rx="16" fill="#ffffff" stroke={frameColor} strokeWidth="2.5" />
          <svg width="190" height="190" viewBox="0 0 1024 1024">
            <QRCodeSVG
              value={config.value || 'https://neoqr-studio.vercel.app'}
              size={1024}
              level={config.level || 'H'}
              fgColor={config.fgColor}
              bgColor="transparent"
              marginSize={config.includeMargin ? 2 : 0}
              imageSettings={config.logoUrl ? {
                src: config.logoUrl,
                height: computedLogoSize,
                width: computedLogoSize,
                excavate: true,
              } : undefined}
            />
          </svg>
        </g>

        {/* Steps Box */}
        <g transform="translate(20, 362)">
          <rect x="0" y="0" width="280" height="38" rx="10" fill={frameColor} fillOpacity="0.08" stroke={frameColor} strokeWidth="1" strokeDasharray="3,3" />
          <text x="140" y="23" fill={cardText} fontSize="9" fontWeight="600" fontFamily={frameFontFamily} textAnchor="middle">
            {cardInstructions}
          </text>
        </g>

        {/* Footer CTA */}
        <text x="160" y="424" fill={cardText} fontSize="8.5" opacity="0.6" fontWeight="bold" letterSpacing="0.5" fontFamily={frameFontFamily} textAnchor="middle">
          ★ {cardCta} ★
        </text>
      </svg>
    );
  }

  if (position === 'right' || position === 'left') {
    // Horizontal / Landscape Card (420 x 220)
    const isRight = position === 'right';
    const qrTranslateX = isRight ? 20 : 210;
    const textTranslateX = isRight ? 215 : 25;

    return (
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 420 220"
        className={className}
        style={{ overflow: 'visible' }}
      >
        <rect x="0" y="0" width="420" height="220" rx="20" fill={cardBg} />
        <rect x="4" y="4" width="412" height="212" rx="16" fill="none" stroke={frameColor} strokeWidth="3" />

        {/* QR Section */}
        <g transform={`translate(${qrTranslateX}, 20)`}>
          <rect x="0" y="0" width="180" height="180" rx="12" fill="#ffffff" stroke={frameColor} strokeWidth="2" />
          <svg x="5" y="5" width="170" height="170" viewBox="0 0 1024 1024">
            <QRCodeSVG
              value={config.value || 'https://neoqr-studio.vercel.app'}
              size={1024}
              level={config.level || 'H'}
              fgColor={config.fgColor}
              bgColor="transparent"
              marginSize={config.includeMargin ? 2 : 0}
              imageSettings={config.logoUrl ? {
                src: config.logoUrl,
                height: computedLogoSize,
                width: computedLogoSize,
                excavate: true,
              } : undefined}
            />
          </svg>
        </g>

        {/* Text Section */}
        <g transform={`translate(${textTranslateX}, 35)`}>
          {/* Badge */}
          <rect x="0" y="0" width="100" height="22" rx="11" fill={frameColor} />
          <text x="50" y="14" fill={frameTextColor} fontSize="8.5" fontWeight="bold" fontFamily={frameFontFamily} textAnchor="middle">
            {frameText}
          </text>

          {/* Title */}
          <text x="0" y="50" fill={cardText} fontSize="16" fontWeight="bold" fontFamily={frameFontFamily}>
            {cardTitle}
          </text>

          {/* Subtitle */}
          <text x="0" y="74" fill={cardText} fontSize="10" opacity="0.8" fontFamily={frameFontFamily}>
            {cardSubtitle}
          </text>

          {/* Instructions Box */}
          <rect x="0" y="96" width="180" height="42" rx="8" fill={frameColor} fillOpacity="0.08" stroke={frameColor} strokeWidth="1" />
          <text x="10" y="115" fill={cardText} fontSize="8.5" fontWeight="600" fontFamily={frameFontFamily}>
            {cardInstructions}
          </text>
          <text x="10" y="128" fill={cardText} fontSize="7.5" opacity="0.6" fontFamily={frameFontFamily}>
            {cardCta}
          </text>
        </g>
      </svg>
    );
  }

  // Vertical Top/Bottom Card (260 x 360)
  const isTopText = position === 'top';
  const qrY = isTopText ? 155 : 25;
  const textY = isTopText ? 25 : 225;

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 360"
      className={className}
      style={{ overflow: 'visible' }}
    >
      <rect x="0" y="0" width="260" height="360" rx="20" fill={cardBg} />
      <rect x="4" y="4" width="252" height="352" rx="16" fill="none" stroke={frameColor} strokeWidth="3" />

      {/* Text Area */}
      <g transform={`translate(15, ${textY})`}>
        <rect x="65" y="0" width="100" height="20" rx="10" fill={frameColor} />
        <text x="115" y="13" fill={frameTextColor} fontSize="8" fontWeight="bold" fontFamily={frameFontFamily} textAnchor="middle">
          {frameText}
        </text>

        <text x="115" y="40" fill={cardText} fontSize="14" fontWeight="bold" fontFamily={frameFontFamily} textAnchor="middle">
          {cardTitle}
        </text>
        <text x="115" y="58" fill={cardText} fontSize="9" opacity="0.8" fontFamily={frameFontFamily} textAnchor="middle">
          {cardSubtitle}
        </text>

        <rect x="10" y="72" width="210" height="30" rx="8" fill={frameColor} fillOpacity="0.08" stroke={frameColor} strokeWidth="1" />
        <text x="115" y="90" fill={cardText} fontSize="8" fontWeight="600" fontFamily={frameFontFamily} textAnchor="middle">
          {cardInstructions}
        </text>
      </g>

      {/* QR Code Container */}
      <g transform={`translate(35, ${qrY})`}>
        <rect x="0" y="0" width="190" height="190" rx="14" fill="#ffffff" stroke={frameColor} strokeWidth="2" />
        <svg x="8" y="8" width="174" height="174" viewBox="0 0 1024 1024">
          <QRCodeSVG
            value={config.value || 'https://neoqr-studio.vercel.app'}
            size={1024}
            level={config.level || 'H'}
            fgColor={config.fgColor}
            bgColor="transparent"
            marginSize={config.includeMargin ? 2 : 0}
            imageSettings={config.logoUrl ? {
              src: config.logoUrl,
              height: computedLogoSize,
              width: computedLogoSize,
              excavate: true,
            } : undefined}
          />
        </svg>
      </g>
    </svg>
  );
};

// MINIATURE FRAME PREVIEW FOR BUTTONS IN STYLE TAB
export const FrameThumbnail: React.FC<{ frame: QRFrame; isSelected: boolean; fgColor: string }> = ({
  frame,
  isSelected,
  fgColor
}) => {
  return (
    <svg viewBox={frame.viewBox} className="w-10 h-10 transition-transform">
      <rect width="100%" height="100%" fill="transparent" rx={frame.borderRadius || 0} />
      
      {/* Miniature Frame Shape */}
      {renderFrameShape(
        frame,
        { fgColor, bgColor: '#ffffff' } as QRCodeConfig,
        isSelected ? '#4f46e5' : '#64748b',
        '#ffffff',
        'QR',
        'sans-serif'
      )}

      {/* Simplified QR matrix icon inside thumbnail */}
      <g transform={`translate(${frame.qrX}, ${frame.qrY})`}>
        <rect
          width={frame.qrSize}
          height={frame.qrSize}
          fill={isSelected ? '#4f46e5' : '#64748b'}
          opacity="0.3"
          rx="2"
        />
        {/* Finder pattern representations */}
        <rect x={frame.qrSize * 0.1} y={frame.qrSize * 0.1} width={frame.qrSize * 0.25} height={frame.qrSize * 0.25} fill={isSelected ? '#4f46e5' : '#64748b'} />
        <rect x={frame.qrSize * 0.65} y={frame.qrSize * 0.1} width={frame.qrSize * 0.25} height={frame.qrSize * 0.25} fill={isSelected ? '#4f46e5' : '#64748b'} />
        <rect x={frame.qrSize * 0.1} y={frame.qrSize * 0.65} width={frame.qrSize * 0.25} height={frame.qrSize * 0.25} fill={isSelected ? '#4f46e5' : '#64748b'} />
      </g>
    </svg>
  );
};
