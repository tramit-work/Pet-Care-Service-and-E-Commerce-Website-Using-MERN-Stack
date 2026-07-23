import { Link } from 'react-router-dom';

function FooterLinkList({ titleId, title, items }) {
  return (
    <nav aria-labelledby={titleId}>
      <h3 id={titleId}>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.label}>{item.to ? <Link to={item.to}>{item.label}</Link> : item.label}</li>
        ))}
      </ul>
    </nav>
  );
}

export default FooterLinkList;
