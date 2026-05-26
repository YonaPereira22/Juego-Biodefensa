import React, { useState, useEffect, useRef } from 'react';

const SCENARIOS = [
  {
    id: 1,
    title: "Contacto Preventivo",
    description: "Lucía está sana, pero trabaja en un hospital y teme contagiarse del nuevo brote en las próximas semanas. ¿Qué intervención es la adecuada?",
    type: "choice" as const,
    options: [
      { id: "A", text: "Aplicar Vacuna (Genera memoria inmunológica con antígenos)", isCorrect: true },
      { id: "B", text: "Inyectar Suero (Brinda anticuerpos inmediatos pero temporales)", isCorrect: false },
      { id: "C", text: "No hacer nada", isCorrect: false }
    ],
    feedbackCorrect: "¡Excelente! Las vacunas introducen antígenos de forma segura para que el sistema inmune genere sus propios anticuerpos y células de memoria, ideal para la prevención a largo plazo.",
    feedbackIncorrect: "Incorrecto. El suero proporciona inmunidad pasiva artificial inmediata (anticuerpos ya hechos), lo cual no es eficiente para prevenir contagios futuros en personas sanas."
  },
  {
    id: 2,
    title: "Caso Agudo: Mordedura",
    description: "Carlos llega de emergencia tras ser mordido por un animal silvestre que muestra signos de la infección. Ya presenta síntomas agudos y el patógeno avanza rápido.",
    type: "choice" as const,
    options: [
      { id: "A", text: "Aplicar Vacuna de acción lenta", isCorrect: false },
      { id: "B", text: "Suministrar Suero / Antitoxinas (Inmunidad Pasiva)", isCorrect: true },
      { id: "C", text: "Recomendar reposo y aislamiento social", isCorrect: false }
    ],
    feedbackCorrect: "¡Correcto! En una infección aguda o exposición a toxinas, el cuerpo no tiene tiempo de generar sus propios anticuerpos. El suero neutraliza el patógeno de inmediato.",
    feedbackIncorrect: "Incorrecto. La vacuna tarda días o semanas en inducir una respuesta inmune protectora. En un caso agudo, el paciente empeoraría críticamente."
  },
  {
    id: 3,
    title: "Higiene y Control Ambiental",
    description: "La familia Martínez quiere saber qué medidas no farmacológicas son efectivas para mitigar la propagación aérea del virus en su hogar. (Selecciona todas las correctas)",
    type: "multichoice" as const,
    options: [
      { id: "A", text: "Ventilación cruzada y continua de las habitaciones", isCorrect: true },
      { id: "B", text: "Uso de mascarillas quirúrgicas o de alta eficiencia (N95)", isCorrect: true },
      { id: "C", text: "Uso estricto de antibióticos preventivos", isCorrect: false },
      { id: "D", text: "Aislamiento de los casos sospechosos", isCorrect: true }
    ],
    feedbackCorrect: "¡Muy bien! La ventilación, las mascarillas y el aislamiento reducen la carga viral en el aire y cortan la cadena de transmisión. Los antibióticos solo destruyen bacterias, no virus.",
    feedbackIncorrect: "No has seleccionado la combinación correcta. Recuerda que los antibióticos no tienen efecto sobre los virus y las medidas deben mitigar la dispersión de aerosoles."
  },
  {
    id: 4,
    title: "Bebé Lactante",
    description: "Una madre lactante consulta si debe suspender la lactancia debido al brote. Quiere saber si protege de algún modo a su hijo.",
    type: "choice" as const,
    options: [
      { id: "A", text: "Suspenderla; la leche transmite la enfermedad de forma directa", isCorrect: false },
      { id: "B", text: "Continuarla; transmite inmunidad pasiva natural (anticuerpos IgA)", isCorrect: true },
      { id: "C", text: "Cambiar a fórmula fortificada con antibióticos", isCorrect: false }
    ],
    feedbackCorrect: "¡Correcto! La lactancia materna transfiere anticuerpos (inmunidad pasiva natural, principalmente IgA) que protegen el tracto gastrointestinal y respiratorio del lactante.",
    feedbackIncorrect: "Incorrecto. Salvo excepciones médicas específicas, la leche materna es una fuente crucial de anticuerpos protectores para el bebé frente a los brotes de la comunidad."
  },
  {
    id: 5,
    title: "Inmunidad de Rebaño",
    description: "El intendente del barrio te pregunta qué porcentaje de vacunación se requiere aproximadamente para proteger a aquellos que no pueden vacunarse (médicamente contraindicados).",
    type: "choice" as const,
    options: [
      { id: "A", text: "Con un 10% es suficiente si se cuidan", isCorrect: false },
      { id: "B", text: "Alrededor del 70% al 90% (Inmunidad de rebaño o colectiva)", isCorrect: true },
      { id: "C", text: "Se requiere el 100% obligatorio sin excepciones", isCorrect: false }
    ],
    feedbackCorrect: "¡Excelente! La inmunidad de rebaño se logra cuando una gran masa crítica de la población está inmunizada, interrumpiendo la cadena de contagios y protegiendo indirectamente a los vulnerables.",
    feedbackIncorrect: "Incorrecto. Un porcentaje bajo no frena la transmisión comunitaria. El 100% es idealmente imposible debido a personas con alergias severas o inmunocomprometidas; por eso dependemos del umbral colectivo."
  }
];

