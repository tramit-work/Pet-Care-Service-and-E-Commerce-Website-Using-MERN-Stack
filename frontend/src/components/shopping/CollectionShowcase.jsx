import { collectionCards as mockCollectionCards } from '../../mock/shopping.mock';

function CollectionShowcase({ cards = mockCollectionCards, onSelectCategory }) {
  return (
    <section className="collection-shopping" aria-label="Shop by collection section">
      <h2>CÁC MỤC NỔI BẬT</h2>
      <div className="collection-container" role="list">
        {cards.map((card) => (
          <div
            className="collection-card"
            key={card.id}
            tabIndex={0}
            role="listitem"
            aria-label={card.alt}
            onClick={() => onSelectCategory(card.category)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelectCategory(card.category);
            }}
          >
            <div className="collection-image" aria-hidden="true">
              <img
                src={card.image}
                alt={card.alt}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://placehold.co/160x160?text=No+Image';
                }}
              />
            </div>
            <div className="collection-label">{card.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CollectionShowcase;
