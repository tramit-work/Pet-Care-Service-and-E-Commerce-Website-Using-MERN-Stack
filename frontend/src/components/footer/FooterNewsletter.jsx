import { useState } from 'react';

const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

function FooterNewsletter() {
  const [email, setEmail] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (trimmed.length === 0 || !EMAIL_REGEX.test(trimmed.toLowerCase())) {
      alert('Vui lòng nhập email hợp lệ!');
      return;
    }
    alert('Cảm ơn bạn đã đăng ký: ' + trimmed);
    setEmail('');
  }

  return (
    <section aria-labelledby="contact-us">
      <h3 id="contact-us">Liên hệ với chúng tôi</h3>
      <p>Nhập email để nhận thông báo và ưu đãi từ Cuc Pet.</p>
      <form className="subscribe-form" aria-label="Form đăng ký nhận tin" onSubmit={handleSubmit}>
        <input
          className="email-input"
          type="email"
          placeholder="Địa chỉ Email"
          aria-label="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="subscribe-button" type="submit">
          Đăng ký
        </button>
      </form>
    </section>
  );
}

export default FooterNewsletter;
