export default function Slide5Pricing() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#0C0A08', fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      {/* Subtle bottom warmth */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '35vh',
          background: 'linear-gradient(to top, rgba(200,154,64,0.04) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '8vh 7vw 7vh',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '4.5vh' }}>
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
            Pricing
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
            Simple, transparent pricing
          </h1>
        </div>

        {/* Tier columns */}
        <div style={{ flex: 1, display: 'flex', gap: '2vw', minHeight: 0 }}>
          {/* Free */}
          <div
            style={{
              flex: 1,
              border: '1px solid #2A2420',
              borderRadius: '1vw',
              padding: '4vh 2.8vw',
              display: 'flex',
              flexDirection: 'column',
              background: '#0F0D0B',
            }}
          >
            <p
              style={{
                fontSize: '1.5vw',
                fontWeight: 600,
                color: '#8A8480',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                margin: '0 0 2.5vh 0',
              }}
            >
              Free
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6vw', marginBottom: '1vh' }}>
              <span style={{ fontSize: '5.5vw', fontWeight: 800, color: '#F5F1EB', lineHeight: 1 }}>A$0</span>
            </div>
            <p style={{ fontSize: '1.8vw', fontWeight: 400, color: '#5A5450', margin: '0 0 3vh 0' }}>
              per month
            </p>
            <div style={{ width: '100%', height: '1px', background: '#2A2420', marginBottom: '3vh' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
              <p style={{ fontSize: '1.9vw', fontWeight: 400, color: '#8A8480', margin: 0, lineHeight: 1.4, textWrap: 'pretty' }}>
                Unlimited text chat
              </p>
              <p style={{ fontSize: '1.9vw', fontWeight: 400, color: '#8A8480', margin: 0, lineHeight: 1.4, textWrap: 'pretty' }}>
                1 companion at a time
              </p>
              <p style={{ fontSize: '1.9vw', fontWeight: 400, color: '#8A8480', margin: 0, lineHeight: 1.4, textWrap: 'pretty' }}>
                Basic emotional memory
              </p>
            </div>
          </div>

          {/* Plus */}
          <div
            style={{
              flex: 1,
              border: '1px solid #3A3025',
              borderRadius: '1vw',
              padding: '4vh 2.8vw',
              display: 'flex',
              flexDirection: 'column',
              background: '#100E0A',
            }}
          >
            <p
              style={{
                fontSize: '1.5vw',
                fontWeight: 600,
                color: '#C89A40',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                margin: '0 0 2.5vh 0',
              }}
            >
              Plus
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6vw', marginBottom: '1vh' }}>
              <span style={{ fontSize: '5.5vw', fontWeight: 800, color: '#F5F1EB', lineHeight: 1 }}>A$59</span>
            </div>
            <p style={{ fontSize: '1.8vw', fontWeight: 400, color: '#5A5450', margin: '0 0 3vh 0' }}>
              per month
            </p>
            <div style={{ width: '100%', height: '1px', background: '#2A2420', marginBottom: '3vh' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
              <p style={{ fontSize: '1.9vw', fontWeight: 400, color: '#D4AF6A', margin: 0, lineHeight: 1.4, textWrap: 'pretty' }}>
                Voice replies
              </p>
              <p style={{ fontSize: '1.9vw', fontWeight: 400, color: '#D4AF6A', margin: 0, lineHeight: 1.4, textWrap: 'pretty' }}>
                All companions unlocked
              </p>
              <p style={{ fontSize: '1.9vw', fontWeight: 400, color: '#D4AF6A', margin: 0, lineHeight: 1.4, textWrap: 'pretty' }}>
                Enhanced memory system
              </p>
            </div>
          </div>

          {/* Pro — highlighted */}
          <div
            style={{
              flex: 1,
              border: '1px solid #C89A40',
              borderRadius: '1vw',
              padding: '4vh 2.8vw',
              display: 'flex',
              flexDirection: 'column',
              background: '#141008',
              position: 'relative',
            }}
          >
            {/* Popular badge */}
            <div
              style={{
                position: 'absolute',
                top: '-1.4vh',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#C89A40',
                color: '#0C0A08',
                fontSize: '1.3vw',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.4vh 1.2vw',
                borderRadius: '2vw',
              }}
            >
              Popular
            </div>

            <p
              style={{
                fontSize: '1.5vw',
                fontWeight: 600,
                color: '#C89A40',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                margin: '0 0 2.5vh 0',
              }}
            >
              Pro
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6vw', marginBottom: '1vh' }}>
              <span style={{ fontSize: '5.5vw', fontWeight: 800, color: '#F5F1EB', lineHeight: 1 }}>A$99</span>
            </div>
            <p style={{ fontSize: '1.8vw', fontWeight: 400, color: '#5A5450', margin: '0 0 3vh 0' }}>
              per month
            </p>
            <div style={{ width: '100%', height: '1px', background: 'rgba(200,154,64,0.3)', marginBottom: '3vh' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
              <p style={{ fontSize: '1.9vw', fontWeight: 400, color: '#F5F1EB', margin: 0, lineHeight: 1.4, textWrap: 'pretty' }}>
                Live video
              </p>
              <p style={{ fontSize: '1.9vw', fontWeight: 400, color: '#F5F1EB', margin: 0, lineHeight: 1.4, textWrap: 'pretty' }}>
                Intimacy layer
              </p>
              <p style={{ fontSize: '1.9vw', fontWeight: 400, color: '#F5F1EB', margin: 0, lineHeight: 1.4, textWrap: 'pretty' }}>
                Companion Diary
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
