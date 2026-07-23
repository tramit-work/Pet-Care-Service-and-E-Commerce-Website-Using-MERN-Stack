import StarRating from './StarRating';

function RatingSummary({ summary }) {
  if (!summary || summary.total === 0) {
    return (
      <div className="rating-summary">
        <div className="rating-summary-average">
          <span className="rating-summary-average-number">0.0</span>
          <StarRating value={0} />
          <span className="rating-summary-average-total">Chưa có đánh giá</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-summary">
      <div className="rating-summary-average">
        <span className="rating-summary-average-number">{summary.average.toFixed(1)}</span>
        <StarRating value={summary.average} />
        <span className="rating-summary-average-total">{summary.total} đánh giá</span>
      </div>
      <div className="rating-summary-distribution">
        {summary.distribution.map((row) => (
          <div className="rating-summary-bar-row" key={row.star}>
            <span>{row.star} ★</span>
            <div className="rating-summary-bar-track">
              <div
                className="rating-summary-bar-fill"
                style={{ width: `${summary.total > 0 ? (row.count / summary.total) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="rating-summary-bar-count">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RatingSummary;