type BuildingType = 'infected' | 'center' | 'healthy';

interface Building {
  id: number; x: number; y: number;
  width: number; height: number;
  type: BuildingType; scenarioId?: number; resolved: boolean;
}

interface Player {
  x: number; y: number; vx: number; vy: number; width: number; height: number;
}

type GameState = 'START' | 'PLAYING' | 'MODAL' | 'GAMEOVER' | 'VICTORY';

// ─── PLAYER SPRITE ───────────────────────────────────────────────
const PlayerSprite = ({ moving }: { moving: boolean }) => {
  const p = moving ? '' : ' anim-paused';
  return (
    <svg viewBox="0 0 33 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <ellipse cx="16.5" cy="58" rx="9" ry="2.5" fill="rgba(0,0,0,0.35)" />
      <g className={`walk-leg-l${p}`}>
        <rect x="7" y="40" width="8" height="16" rx="3" fill="#1e3a8a" />
        <rect x="6" y="53" width="9" height="5" rx="2" fill="#0f172a" />
      </g>
      <g className={`walk-leg-r${p}`}>
        <rect x="18" y="40" width="8" height="16" rx="3" fill="#1d4ed8" />
        <rect x="18" y="53" width="9" height="5" rx="2" fill="#0f172a" />
      </g>
      <rect x="7" y="19" width="19" height="23" rx="2" fill="#f0f9ff" />
      <polygon points="16.5,19 12,23 16.5,21" fill="#bae6fd" />
      <polygon points="16.5,19 21,23 16.5,21" fill="#bae6fd" />
      <rect x="9" y="28" width="6" height="5" rx="1" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="0.5" />
      <path d="M17 21 Q20 26 19 31" stroke="#94a3b8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="19" cy="32" r="2" fill="#64748b" />
      <rect x="18" y="27" width="5" height="4" rx="0.5" fill="#0ea5e9" />
      <rect x="19" y="28" width="3" height="0.8" rx="0.3" fill="white" />
      <rect x="19" y="29.5" width="2" height="0.8" rx="0.3" fill="white" />
      <g className={`walk-arm-l${p}`}>
        <rect x="2" y="19" width="6" height="14" rx="3" fill="#f0f9ff" />
        <rect x="2" y="31" width="6" height="6" rx="2" fill="#fde68a" />
      </g>
      <g className={`walk-arm-r${p}`}>
        <rect x="25" y="19" width="6" height="14" rx="3" fill="#f0f9ff" />
        <rect x="24" y="33" width="8" height="6" rx="1.5" fill="#dc2626" />
        <rect x="27" y="34.5" width="2" height="3" rx="0.5" fill="white" />
        <rect x="26" y="35.8" width="4" height="0.8" rx="0.3" fill="white" />
      </g>
      <rect x="14" y="14" width="5" height="6" rx="1" fill="#fcd9b6" />
      <circle cx="16.5" cy="10" r="9" fill="#fcd9b6" />
      <path d="M7.5 9 Q7.5 1 16.5 1 Q25.5 1 25.5 9 Q24 5 16.5 5 Q9 5 7.5 9Z" fill="#1c1917" />
      <ellipse cx="7.5" cy="10.5" rx="1.8" ry="2.2" fill="#f5c8a0" />
      <ellipse cx="25.5" cy="10.5" rx="1.8" ry="2.2" fill="#f5c8a0" />
      <ellipse cx="13" cy="9.5" rx="1.5" ry="1.8" fill="#1c1917" />
      <ellipse cx="20" cy="9.5" rx="1.5" ry="1.8" fill="#1c1917" />
      <circle cx="13.5" cy="9" r="0.5" fill="white" />
      <circle cx="20.5" cy="9" r="0.5" fill="white" />
      <path d="M9 12 Q16.5 16 24 12 Q22 18 16.5 18.5 Q11 18 9 12Z" fill="#e0f2fe" stroke="#93c5fd" strokeWidth="0.4" />
      <path d="M11 14 Q16.5 17 22 14" stroke="#93c5fd" strokeWidth="0.5" fill="none" />
    </svg>
  );
};

