'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import CourseCover from '@/components/CourseCover';

export default function StudentCoursesPage() {
  const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' | 'catalog'
  const [courses, setCourses] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Join Course Modal
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // KakshaPay Payment Modal state
  const [payModalCourse, setPayModalCourse] = useState(null);
  const [payMethod, setPayMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('aarav@okaxis');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('Aarav Sharma');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [paymentStep, setPaymentStep] = useState('input'); // 'input' | 'processing' | 'success'
  const [processingStatus, setProcessingStatus] = useState('');
  const [txnResult, setTxnResult] = useState(null);

  async function loadCourses() {
    try {
      const res = await fetch('/api/student/courses');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load enrolled courses.');
      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCatalog() {
    setCatalogLoading(true);
    try {
      const res = await fetch('/api/student/courses/catalog');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load course catalog.');
      setCatalog(data.courses || []);
    } catch (err) {
      console.warn('Catalog load error:', err.message);
    } finally {
      setCatalogLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
    loadCatalog();
  }, []);

  async function handleJoinCourse(e) {
    e.preventDefault();
    setJoinError('');
    setJoining(true);

    try {
      const res = await fetch('/api/student/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join course.');
      setJoinModalOpen(false);
      setJoinCode('');
      await Promise.all([loadCourses(), loadCatalog()]);
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setJoining(false);
    }
  }

  function openPaymentModal(course) {
    setPayModalCourse(course);
    setPaymentStep('input');
    setProcessingStatus('');
    setTxnResult(null);
  }

  function handleAutoFillTest() {
    if (payMethod === 'upi') {
      setUpiId('student.aarav@icici');
    } else if (payMethod === 'card') {
      setCardNumber('4242 4242 4242 4242');
      setCardHolder('Aarav Sharma');
      setCardExpiry('08/29');
      setCardCvv('732');
    } else {
      setSelectedBank('State Bank of India');
    }
  }

  async function handleExecutePayment() {
    if (!payModalCourse) return;
    setPaymentStep('processing');
    setProcessingStatus('Connecting to secure payment gateway...');

    const txId = `TXN_KP_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStatus(`Authorizing ₹${payModalCourse.price} with ${payMethod.toUpperCase()} gateway...`);
      await new Promise((r) => setTimeout(r, 700));
      setProcessingStatus('Confirming institutional enrolment record...');

      const res = await fetch('/api/student/courses/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: payModalCourse.id,
          paymentMethod: payMethod,
          transactionId: txId,
          amount: payModalCourse.price,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment gateway declined transaction.');

      setTxnResult({
        transactionId: data.transactionId || txId,
        courseTitle: payModalCourse.title,
        amount: payModalCourse.price,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      });
      setPaymentStep('success');

      // Refresh data so course displays in enrolled list immediately
      await Promise.all([loadCourses(), loadCatalog()]);
    } catch (err) {
      alert(`Payment Error: ${err.message}`);
      setPaymentStep('input');
    }
  }

  // Filtered enrolled
  const filteredEnrolled = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      c.code.toLowerCase().includes(search.trim().toLowerCase())
  );

  // Filtered catalog
  const filteredCatalog = catalog.filter(
    (c) =>
      c.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      c.code.toLowerCase().includes(search.trim().toLowerCase()) ||
      (c.teacherName && c.teacherName.toLowerCase().includes(search.trim().toLowerCase()))
  );

  return (
    <AppShell title="Course Management" requiredRole="student">
      {/* Top Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Academic Enrolment & Elective Store
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Session 2024-25 &middot; Department of Computer Applications
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="search"
            className="input"
            style={{ width: '220px', height: '40px' }}
            placeholder="Search code or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            type="button"
            className="btn btn-outline"
            style={{ height: '40px' }}
            onClick={() => setJoinModalOpen(true)}
          >
            <i className="fa-solid fa-key" />
            <span>Join With Code</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('enrolled')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'enrolled' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'enrolled' ? 'var(--primary)' : 'var(--muted)',
            fontWeight: activeTab === 'enrolled' ? 700 : 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 120ms ease',
          }}
        >
          <i className="fa-solid fa-book-bookmark" />
          <span>My Enrolled Courses</span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '999px',
              background: activeTab === 'enrolled' ? '#EBF2FE' : 'var(--border)',
              color: activeTab === 'enrolled' ? 'var(--primary)' : 'var(--muted)',
              fontWeight: 700,
            }}
          >
            {courses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('catalog');
            if (catalog.length === 0) loadCatalog();
          }}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'catalog' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'catalog' ? 'var(--primary)' : 'var(--muted)',
            fontWeight: activeTab === 'catalog' ? 700 : 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 120ms ease',
          }}
        >
          <i className="fa-solid fa-cart-shopping" />
          <span>Course Store & Electives</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#DCFCE7',
              color: '#15803D',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            New Electives
          </span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: ENROLLED COURSES */}
      {activeTab === 'enrolled' && (
        <>
          {loading && <div className="card">Loading courses...</div>}

          {!loading && filteredEnrolled.length === 0 && (
            <div className="card empty-state" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <i className="fa-solid fa-book-open" style={{ fontSize: '36px', color: 'var(--muted)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>No Enrolled Courses Found</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '400px', margin: '0 auto 20px' }}>
                You have not registered for any courses matching this query. Explore our elective courses or enter a join code.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setJoinModalOpen(true)}>
                  Join With Code
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setActiveTab('catalog')}>
                  Browse Course Store
                </button>
              </div>
            </div>
          )}

          {!loading && filteredEnrolled.length > 0 && (
            <div className="courses-grid">
              {filteredEnrolled.map((course) => (
                <article key={course.id} className="course-card">
                  <CourseCover code={course.code} title={course.title} colorIndex={course.color_index} height={135} />

                  <div className="course-card-body">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', background: '#EBF2FE', padding: '2px 6px', borderRadius: '4px' }}>
                          {course.code}
                        </span>
                        {course.attendance !== undefined && (
                          <span style={{ fontSize: '11px', fontWeight: 600, color: course.attendance >= 75 ? '#16A34A' : '#E05344' }}>
                            {course.attendance}% Attendance
                          </span>
                        )}
                      </div>
                      <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
                        {course.title}
                      </h2>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                        Instructor: <strong>{course.teacherName}</strong>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                        <span style={{ color: 'var(--muted)' }}>Completion</span>
                        <span style={{ color: 'var(--primary)' }}>{course.progress}%</span>
                      </div>
                      <div className="progress-track" style={{ marginBottom: '14px' }}>
                        <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                      </div>

                      <Link href={`/student/courses/${course.id}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                        <span>Open Course</span>
                        <i className="fa-solid fa-arrow-right" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: COURSE STORE & ELECTIVES */}
      {activeTab === 'catalog' && (
        <>
          <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#10B981', width: '8px', height: '8px', borderRadius: '50%' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Institutional Electives Marketplace</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                Enrol in specialized technical tracks. Instant self-service checkout with simulated KakshaPay gateway.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--muted)' }}>
              <span><i className="fa-solid fa-bolt" style={{ color: '#F59E0B', marginRight: '6px' }} />Instant Access</span>
              <span><i className="fa-solid fa-shield-halved" style={{ color: '#2563EB', marginRight: '6px' }} />Verified Coursework</span>
              <span><i className="fa-solid fa-award" style={{ color: '#10B981', marginRight: '6px' }} />Accredited Certificates</span>
            </div>
          </div>

          {catalogLoading && <div className="card">Loading elective catalog...</div>}

          {!catalogLoading && filteredCatalog.length === 0 && (
            <div className="card empty-state">
              <i className="fa-solid fa-cart-shopping" />
              <p>No courses found in the store matching your search.</p>
            </div>
          )}

          {!catalogLoading && filteredCatalog.length > 0 && (
            <div className="courses-grid">
              {filteredCatalog.map((course) => {
                const isEnrolled = courses.some((c) => c.id === course.id) || course.isEnrolled;
                const isPaid = (course.price || 0) > 0;

                return (
                  <article key={course.id} className="course-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <CourseCover code={course.code} title={course.title} colorIndex={course.color_index} height={135} />

                    <div className="course-card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', background: '#EBF2FE', padding: '2px 6px', borderRadius: '4px' }}>
                            {course.code}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {course.lessonsCount || 6} Units
                          </span>
                        </div>

                        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
                          {course.title}
                        </h2>

                        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {course.description}
                        </p>

                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                          Instructor: <strong>{course.teacherName}</strong>
                        </div>
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                        {/* Price & Action Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div>
                            {isPaid ? (
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                                  ₹{course.price}
                                </span>
                                {course.originalPrice && (
                                  <span style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'line-through' }}>
                                    ₹{course.originalPrice}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#16A34A' }}>
                                Free / Institutional
                              </div>
                            )}
                          </div>

                          {isPaid && (
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                              60% OFF
                            </span>
                          )}
                        </div>

                        {isEnrolled ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ flex: 1, textAlign: 'center', background: '#F1F5F9', color: '#475569', fontSize: '12px', fontWeight: 700, padding: '8px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <i className="fa-solid fa-check" style={{ color: '#16A34A' }} />
                              <span>Enrolled</span>
                            </span>
                            <Link href={`/student/courses/${course.id}`} className="btn btn-outline btn-sm">
                              <span>Go to Course</span>
                            </Link>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ width: '100%', justifyContent: 'center', gap: '8px', height: '36px' }}
                            onClick={() => openPaymentModal(course)}
                          >
                            <i className="fa-solid fa-lock-open" />
                            <span>{isPaid ? `Purchase Course · ₹${course.price}` : 'Enroll Free'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* KAKSHAPAY SECURE SIMULATED GATEWAY MODAL                                   */}
      {/* ========================================================================= */}
      {payModalCourse && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (paymentStep !== 'processing') setPayModalCourse(null);
          }}
          style={{ zIndex: 1000 }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '92%', borderRadius: '16px', overflow: 'hidden', padding: 0 }}
          >
            {/* Gateway Brand Header */}
            <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#2F6FED', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <i className="fa-solid fa-shield-halved" style={{ fontSize: '16px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>KakshaPay</span>
                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Sandbox
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    256-Bit SSL Encrypted &middot; Institutional Gateway
                  </div>
                </div>
              </div>

              {paymentStep !== 'processing' && (
                <button
                  type="button"
                  onClick={() => setPayModalCourse(null)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>

            {/* Modal Body: STEP 1 - INPUT FORM */}
            {paymentStep === 'input' && (
              <div style={{ padding: '20px' }}>
                {/* Order Summary Strip */}
                <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>
                        {payModalCourse.code} &middot; Elective Enrolment
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                        {payModalCourse.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                        Instructor: {payModalCourse.teacherName}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                        ₹{payModalCourse.price}
                      </div>
                      <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
                        All Taxes Inc.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Auto Fill Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Select Payment Method
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoFillTest}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <i className="fa-solid fa-bolt" />
                    <span>Auto-Fill Test Info</span>
                  </button>
                </div>

                {/* Payment Tabs: UPI / Card / NetBanking */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setPayMethod('upi')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: payMethod === 'upi' ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: payMethod === 'upi' ? '#EBF2FE' : '#FFFFFF',
                      color: payMethod === 'upi' ? 'var(--primary)' : 'var(--text)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <i className="fa-solid fa-qrcode" style={{ fontSize: '16px' }} />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMethod('card')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: payMethod === 'card' ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: payMethod === 'card' ? '#EBF2FE' : '#FFFFFF',
                      color: payMethod === 'card' ? 'var(--primary)' : 'var(--text)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <i className="fa-regular fa-credit-card" style={{ fontSize: '16px' }} />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMethod('netbanking')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: payMethod === 'netbanking' ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: payMethod === 'netbanking' ? '#EBF2FE' : '#FFFFFF',
                      color: payMethod === 'netbanking' ? 'var(--primary)' : 'var(--text)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <i className="fa-solid fa-building-columns" style={{ fontSize: '16px' }} />
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* METHOD 1: UPI */}
                {payMethod === 'upi' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed var(--border)', marginBottom: '14px' }}>
                      {/* Blueprint Simulated QR Code */}
                      <div style={{ background: '#FFF', padding: '8px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                        <svg width="84" height="84" viewBox="0 0 100 100" fill="none">
                          <rect x="0" y="0" width="100" height="100" fill="#FFFFFF" />
                          <rect x="6" y="6" width="30" height="30" fill="#0F172A" />
                          <rect x="12" y="12" width="18" height="18" fill="#FFFFFF" />
                          <rect x="16" y="16" width="10" height="10" fill="#0F172A" />
                          <rect x="64" y="6" width="30" height="30" fill="#0F172A" />
                          <rect x="70" y="12" width="18" height="18" fill="#FFFFFF" />
                          <rect x="74" y="16" width="10" height="10" fill="#0F172A" />
                          <rect x="6" y="64" width="30" height="30" fill="#0F172A" />
                          <rect x="12" y="70" width="18" height="18" fill="#FFFFFF" />
                          <rect x="16" y="74" width="10" height="10" fill="#0F172A" />
                          <rect x="42" y="10" width="12" height="12" fill="#2F6FED" />
                          <rect x="46" y="32" width="8" height="18" fill="#0F172A" />
                          <rect x="64" y="46" width="14" height="12" fill="#0F172A" />
                          <rect x="42" y="66" width="18" height="14" fill="#0F172A" />
                          <rect x="72" y="72" width="16" height="16" fill="#2F6FED" />
                        </svg>
                        <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                          Scan to Pay
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text)' }}>
                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>Supported UPI Apps</div>
                        <div style={{ color: 'var(--muted)', lineHeight: 1.4, marginBottom: '8px' }}>
                          Google Pay &middot; PhonePe &middot; Paytm &middot; BHIM &middot; CRED
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          <i className="fa-solid fa-circle-check" />
                          <span>Zero Surcharge</span>
                        </div>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Or Enter Virtual Payment Address (VPA)</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="username@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* METHOD 2: CARD */}
                {payMethod === 'card' && (
                  <div>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Card Number</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Cardholder Name</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Aarav Sharma"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '12px' }}>Valid Thru</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '12px' }}>CVV</label>
                        <input
                          type="password"
                          maxLength={3}
                          className="input"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* METHOD 3: NET BANKING */}
                {payMethod === 'netbanking' && (
                  <div style={{ marginBottom: '14px' }}>
                    <label className="form-label" style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                      Popular Indian Banks
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          style={{
                            padding: '10px 12px',
                            textAlign: 'left',
                            borderRadius: '6px',
                            border: selectedBank === bank ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: selectedBank === bank ? '#EBF2FE' : '#FFFFFF',
                            color: selectedBank === bank ? 'var(--primary)' : 'var(--text)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <i className="fa-solid fa-landmark" style={{ marginRight: '6px', opacity: 0.7 }} />
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Submit Button */}
                <div style={{ marginTop: '18px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', height: '42px', fontSize: '14px', fontWeight: 700, justifyContent: 'center', gap: '8px' }}
                    onClick={handleExecutePayment}
                  >
                    <i className="fa-solid fa-lock" />
                    <span>Pay ₹{payModalCourse.price} Securely</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '11px', color: 'var(--muted)', marginTop: '10px' }}>
                    <span><i className="fa-solid fa-shield" style={{ marginRight: '4px' }} />PCI-DSS Level 1</span>
                    <span>&middot;</span>
                    <span>Sandbox Evaluation Mode</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: STEP 2 - PROCESSING SIMULATION */}
            {paymentStep === 'processing' && (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    border: '4px solid #E2E8F0',
                    borderTop: '4px solid #2F6FED',
                    borderRadius: '50%',
                    margin: '0 auto 20px',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
                  Processing Transaction
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, minHeight: '20px' }}>
                  {processingStatus}
                </p>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '14px' }}>
                  Please do not refresh or close this browser window.
                </div>
              </div>
            )}

            {/* Modal Body: STEP 3 - SUCCESS RECEIPT */}
            {paymentStep === 'success' && txnResult && (
              <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 14px' }}>
                  <i className="fa-solid fa-check" />
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
                  Enrolment Confirmed!
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
                  Payment of <strong>₹{txnResult.amount}</strong> was authorized and recorded.
                </p>

                {/* Receipt Box */}
                <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', textAlign: 'left', fontSize: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--muted)' }}>Course Title:</span>
                    <strong style={{ color: 'var(--text)', textAlign: 'right' }}>{txnResult.courseTitle}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--muted)' }}>Transaction Reference:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{txnResult.transactionId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--muted)' }}>Date & Time:</span>
                    <span style={{ color: 'var(--text)' }}>{txnResult.date} &middot; {txnResult.time} IST</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '6px', marginTop: '6px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>Total Paid:</span>
                    <strong style={{ color: '#16A34A', fontSize: '13px' }}>₹{txnResult.amount}.00</strong>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => {
                      setPayModalCourse(null);
                      setActiveTab('enrolled');
                    }}
                  >
                    <span>My Courses</span>
                  </button>

                  <Link
                    href={`/student/courses/${payModalCourse.id}`}
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setPayModalCourse(null)}
                  >
                    <span>Start Learning</span>
                    <i className="fa-solid fa-arrow-right" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Join Course Modal */}
      {joinModalOpen && (
        <div className="modal-overlay" onClick={() => setJoinModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Join Course With Code</h2>
              <button
                type="button"
                onClick={() => setJoinModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '16px' }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
              Enter the unique course code provided by your instructor (e.g., PY402, DB401, DS301).
            </p>

            {joinError && (
              <div className="alert alert-error" style={{ marginBottom: '12px' }}>
                <i className="fa-solid fa-circle-exclamation" />
                <span>{joinError}</span>
              </div>
            )}

            <form onSubmit={handleJoinCourse}>
              <div className="form-group">
                <label className="form-label" htmlFor="joinCode">Course Join Code</label>
                <input
                  id="joinCode"
                  type="text"
                  className="input"
                  placeholder="e.g. PY402"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setJoinModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={joining}>
                  {joining ? 'Enrolling...' : 'Join Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
