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

// TEXT WRAPPER UTILITY FOR SVG
function wrapText(text: string, maxChars: number): string[] {
  if (!text) return [];
  // Also split by explicit newlines if user added any
  const paragraphs = text.split('\n');
  const result: string[] = [];

  paragraphs.forEach(p => {
    const words = p.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      if (!word) continue;
      if ((currentLine + (currentLine ? ' ' : '') + word).length <= maxChars) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) result.push(currentLine);
        // If single word is longer than maxChars, keep it whole
        currentLine = word;
      }
    }
    if (currentLine) result.push(currentLine);
  });

  return result.length > 0 ? result : [text];
}

// HELPER FOR INNER QR IN CARD (RESPECTS ACTIVE FRAME AND STYLES)
const RenderFramedOrPlainQR: React.FC<{
  config: QRCodeConfig;
  activeFrame: QRFrame;
  frameColor: string;
  frameTextColor: string;
  frameText: string;
  frameFontFamily: string;
  computedLogoSize: number;
  width: number;
  height: number;
}> = ({
  config,
  activeFrame,
  frameColor,
  frameTextColor,
  frameText,
  frameFontFamily,
  computedLogoSize,
  width,
  height
}) => {
  const hasFrame = activeFrame && activeFrame.id !== 'none';

  if (hasFrame) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={activeFrame.viewBox}
        style={{ overflow: 'visible' }}
      >
        {/* Frame Background */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={config.bgColor || '#ffffff'}
          rx={activeFrame.borderRadius || 0}
        />

        {/* Frame Visual Elements */}
        {renderFrameShape(activeFrame, config, frameColor, frameTextColor, frameText, frameFontFamily)}

        {/* Inner QR Matrix */}
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
  }

  // Plain QR without frame
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      style={{ overflow: 'visible' }}
    >
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        fill={config.bgColor || '#ffffff'}
        rx="8"
      />
      <svg
        x="5"
        y="5"
        width="90"
        height="90"
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

  // 1. FLYER / POSTER FORMAT (360 x 520)
  if (position === 'flyer') {
    const titleLines = wrapText(cardTitle, 26);
    const subtitleLines = wrapText(cardSubtitle, 38);
    const instructionLines = wrapText(cardInstructions, 36);

    return (
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 360 520"
        className={className}
        style={{ overflow: 'visible' }}
      >
        {/* Card Background */}
        <rect x="0" y="0" width="360" height="520" rx="24" fill={cardBg} />
        <rect x="4" y="4" width="352" height="512" rx="20" fill="none" stroke={frameColor} strokeWidth="3" opacity="0.8" />

        {/* Decorative Header Bar */}
        <path d="M 4 24 A 20 20 0 0 1 24 4 L 336 4 A 20 20 0 0 1 356 24 L 356 68 L 4 68 Z" fill={frameColor} />
        
        {/* Badge in Header */}
        <rect x="100" y="54" width="160" height="28" rx="14" fill={cardBg} stroke={frameColor} strokeWidth="2.5" />
        <text x="180" y="72" fill={frameColor} fontSize="11" fontWeight="900" letterSpacing="1" fontFamily={frameFontFamily} textAnchor="middle">
          {frameText.toUpperCase()}
        </text>

        {/* Title */}
        <text x="180" y="112" fill={cardText} fontSize="17" fontWeight="bold" fontFamily={frameFontFamily} textAnchor="middle">
          {titleLines.map((line, idx) => (
            <tspan key={idx} x="180" dy={idx === 0 ? 0 : 20}>{line}</tspan>
          ))}
        </text>

        {/* Subtitle */}
        <text x="180" y={112 + (titleLines.length * 20) + 4} fill={cardText} fontSize="10" opacity="0.8" fontFamily={frameFontFamily} textAnchor="middle">
          {subtitleLines.map((line, idx) => (
            <tspan key={idx} x="180" dy={idx === 0 ? 0 : 13}>{line}</tspan>
          ))}
        </text>

        {/* Center QR Box with Active Frame */}
        <g transform="translate(80, 185)">
          <rect x="-8" y="-8" width="216" height="216" rx="16" fill={config.bgColor || '#ffffff'} stroke={frameColor} strokeWidth="2" />
          <RenderFramedOrPlainQR
            config={config}
            activeFrame={activeFrame}
            frameColor={frameColor}
            frameTextColor={frameTextColor}
            frameText={frameText}
            frameFontFamily={frameFontFamily}
            computedLogoSize={computedLogoSize}
            width={200}
            height={200}
          />
        </g>

        {/* Steps / Instructions Box */}
        <g transform="translate(25, 420)">
          <rect x="0" y="0" width="310" height={instructionLines.length > 1 ? 46 : 38} rx="10" fill={frameColor} fillOpacity="0.08" stroke={frameColor} strokeWidth="1" strokeDasharray="3,3" />
          <text x="155" y={instructionLines.length > 1 ? 18 : 23} fill={cardText} fontSize="9.5" fontWeight="600" fontFamily={frameFontFamily} textAnchor="middle">
            {instructionLines.map((line, idx) => (
              <tspan key={idx} x="155" dy={idx === 0 ? 0 : 14}>{line}</tspan>
            ))}
          </text>
        </g>

        {/* Footer CTA */}
        <text x="180" y="494" fill={cardText} fontSize="9" opacity="0.7" fontWeight="bold" letterSpacing="0.5" fontFamily={frameFontFamily} textAnchor="middle">
          ★ {cardCta} ★
        </text>
      </svg>
    );
  }

  // 2. HORIZONTAL CARD (530 x 260) - Left or Right
  if (position === 'right' || position === 'left') {
    const isRight = position === 'right';
    const qrTranslateX = isRight ? 24 : 290;
    const textTranslateX = isRight ? 260 : 24;

    const titleLines = wrapText(cardTitle, 22);
    const subtitleLines = wrapText(cardSubtitle, 32);
    const instructionLines = wrapText(cardInstructions, 30);

    return (
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 530 260"
        className={className}
        style={{ overflow: 'visible' }}
      >
        <rect x="0" y="0" width="530" height="260" rx="20" fill={cardBg} />
        <rect x="4" y="4" width="522" height="252" rx="16" fill="none" stroke={frameColor} strokeWidth="3" />

        {/* QR Section with Active Frame */}
        <g transform={`translate(${qrTranslateX}, 25)`}>
          <rect x="-4" y="-4" width="218" height="218" rx="14" fill={config.bgColor || '#ffffff'} stroke={frameColor} strokeWidth="2" />
          <RenderFramedOrPlainQR
            config={config}
            activeFrame={activeFrame}
            frameColor={frameColor}
            frameTextColor={frameTextColor}
            frameText={frameText}
            frameFontFamily={frameFontFamily}
            computedLogoSize={computedLogoSize}
            width={210}
            height={210}
          />
        </g>

        {/* Text Section */}
        <g transform={`translate(${textTranslateX}, 24)`}>
          {/* Badge */}
          <rect x="0" y="0" width="110" height="24" rx="12" fill={frameColor} />
          <text x="55" y="16" fill={frameTextColor} fontSize="9.5" fontWeight="bold" fontFamily={frameFontFamily} textAnchor="middle">
            {frameText}
          </text>

          {/* Title with wrapping */}
          <text x="0" y="48" fill={cardText} fontSize="16" fontWeight="bold" fontFamily={frameFontFamily}>
            {titleLines.map((line, idx) => (
              <tspan key={idx} x="0" dy={idx === 0 ? 0 : 20}>{line}</tspan>
            ))}
          </text>

          {/* Subtitle with wrapping */}
          <text x="0" y="48 + (titleLines.length * 20) + 4" fill={cardText} fontSize="10" opacity="0.8" fontFamily={frameFontFamily}>
            {subtitleLines.map((line, idx) => (
              <tspan key={idx} x="0" dy={idx === 0 ? 0 : 13}>{line}</tspan>
            ))}
          </text>

          {/* Instructions Box with clean padding and wrapping */}
          <g transform={`translate(0, ${125 + (titleLines.length > 1 ? 10 : 0)})`}>
            <rect 
              x="0" 
              y="0" 
              width="246" 
              height={instructionLines.length > 1 ? 52 : 42} 
              rx="8" 
              fill={frameColor} 
              fillOpacity="0.08" 
              stroke={frameColor} 
              strokeWidth="1" 
            />
            <text x="10" y="16" fill={cardText} fontSize="8.5" fontWeight="600" fontFamily={frameFontFamily}>
              {instructionLines.map((line, idx) => (
                <tspan key={idx} x="10" dy={idx === 0 ? 0 : 13}>{line}</tspan>
              ))}
            </text>
            <text x="10" y={instructionLines.length > 1 ? 44 : 33} fill={cardText} fontSize="7.5" opacity="0.6" fontWeight="bold" fontFamily={frameFontFamily}>
              ★ {cardCta}
            </text>
          </g>
        </g>
      </svg>
    );
  }

  // 3. VERTICAL CARD (320 x 440) - Top or Bottom Text
  const isTopText = position === 'top';
  const qrY = isTopText ? 195 : 24;
  const textY = isTopText ? 24 : 245;

  const titleLines = wrapText(cardTitle, 26);
  const subtitleLines = wrapText(cardSubtitle, 38);
  const instructionLines = wrapText(cardInstructions, 34);

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 440"
      className={className}
      style={{ overflow: 'visible' }}
    >
      <rect x="0" y="0" width="320" height="440" rx="20" fill={cardBg} />
      <rect x="4" y="4" width="312" height="432" rx="16" fill="none" stroke={frameColor} strokeWidth="3" />

      {/* QR Code Container with Active Frame */}
      <g transform={`translate(55, ${qrY})`}>
        <rect x="-4" y="-4" width="218" height="218" rx="14" fill={config.bgColor || '#ffffff'} stroke={frameColor} strokeWidth="2" />
        <RenderFramedOrPlainQR
          config={config}
          activeFrame={activeFrame}
          frameColor={frameColor}
          frameTextColor={frameTextColor}
          frameText={frameText}
          frameFontFamily={frameFontFamily}
          computedLogoSize={computedLogoSize}
          width={210}
          height={210}
        />
      </g>

      {/* Text Area */}
      <g transform={`translate(20, ${textY})`}>
        {/* Badge */}
        <rect x="90" y="0" width="100" height="22" rx="11" fill={frameColor} />
        <text x="140" y="15" fill={frameTextColor} fontSize="8.5" fontWeight="bold" fontFamily={frameFontFamily} textAnchor="middle">
          {frameText}
        </text>

        {/* Title */}
        <text x="140" y="44" fill={cardText} fontSize="15" fontWeight="bold" fontFamily={frameFontFamily} textAnchor="middle">
          {titleLines.map((line, idx) => (
            <tspan key={idx} x="140" dy={idx === 0 ? 0 : 19}>{line}</tspan>
          ))}
        </text>

        {/* Subtitle */}
        <text x="140" y={44 + (titleLines.length * 19) + 2} fill={cardText} fontSize="9.5" opacity="0.8" fontFamily={frameFontFamily} textAnchor="middle">
          {subtitleLines.map((line, idx) => (
            <tspan key={idx} x="140" dy={idx === 0 ? 0 : 13}>{line}</tspan>
          ))}
        </text>

        {/* Instructions */}
        <g transform={`translate(10, ${85 + (titleLines.length > 1 ? 8 : 0)})`}>
          <rect x="0" y="0" width="260" height={instructionLines.length > 1 ? 46 : 34} rx="8" fill={frameColor} fillOpacity="0.08" stroke={frameColor} strokeWidth="1" />
          <text x="130" y={instructionLines.length > 1 ? 16 : 21} fill={cardText} fontSize="8.5" fontWeight="600" fontFamily={frameFontFamily} textAnchor="middle">
            {instructionLines.map((line, idx) => (
              <tspan key={idx} x="130" dy={idx === 0 ? 0 : 13}>{line}</tspan>
            ))}
          </text>
        </g>
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
