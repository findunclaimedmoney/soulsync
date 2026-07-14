const base = import.meta.env.BASE_URL;

export default function Slide6Cta() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0C0A08' }}>
      {/* Full-bleed CTA image */}
      <img
        src={`${base}cta.jpg`}
        crossOrigin="anonymous"
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
      />

      {/* Full overlay — darker toward center-left, lighter on right */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(110deg, rgba(12,10,8,0.88) 0%, rgba(12,10,8,0.65) 50%, rgba(12,10,8,0.30) 100%)',
        }}
      />

      {/* Bottom vignette */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '35vh',
          background: 'linear-gradient(to top, rgba(12,10,8,0.85) 0%, transparent 100%)',
        }}
      />

      {/* Content — left-aligned bottom-third */}
      <div
        style={{
          position: 'absolute',
          left: '8vw',
          bottom: '12vh',
          right: '50vw',
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
        {/* Gold line */}
        <div style={{ width: '5vw', height: '1px', background: '#C89A40', marginBottom: '3.5vh' }} />

        {/* Main headline */}
        <h1
          style={{
            fontSize: '5vw',
            fontWeight: 800,
            color: '#F5F1EB',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            textWrap: 'balance',
            margin: '0 0 3vh 0',
          }}
        >
          Your companion is waiting.
        </h1>

        {/* Sub-line */}
        <p
          style={{
            fontSize: '2vw',
            fontWeight: 400,
            color: '#D4AF6A',
            margin: '0 0 4vh 0',
            letterSpacing: '0.02em',
          }}
        >
          Start free. No card required.
        </p>

        {/* URL */}
        <p
          style={{
            fontSize: '1.7vw',
            fontWeight: 400,
            color: '#8A8480',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          glimr.com.au
        </p>
      </div>

      {/* GLIMR logo — top right */}
      <img
        src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png"
        alt="GLIMR"
        crossOrigin="anonymous"
        style={{
          position: 'absolute',
          top: '6vh',
          right: '6vw',
          height: '4.5vh',
          width: 'auto',
          objectFit: 'contain',
          objectPosition: 'right center',
        }}
      />
    </div>
  );
}