// ─── INFECTED HOUSE ───────────────────────────────────────────────
const InfectedHouse = () => (
  <svg viewBox="0 0 80 92" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <g>
      <ellipse cx="60" cy="14" rx="3" ry="2" fill="#6b7280" opacity="0.6" className="smoke-puff" />
      <ellipse cx="59" cy="11" rx="2.5" ry="2" fill="#9ca3af" opacity="0.5" className="smoke-puff" style={{ animationDelay: '0.7s' }} />
      <ellipse cx="61" cy="8" rx="2" ry="1.5" fill="#d1d5db" opacity="0.4" className="smoke-puff" style={{ animationDelay: '1.4s' }} />
    </g>
    <rect x="55" y="10" width="11" height="20" rx="1" fill="#7f1d1d" />
    <rect x="54" y="10" width="13" height="3" rx="1" fill="#991b1b" />
    <polygon points="40,4 78,32 2,32" fill="#1c1917" />
    <line x1="2" y1="28" x2="78" y2="28" stroke="#292524" strokeWidth="1" />
    <line x1="5" y1="24" x2="75" y2="24" stroke="#292524" strokeWidth="1" />
    <line x1="9" y1="20" x2="71" y2="20" stroke="#292524" strokeWidth="1" />
    <line x1="14" y1="16" x2="66" y2="16" stroke="#292524" strokeWidth="1" />
    <line x1="20" y1="12" x2="60" y2="12" stroke="#292524" strokeWidth="1" />
    <line x1="40" y1="4" x2="78" y2="32" stroke="#44403c" strokeWidth="1.5" />
    <line x1="40" y1="4" x2="2" y2="32" stroke="#44403c" strokeWidth="1.5" />
    <rect x="4" y="32" width="72" height="52" fill="#7c3e2a" />
    {[36,41,46,51,56,61,66,71,76].map((y,i) => (
      <g key={y}>
        {i%2===0
          ? [0,18,36,54,66].map(x=><rect key={x} x={x+4} y={y} width="14" height="4" rx="0.5" fill="#92400e" stroke="#78350f" strokeWidth="0.4"/>)
          : [0,11,29,47,60].map(x=><rect key={x} x={x+4} y={y} width="14" height="4" rx="0.5" fill="#92400e" stroke="#78350f" strokeWidth="0.4"/>)
        }
      </g>
    ))}
    <rect x="4" y="32" width="72" height="4" fill="rgba(0,0,0,0.2)" />
    <rect x="10" y="38" width="18" height="16" rx="1" fill="#1a0000" stroke="#7f1d1d" strokeWidth="1.5" />
    <rect x="11" y="39" width="16" height="14" rx="0.5" fill="#450a0a" />
    <rect x="11" y="39" width="16" height="14" rx="0.5" fill="url(#redGlow)" opacity="0.7" />
    <line x1="19" y1="39" x2="19" y2="53" stroke="#7f1d1d" strokeWidth="1" />
    <line x1="11" y1="46" x2="27" y2="46" stroke="#7f1d1d" strokeWidth="1" />
    <path d="M14 41 L16 45 L13 48" stroke="#dc2626" strokeWidth="0.8" fill="none" />
    <rect x="52" y="38" width="18" height="16" rx="1" fill="#1a0000" stroke="#7f1d1d" strokeWidth="1.5" />
    <rect x="53" y="39" width="16" height="14" rx="0.5" fill="#450a0a" />
    <rect x="53" y="39" width="16" height="14" rx="0.5" fill="url(#redGlow)" opacity="0.7" />
    <line x1="61" y1="39" x2="61" y2="53" stroke="#7f1d1d" strokeWidth="1" />
    <line x1="53" y1="46" x2="69" y2="46" stroke="#7f1d1d" strokeWidth="1" />
    <path d="M64 40 L62 43 L65 47" stroke="#dc2626" strokeWidth="0.8" fill="none" />
    <rect x="31" y="58" width="18" height="26" rx="2" fill="#451a03" stroke="#78350f" strokeWidth="1" />
    <path d="M31 58 Q40 52 49 58" fill="#78350f" />
    <circle cx="46" cy="71" r="1.5" fill="#d97706" />
    <rect x="33" y="61" width="14" height="10" rx="1" fill="#3c1506" />
    <rect x="33" y="73" width="14" height="8" rx="1" fill="#3c1506" />
    <rect x="4" y="55" width="72" height="5" fill="#fbbf24" opacity="0.7" />
    <line x1="4" y1="55" x2="76" y2="60" stroke="#92400e" strokeWidth="1" strokeDasharray="8,6" />
    <circle cx="40" cy="55" r="6" fill="#7f1d1d" stroke="#dc2626" strokeWidth="1" />
    <text x="40" y="58.5" textAnchor="middle" fontSize="7" fill="#fca5a5" fontWeight="bold">☣</text>
    <rect x="0" y="84" width="80" height="8" rx="1" fill="#44403c" />
    <rect x="0" y="84" width="80" height="2" fill="#57534e" />
    <rect x="0" y="88" width="80" height="4" fill="#14532d" />
    <defs>
      <radialGradient id="redGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// ─── HOSPITAL SPRITE ──────────────────────────────────────────────
const HospitalSprite = () => (
  <svg viewBox="0 0 90 105" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <line x1="78" y1="6" x2="78" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
    <polygon points="78,6 78,16 90,11" fill="#dc2626" />
    <rect x="82" y="9" width="5" height="3" fill="white" />
    <line x1="84" y1="10.5" x2="87" y2="10.5" stroke="#dc2626" strokeWidth="0.8" />
    <rect x="6" y="12" width="70" height="24" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1" />
    <rect x="6" y="36" width="70" height="24" fill="#f0f9ff" stroke="#0ea5e9" strokeWidth="1" />
    <rect x="2" y="60" width="78" height="30" fill="#e0f2fe" stroke="#0369a1" strokeWidth="1.5" />
    <rect x="4" y="34" width="74" height="4" fill="#7dd3fc" />
    <rect x="4" y="58" width="74" height="4" fill="#38bdf8" />
    {[10,28,46].map(x=>(
      <g key={x}>
        <rect x={x} y="16" width="14" height="16" rx="1" fill="#dbeafe" stroke="#0ea5e9" strokeWidth="0.8" />
        <line x1={x+7} y1="16" x2={x+7} y2="32" stroke="#93c5fd" strokeWidth="0.6" />
        <line x1={x} y1="24" x2={x+14} y2="24" stroke="#93c5fd" strokeWidth="0.6" />
        <rect x={x+1} y="17" width="12" height="7" fill="#bfdbfe" opacity="0.5" />
      </g>
    ))}
    {[10,28,46].map(x=>(
      <g key={x}>
        <rect x={x} y="40" width="14" height="16" rx="1" fill="#dbeafe" stroke="#0ea5e9" strokeWidth="0.8" />
        <line x1={x+7} y1="40" x2={x+7} y2="56" stroke="#93c5fd" strokeWidth="0.6" />
        <line x1={x} y1="48" x2={x+14} y2="48" stroke="#93c5fd" strokeWidth="0.6" />
        {x===28&&<rect x={x+1} y="41" width="12" height="14" rx="0.5" fill="#fef9c3" opacity="0.4" />}
      </g>
    ))}
    <rect x="56" y="14" width="6" height="20" rx="1" fill="#dc2626" />
    <rect x="51" y="19" width="16" height="6" rx="1" fill="#dc2626" />
    {[8,22,54,68].map(x=>(
      <rect key={x} x={x} y="60" width="6" height="30" rx="1" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="0.5" />
    ))}
    {[7,21,53,67].map(x=>(
      <rect key={x} x={x} y="62" width="8" height="3" rx="0.5" fill="#e0f2fe" />
    ))}
    <rect x="12" y="65" width="58" height="10" rx="1" fill="#0369a1" />
    <text x="41" y="73" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold" fontFamily="sans-serif">HOSPITAL</text>
    <rect x="28" y="72" width="16" height="18" rx="1" fill="#082f49" stroke="#0369a1" strokeWidth="1" />
    <line x1="36" y1="72" x2="36" y2="90" stroke="#0ea5e9" strokeWidth="0.8" />
    <circle cx="34" cy="81" r="1.2" fill="#38bdf8" />
    <circle cx="38" cy="81" r="1.2" fill="#38bdf8" />
    <rect x="24" y="90" width="24" height="4" rx="1" fill="#fbbf24" opacity="0.7" />
    <rect x="16" y="90" width="50" height="5" rx="0.5" fill="#7dd3fc" />
    <rect x="12" y="95" width="58" height="5" rx="0.5" fill="#93c5fd" />
    <rect x="0" y="100" width="90" height="5" fill="#0c4a6e" />
    <rect x="0" y="101" width="90" height="4" fill="#14532d" />
  </svg>
);

// ─── HEALTHY HOUSE ────────────────────────────────────────────────
const HealthyHouse = () => (
  <svg viewBox="0 0 80 92" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect x="55" y="14" width="10" height="18" rx="1" fill="#78350f" />
    <rect x="54" y="14" width="12" height="3" rx="1" fill="#92400e" />
    <polygon points="40,4 78,32 2,32" fill="#b45309" />
    <line x1="2" y1="28" x2="78" y2="28" stroke="#92400e" strokeWidth="1" />
    <line x1="5" y1="24" x2="75" y2="24" stroke="#92400e" strokeWidth="1" />
    <line x1="9" y1="20" x2="71" y2="20" stroke="#92400e" strokeWidth="1" />
    <line x1="14" y1="16" x2="66" y2="16" stroke="#92400e" strokeWidth="1" />
    <line x1="20" y1="12" x2="60" y2="12" stroke="#92400e" strokeWidth="1" />
    <line x1="40" y1="4" x2="78" y2="32" stroke="#d97706" strokeWidth="1.5" />
    <line x1="40" y1="4" x2="2" y2="32" stroke="#d97706" strokeWidth="1.5" />
    <rect x="4" y="32" width="72" height="52" fill="#fef3c7" />
    {[36,41,46,51,56,61,66,71,76].map((y,i)=>(
      <g key={y}>
        {i%2===0
          ? [0,18,36,54,66].map(x=><rect key={x} x={x+4} y={y} width="14" height="4" rx="0.5" fill="#fde68a" stroke="#fbbf24" strokeWidth="0.3"/>)
          : [0,11,29,47,60].map(x=><rect key={x} x={x+4} y={y} width="14" height="4" rx="0.5" fill="#fde68a" stroke="#fbbf24" strokeWidth="0.3"/>)
        }
      </g>
    ))}
    <rect x="4" y="32" width="72" height="4" fill="rgba(0,0,0,0.07)" />
    <rect x="10" y="38" width="18" height="16" rx="1.5" fill="#fef9c3" stroke="#d97706" strokeWidth="1.5" />
    <rect x="11" y="39" width="16" height="14" rx="0.5" fill="#fefce8" />
    <line x1="19" y1="39" x2="19" y2="53" stroke="#d97706" strokeWidth="1" />
    <line x1="11" y1="46" x2="27" y2="46" stroke="#d97706" strokeWidth="1" />
    <rect x="11" y="39" width="7" height="7" fill="#fde68a" opacity="0.5" />
    <rect x="10" y="54" width="18" height="2" rx="0.5" fill="#d97706" />
    <ellipse cx="15" cy="53" rx="2" ry="3" fill="#16a34a" />
    <ellipse cx="20" cy="53" rx="1.5" ry="2.5" fill="#15803d" />
    <circle cx="15" cy="51" r="1.5" fill="#dc2626" />
    <circle cx="20" cy="51" r="1.2" fill="#f97316" />
    <rect x="52" y="38" width="18" height="16" rx="1.5" fill="#fef9c3" stroke="#d97706" strokeWidth="1.5" />
    <rect x="53" y="39" width="16" height="14" rx="0.5" fill="#fefce8" />
    <line x1="61" y1="39" x2="61" y2="53" stroke="#d97706" strokeWidth="1" />
    <line x1="53" y1="46" x2="69" y2="46" stroke="#d97706" strokeWidth="1" />
    <rect x="61" y="39" width="8" height="7" fill="#fde68a" opacity="0.5" />
    <rect x="52" y="54" width="18" height="2" rx="0.5" fill="#d97706" />
    <ellipse cx="57" cy="53" rx="2" ry="3" fill="#16a34a" />
    <ellipse cx="62" cy="53" rx="1.5" ry="2.5" fill="#15803d" />
    <circle cx="57" cy="51" r="1.5" fill="#86efac" />
    <circle cx="62" cy="51" r="1.2" fill="#4ade80" />
    <rect x="31" y="58" width="18" height="26" rx="2" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1" />
    <path d="M31 58 Q40 53 49 58" fill="#6d28d9" />
    <circle cx="46" cy="71" r="1.5" fill="#fbbf24" />
    <rect x="33" y="61" width="14" height="10" rx="1" fill="#6d28d9" />
    <rect x="33" y="73" width="14" height="8" rx="1" fill="#6d28d9" />
    <circle cx="40" cy="55" r="6" fill="#16a34a" stroke="#4ade80" strokeWidth="1" />
    <path d="M37 55 L39.5 57.5 L44 52.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="0" y="84" width="80" height="8" rx="1" fill="#44403c" />
    <rect x="0" y="84" width="80" height="2" fill="#57534e" />
    <rect x="0" y="88" width="80" height="4" fill="#15803d" />
    {[5,15,65,74].map(x=>(
      <g key={x}>
        <line x1={x} y1="88" x2={x} y2="85" stroke="#16a34a" strokeWidth="1" />
        <circle cx={x} cy="85" r="1.5" fill="#fbbf24" />
      </g>
    ))}
  </svg>
);

const BuildingSprite = ({ type }: { type: BuildingType }) => {
  if (type === 'infected') return <InfectedHouse />;
  if (type === 'center') return <HospitalSprite />;
  return <HealthyHouse />;
};

const INITIAL_BUILDINGS_L1: Building[] = [
  { id: 1, x: 105, y: 85,  width: 80, height: 92,  type: 'infected', scenarioId: 1, resolved: false },
  { id: 2, x: 430, y: 55,  width: 80, height: 92,  type: 'infected', scenarioId: 2, resolved: false },
  { id: 3, x: 245, y: 175, width: 90, height: 105, type: 'center',   resolved: false },
  { id: 4, x: 75,  y: 320, width: 80, height: 92,  type: 'infected', scenarioId: 3, resolved: false },
  { id: 5, x: 460, y: 285, width: 80, height: 92,  type: 'infected', scenarioId: 4, resolved: false },
  { id: 6, x: 265, y: 8,   width: 80, height: 92,  type: 'infected', scenarioId: 5, resolved: false },
];

const INITIAL_BUILDINGS_L2: Building[] = [
  { id: 1, x: 65,  y: 75,  width: 80, height: 92,  type: 'infected', scenarioId: 3, resolved: false },
  { id: 2, x: 470, y: 95,  width: 80, height: 92,  type: 'infected', scenarioId: 4, resolved: false },
  { id: 3, x: 245, y: 180, width: 90, height: 105, type: 'center',   resolved: false },
  { id: 4, x: 165, y: 340, width: 80, height: 92,  type: 'infected', scenarioId: 5, resolved: false },
  { id: 5, x: 410, y: 310, width: 80, height: 92,  type: 'infected', scenarioId: 1, resolved: false },
];

const levels = [
  { name: "Barrio Residencial", epidemicGrowth: 0.05 },
  { name: "Centro Urbano",      epidemicGrowth: 0.09 }
];

const PLAYER_W = 33;
const PLAYER_H = 60;

const WorldBackground = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 640 480" preserveAspectRatio="none">
    <rect width="640" height="480" fill="#1c1917" />
    <rect x="0" y="75"  width="640" height="22" fill="#292524" />
    <rect x="0" y="270" width="640" height="22" fill="#292524" />
    <rect x="65"  y="0" width="22" height="480" fill="#292524" />
    <rect x="360" y="0" width="22" height="480" fill="#292524" />
    {[80,120,160,200,240,280,320,360,400,440,480,520,560,600].map(x=>(
      <rect key={x} x={x} y="83" width="20" height="6" rx="2" fill="#fbbf24" opacity="0.25" />
    ))}
    {[80,120,160,200,240,280,320,360,400,440,480,520,560,600].map(x=>(
      <rect key={x} x={x} y="278" width="20" height="6" rx="2" fill="#fbbf24" opacity="0.25" />
    ))}
    {[40,80,120,160,200,240,280,320,360,400,440].map(y=>(
      <rect key={y} x="73" y={y} width="6" height="20" rx="2" fill="#fbbf24" opacity="0.25" />
    ))}
    {[40,80,120,160,200,240,280,320,360,400,440].map(y=>(
      <rect key={y} x="368" y={y} width="6" height="20" rx="2" fill="#fbbf24" opacity="0.25" />
    ))}
    <rect x="87"  y="97"  width="273" height="173" fill="#14532d" opacity="0.4" rx="2" />
    <rect x="382" y="97"  width="258" height="173" fill="#14532d" opacity="0.4" rx="2" />
    <rect x="87"  y="292" width="273" height="188" fill="#14532d" opacity="0.4" rx="2" />
    <rect x="382" y="292" width="258" height="188" fill="#14532d" opacity="0.4" rx="2" />
    <rect x="0" y="73"  width="640" height="4" fill="#44403c" opacity="0.6" />
    <rect x="0" y="97"  width="640" height="3" fill="#57534e" opacity="0.5" />
    <rect x="0" y="268" width="640" height="4" fill="#44403c" opacity="0.6" />
    <rect x="0" y="292" width="640" height="3" fill="#57534e" opacity="0.5" />
  </svg>
);

