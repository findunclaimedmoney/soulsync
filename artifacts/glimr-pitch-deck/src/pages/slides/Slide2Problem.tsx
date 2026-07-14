export default function Slide2Problem() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#0C0A08', fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      {/* Subtle radial warmth top-right */}
      <div
        style={{
          position: 'absolute',
          top: '-15vh',
          right: '-8vw',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(200,154,64,0.07) 0%, transparent 68%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative large faded character — right side */}
      <div
        style={{
          position: 'absolute',
          right: '6vw',
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '26vw',
          fontWeight: 800,
          color: 'rgba(200,154,64,0.05)',
          lineHeight: 1,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        ?
      </div>

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '10vw',
          paddingRight: '48vw',
        }}
      >
        <div>
          {/* Label */}
          <p
            style={{
              fontSize: '1.5vw',
              fontWeight: 400,
              color: '#C89A40',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              margin: '0 0 2vh 0',
            }}
          >
            The Problem
          </p>

          {/* Gold line */}
          <div style={{ width: '4.5vw', height: '1px', background: '#C89A40', marginBottom: '3.5vh' }} />

          {/* Headline */}
          <h1
            style={{
              fontSize: '4vw',
              fontWeight: 700,
              color: '#F5F1EB',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              textWrap: 'balance',
              margin: '0 0 5vh 0',
            }}
          >
            Human connection has never been harder
          </h1>

          {/* Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.4vh' }}>
            <div style={{ display: 'flex', gap: '1.6vw', alignItems: 'flex-start' }}>
              <span style={{ color: '#C89A40', fontSize: '2vw', lineHeight: 1.5, flexShrink: 0, marginTop: '-0.1vh' }}>—</span>
              <p style={{ fontSize: '2vw', fontWeight: 400, color: '#F5F1EB', lineHeight: 1.5, opacity: 0.88, margin: 0, textWrap: 'pretty' }}>
                Screens offer reach without intimacy
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1.6vw', alignItems: 'flex-start' }}>
              <span style={{ color: '#C89A40', fontSize: '2vw', lineHeight: 1.5, flexShrink: 0, marginTop: '-0.1vh' }}>—</span>
              <p style={{ fontSize: '2vw', fontWeight: 400, color: '#F5F1EB', lineHeight: 1.5, opacity: 0.88, margin: 0, textWrap: 'pretty' }}>
                Friendships fade as adult life accelerates
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1.6vw', alignItems: 'flex-start' }}>
              <span style={{ color: '#C89A40', fontSize: '2vw', lineHeight: 1.5, flexShrink: 0, marginTop: '-0.1vh' }}>—</span>
              <p style={{ fontSize: '2vw', fontWeight: 400, color: '#F5F1EB', lineHeight: 1.5, opacity: 0.88, margin: 0, textWrap: 'pretty' }}>
                People want to feel heard — consistently, deeply, privately
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1.6vw', alignItems: 'flex-start' }}>
              <span style={{ color: '#C89A40', fontSize: '2vw', lineHeight: 1.5, flexShrink: 0, marginTop: '-0.1vh' }}>—</span>
              <p style={{ fontSize: '2vw', fontWeight: 400, color: '#F5F1EB', lineHeight: 1.5, opacity: 0.88, margin: 0, textWrap: 'pretty' }}>
                Existing apps offer chat, not presence
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
