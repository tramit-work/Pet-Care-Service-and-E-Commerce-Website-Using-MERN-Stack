function DevVerificationLinkNotice({ verificationUrl }) {
  if (!verificationUrl) return null;

  return (
    <div className="auth-dev-notice">
      <a href={verificationUrl} target="_blank" rel="noreferrer" className="button-submit auth-dev-notice-btn">
        Mở liên kết xác thực
      </a>
    </div>
  );
}

export default DevVerificationLinkNotice;
