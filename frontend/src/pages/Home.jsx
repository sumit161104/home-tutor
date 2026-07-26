import React from 'react';
import { Search, MapPin, BookOpen, Clock, Shield, Star, CheckCircle, Video, Users, UserPlus, ChevronDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Home({ setCurrentView }) {
  const faqData = [
    { q: "How can I find a home tutor near me?", a: "Simply register, enter your location, class, and subject, then browse qualified tutors available in your preferred area." },
    { q: "Can I find online tutors?", a: "Yes. Tutors on Tutodian can offer online tuition, home tuition, or hybrid learning depending on their availability." },
    { q: "Which classes are supported?", a: "Tutors are available for Nursery, Kindergarten (KG), Class 1-12, board examinations, and competitive examination preparation." },
    { q: "Can I search tutors by subject?", a: "Yes. You can search tutors based on Mathematics, Science, Physics, Chemistry, Biology, English, Hindi, History, Computer Science, Geography, and many other subjects." },
    { q: "Can I contact tutors directly?", a: "Yes. After reviewing tutor profiles, guardians can communicate directly with tutors to discuss teaching methods, schedules, and tuition fees." },
    { q: "Is registration free?", a: "Yes. Guardians and tutors can register and create their profiles on Tutodian for free." }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      {/* Hero Section */}
      <section className="glow-card" style={{ padding: '60px 24px', borderRadius: '24px', marginBottom: '60px', background: 'var(--bg-secondary)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '48px', marginBottom: '24px', lineHeight: 1.2, background: 'var(--grad-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Find Qualified Home Tutors Near You
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
            Finding the right home tutor should be simple, transparent, and trustworthy. <strong>Tutodian</strong> is a smart tutor discovery platform that connects guardians with qualified home tutors offering <strong>home tuition, online tuition, and hybrid learning</strong> based on every student's academic needs.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setCurrentView('search')} className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '30px' }}>
              <Search size={20} /> Search Tutors Now
            </button>
            <button onClick={() => setCurrentView('register')} className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '30px' }}>
              <UserPlus size={20} /> Register as Guardian/Tutor
            </button>
          </div>
        </div>
      </section>

      {/* Ads Box Placeholder */}
      <section style={{ margin: '40px 0', padding: '20px', background: 'var(--bg-tertiary)', border: '1px dashed var(--border-color)', borderRadius: '12px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No ads running right now</p>
      </section>

      {/* Why Choose Tutodian */}
      <section style={{ marginBottom: '60px' }}>
        <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '32px', marginBottom: '24px' }}>Why Choose Tutodian?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              Finding a reliable tutor often depends on referrals, social media posts, local advertisements, or word of mouth. These methods rarely provide complete information, making it difficult to compare tutors and choose the right educator.
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              Tutodian simplifies the entire process by providing a secure platform where tutors create professional profiles and guardians can search, compare, and connect with qualified educators based on their specific learning requirements.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {['Location', 'Subject', 'Class', 'Teaching Experience', 'Teaching Mode', 'Availability', 'Preferred Teaching Area'].map(item => (
                <span key={item} className="badge badge-primary" style={{ padding: '8px 16px', fontSize: '14px' }}><CheckCircle size={14} style={{ marginRight: '6px' }} /> {item}</span>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                borderRadius: '24px',
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
                <img 
                  src="/hero-illustration.png" 
                  alt="Tutor & Guardian Illustration" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <p style={{ display: 'none' }}>Illustration Placeholder (Tutor & Guardian)</p>
              </div>
          </div>
        </div>
      </section>

      {/* Flexible Learning Options */}
      <section style={{ marginBottom: '60px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Flexible Learning Options</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>Every family has different learning preferences. That's why Tutodian supports multiple teaching formats.</p>
        
        <div className="responsive-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div className="glow-card" style={{ padding: '32px', background: 'var(--bg-tertiary)' }}>
            <MapPin size={40} color="var(--primary)" style={{ marginBottom: '20px' }} />
            <h3 style={{ marginBottom: '16px' }}>Home Tuition</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Personalized one-to-one learning at the student's home.</p>
          </div>
          <div className="glow-card" style={{ padding: '32px', background: 'var(--bg-tertiary)' }}>
            <Video size={40} color="var(--secondary)" style={{ marginBottom: '20px' }} />
            <h3 style={{ marginBottom: '16px' }}>Online Tuition</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Interactive live classes from anywhere using digital learning tools.</p>
          </div>
          <div className="glow-card" style={{ padding: '32px', background: 'var(--bg-tertiary)' }}>
            <Users size={40} color="var(--success)" style={{ marginBottom: '20px' }} />
            <h3 style={{ marginBottom: '16px' }}>Hybrid Learning</h3>
            <p style={{ color: 'var(--text-secondary)' }}>A combination of online and offline tuition that provides greater flexibility and convenience.</p>
          </div>
        </div>
      </section>

      {/* Subjects and Classes */}
      <section style={{ marginBottom: '60px' }}>
        <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div className="glow-card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Search Home Tutors by Subject</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Every student has unique learning goals. Tutodian helps you discover experienced tutors across a wide range of subjects.</p>
            <ul style={{ color: 'var(--text-secondary)', listStyleType: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Science', 'English', 'Hindi', 'History', 'Social Studies', 'Computer Science', 'Geography', 'EVS'].map(sub => (
                <li key={sub} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div> {sub}</li>
              ))}
            </ul>
          </div>
          <div className="glow-card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Home Tuition for Every Class</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Tutodian helps families find tutors for every stage of education.</p>
            <ul style={{ color: 'var(--text-secondary)', listStyleType: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {['Nursery', 'LKG & UKG', 'Kindergarten (KG)', 'Class 1-5', 'Class 6-8', 'Class 9-10', 'Class 11', 'Class 12'].map(cls => (
                <li key={cls} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--secondary)' }}></div> {cls}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ marginBottom: '60px', background: 'var(--bg-tertiary)', padding: '60px 40px', borderRadius: '24px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center' }}>How Tutodian Works</h2>
        <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
          <div>
            <h3 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--primary)' }}>For Guardians</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Finding the right tutor is simple.</p>
            <ol style={{ color: 'var(--text-primary)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>Register your guardian account.</li>
              <li>Search tutors using subject, class, location, or experience.</li>
              <li>Compare professional tutor profiles.</li>
              <li>Contact tutors directly.</li>
              <li>Choose the educator who best fits your child's learning goals.</li>
            </ol>
          </div>
          <div>
            <h3 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--secondary)' }}>For Tutors</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Tutodian helps educators grow their teaching careers.</p>
            <ol style={{ color: 'var(--text-primary)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>Create your professional profile.</li>
              <li>Add your qualifications and teaching experience.</li>
              <li>Select the subjects and classes you teach.</li>
              <li>Choose your preferred teaching locations.</li>
              <li>Set your availability and teaching mode.</li>
              <li>Receive enquiries from nearby guardians.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'grid', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
          {faqData.map((faq, i) => (
            <details key={i} className="glass-panel faq-item" style={{ padding: '24px', cursor: 'pointer' }}>
              <summary style={{ fontSize: '18px', fontWeight: '600', color: 'var(--primary)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {faq.q}
                <ChevronDown size={20} />
              </summary>
              <p style={{ color: 'var(--text-secondary)', marginTop: '16px', lineHeight: '1.6' }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--grad-hero)', borderRadius: '24px', color: 'white', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '20px', color: 'white' }}>Start Learning with Confidence</h2>
        <p style={{ fontSize: '18px', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px', opacity: 0.9 }}>
          Whether you're searching for a qualified home tutor or looking to expand your teaching opportunities, Tutodian provides a trusted platform where students, guardians, and educators connect with confidence.
        </p>
        <button onClick={() => setCurrentView('search')} className="btn" style={{ background: 'white', color: 'var(--primary)', padding: '16px 40px', fontSize: '18px', borderRadius: '30px' }}>
          Find Tutors Now
        </button>
      </section>
    </div>
  );
}
