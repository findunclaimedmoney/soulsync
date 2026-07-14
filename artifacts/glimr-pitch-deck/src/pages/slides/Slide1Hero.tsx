const base = import.meta.env.BASE_URL;

export default function Slide1Hero() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#0C0A08' }}>
      {/* Full-bleed hero image */}
      <img
        src={`${base}hero.jpg`}
        crossOrigin="anonymous"
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
      />

      {/* Left-to-right gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(100deg, rgba(12,10,8,0.96) 0%, rgba(12,10,8,0.82) 42%, rgba(12,10,8,0.28) 75%, rgba(12,10,8,0.08) 100%)',
        }}
      />

      {/* Bottom vignette */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30vh',
          background: 'linear-gradient(to top, rgba(12,10,8,0.7) 0%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: '8vw',
          paddingRight: '52vw',
        }}
      >
        {/* Logo */}
        <img
          src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png"
          alt="GLIMR"
          crossOrigin="anonymous"
          style={{ height: '5vh', width: 'auto', marginBottom: '3.5vh', objectFit: 'contain', objectPosition: 'left center' }}
        />

        {/* Gold divider */}
        <div style={{ width: '5vw', height: '1px', background: '#C89A40', marginBottom: '3.5vh' }} />

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '5.2vw',
            fontWeight: 800,
            color: '#F5F1EB',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            textWrap: 'balance',
            margin: '0 0 3.5vh 0',
          }}
        >
          The AI companion that truly knows you.
        </h1>

        {/* Tagline label */}
        <p
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '1.7vw',
            fontWeight: 400,
            color: '#C89A40',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          glimr.com.au
        </p>
      </div>
    </div>
  );
}
