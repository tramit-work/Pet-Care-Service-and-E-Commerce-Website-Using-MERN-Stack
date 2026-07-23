function ContactForm({ values, onChange, onSubmit }) {
  return (
    <form className="form-panel" onSubmit={onSubmit}>
      <input
        className="form-input"
        type="text"
        placeholder="Tên của bạn"
        required
        value={values.name}
        onChange={(e) => onChange('name', e.target.value)}
      />
      <input
        className="form-input"
        type="email"
        placeholder="Email của bạn"
        required
        value={values.email}
        onChange={(e) => onChange('email', e.target.value)}
      />
      <textarea
        className="form-textarea"
        placeholder="Tin nhắn của bạn"
        required
        value={values.message}
        onChange={(e) => onChange('message', e.target.value)}
      ></textarea>
      <button className="button-submit" type="submit">
        Gửi
      </button>
    </form>
  );
}

export default ContactForm;
