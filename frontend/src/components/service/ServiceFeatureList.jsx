import ServiceFeatureCard from './ServiceFeatureCard';
import { services } from '../../mock/service.mock';

function ServiceFeatureList({ onBook, bookedServiceTitles }) {
  return (
    <div className="section-wrapper site-container">
      <div className="feature-list">
        {services.map((service) => (
          <ServiceFeatureCard
            key={service.id}
            id={service.id}
            title={service.title}
            description={service.description}
            onBook={onBook}
            isBooked={bookedServiceTitles?.has(service.title)}
          />
        ))}
      </div>
    </div>
  );
}

export default ServiceFeatureList;
