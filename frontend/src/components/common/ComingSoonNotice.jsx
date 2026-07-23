function ComingSoonNotice({ title, note }) {
  return (
    <div
      style={{
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 20px',
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <h1 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, color: '#fb8c5a', marginBottom: '12px' }}>
        {title}
      </h1>
      <p style={{ color: '#4a4a4a', maxWidth: '480px' }}>{note}</p>
    </div>
  );
}

export default ComingSoonNotice;
