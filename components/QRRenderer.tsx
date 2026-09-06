import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QRCodeConfig, QRFrame } from '../types';
import { FRAMES, FONT_FAMILIES } from './framesData';

interface QRRendererProps {
  config: QRCodeConfig;
  svgRef?: React.RefObject<SVGSVGElement>;
  customFrames?: QRFrame[];
  className?: string;
}

export const QRRenderer: React.FC<QRRendererProps> = ({ config, svgRef, customFrames = [], className = '' }) => {
  const framePool = [...FRAMES, ...customFrames];
  const activeFrame = framePool.find(f => f.id === config.frameId) || FRAMES[0];
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
      // GENERIC & THEMATIC / CUSTOM ADMIN FRAME RENDERER
      return renderThematicOrCustomFrame(frame, config, frameColor, frameTextColor, frameText, fontFamily);
  }
}

/**
 * Renders thematic and admin-created custom frames with rich SVG silhouettes,
 * top icons/emojis, decorative corners, and bottom accessories.
 */
function renderThematicOrCustomFrame(
  frame: QRFrame,
  config: QRCodeConfig,
  frameColor: string,
  frameTextColor: string,
  frameText: string,
  fontFamily: string
) {
  const shape = frame.silhouetteShape || 'rounded';
  const corner = frame.cornerStyle || 'none';
  const bottom = frame.bottomStyle || 'none';
  const topIcon = frame.topIcon;
  const accent = frame.accentColor || config.bgColor || '#ffffff';

  return (
    <g>
      {/* 1. Base Silhouette / Outer Shape */}
      {shape === 'heart' && (
        <path
          d="M 50 118 C 15 88 2 62 2 38 C 2 16 18 2 40 2 C 48 2 50 8 50 8 C 50 8 52 2 60 2 C 82 2 98 16 98 38 C 98 62 85 88 50 118 Z"
          fill="none"
          stroke={frameColor}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      )}

      {shape === 'ticket' && (
        <g>
          {/* Ticket body with circular cutouts on sides */}
          <path
            d="M 8 4 L 92 4 A 4 4 0 0 1 96 8 L 96 52 A 8 8 0 0 0 96 68 L 96 120 A 4 4 0 0 1 92 124 L 8 124 A 4 4 0 0 1 4 120 L 4 68 A 8 8 0 0 0 4 52 L 4 8 A 4 4 0 0 1 8 4 Z"
            fill="none"
            stroke={frameColor}
            strokeWidth="3.5"
          />
          {/* Perforation line */}
          <line x1="12" y1="60" x2="88" y2="60" stroke={frameColor} strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />
        </g>
      )}

      {shape === 'shopping_bag' && (
        <g>
          {/* Shopping Bag handles */}
          <path
            d="M 34 26 C 34 8 66 8 66 26"
            fill="none"
            stroke={frameColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Bag Body */}
          <rect
            x="4"
            y="24"
            width="92"
            height="108"
            rx="6"
            fill="none"
            stroke={frameColor}
            strokeWidth="3.5"
          />
          {/* Bag crease / fold */}
          <line x1="4" y1="36" x2="96" y2="36" stroke={frameColor} strokeWidth="1" opacity="0.3" />
        </g>
      )}

      {shape === 'envelope' && (
        <g>
          {/* Envelope Card */}
          <rect
            x="4"
            y="22"
            width="92"
            height="106"
            rx="8"
            fill="none"
            stroke={frameColor}
            strokeWidth="3.5"
          />
          {/* Envelope open flap lines */}
          <path
            d="M 4 22 L 50 48 L 96 22"
            fill="none"
            stroke={frameColor}
            strokeWidth="2"
            opacity="0.5"
          />
          {/* Postage stamp outline */}
          <rect x="74" y="28" width="16" height="18" rx="2" fill="none" stroke={frameColor} strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
        </g>
      )}

      {shape === 'parchment' && (
        <g>
          {/* Rolled parchment effect */}
          <rect
            x="5"
            y="5"
            width="90"
            height="124"
            rx="6"
            fill="none"
            stroke={frameColor}
            strokeWidth="3.5"
          />
          {/* Scroll corner curls */}
          <path d="M 5 16 C 12 16 12 5 5 5" fill="none" stroke={frameColor} strokeWidth="2" />
          <path d="M 95 16 C 88 16 88 5 95 5" fill="none" stroke={frameColor} strokeWidth="2" />
          <path d="M 5 118 C 12 118 12 129 5 129" fill="none" stroke={frameColor} strokeWidth="2" />
          <path d="M 95 118 C 88 118 88 129 95 129" fill="none" stroke={frameColor} strokeWidth="2" />
        </g>
      )}

      {shape === 'oriental_arch' && (
        <g>
          {/* Dome / Arabesque Arch Top */}
          <path
            d="M 50 4 C 58 14 88 18 94 36 L 94 126 A 4 4 0 0 1 90 130 L 10 130 A 4 4 0 0 1 6 126 L 6 36 C 12 18 42 14 50 4 Z"
            fill="none"
            stroke={frameColor}
            strokeWidth="3.5"
          />
          {/* Inner arch trim line */}
          <path
            d="M 50 9 C 56 18 84 22 90 38"
            fill="none"
            stroke={frameColor}
            strokeWidth="1.5"
            opacity="0.5"
          />
          <path
            d="M 50 9 C 44 18 16 22 10 38"
            fill="none"
            stroke={frameColor}
            strokeWidth="1.5"
            opacity="0.5"
          />
        </g>
      )}

      {shape === 'rosette' && (
        <g>
          {/* Scalloped Medallion Outer Contour */}
          <rect
            x="4"
            y="4"
            width="92"
            height="122"
            rx="24"
            fill="none"
            stroke={frameColor}
            strokeWidth="3.5"
          />
          {/* Scallop accents */}
          <circle cx="50" cy="4" r="5" fill={frameColor} />
          <circle cx="50" cy="126" r="5" fill={frameColor} />
          <circle cx="4" cy="65" r="5" fill={frameColor} />
          <circle cx="96" cy="65" r="5" fill={frameColor} />
        </g>
      )}

      {(shape === 'rounded' || shape === 'square') && (
        <rect
          x="3"
          y="3"
          width="94"
          height={frame.hasText !== false ? "124" : "94"}
          rx={shape === 'square' ? 2 : (frame.borderRadius || 12)}
          fill="none"
          stroke={frameColor}
          strokeWidth="3.5"
        />
      )}

      {/* 2. Top Icon / Emoji Badge */}
      {topIcon && (
        <g transform="translate(50, 16)">
          <circle cx="0" cy="0" r="13" fill={frameColor} />
          <circle cx="0" cy="0" r="11" fill={accent} />
          <text
            x="0"
            y="3.5"
            fontSize="12"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {topIcon}
          </text>
        </g>
      )}

      {/* 3. Corner Embellishments */}
      {corner === 'flowers' && (
        <g>
          {/* Top Left Flower */}
          <g transform="translate(10, 10)">
            <circle cx="0" cy="0" r="4" fill="#f472b6" />
            <circle cx="-3" cy="-3" r="3" fill="#fbcfe8" />
            <circle cx="3" cy="-3" r="3" fill="#fbcfe8" />
            <circle cx="3" cy="3" r="3" fill="#fbcfe8" />
            <circle cx="-3" cy="3" r="3" fill="#fbcfe8" />
            <circle cx="0" cy="0" r="2" fill="#fbbf24" />
          </g>
          {/* Top Right Flower */}
          <g transform="translate(90, 10)">
            <circle cx="0" cy="0" r="4" fill="#a78bfa" />
            <circle cx="-3" cy="-3" r="3" fill="#ddd6fe" />
            <circle cx="3" cy="-3" r="3" fill="#ddd6fe" />
            <circle cx="3" cy="3" r="3" fill="#ddd6fe" />
            <circle cx="-3" cy="3" r="3" fill="#ddd6fe" />
            <circle cx="0" cy="0" r="2" fill="#fbbf24" />
          </g>
          {/* Bottom Left Leaf */}
          <g transform="translate(10, 94)">
            <path d="M 0 0 C -4 -4 -4 -8 0 -10 C 4 -8 4 -4 0 0 Z" fill="#4ade80" />
            <circle cx="0" cy="0" r="3" fill="#fb7185" />
          </g>
          {/* Bottom Right Leaf */}
          <g transform="translate(90, 94)">
            <path d="M 0 0 C 4 -4 4 -8 0 -10 C -4 -8 -4 -4 0 0 Z" fill="#4ade80" />
            <circle cx="0" cy="0" r="3" fill="#fb7185" />
          </g>
        </g>
      )}

      {corner === 'pine_holly' && (
        <g>
          {/* Top Left Pine & Holly */}
          <g transform="translate(8, 8)">
            <path d="M 0 0 L -4 -6 L 2 -4 L -2 -10 L 6 -6" fill="none" stroke="#16a34a" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2.5" fill="#dc2626" />
            <circle cx="3" cy="2" r="2.5" fill="#ef4444" />
            <circle cx="-2" cy="3" r="2" fill="#b91c1c" />
          </g>
          {/* Top Right Pine & Holly */}
          <g transform="translate(92, 8)">
            <path d="M 0 0 L 4 -6 L -2 -4 L 2 -10 L -6 -6" fill="none" stroke="#16a34a" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2.5" fill="#dc2626" />
            <circle cx="-3" cy="2" r="2.5" fill="#ef4444" />
            <circle cx="2" cy="3" r="2" fill="#b91c1c" />
          </g>
        </g>
      )}

      {corner === 'autumn_leaves' && (
        <g>
          {/* Top Left Maple Leaf */}
          <g transform="translate(8, 8)">
            <path d="M 0 0 C -4 -2 -6 -6 -2 -8 C -2 -4 2 -4 4 -8 C 6 -6 4 -2 0 0 Z" fill="#ea580c" />
            <circle cx="2" cy="2" r="2" fill="#78350f" />
          </g>
          {/* Top Right Maple Leaf */}
          <g transform="translate(92, 8)">
            <path d="M 0 0 C 4 -2 6 -6 2 -8 C 2 -4 -2 -4 -4 -8 C -6 -6 -4 -2 0 0 Z" fill="#d97706" />
            <circle cx="-2" cy="2" r="2" fill="#78350f" />
          </g>
        </g>
      )}

      {corner === 'confetti' && (
        <g>
          <circle cx="8" cy="8" r="2" fill="#eab308" />
          <circle cx="14" cy="4" r="1.5" fill="#ec4899" />
          <circle cx="4" cy="14" r="1.5" fill="#3b82f6" />
          <circle cx="92" cy="8" r="2" fill="#8b5cf6" />
          <circle cx="86" cy="4" r="1.5" fill="#10b981" />
          <circle cx="96" cy="14" r="1.5" fill="#f97316" />
          {/* Music Note */}
          <text x="88" y="24" fontSize="7" fill={frameColor}>🎵</text>
          <text x="8" y="24" fontSize="7" fill={frameColor}>✨</text>
        </g>
      )}

      {corner === 'arrows' && (
        <g>
          <path d="M 6 16 L 16 6 M 16 6 L 10 6 M 16 6 L 16 12" stroke={frameColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 94 16 L 84 6 M 84 6 L 90 6 M 84 6 L 84 12" stroke={frameColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      )}

      {corner === 'hearts' && (
        <g>
          <text x="6" y="14" fontSize="8">💖</text>
          <text x="86" y="14" fontSize="8">💖</text>
          <text x="4" y="98" fontSize="7">✨</text>
          <text x="88" y="98" fontSize="7">✨</text>
        </g>
      )}

      {corner === 'lanterns' && (
        <g>
          {/* Top Left Hanging Lantern */}
          <g transform="translate(10, 6)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#eab308" strokeWidth="1" />
            <rect x="-4" y="6" width="8" height="10" rx="3" fill="#dc2626" stroke="#facc15" strokeWidth="1" />
            <line x1="0" y1="16" x2="0" y2="20" stroke="#facc15" strokeWidth="1" />
          </g>
          {/* Top Right Hanging Lantern */}
          <g transform="translate(90, 6)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#eab308" strokeWidth="1" />
            <rect x="-4" y="6" width="8" height="10" rx="3" fill="#dc2626" stroke="#facc15" strokeWidth="1" />
            <line x1="0" y1="16" x2="0" y2="20" stroke="#facc15" strokeWidth="1" />
          </g>
        </g>
      )}

      {corner === 'cocktail_lime' && (
        <g transform="translate(90, 10)">
          {/* Lime Slice */}
          <circle cx="0" cy="0" r="8" fill="#84cc16" stroke="#4d7c0f" strokeWidth="1" />
          <circle cx="0" cy="0" r="6.5" fill="#bef264" />
          <path d="M 0 0 L -4 -4 M 0 0 L 4 -4 M 0 0 L -4 4 M 0 0 L 4 4 M 0 0 L 0 -6 M 0 0 L 0 6 M 0 0 L -6 0 M 0 0 L 6 0" stroke="#4d7c0f" strokeWidth="0.6" />
        </g>
      )}

      {/* 4. Bottom Accessories & Hanging Decorations */}
      {bottom === 'hanging_hearts' && (
        <g>
          <line x1="28" y1="116" x2="28" y2="128" stroke={frameColor} strokeWidth="1" strokeDasharray="1.5,1.5" />
          <text x="24" y="134" fontSize="7">💕</text>
          <line x1="50" y1="118" x2="50" y2="132" stroke={frameColor} strokeWidth="1" strokeDasharray="1.5,1.5" />
          <text x="46" y="138" fontSize="8">💖</text>
          <line x1="72" y1="116" x2="72" y2="128" stroke={frameColor} strokeWidth="1" strokeDasharray="1.5,1.5" />
          <text x="68" y="134" fontSize="7">💕</text>
        </g>
      )}

      {bottom === 'quill_ink' && (
        <g transform="translate(78, 114)">
          {/* Feather Quill */}
          <path d="M 0 10 C 6 6 12 -4 14 -12 C 10 -8 4 -4 0 0 Z" fill="#78350f" />
          <line x1="0" y1="10" x2="14" y2="-12" stroke="#451a03" strokeWidth="0.8" />
          {/* Ink Pot */}
          <rect x="-6" y="4" width="8" height="7" rx="1.5" fill={frameColor} />
        </g>
      )}

      {bottom === 'gift_ribbon' && (
        <g transform="translate(50, 120)">
          {/* Satin Bow */}
          <path d="M 0 0 C -8 -6 -12 -2 0 4 C 12 -2 8 -6 0 0 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
          <circle cx="0" cy="0" r="2.5" fill="#fde047" />
          <path d="M -3 3 L -8 10 M 3 3 L 8 10" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* 5. Text Banner / Badge (if enabled) */}
      {frame.hasText !== false && frameText && (
        <g>
          {frame.badgeStyle === 'ticket' ? (
            <g>
              <rect
                x="8"
                y="96"
                width="84"
                height="22"
                rx="4"
                fill={frameColor}
              />
              <line x1="12" y1="96" x2="12" y2="118" stroke={accent} strokeWidth="1" strokeDasharray="2,2" />
              <line x1="88" y1="96" x2="88" y2="118" stroke={accent} strokeWidth="1" strokeDasharray="2,2" />
              <text
                x="50"
                y="107"
                fill={frameTextColor}
                fontSize="8"
                fontWeight="bold"
                letterSpacing="0.8"
                fontFamily={fontFamily}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {frameText}
              </text>
            </g>
          ) : frame.badgeStyle === 'banner' ? (
            <g>
              <path
                d="M 6 96 L 43 96 L 50 90 L 57 96 L 94 96 A 5 5 0 0 1 97 101 L 97 119 A 5 5 0 0 1 92 124 L 8 124 A 5 5 0 0 1 3 119 L 3 101 A 5 5 0 0 1 6 96 Z"
                fill={frameColor}
              />
              <text
                x="50"
                y="113"
                fill={frameTextColor}
                fontSize="8.5"
                fontWeight="bold"
                letterSpacing="0.8"
                fontFamily={fontFamily}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {frameText}
              </text>
            </g>
          ) : (
            /* Default Rounded Pill Badge */
            <g>
              <rect
                x="10"
                y="96"
                width="80"
                height="22"
                rx="11"
                fill={frameColor}
              />
              <text
                x="50"
                y="107"
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
          )}
        </g>
      )}
    </g>
  );
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

// Helpers for Google G and Five Star Rating
const renderGoogleG = (x: number, y: number, scale: number = 0.75) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <circle cx="12" cy="12" r="13" fill="#ffffff" />
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </g>
);

const renderFiveStars = (cx: number, cy: number, scale: number = 1) => {
  const starPath = "M 0,-7 L 2.1,-2.3 L 7,-1.5 L 3.5,1.9 L 4.3,6.8 L 0,4.5 L -4.3,6.8 L -3.5,1.9 L -7,-1.5 L -2.1,-2.3 Z";
  const offsets = [-34, -17, 0, 17, 34];
  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
      {offsets.map((dx, i) => (
        <g key={i} transform={`translate(${dx}, 0)`}>
          <path d={starPath} fill="#fbbc04" stroke="#d97706" strokeWidth="0.8" />
        </g>
      ))}
    </g>
  );
};

const renderPhoneScanIcon = (cx: number, cy: number, scale: number = 1) => (
  <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
    <rect x="-8" y="-14" width="16" height="28" rx="3.5" fill="none" stroke="#475569" strokeWidth="1.8" />
    <line x1="-3" y1="-10.5" x2="3" y2="-10.5" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="0" cy="9.5" r="1.1" fill="#475569" />
    <rect x="-4.5" y="-6.5" width="9" height="9" rx="1" fill="#94a3b8" />
    <line x1="-6" y1="-2" x2="6" y2="-2" stroke="#2563eb" strokeWidth="1.2" />
  </g>
);

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
  const hasStars = config.cardShowStars || config.cardTheme === 'google_review' || cardSubtitle.includes('⭐');

  // SPECIALIZED GOOGLE REVIEWS THEMES (Direct reproduction of display stands and PVC cards)
  // A. ACRYLIC PLAQUE WITH WOODEN BASE (Image 2)
  if (config.cardTheme === 'google_acrylic_wood') {
    const showWood = config.cardShowWoodBase !== false;
    const plaqueHeight = showWood ? 420 : 455;
    const svgHeight = showWood ? 505 : 470;

    return (
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 340 ${svgHeight}`}
        className={className}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="woodBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e8cfad" />
            <stop offset="25%" stopColor="#dab383" />
            <stop offset="70%" stopColor="#c59964" />
            <stop offset="100%" stopColor="#ab7e47" />
          </linearGradient>
          <linearGradient id="acrylicReflection" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="subtlePlaqueDrop" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="#000000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Acrylic Plaque Body */}
        <rect x="36" y="16" width="268" height={plaqueHeight} rx="14" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" filter="url(#subtlePlaqueDrop)" />
        {/* Subtle acrylic top highlight */}
        <line x1="50" y1="18" x2="290" y2="18" stroke="#ffffff" strokeWidth="2.5" />

        {/* Google G Logo at top */}
        {renderGoogleG(170 - 22, 36, 1.8)}

        {/* 5 Golden Stars */}
        {renderFiveStars(170, 110, 1.4)}

        {/* Title: Valorános */}
        <text 
          x="170" 
          y="150" 
          fill="#0f172a" 
          fontSize="24" 
          fontWeight="800" 
          fontFamily={frameFontFamily} 
          textAnchor="middle"
          letterSpacing="-0.3"
        >
          {cardTitle || 'Valorános'}
        </text>

        {/* Framed QR Code */}
        <g transform="translate(68, 170)">
          <rect x="-4" y="-4" width="212" height="212" rx="14" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          <RenderFramedOrPlainQR
            config={config}
            activeFrame={activeFrame}
            frameColor={frameColor}
            frameTextColor={frameTextColor}
            frameText={frameText}
            frameFontFamily={frameFontFamily}
            computedLogoSize={computedLogoSize}
            width={204}
            height={204}
          />
        </g>

        {/* Phone Scan Icon + Escanea QR */}
        <g transform="translate(170, 396)">
          {renderPhoneScanIcon(0, -6, 0.75)}
          <text 
            x="0" 
            y="17" 
            fill="#475569" 
            fontSize="10" 
            fontWeight="700" 
            fontFamily={frameFontFamily} 
            textAnchor="middle"
            letterSpacing="0.2"
          >
            {cardInstructions || 'Escanea QR'}
          </text>
        </g>

        {/* Wooden Stand Base (como en la Imagen 2) */}
        {showWood && (
          <g transform="translate(26, 432)">
            <rect x="6" y="52" width="276" height="5" rx="2.5" fill="#000000" opacity="0.18" />
            <rect x="0" y="0" width="288" height="52" rx="6" fill="url(#woodBaseGrad)" stroke="#a1753e" strokeWidth="1" />
            <rect x="12" y="2" width="264" height="4" rx="2" fill="#784f22" opacity="0.45" />
            <path d="M 16 19 Q 80 16, 150 20 T 272 17" fill="none" stroke="#ba8c54" strokeWidth="0.8" opacity="0.5" />
            <path d="M 24 35 Q 110 38, 190 34 T 268 36" fill="none" stroke="#ba8c54" strokeWidth="0.8" opacity="0.4" />
          </g>
        )}
      </svg>
    );
  }

  // B. MATTE BLACK NFC / REVIEW CARD (Image 3)
  if (config.cardTheme === 'google_black_card') {
    return (
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 510"
        className={className}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id="blackCardShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Matte Black Card Body */}
        <rect x="0" y="0" width="320" height="510" rx="24" fill="#141416" stroke="#2a2a30" strokeWidth="2" filter="url(#blackCardShadow)" />

        {/* Top 4-Color Google Strip */}
        <g transform="translate(24, 22)">
          <rect x="0" y="0" width="64" height="11" rx="3.5" fill="#EA4335" />
          <rect x="69" y="0" width="64" height="11" rx="3.5" fill="#FBBC05" />
          <rect x="138" y="0" width="64" height="11" rx="3.5" fill="#4285F4" />
          <rect x="207" y="0" width="65" height="11" rx="3.5" fill="#34A853" />
        </g>

        {/* Header Text */}
        <text x="160" y="58" fill="#f8fafc" fontSize="10.5" fontWeight="600" fontFamily={frameFontFamily} textAnchor="middle">
          <tspan x="160" dy="0">Escanea el código QR o</tspan>
          <tspan x="160" dy="16">toca con tu celular para</tspan>
          <tspan x="160" dy="16">dejarnos tu opinión en Google.</tspan>
        </text>

        {/* 5 Golden Stars */}
        {renderFiveStars(160, 120, 1.25)}

        {/* Crisp White QR Container */}
        <g transform="translate(48, 140)">
          <rect x="0" y="0" width="224" height="224" rx="18" fill="#ffffff" />
          <g transform="translate(7, 7)">
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
        </g>

        {/* Custom Logo / Business Box */}
        <g transform="translate(48, 386)">
          <rect x="0" y="0" width="224" height="42" rx="8" fill="#1b1b22" stroke="#52525b" strokeWidth="1.5" strokeDasharray="5,4" />
          <text 
            x="112" 
            y="26" 
            fill="#e4e4e7" 
            fontSize="12.5" 
            fontWeight="bold" 
            fontFamily={frameFontFamily} 
            textAnchor="middle"
          >
            {config.cardCustomLogoText || 'Pon tu logo / Tu Negocio'}
          </text>
        </g>

        {/* Bottom 4-Color Google Strip */}
        <g transform="translate(24, 474)">
          <rect x="0" y="0" width="64" height="11" rx="3.5" fill="#EA4335" />
          <rect x="69" y="0" width="64" height="11" rx="3.5" fill="#FBBC05" />
          <rect x="138" y="0" width="64" height="11" rx="3.5" fill="#4285F4" />
          <rect x="207" y="0" width="65" height="11" rx="3.5" fill="#34A853" />
        </g>
      </svg>
    );
  }

  // C. GEOMETRIC GOOGLE MULTICOLOR CARD (Image 1)
  if (config.cardTheme === 'google_geometric_card') {
    return (
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 510"
        className={className}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <clipPath id="geometricCardClip">
            <rect x="0" y="0" width="320" height="510" rx="24" />
          </clipPath>
          <filter id="geoShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Main Base Card with Google Color Polygons */}
        <g clipPath="url(#geometricCardClip)" filter="url(#geoShadow)">
          <rect x="0" y="0" width="320" height="510" fill="#2563EB" />
          <path d="M 0 130 L 320 180 L 320 310 L 0 360 Z" fill="#16A34A" />
          <polygon points="180,180 320,180 320,400 240,400" fill="#F59E0B" />
          <path d="M 0 350 L 320 395 L 320 510 L 0 510 Z" fill="#DC2626" />
        </g>

        {/* Card Border */}
        <rect x="0" y="0" width="320" height="510" rx="24" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.6" />

        {/* Top Text: Califícanos en Google */}
        <text x="160" y="44" fill="#ffffff" fontSize="12" fontWeight="600" fontFamily={frameFontFamily} textAnchor="middle" opacity="0.95">
          Califícanos en
        </text>
        <text x="160" y="74" fill="#ffffff" fontSize="26" fontWeight="900" fontFamily={frameFontFamily} textAnchor="middle" letterSpacing="-0.5">
          Google
        </text>

        {/* 5 Stars + "Tu opinión nos importa" */}
        {renderFiveStars(160, 96, 1.15)}
        <text x="160" y="118" fill="#ffffff" fontSize="11" fontWeight="700" fontFamily={frameFontFamily} textAnchor="middle" opacity="0.95">
          {cardSubtitle || 'Tu opinión nos importa'}
        </text>

        {/* White Center QR Card */}
        <g transform="translate(48, 138)">
          <rect x="0" y="0" width="224" height="224" rx="20" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <g transform="translate(7, 7)">
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
        </g>

        {/* Bottom CTA: Escanea */}
        <g transform="translate(160, 440)">
          <rect x="-65" y="-16" width="130" height="32" rx="16" fill="#ffffff" fillOpacity="0.25" stroke="#ffffff" strokeWidth="1.5" />
          <text x="0" y="5" fill="#ffffff" fontSize="13" fontWeight="800" fontFamily={frameFontFamily} textAnchor="middle" letterSpacing="0.8">
            {cardCta || 'Escanea'}
          </text>
        </g>
      </svg>
    );
  }

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
        <rect x="80" y="54" width="200" height="28" rx="14" fill={cardBg} stroke={frameColor} strokeWidth="2.5" />
        {config.cardTheme === 'google_review' && renderGoogleG(86, 56, 0.72)}
        <text 
          x={config.cardTheme === 'google_review' ? 186 : 180} 
          y="72" 
          fill={frameColor} 
          fontSize="10.5" 
          fontWeight="900" 
          letterSpacing="1" 
          fontFamily={frameFontFamily} 
          textAnchor="middle"
        >
          {(config.cardBadgeText || frameText).toUpperCase()}
        </text>

        {/* Title */}
        <text x="180" y="108" fill={cardText} fontSize="17" fontWeight="bold" fontFamily={frameFontFamily} textAnchor="middle">
          {titleLines.map((line, idx) => (
            <tspan key={idx} x="180" dy={idx === 0 ? 0 : 20}>{line}</tspan>
          ))}
        </text>

        {/* Subtitle */}
        <text x="180" y={108 + (titleLines.length * 20) + 2} fill={cardText} fontSize="10" opacity="0.8" fontFamily={frameFontFamily} textAnchor="middle">
          {subtitleLines.map((line, idx) => (
            <tspan key={idx} x="180" dy={idx === 0 ? 0 : 13}>{line}</tspan>
          ))}
        </text>

        {/* 5 Stars Rating */}
        {hasStars && renderFiveStars(180, 108 + (titleLines.length * 20) + (subtitleLines.length > 1 ? 26 : 18), 1.05)}

        {/* Center QR Box with Active Frame */}
        <g transform={`translate(80, ${hasStars ? 188 : 178})`}>
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

        {/* 5 Stars Rating */}
        {hasStars && renderFiveStars(140, 44 + (titleLines.length * 19) + (subtitleLines.length > 1 ? 22 : 15), 0.85)}

        {/* Instructions */}
        <g transform={`translate(10, ${85 + (titleLines.length > 1 ? 8 : 0) + (hasStars ? 8 : 0)})`}>
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
