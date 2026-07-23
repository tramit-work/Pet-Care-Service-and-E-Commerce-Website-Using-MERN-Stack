import { Link } from 'react-router-dom';
import '../../assets/styles/auth.css';

function AuthCard({ title, children, footerText, footerLinkText, footerLinkTo }) {
  return (
    <div className="page-wrapper auth-page-wrapper">
      <div className="auth-card-wrapper">
        <div className="form-panel">
          <h1 className="label-title">{title}</h1>
          {children}
          <p className="auth-footer-text">
            {footerText} <Link to={footerLinkTo}>{footerLinkText}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthCard;
