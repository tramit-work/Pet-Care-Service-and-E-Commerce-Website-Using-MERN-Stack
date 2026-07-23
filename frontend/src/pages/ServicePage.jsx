import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ServiceFeatureList from '../components/service/ServiceFeatureList';
import BookingForm from '../components/service/BookingForm';
import Snackbar from '../components/shopping/Snackbar';
import { useAuth } from '../context/AuthContext';
import { createBooking, getBookings } from '../api/bookingService';

const EMPTY_FORM = { name: '', phone: '', date: '' };

const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

function validateBookingForm(formData) {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = 'Họ tên không được để trống.';
  }

  if (!formData.phone.trim()) {
    errors.phone = 'Số điện thoại không được để trống.';
  } else if (!PHONE_REGEX.test(formData.phone.trim())) {
    errors.phone = 'Số điện thoại không hợp lệ.';
  }

  if (!formData.date) {
    errors.date = 'Vui lòng chọn ngày đặt.';
  }

  return errors;
}

function ServicePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(null);

  const [bookedServiceTitles, setBookedServiceTitles] = useState(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      setBookedServiceTitles(new Set());
      return;
    }

    let cancelled = false;
    getBookings({ limit: 100 })
      .then(({ items }) => {
        if (cancelled) return;
        const booked = new Set(
          (items || []).filter((b) => b.status !== 'cancelled').map((b) => b.serviceType)
        );
        setBookedServiceTitles(booked);
      })
      .catch(() => {
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  function showSnackbar(message) {
    setSnackbarMessage(message);
  }

  const [isShowing, setIsShowing] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (bookingOpen) {
      setVisible(true);
      const openTimer = setTimeout(() => setIsShowing(true), 10);
      return () => clearTimeout(openTimer);
    }

    setIsShowing(false);
    const closeTimer = setTimeout(() => setVisible(false), 300);
    return () => clearTimeout(closeTimer);
  }, [bookingOpen]);

  function handleOpenBooking(serviceTitle) {
    setSelectedService(serviceTitle);
    setErrors({});
    setBookingOpen(true);
  }

  function handleCloseBooking() {
    setBookingOpen(false);
  }

  function handleFieldChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  async function handleSubmitBooking() {
    const validationErrors = validateBookingForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    if (!isAuthenticated) {
      showSnackbar('Vui lòng đăng nhập để đặt lịch.');
      setTimeout(() => {
        navigate('/login', { state: { from: '/service' } });
      }, 1200);
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        customerName: formData.name,
        phone: formData.phone,
        serviceType: selectedService,
        bookingDate: formData.date,
      });

      setBookingOpen(false);
      setFormData(EMPTY_FORM);
      setErrors({});
      setBookedServiceTitles((prev) => new Set(prev).add(selectedService));
      showSnackbar('Đặt lịch thành công!');
    } catch (err) {
      const message = err.response?.data?.message || 'Đặt lịch thất bại, vui lòng thử lại.';
      showSnackbar(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {}
      <section className="service-hero site-container">
        <div className="service-hero-text">
          <span className="hero-badge">Premium Service</span>
          <div className="service-hero-eyebrow">Pet Salon hàng đầu cho thú cưng</div>
          <h1>Dịch Vụ Chăm Sóc Thú Cưng Trọn Gói</h1>
          <p>
            Từ spa, tiêm phòng, khám bệnh đến huấn luyện — đội ngũ tận tâm của
            chúng tôi luôn sẵn sàng đồng hành cùng thú cưng của bạn.
          </p>
          <div className="service-hero-ctas">
            <a href="#service-list" className="service-hero-cta-primary">
              Xem Dịch Vụ
            </a>
            <Link to="/contact" className="service-hero-cta-secondary">
              Liên Hệ Ngay
            </Link>
          </div>
        </div>
        <div className="service-hero-image">
          <img
            src="/images/service/aboutus.png"
            alt="Chăm sóc thú cưng"
          />
        </div>
      </section>

      <div id="service-list">
        <ServiceFeatureList onBook={handleOpenBooking} bookedServiceTitles={bookedServiceTitles} />
      </div>

      {}
      <section className="service-info-section site-container">
        <div className="service-info-media">
          <img src="/images/service/pet.png" alt="Giới thiệu dịch vụ chăm sóc thú cưng" />
        </div>
        <div className="service-info-text">
          <div className="service-info-eyebrow">Vì sao chọn chúng tôi</div>
          <h2>Chăm sóc tận tâm như người thân trong nhà</h2>
          <p>
            Đội ngũ nhân viên giàu kinh nghiệm, được đào tạo bài bản, luôn đặt
            sự an toàn và thoải mái của thú cưng lên hàng đầu trong từng dịch vụ.
          </p>
          <p>
            Từ trang thiết bị hiện đại đến quy trình chăm sóc khép kín, chúng
            tôi cam kết mang lại trải nghiệm tốt nhất cho cả thú cưng và chủ nuôi.
          </p>
        </div>
      </section>

      <BookingForm
        visible={visible}
        isShowing={isShowing}
        serviceName={selectedService}
        formData={formData}
        errors={errors}
        submitting={submitting}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmitBooking}
        onClose={handleCloseBooking}
      />

      <Snackbar message={snackbarMessage} onHide={() => setSnackbarMessage(null)} />
    </>
  );
}

export default ServicePage;
