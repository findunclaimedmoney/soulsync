export default function Slide3Companions() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#0C0A08', fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      {/* Subtle top warm gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '25vh',
          background: 'linear-gradient(180deg, rgba(200,154,64,0.05) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '7vh 5vw 6vh',
        }}
      >
        {/* Label */}
        <p
          style={{
            fontSize: '1.5vw',
            fontWeight: 400,
            color: '#C89A40',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            margin: '0 0 1.8vh 0',
          }}
        >
          The Companions
        </p>

        {/* Gold line */}
        <div style={{ width: '4.5vw', height: '1px', background: '#C89A40', marginBottom: '2.8vh' }} />

        {/* Headline */}
        <h1
          style={{
            fontSize: '3.8vw',
            fontWeight: 700,
            color: '#F5F1EB',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: '0 0 3.5vh 0',
          }}
        >
          Meet your companions
        </h1>

        {/* Portrait row */}
        <div style={{ display: 'flex', gap: '1.6vw', flex: 1, minHeight: 0 }}>
          {/* Jess */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ flex: 1, borderRadius: '0.6vw', overflow: 'hidden', minHeight: 0 }}>
              <img
                src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/72ed256b7_image-3.png"
                alt="Jess"
                crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
              />
            </div>
            <p style={{ fontSize: '2.1vw', fontWeight: 600, color: '#F5F1EB', margin: '1.6vh 0 0.4vh 0' }}>Jess</p>
            <p style={{ fontSize: '1.6vw', fontWeight: 400, fontStyle: 'italic', color: '#C89A40', margin: 0 }}>She listens</p>
          </div>

          {/* Mia */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ flex: 1, borderRadius: '0.6vw', overflow: 'hidden', minHeight: 0 }}>
              <img
                src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/19ce39eea_Womaninsilkrobe.png"
                alt="Mia"
                crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
              />
            </div>
            <p style={{ fontSize: '2.1vw', fontWeight: 600, color: '#F5F1EB', margin: '1.6vh 0 0.4vh 0' }}>Mia</p>
            <p style={{ fontSize: '1.6vw', fontWeight: 400, fontStyle: 'italic', color: '#C89A40', margin: 0 }}>She inspires</p>
          </div>

          {/* Zac */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ flex: 1, borderRadius: '0.6vw', overflow: 'hidden', minHeight: 0 }}>
              <img
                src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/45da0b4c5_zac.png"
                alt="Zac"
                crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
              />
            </div>
            <p style={{ fontSize: '2.1vw', fontWeight: 600, color: '#F5F1EB', margin: '1.6vh 0 0.4vh 0' }}>Zac</p>
            <p style={{ fontSize: '1.6vw', fontWeight: 400, fontStyle: 'italic', color: '#C89A40', margin: 0 }}>He steadies</p>
          </div>

          {/* Leo */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ flex: 1, borderRadius: '0.6vw', overflow: 'hidden', minHeight: 0 }}>
              <img
                src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/de484828a_generated_image.png"
                alt="Leo"
                crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
              />
            </div>
            <p style={{ fontSize: '2.1vw', fontWeight: 600, color: '#F5F1EB', margin: '1.6vh 0 0.4vh 0' }}>Leo</p>
            <p style={{ fontSize: '1.6vw', fontWeight: 400, fontStyle: 'italic', color: '#C89A40', margin: 0 }}>He feels</p>
          </div>

          {/* Luna */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ flex: 1, borderRadius: '0.6vw', overflow: 'hidden', minHeight: 0 }}>
              <img
                src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/1a1420690_image-1782886782778.png"
                alt="Luna"
                crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
              />
            </div>
            <p style={{ fontSize: '2.1vw', fontWeight: 600, color: '#F5F1EB', margin: '1.6vh 0 0.4vh 0' }}>Luna</p>
            <p style={{ fontSize: '1.6vw', fontWeight: 400, fontStyle: 'italic', color: '#C89A40', margin: 0 }}>She calms</p>
          </div>
        </div>

        {/* Bottom caption */}
        <p
          style={{
            fontSize: '1.7vw',
            fontWeight: 400,
            color: '#5A5450',
            margin: '2.5vh 0 0 0',
            letterSpacing: '0.04em',
          }}
        >
          10+ distinct personalities — warm, grounded, adventurous, creative
        </p>
      </div>
    </div>
  );
}
