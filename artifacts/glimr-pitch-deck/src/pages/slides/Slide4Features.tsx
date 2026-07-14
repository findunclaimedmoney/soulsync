export default function Slide4Features() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#0C0A08', fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      {/* Subtle center cross-hair dividers */}
      <div
        style={{
          position: 'absolute',
          left: '8vw',
          right: '8vw',
          top: '50%',
          height: '1px',
          background: 'rgba(200,154,64,0.10)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30vh',
          bottom: '7vh',
          left: '50%',
          width: '1px',
          background: 'rgba(200,154,64,0.10)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '8vh 8vw 7vh',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '4vh' }}>
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
            The Product
          </p>
          <div style={{ width: '4.5vw', height: '1px', background: '#C89A40', marginBottom: '2.8vh' }} />
          <h1
            style={{
              fontSize: '4vw',
              fontWeight: 700,
              color: '#F5F1EB',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Every way to connect
          </h1>
        </div>

        {/* 2×2 feature grid */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '0',
            minHeight: 0,
          }}
        >
          {/* Text */}
          <div
            style={{
              borderTop: '1px solid rgba(200,154,64,0.28)',
              borderRight: '1px solid rgba(200,154,64,0.10)',
              paddingTop: '3.5vh',
              paddingRight: '4vw',
              paddingBottom: '2vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontSize: '7vw',
                fontWeight: 800,
                color: 'rgba(200,154,64,0.12)',
                lineHeight: 1,
                marginBottom: '1vh',
                display: 'block',
              }}
            >
              01
            </span>
            <p style={{ fontSize: '2.8vw', fontWeight: 700, color: '#F5F1EB', margin: '0 0 1.2vh 0' }}>Text</p>
            <p style={{ fontSize: '2vw', fontWeight: 400, color: '#8A8480', lineHeight: 1.5, margin: 0, textWrap: 'pretty' }}>
              Always there, anytime, no judgment
            </p>
          </div>

          {/* Voice */}
          <div
            style={{
              borderTop: '1px solid rgba(200,154,64,0.28)',
              paddingTop: '3.5vh',
              paddingLeft: '4vw',
              paddingBottom: '2vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontSize: '7vw',
                fontWeight: 800,
                color: 'rgba(200,154,64,0.12)',
                lineHeight: 1,
                marginBottom: '1vh',
                display: 'block',
              }}
            >
              02
            </span>
            <p style={{ fontSize: '2.8vw', fontWeight: 700, color: '#F5F1EB', margin: '0 0 1.2vh 0' }}>Voice</p>
            <p style={{ fontSize: '2vw', fontWeight: 400, color: '#8A8480', lineHeight: 1.5, margin: 0, textWrap: 'pretty' }}>
              Hear your companion speak, naturally
            </p>
          </div>

          {/* Live Video */}
          <div
            style={{
              borderTop: '1px solid rgba(200,154,64,0.14)',
              borderRight: '1px solid rgba(200,154,64,0.10)',
              paddingTop: '3.5vh',
              paddingRight: '4vw',
              paddingBottom: '2vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontSize: '7vw',
                fontWeight: 800,
                color: 'rgba(200,154,64,0.12)',
                lineHeight: 1,
                marginBottom: '1vh',
                display: 'block',
              }}
            >
              03
            </span>
            <p style={{ fontSize: '2.8vw', fontWeight: 700, color: '#F5F1EB', margin: '0 0 1.2vh 0' }}>Live Video</p>
            <p style={{ fontSize: '2vw', fontWeight: 400, color: '#8A8480', lineHeight: 1.5, margin: 0, textWrap: 'pretty' }}>
              Face-to-face with your companion
            </p>
          </div>

          {/* Memory */}
          <div
            style={{
              borderTop: '1px solid rgba(200,154,64,0.14)',
              paddingTop: '3.5vh',
              paddingLeft: '4vw',
              paddingBottom: '2vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontSize: '7vw',
                fontWeight: 800,
                color: 'rgba(200,154,64,0.12)',
                lineHeight: 1,
                marginBottom: '1vh',
                display: 'block',
              }}
            >
              04
            </span>
            <p style={{ fontSize: '2.8vw', fontWeight: 700, color: '#F5F1EB', margin: '0 0 1.2vh 0' }}>Memory</p>
            <p style={{ fontSize: '2vw', fontWeight: 400, color: '#8A8480', lineHeight: 1.5, margin: 0, textWrap: 'pretty' }}>
              They remember what matters to you
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