export default function BioDefenseGame() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [epidemicHealth, setEpidemicHealth] = useState(70);
  const [vaccines, setVaccines] = useState(3);
  const [serums, setSerums] = useState(2);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('START');
  const [player, setPlayer] = useState<Player>({ x: 50, y: 130, vx: 0, vy: 0, width: PLAYER_W, height: PLAYER_H });
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS_L1);
  const [activeBuilding, setActiveBuilding] = useState<Building | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [modalFeedback, setModalFeedback] = useState<{ success: boolean; text: string } | null>(null);
  const [supplyAlert, setSupplyAlert] = useState(false);
  const [moving, setMoving] = useState(false);

  const keysPressed = useRef<Record<string, boolean>>({});
  const centerAlerted = useRef(false);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key.toLowerCase()] = true; };
    const handleKeyUp   = (e: KeyboardEvent) => { keysPressed.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const interval = setInterval(() => {
      setPlayer((prev) => {
        let ax = 0, ay = 0;
        const ACCEL = 0.6, FRICTION = 0.82, MAX_SPEED = 5;
        if (keysPressed.current['w'] || keysPressed.current['arrowup'])    ay -= ACCEL;
        if (keysPressed.current['s'] || keysPressed.current['arrowdown'])  ay += ACCEL;
        if (keysPressed.current['a'] || keysPressed.current['arrowleft'])  ax -= ACCEL;
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) ax += ACCEL;
        let vx = (prev.vx + ax) * FRICTION;
        let vy = (prev.vy + ay) * FRICTION;
        if (vx >  MAX_SPEED) vx =  MAX_SPEED;
        if (vx < -MAX_SPEED) vx = -MAX_SPEED;
        if (vy >  MAX_SPEED) vy =  MAX_SPEED;
        if (vy < -MAX_SPEED) vy = -MAX_SPEED;
        setMoving(Math.abs(vx) > 0.3 || Math.abs(vy) > 0.3);
        let newX = prev.x + vx;
        let newY = prev.y + vy;
        if (newX < 0)   { newX = 0;   vx = 0; }
        if (newX > 607) { newX = 607; vx = 0; }
        if (newY < 0)   { newY = 0;   vy = 0; }
        if (newY > 420) { newY = 420; vy = 0; }
        return { ...prev, x: newX, y: newY, vx, vy };
      });
      setEpidemicHealth((prev) => {
        const next = prev + levels[currentLevel].epidemicGrowth;
        if (next >= 100) { setGameState('GAMEOVER'); return 100; }
        return next;
      });
    }, 16);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
    };
  }, [gameState, currentLevel]);

  const checkCollision = (r1: Player, r2: Building) => (
    r1.x < r2.x + r2.width && r1.x + r1.width > r2.x &&
    r1.y < r2.y + r2.height && r1.y + r1.height > r2.y
  );

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    for (const b of buildings) {
      if (checkCollision(player, b)) {
        if (b.type === 'center') {
          if (!centerAlerted.current) {
            centerAlerted.current = true;
            setVaccines(3); setSerums(2); setSupplyAlert(true);
            setTimeout(() => { setSupplyAlert(false); centerAlerted.current = false; }, 2000);
          }
          setPlayer(p => ({ ...p, x: p.x - p.vx * 3, y: p.y - p.vy * 3, vx: 0, vy: 0 }));
          break;
        } else if (!b.resolved) {
          setPlayer(p => ({ ...p, vx: 0, vy: 0 }));
          setActiveBuilding(b); setSelectedOptions([]); setModalFeedback(null);
          setGameState('MODAL'); break;
        }
      }
    }
  }, [player, buildings, gameState]);

  const handleAnswerSubmit = (scenario: typeof SCENARIOS[0], singleOptionId?: string) => {
    let isCorrect = false;
    if (scenario.type === "choice" && singleOptionId)
      isCorrect = scenario.options.find(o => o.id === singleOptionId)?.isCorrect ?? false;
    else if (scenario.type === "multichoice") {
      const correctIds = scenario.options.filter(o => o.isCorrect).map(o => o.id);
      isCorrect = selectedOptions.length === correctIds.length && selectedOptions.every(id => correctIds.includes(id));
    }
    if (isCorrect) {
      setModalFeedback({ success: true, text: scenario.feedbackCorrect });
      setScore(s => s + 100);
      setEpidemicHealth(h => Math.max(0, h - 20));
      setBuildings(bs => bs.map(b => b.id === activeBuilding?.id ? { ...b, resolved: true, type: 'healthy' } : b));
    } else {
      setModalFeedback({ success: false, text: scenario.feedbackIncorrect });
      setEpidemicHealth(h => Math.min(100, h + 10));
    }
  };

  const closeModal = () => {
    const updated = buildings.map(b =>
      b.id === activeBuilding?.id && modalFeedback?.success ? { ...b, resolved: true, type: 'healthy' as BuildingType } : b
    );
    setGameState('PLAYING');
    setActiveBuilding(null);
    const remaining = updated.filter(b => b.type === 'infected' && !b.resolved);
    if (remaining.length === 0 && modalFeedback?.success) {
      if (currentLevel < levels.length - 1) {
        setCurrentLevel(l => l + 1); setBuildings(INITIAL_BUILDINGS_L2);
        setEpidemicHealth(65);
        setPlayer({ x: 50, y: 130, vx: 0, vy: 0, width: PLAYER_W, height: PLAYER_H });
      } else setGameState('VICTORY');
    }
  };

  const toggleMultiChoiceOption = (id: string) =>
    setSelectedOptions(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);

  const restartGame = () => {
    setCurrentLevel(0); setEpidemicHealth(70); setVaccines(3); setSerums(2); setScore(0);
    setBuildings(INITIAL_BUILDINGS_L1);
    setPlayer({ x: 50, y: 130, vx: 0, vy: 0, width: PLAYER_W, height: PLAYER_H });
    setGameState('PLAYING');
  };

  const epidemicColor = epidemicHealth > 75 ? 'from-red-600 to-red-700'
    : epidemicHealth > 50 ? 'from-orange-500 to-red-500' : 'from-yellow-500 to-orange-500';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans p-3 select-none">
      <header className="w-full max-w-4xl bg-slate-900 px-5 py-3 rounded-t-2xl border border-slate-700/60 shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-lg font-extrabold text-teal-400 tracking-tight">🦠 Bio-Defensa</h1>
          <p className="text-xs text-slate-500">
            Sector: <span className="text-slate-300 font-semibold">{levels[currentLevel].name}</span>
            <span className="ml-2 text-slate-600">— Nivel {currentLevel + 1}/{levels.length}</span>
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1 min-w-[180px]">
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-slate-400">Brote comunitario</span>
              <span className={`font-bold ${epidemicHealth>75?'text-red-400':epidemicHealth>50?'text-orange-400':'text-yellow-400'}`}>
                {Math.round(epidemicHealth)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
              <div className={`bg-gradient-to-r ${epidemicColor} h-full transition-all duration-300`} style={{ width: `${epidemicHealth}%` }} />
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Puntaje</span>
            <div className="text-yellow-400 font-bold text-base">{score}</div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl h-[480px] relative overflow-hidden rounded-b-2xl border border-t-0 border-slate-700/60 shadow-2xl">
        <WorldBackground />

        {gameState === 'START' && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="text-5xl mb-3">🦠</div>
            <h2 className="text-3xl font-black text-teal-400 mb-1">¡Agente Epidemiólogo!</h2>
            <p className="text-slate-400 text-sm mb-5">Controla el brote antes de que colapse la comunidad.</p>
            <div className="flex gap-3 text-xs max-w-lg w-full mb-6">
              <div className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-left">
                <div className="text-lg mb-1">🧪</div>
                <div className="font-semibold text-teal-300 mb-1">Vacunas</div>
                <div className="text-slate-400">Inmunidad activa — prevención a largo plazo en personas sanas.</div>
              </div>
              <div className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-left">
                <div className="text-lg mb-1">🩸</div>
                <div className="font-semibold text-amber-300 mb-1">Sueros</div>
                <div className="text-slate-400">Inmunidad pasiva — anticuerpos inmediatos para casos agudos.</div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-5">
              Muévete con <kbd className="px-1.5 py-0.5 bg-slate-700 border border-slate-600 rounded text-slate-300">WASD</kbd> o{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-700 border border-slate-600 rounded text-slate-300">↑↓←→</kbd>.
              Visitá los focos <span className="text-red-400">rojos</span>. El <span className="text-blue-400">Hospital</span> recarga suministros.
            </div>
            <button onClick={() => setGameState('PLAYING')}
              className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-xl transition-all transform hover:scale-105 text-sm">
              Iniciar Operativo Sanitario
            </button>
          </div>
        )}

        {(gameState === 'PLAYING' || gameState === 'MODAL') && (
          <>
            <div className="absolute top-2 left-2 bg-slate-900/90 border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs flex gap-4 z-10">
              <span className="flex items-center gap-1.5"><span>🧪</span><span className="text-slate-400">Vacunas:</span><strong className="text-teal-400">{vaccines}</strong></span>
              <span className="flex items-center gap-1.5"><span>🩸</span><span className="text-slate-400">Sueros:</span><strong className="text-amber-400">{serums}</strong></span>
            </div>
            {supplyAlert && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full z-20 animate-bounce">
                ✅ Suministros reabastecidos
              </div>
            )}
            <div className="absolute top-2 right-2 bg-slate-900/80 border border-slate-700/60 px-2 py-1.5 rounded-lg text-xs z-10 space-y-0.5">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-700 inline-block"/>Foco infeccioso</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-400 inline-block"/>Hospital</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-600 inline-block"/>Controlado</div>
            </div>
            {buildings.map(b => (
              <div key={b.id} className="absolute" style={{ left:b.x, top:b.y, width:b.width, height:b.height }}>
                {b.type==='infected'&&<div className="absolute -inset-4 bg-red-700/25 rounded-2xl blur-lg infect-glow pointer-events-none"/>}
                {b.type==='healthy'&&<div className="absolute -inset-3 bg-emerald-500/15 rounded-xl blur-md pointer-events-none"/>}
                <BuildingSprite type={b.type} />
                {b.type==='infected'&&(
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-300 text-xs font-bold px-2 py-0.5 rounded-full border border-red-700/60 whitespace-nowrap">
                    ⚠ Foco #{b.id}
                  </div>
                )}
              </div>
            ))}
            <div className="absolute pointer-events-none" style={{ left:player.x, top:player.y, width:PLAYER_W, height:PLAYER_H }}>
              <PlayerSprite moving={moving} />
            </div>
          </>
        )}

        {gameState==='MODAL'&&activeBuilding&&(()=>{
          const scenario = SCENARIOS.find(s=>s.id===activeBuilding.scenarioId);
          if(!scenario) return null;
          return (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-30">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-lg p-5 rounded-2xl shadow-2xl text-sm">
                <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">⚠ Foco #{activeBuilding.id}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{scenario.title}</h3>
                  </div>
                  <span className="text-xs bg-red-900/50 text-red-300 border border-red-800/60 px-2 py-0.5 rounded-full">En observación</span>
                </div>
                <p className="text-slate-300 bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl mb-4 text-xs leading-relaxed">
                  {scenario.description}
                </p>
                {modalFeedback ? (
                  <div className={`p-4 rounded-xl border mb-3 ${modalFeedback.success?'bg-emerald-950/60 border-emerald-700/60 text-emerald-200':'bg-red-950/60 border-red-700/60 text-red-200'}`}>
                    <div className="font-bold text-sm mb-1">{modalFeedback.success?"✅ Acción Exitosa":"❌ Error Inmunológico"}</div>
                    <p className="text-xs leading-relaxed opacity-90">{modalFeedback.text}</p>
                    <button onClick={closeModal} className="mt-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-white w-full transition">
                      Continuar Monitoreo →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scenario.type==="choice"
                      ? scenario.options.map(opt=>(
                          <button key={opt.id} onClick={()=>handleAnswerSubmit(scenario,opt.id)}
                            className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 hover:border-teal-500/50 transition-all text-xs group">
                            <strong className="text-teal-400 mr-2">{opt.id}.</strong>
                            <span className="text-slate-300">{opt.text}</span>
                          </button>
                        ))
                      : (<>
                          <p className="text-xs text-slate-500 mb-2">Selecciona todas las correctas:</p>
                          {scenario.options.map(opt=>(
                            <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs transition-all ${selectedOptions.includes(opt.id)?'bg-teal-900/30 border-teal-600/60 text-teal-200':'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'}`}>
                              <input type="checkbox" checked={selectedOptions.includes(opt.id)} onChange={()=>toggleMultiChoiceOption(opt.id)} className="rounded accent-teal-500"/>
                              <span>{opt.text}</span>
                            </label>
                          ))}
                          <button onClick={()=>handleAnswerSubmit(scenario)} disabled={selectedOptions.length===0}
                            className="w-full mt-2 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition text-xs">
                            Validar Protocolo Preventivo
                          </button>
                        </>)
                    }
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {gameState==='GAMEOVER'&&(
          <div className="absolute inset-0 bg-red-950/95 flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="text-6xl mb-4">🚨</div>
            <h2 className="text-3xl font-black text-red-400 mb-2">Alerta Sanitaria Extrema</h2>
            <p className="max-w-md text-slate-300 mb-6 text-sm">La tasa de contagios alcanzó el 100%. La epidemia se descontroló.</p>
            <div className="text-slate-400 text-sm mb-6">Puntaje: <span className="text-yellow-400 font-bold">{score} pts</span></div>
            <button onClick={restartGame} className="px-6 py-3 bg-white text-red-950 font-bold rounded-xl hover:bg-red-100 transition text-sm">
              Reintentar Operación de Control
            </button>
          </div>
        )}

        {gameState==='VICTORY'&&(
          <div className="absolute inset-0 bg-emerald-900/95 flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-black text-emerald-300 mb-2">Operativo Exitoso</h2>
            <p className="max-w-md text-slate-300 mb-6 text-sm">Has controlado los focos y protegido a la comunidad. ¡Buen trabajo, agente!</p>
            <div className="text-slate-400 text-sm mb-6">Puntaje: <span className="text-yellow-400 font-bold">{score} pts</span></div>
            <button onClick={restartGame} className="px-6 py-3 bg-white text-emerald-900 font-bold rounded-xl hover:bg-emerald-100 transition text-sm">
              Reiniciar Misión
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

