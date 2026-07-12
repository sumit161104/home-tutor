import Login from './pages/Login';
import Register from './pages/Register';
import React, { useState, useEffect } from 'react'
import { 
  Search, MapPin, Award, BookOpen, Clock, Calendar, 
  User as UserIcon, Phone, Mail, IndianRupee, Eye, EyeOff, LogIn, 
  LogOut, Shield, ChevronRight, X, Compass, CheckCircle2, 
  Plus, Trash2, Edit3, MessageCircle, Star, AlertTriangle, 
  Check, FileText, BarChart2, CheckSquare 
} from 'lucide-react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'var(--bg-tertiary)',
    borderColor: state.isFocused ? 'var(--primary)' : 'var(--border-color)',
    color: 'var(--text-primary)',
    boxShadow: state.isFocused ? '0 0 0 3px var(--primary-glow)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--primary)' : 'var(--border-hover)'
    }
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--bg-tertiary)',
    zIndex: 9999,
    border: '1px solid var(--border-color)'
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'var(--primary)' : 'var(--bg-tertiary)',
    color: state.isFocused ? '#ffffff' : 'var(--text-primary)',
    cursor: 'pointer'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'var(--text-primary)'
  }),
  input: (provided) => ({
    ...provided,
    color: 'var(--text-primary)'
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--text-muted)'
  })
};

import { State, City } from 'country-state-city';

const indianStates = State.getStatesOfCountry('IN').map(state => ({
  value: state.isoCode,
  label: state.name
}));

export default function App() {
  // Navigation / Route state: 'search' | 'detail' | 'login' | 'register' | 'tutor-dashboard' | 'guardian-dashboard' | 'admin-dashboard'
  const [currentView, setCurrentView] = useState(localStorage.getItem('token') ? 'search' : 'login')
  
  // Password Visibility States
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [showProfilePassword, setShowProfilePassword] = useState(false)
  
  // Register Role selection State
  const [registerRole, setRegisterRole] = useState('GUARDIAN')

  // Available Tutors Filter Toggle (3-way selector: 'ALL' | 'AVAILABLE' | 'UNAVAILABLE')
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL')
  
  // Experience Formatter to display fractional years as years and months
  const formatExperience = (exp) => {
    if (exp === null || exp === undefined || exp === '') return 'N/A'
    const num = parseFloat(exp)
    if (isNaN(num) || num === 0) return 'No Experience'
    const years = Math.floor(num)
    const months = Math.round((num - years) * 12)
    if (years === 0) {
      return `${months} Month${months > 1 ? 's' : ''}`
    } else if (months === 0) {
      return `${years} Year${years > 1 ? 's' : ''}`
    } else {
      return `${years} Year${years > 1 ? 's' : ''} ${months} Month${months > 1 ? 's' : ''}`
    }
  }

  // Render User Avatar Badge (T for Tutor, G for Guardian)
  const renderUserAvatar = (role, size = '40px', fontSize = '16px') => {
    const isTutor = role === 'TUTOR';
    const bg = isTutor ? 'var(--primary)' : 'var(--secondary)';
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: fontSize,
        fontFamily: 'var(--font-heading)',
        border: '2px solid rgba(255,255,255,0.1)',
        flexShrink: 0
      }}>
        {isTutor ? 'T' : 'G'}
      </div>
    )
  }

  // Format Date helper to DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  }

  // Auth state
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)

  // Search/Filter states
  const [city, setCity] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [subject, setSubject] = useState('')
  const [standard, setStandard] = useState('')
  const [maxFees, setMaxFees] = useState('')
  const [minExp, setMinExp] = useState('')
  const [availabilityDay, setAvailabilityDay] = useState('')
  const [radius, setRadius] = useState('')
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [useGeo, setUseGeo] = useState(false)

  // Data states
  const [tutors, setTutors] = useState([])
  const [allTutors, setAllTutors] = useState([])
  const [subjects, setSubjects] = useState([])
  const [standards, setStandards] = useState([])
  const [selectedTutor, setSelectedTutor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Edit states (for dashboards)
  const [tutorProfile, setTutorProfile] = useState({
    qualification: '',
    experience: '',
    fees: '',
    city: '',
    address: '',
    latitude: '',
    longitude: '',
    teachingMode: 'BOTH',
    about: '',
    subjectIds: [],
    standardIds: [],
    availabilities: []
  })
  
  const [guardianProfile, setGuardianProfile] = useState({
    name: '',
    phone: '',
    password: '',
    profileImage: '',
    state: '',
    city: ''
  })

  const [deactivationRequested, setDeactivationRequested] = useState(
    localStorage.getItem(`deactivationRequested_${user?.id}`) === 'true'
  )
  const [guardianDeactivationRequested, setGuardianDeactivationRequested] = useState(
    localStorage.getItem(`guardianDeactivationRequested_${user?.id}`) === 'true'
  )

  // Tutor Verification Document uploads state
  const [idProofUrl, setIdProofUrl] = useState('')
  const [degreeProofUrl, setDegreeProofUrl] = useState('')
  const [backgroundCheckUrl, setBackgroundCheckUrl] = useState('')
  const [verificationStatus, setVerificationStatus] = useState(null)

  // Bookings list state
  const [tutorBookings, setTutorBookings] = useState([])
  const [guardianBookings, setGuardianBookings] = useState([])

  // Ratings inputs
  const [newRating, setNewRating] = useState(5)
  const [newComments, setNewComments] = useState('')

  // Booking input
  const [newBookingDate, setNewBookingDate] = useState('')

  // Disputes & Report inputs
  const [reportReason, setReportReason] = useState('')
  const [showReportForm, setShowReportForm] = useState(false)

  // Admin Dashboard State
  const [adminStats, setAdminStats] = useState(null)
  const [adminVerifications, setAdminVerifications] = useState([])
  const [adminReports, setAdminReports] = useState([])
  const [adminUsers, setAdminUsers] = useState([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'GUARDIAN',
    profileImage: '',
    approved: true
  })
  const [adminTab, setAdminTab] = useState('stats')

  // Verification Modal State
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationType, setVerificationType] = useState('email') // 'email' or 'phone'
  const [otpCode, setOtpCode] = useState('')
  const [verificationStep, setVerificationStep] = useState(1) // 1: Select/Send, 2: Enter OTP // 'stats' | 'verifications' | 'reports' | 'users'
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [tutorVerSearch, setTutorVerSearch] = useState('')
  const [guardianVerSearch, setGuardianVerSearch] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectingVerId, setRejectingVerId] = useState(null)
  const selectedStateObj = indianStates.find(s => s.label === stateFilter)
  const availableCities = selectedStateObj 
    ? City.getCitiesOfState('IN', selectedStateObj.value).map(c => c.name)
    : []
  // Temporary availability addition state
  const [newAvailDay, setNewAvailDay] = useState('MONDAY')
  const [newAvailStart, setNewAvailStart] = useState('09:00')
  const [newAvailEnd, setNewAvailEnd] = useState('17:00')

  // Auth fetch wrapper
  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch(url, { ...options, headers })
    if (response.status === 401) {
      handleLogout()
      setCurrentView('login')
      throw new Error('Session expired. Please log in again.')
    }
    return response
  }

  // Load initial search lookups
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const subRes = await fetch('/api/subjects')
        if (subRes.ok) setSubjects(await subRes.json())

        const stdRes = await fetch('/api/standards')
        if (stdRes.ok) setStandards(await stdRes.json())
      } catch (err) {
        console.error('Error loading metadata: ', err)
      }
    }
    loadLookups()
    handleSearch()
  }, [])

  // Load fresh user details if token is present
  useEffect(() => {
    const fetchFreshUser = async () => {
      if (token) {
        try {
          const res = await fetchWithAuth('/api/auth/me')
          if (res.ok) {
            const data = await res.json()
            const freshUser = { 
              id: data.id, 
              name: data.name, 
              email: data.email, 
              phone: data.phone, 
              role: data.role, 
              profileImage: data.profileImage,
              state: data.state,
              city: data.city
            }
            setUser(freshUser)
            localStorage.setItem('user', JSON.stringify(freshUser))
          }
        } catch (err) {
          console.error('Error loading user profile: ', err)
        }
      }
    }
    fetchFreshUser()
  }, [token])

  // Check user role on startup to load dashboard elements
  useEffect(() => {
    if (token && user) {
      if (user.role === 'TUTOR') {
        loadTutorProfile()
        loadTutorVerificationStatus()
        loadTutorBookings()
      } else if (user.role === 'GUARDIAN') {
        loadGuardianProfile()
        loadGuardianBookings()
      } else if (user.role === 'ADMIN') {
        loadAdminStats()
        loadAdminVerifications()
        loadAdminReports()
        loadAdminUsers()
      }
    }
  }, [token, user])

  // Geolocation trigger
  useEffect(() => {
    if (useGeo) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude)
            setLongitude(position.coords.longitude)
            setSuccessMsg('Coordinates fetched from GPS successfully!')
            setTimeout(() => setSuccessMsg(''), 3000)
          },
          (err) => {
            setErrorMsg('Failed to fetch GPS coordinates. Please enter manually.')
            setUseGeo(false)
            setTimeout(() => setErrorMsg(''), 3000)
          }
        )
      } else {
        setErrorMsg('Geolocation is not supported by your browser.')
        setUseGeo(false)
        setTimeout(() => setErrorMsg(''), 3000)
      }
    } else {
      setLatitude(null)
      setLongitude(null)
    }
  }, [useGeo])

  // Password view visibility timer (Item 1.1)
  const triggerPasswordVisibility = (setter) => {
    setter(true)
    setTimeout(() => {
      setter(false)
    }, 1500)
  }

  // Enforce authentication view lockout wall (Item 9)
  useEffect(() => {
    if (!token && currentView !== 'login' && currentView !== 'register') {
      setCurrentView('login')
    }
  }, [token, currentView])

  // Synchronize state -> URL hash for back button navigation
  useEffect(() => {
    const currentHash = window.location.hash;
    let expectedHash = '#/search';
    if (currentView === 'login') expectedHash = '#/login';
    else if (currentView === 'register') expectedHash = '#/register';
    else if (currentView === 'tutor-dashboard') expectedHash = '#/tutor-dashboard';
    else if (currentView === 'guardian-dashboard') expectedHash = '#/guardian-dashboard';
    else if (currentView === 'admin-dashboard') expectedHash = '#/admin-dashboard';
    else if (currentView === 'detail' && selectedTutor) expectedHash = `#/tutor/${selectedTutor.id}`;

    if (currentHash !== expectedHash) {
      window.location.hash = expectedHash;
    }
  }, [currentView, selectedTutor])

  // Synchronize URL hash -> state for back button navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#/' || hash === '#/search') {
        if (currentView !== 'search') {
          setCurrentView('search');
          setSelectedTutor(null);
        }
      } else if (hash === '#/login') {
        if (currentView !== 'login') setCurrentView('login');
      } else if (hash === '#/register') {
        if (currentView !== 'register') setCurrentView('register');
      } else if (hash === '#/tutor-dashboard') {
        if (currentView !== 'tutor-dashboard') setCurrentView('tutor-dashboard');
      } else if (hash === '#/guardian-dashboard') {
        if (currentView !== 'guardian-dashboard') setCurrentView('guardian-dashboard');
      } else if (hash === '#/admin-dashboard') {
        if (currentView !== 'admin-dashboard') setCurrentView('admin-dashboard');
      } else if (hash.startsWith('#/tutor/')) {
        const id = parseInt(hash.replace('#/tutor/', ''), 10);
        if (currentView !== 'detail' || !selectedTutor || selectedTutor.id !== id) {
          const tutor = tutors.find(t => t.id === id);
          if (tutor) {
            setSelectedTutor(tutor);
            setCurrentView('detail');
          } else {
            fetch(`/api/tutors/${id}`)
              .then(res => {
                if (res.ok) return res.json();
                throw new Error();
              })
              .then(data => {
                setSelectedTutor(data);
                setCurrentView('detail');
              })
              .catch(() => {
                setCurrentView('search');
                setSelectedTutor(null);
              });
          }
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [tutors, currentView, selectedTutor])

  // Reset notifications
  const clearMessages = () => {
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleLoginSuccess = (data) => {
    setToken(data.token)
    const userData = { 
      id: data.id, 
      name: data.name, 
      email: data.email, 
      phone: data.phone, 
      role: data.role, 
      profileImage: data.profileImage 
    }
    setUser(userData)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(userData))
    clearMessages()
    
    if (data.role === 'TUTOR') {
      setCurrentView('tutor-dashboard')
    } else if (data.role === 'ADMIN') {
      setCurrentView('admin-dashboard')
    } else {
      setCurrentView('guardian-dashboard')
    }
  }

  const handleLogout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentView('search')
    clearMessages()
  }

  // API Call: Search
  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    clearMessages()
    try {
      let url = `/api/tutors/search?city=${encodeURIComponent(city)}&state=${encodeURIComponent(stateFilter)}&subject=${encodeURIComponent(subject)}&standard=${encodeURIComponent(standard)}`
      if (maxFees) url += `&fees=${maxFees}`
      if (minExp) url += `&experience=${minExp}`
      if (availabilityDay) url += `&availability=${availabilityDay}`
      if (radius) url += `&radius=${radius}`
      if (latitude && longitude) url += `&latitude=${latitude}&longitude=${longitude}`

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setTutors(data)
        if (!city && !stateFilter && !subject && !standard && !maxFees && !minExp && !availabilityDay && !radius) {
          setAllTutors(data)
        }
      } else {
        setErrorMsg('Failed to retrieve search results.')
      }
    } catch (err) {
      setErrorMsg('Network error: Failed to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  // API Call: Load Tutor Profile
  const loadTutorProfile = async () => {
    try {
      const res = await fetchWithAuth('/api/tutors/me')
      if (res.ok) {
        const data = await res.json()
        setTutorProfile({
          qualification: data.qualification || '',
          experience: data.experience || '',
          fees: data.fees || '',
          city: data.city || '',
          state: data.state || '',
          isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
          address: data.address || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          teachingMode: data.teachingMode || 'BOTH',
          about: data.about || '',
          subjectIds: data.subjects ? data.subjects.map(s => s.id) : [],
          standardIds: data.standards ? data.standards.map(s => s.id) : [],
          availabilities: data.availabilities ? data.availabilities.map(a => ({
            day: a.day,
            startTime: a.startTime.substring(0, 5),
            endTime: a.endTime.substring(0, 5)
          })) : []
        })
      }
    } catch (err) {
      console.error('Error fetching tutor profile:', err)
    }
  }

  // API Call: Load Guardian Profile
  const loadGuardianProfile = async () => {
    try {
      const res = await fetchWithAuth('/api/guardian/profile')
      if (res.ok) {
        const data = await res.json()
        setGuardianProfile({
          name: data.name || '',
          phone: data.phone || '',
          password: '',
          profileImage: data.profileImage || '',
          state: data.state || '',
          city: data.city || ''
        })
      }
    } catch (err) {
      console.error('Error fetching guardian profile:', err)
    }
  }

  // Load Tutor Verification Status
  const loadTutorVerificationStatus = async () => {
    try {
      const res = await fetchWithAuth('/api/verification/status')
      if (res.ok) {
        const data = await res.json()
        if (data.status !== 'UNSUBMITTED') {
          setVerificationStatus(data)
          setIdProofUrl(data.idProofUrl || '')
          setDegreeProofUrl(data.degreeProofUrl || '')
          setBackgroundCheckUrl(data.backgroundCheckUrl || '')
        } else {
          setVerificationStatus(null)
        }
      }
    } catch (err) {
      console.error('Error loading verification status:', err)
    }
  }

  // Save Verification Documents
  const handleSaveVerificationDocs = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()
    try {
      const res = await fetchWithAuth('/api/verification', {
        method: 'POST',
        body: JSON.stringify({ idProofUrl, degreeProofUrl, backgroundCheckUrl })
      })

      if (res.ok) {
        setSuccessMsg('Verification documents submitted successfully! Admin review pending.')
        loadTutorVerificationStatus()
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Failed to submit verification documents.')
      }
    } catch (err) {
      setErrorMsg('Error submitting documents.')
    } finally {
      setLoading(false)
    }
  }

  // Request Account Deactivation (Item 13)
  const handleRequestDeactivation = async () => {
    if (window.confirm("Are you sure you want to request account deactivation? This will notify the admin to deactivate your account.")) {
      setLoading(true)
      clearMessages()
      try {
        const res = await fetchWithAuth('/api/reports', {
          method: 'POST',
          body: JSON.stringify({
            reason: `DEACTIVATION_REQUEST: Tutor ${user.name} (${user.email}) is requesting account deactivation.`
          })
        })
        if (res.ok) {
          setSuccessMsg("Deactivation request submitted successfully to the admin.")
          setDeactivationRequested(true)
          localStorage.setItem(`deactivationRequested_${user.id}`, 'true')
        } else {
          const err = await res.json()
          setErrorMsg(err.error || "Failed to submit deactivation request.")
        }
      } catch (err) {
        setErrorMsg("Error submitting deactivation request.")
      } finally {
        setLoading(false)
      }
    }
  }

  // Request Account Deactivation for Guardian
  const handleRequestDeactivationGuardian = async () => {
    if (window.confirm("Are you sure you want to request account deactivation? This will notify the admin to deactivate your account.")) {
      setLoading(true)
      clearMessages()
      try {
        const res = await fetchWithAuth('/api/reports', {
          method: 'POST',
          body: JSON.stringify({
            reason: `DEACTIVATION_REQUEST: Guardian ${user.name} (${user.email}) is requesting account deactivation.`
          })
        })
        if (res.ok) {
          setSuccessMsg("Deactivation request submitted successfully to the admin.")
          setGuardianDeactivationRequested(true)
          localStorage.setItem(`guardianDeactivationRequested_${user.id}`, 'true')
        } else {
          const err = await res.json()
          setErrorMsg(err.error || "Failed to submit deactivation request.")
        }
      } catch (err) {
        setErrorMsg("Error submitting deactivation request.")
      } finally {
        setLoading(false)
      }
    }
  }
  const loadTutorBookings = async () => {
    try {
      const res = await fetchWithAuth('/api/bookings/tutor')
      if (res.ok) {
        const data = await res.json()
        setTutorBookings(data)
      }
    } catch (err) {
      console.error('Error loading tutor bookings:', err)
    }
  }

  // Load Guardian Bookings
  const loadGuardianBookings = async () => {
    try {
      const res = await fetchWithAuth('/api/bookings/guardian')
      if (res.ok) {
        const data = await res.json()
        setGuardianBookings(data)
      }
    } catch (err) {
      console.error('Error loading guardian bookings:', err)
    }
  }

  // Submit Booking Request
  const handleRequestBooking = async (e) => {
    e.preventDefault()
    if (!token) {
      setCurrentView('login')
      return
    }
    setLoading(true)
    clearMessages()
    try {
      const res = await fetchWithAuth('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          tutorId: selectedTutor.id,
          bookingDate: newBookingDate
        })
      })

      if (res.ok) {
        setSuccessMsg('Demo class booking requested successfully!')
        setNewBookingDate('')
        loadGuardianBookings()
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Failed to request booking.')
      }
    } catch (err) {
      setErrorMsg('Error requesting booking.')
    } finally {
      setLoading(false)
    }
  }

  // Update Booking Status (Tutor)
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetchWithAuth(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        setSuccessMsg(`Booking status updated to ${newStatus}!`)
        loadTutorBookings()
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Failed to update booking.')
      }
    } catch (err) {
      setErrorMsg('Error updating booking status.')
    }
  }

  // Load Reviews for Selected Tutor
  const loadTutorReviews = async (tutorId) => {
    try {
      const res = await fetch(`/api/reviews/tutor/${tutorId}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch (err) {
      console.error('Error loading reviews:', err)
    }
  }

  // Submit Rating & Review
  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()
    try {
      const res = await fetchWithAuth(`/api/reviews/tutor/${selectedTutor.id}`, {
        method: 'POST',
        body: JSON.stringify({
          rating: newRating,
          comments: newComments
        })
      })

      if (res.ok) {
        setSuccessMsg('Thank you! Review submitted successfully.')
        setNewComments('')
        loadTutorReviews(selectedTutor.id)
        
        // Refresh detail info (to update aggregates)
        const detailRes = await fetch(`/api/tutors/${selectedTutor.id}`)
        if (detailRes.ok) {
          setSelectedTutor(await detailRes.json())
        }
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Failed to submit review.')
      }
    } catch (err) {
      setErrorMsg('Error submitting review.')
    } finally {
      setLoading(false)
    }
  }

  // Submit Dispute Report
  const handleSubmitReport = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()
    try {
      const res = await fetchWithAuth('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          tutorId: selectedTutor.id,
          reason: reportReason
        })
      })

      if (res.ok) {
        setSuccessMsg('Report submitted to admin team successfully.')
        setReportReason('')
        setShowReportForm(false)
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Failed to submit report.')
      }
    } catch (err) {
      setErrorMsg('Error submitting report.')
    } finally {
      setLoading(false)
    }
  }

  // Save Tutor Profile
  const handleSaveTutorProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()
    try {
      // Process availabilities to include seconds for localTime parser in backend
      const formattedAvails = tutorProfile.availabilities.map(a => ({
        day: a.day,
        startTime: a.startTime.length === 5 ? `${a.startTime}:00` : a.startTime,
        endTime: a.endTime.length === 5 ? `${a.endTime}:00` : a.endTime
      }))

      const payload = {
        ...tutorProfile,
        fees: tutorProfile.fees ? parseFloat(tutorProfile.fees) : null,
        experience: tutorProfile.experience ? parseFloat(tutorProfile.experience) : null,
        latitude: tutorProfile.latitude ? parseFloat(tutorProfile.latitude) : null,
        longitude: tutorProfile.longitude ? parseFloat(tutorProfile.longitude) : null,
        availabilities: formattedAvails
      }

      const res = await fetchWithAuth('/api/tutors', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setSuccessMsg('Tutor profile updated successfully!')
        loadTutorProfile()
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Failed to update tutor profile.')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while saving profile.')
    } finally {
      setLoading(false)
      window.scrollTo(0, 0)
    }
  }

  // Save Guardian Profile
  const handleSaveGuardianProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()
    try {
      const payload = {}
      if (guardianProfile.name) payload.name = guardianProfile.name
      if (guardianProfile.phone) payload.phone = guardianProfile.phone
      if (guardianProfile.profileImage) payload.profileImage = guardianProfile.profileImage
      if (guardianProfile.state) payload.state = guardianProfile.state
      if (guardianProfile.city) payload.city = guardianProfile.city
      if (guardianProfile.password) payload.password = guardianProfile.password

      const res = await fetchWithAuth('/api/guardian/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const updated = await res.json()
        setSuccessMsg('Profile updated successfully!')
        
        // Update user state details locally
        const updatedUser = { 
          ...user, 
          name: updated.name, 
          phone: updated.phone, 
          profileImage: updated.profileImage,
          state: updated.state,
          city: updated.city
        }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        setGuardianProfile(prev => ({ ...prev, password: '', state: updated.state || '', city: updated.city || '' }))
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Failed to update profile.')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error saving profile.')
    } finally {
      setLoading(false)
      window.scrollTo(0, 0)
    }
  }

  // Admin Dashboard API Calls
  const loadAdminStats = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/stats')
      if (res.ok) setAdminStats(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const loadAdminVerifications = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/verifications')
      if (res.ok) setAdminVerifications(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const loadAdminReports = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/reports')
      if (res.ok) setAdminReports(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const loadAdminUsers = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/users')
      if (res.ok) setAdminUsers(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  // Contact Verification Handlers
  const handleSendOtp = async (type) => {
    setLoading(true);
    clearMessages();
    try {
      const res = await fetchWithAuth(`/api/verification/send-${type}-otp`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || `OTP sent to your ${type}.`);
        setVerificationStep(2);
      } else {
        setErrorMsg(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();
    try {
      const res = await fetchWithAuth(`/api/verification/verify-${verificationType}-otp?otp=${otpCode}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Verification successful!');
        if (verificationType === 'email') {
          setUser({ ...user, isEmailVerified: true });
        } else {
          setUser({ ...user, isPhoneVerified: true });
        }
        setShowVerificationModal(false);
        setVerificationStep(1);
        setOtpCode('');
      } else {
        setErrorMsg(data.error || 'Invalid OTP.');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCreateUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()
    try {
      const res = await fetchWithAuth('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(newUserForm)
      })

      if (res.ok) {
        setSuccessMsg('User account created successfully!')
        setShowUserModal(false)
        setNewUserForm({ name: '', email: '', phone: '', password: '', role: 'GUARDIAN', profileImage: '', approved: true })
        loadAdminUsers()
        loadAdminStats()
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Failed to create user account.')
      }
    } catch (err) {
      setErrorMsg('Error creating user account.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminUpdateUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()
    try {
      const res = await fetchWithAuth(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingUser)
      })

      if (res.ok) {
        setSuccessMsg('User account updated successfully!')
        setShowUserModal(false)
        setEditingUser(null)
        loadAdminUsers()
        loadAdminStats()
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Failed to update user account.')
      }
    } catch (err) {
      setErrorMsg('Error updating user account.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminDeleteUser = async (userId) => {
    setLoading(true)
    clearMessages()
    try {
      const res = await fetchWithAuth(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setSuccessMsg('User account deleted successfully.')
        loadAdminUsers()
        loadAdminStats()
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Failed to delete user account.')
      }
    } catch (err) {
      setErrorMsg('Error deleting user account.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminToggleUserApproval = async (userId, newApprovedStatus) => {
    try {
      const res = await fetchWithAuth(`/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ approved: newApprovedStatus })
      })

      if (res.ok) {
        setSuccessMsg(newApprovedStatus ? 'User account approved successfully!' : 'User account deactivated successfully.')
        loadAdminUsers()
      } else {
        const err = await res.json()
        setErrorMsg(err.error || 'Failed to modify user status.')
      }
    } catch (err) {
      setErrorMsg('Error modifying user status.')
    }
  }

  // Admin Approve Document
  const handleAdminApproveVerification = async (verId) => {
    try {
      const res = await fetchWithAuth(`/api/admin/verifications/${verId}/approve`, { method: 'PUT' })
      if (res.ok) {
        setSuccessMsg('Tutor verified successfully!')
        loadAdminVerifications()
        loadAdminStats()
      } else {
        setErrorMsg('Failed to approve verification.')
      }
    } catch (err) {
      setErrorMsg('Error processing request.')
    }
  }

  // Admin Reject Document
  const handleAdminRejectVerification = async (e) => {
    e.preventDefault()
    if (!rejectingVerId || !rejectionReason.trim()) return
    try {
      const res = await fetchWithAuth(`/api/admin/verifications/${rejectingVerId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason: rejectionReason })
      })

      if (res.ok) {
        setSuccessMsg('Verification documents rejected successfully.')
        setRejectionReason('')
        setRejectingVerId(null)
        loadAdminVerifications()
        loadAdminStats()
      } else {
        setErrorMsg('Failed to process rejection.')
      }
    } catch (err) {
      setErrorMsg('Error processing request.')
    }
  }

  // Admin Resolve Dispute Report
  const handleAdminResolveReport = async (reportId) => {
    try {
      const res = await fetchWithAuth(`/api/admin/reports/${reportId}/resolve`, { method: 'PUT' })
      if (res.ok) {
        setSuccessMsg('Dispute resolved successfully.')
        loadAdminReports()
        loadAdminStats()
      } else {
        setErrorMsg('Failed to resolve dispute.')
      }
    } catch (err) {
      setErrorMsg('Error processing request.')
    }
  }

  // Login handler

  // Helpers for checkboxes
  const handleSubjectCheckbox = (id) => {
    const ids = [...tutorProfile.subjectIds]
    if (ids.includes(id)) {
      setTutorProfile({ ...tutorProfile, subjectIds: ids.filter(x => x !== id) })
    } else {
      setTutorProfile({ ...tutorProfile, subjectIds: [...ids, id] })
    }
  }

  const handleStandardCheckbox = (id) => {
    const ids = [...tutorProfile.standardIds]
    if (ids.includes(id)) {
      setTutorProfile({ ...tutorProfile, standardIds: ids.filter(x => x !== id) })
    } else {
      setTutorProfile({ ...tutorProfile, standardIds: [...ids, id] })
    }
  }

  // Add Availability Day Slot
  const addAvailabilitySlot = () => {
    if (!newAvailStart || !newAvailEnd) return
    const newSlot = {
      day: newAvailDay,
      startTime: newAvailStart,
      endTime: newAvailEnd
    }
    setTutorProfile({
      ...tutorProfile,
      availabilities: [...tutorProfile.availabilities, newSlot]
    })
  }

  // Remove Availability Day Slot
  const removeAvailabilitySlot = (index) => {
    setTutorProfile({
      ...tutorProfile,
      availabilities: tutorProfile.availabilities.filter((_, idx) => idx !== index)
    })
  }

  // View Tutor Details page
  const handleViewTutor = (tutor) => {
    setSelectedTutor(tutor)
    loadTutorReviews(tutor.id)
    setCurrentView('detail')
    window.scrollTo(0, 0)
  }

  return (
    <div className="app-wrapper">
      {/* Navigation Bar */}
      <nav className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderLeft: 'none', borderRight: 'none', borderTop: 'none', borderRadius: 0, padding: '16px 0' }}>
        <div className="container navbar-container">
          <div className="brand" onClick={() => { setCurrentView('search'); setSelectedTutor(null); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ background: 'var(--grad-hero)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={22} color="white" />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-heading)', background: 'var(--grad-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HomeTutor</span>
          </div>

          <div className="navbar-links">
            <span onClick={() => { setCurrentView('search'); setSelectedTutor(null); }} style={{ cursor: 'pointer', fontWeight: 600, color: currentView === 'search' ? 'var(--primary)' : 'var(--text-secondary)' }}>Find Tutors</span>
            
            {token ? (
              <>
                <span 
                  onClick={() => {
                    if (user.role === 'TUTOR') setCurrentView('tutor-dashboard');
                    else if (user.role === 'ADMIN') setCurrentView('admin-dashboard');
                    else setCurrentView('guardian-dashboard');
                  }} 
                  style={{ cursor: 'pointer', fontWeight: 600, color: (currentView.includes('dashboard')) ? 'var(--primary)' : 'var(--text-secondary)' }}
                >
                  Dashboard
                </span>
                <div className="navbar-user">
                  {renderUserAvatar(user.role, '32px', '14px')}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 600 }}>{user.role}</span>
                  </div>
                  <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '13px' }} title="Log Out">
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setCurrentView('login')} className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: '14px' }}>
                  <LogIn size={15} /> Login
                </button>
                <button onClick={() => setCurrentView('register')} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '14px' }}>
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Container Content */}
      <main className="container" style={{ margin: '32px auto', minHeight: 'calc(100vh - 200px)' }}>
        
        {/* Global Notifications */}
        {errorMsg && (
          <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--danger)', padding: '16px', marginBottom: '24px', color: 'white', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{errorMsg}</span>
            <X size={18} style={{ cursor: 'pointer' }} onClick={clearMessages} />
          </div>
        )}
        {successMsg && (
          <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)', padding: '16px', marginBottom: '24px', color: 'white', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{successMsg}</span>
            <X size={18} style={{ cursor: 'pointer' }} onClick={clearMessages} />
          </div>
        )}

        {/* VIEW: Home/Search tutors */}
        {currentView === 'search' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            
            {/* Search Hero banner */}
            <div className="glow-card" style={{ padding: '40px', borderRadius: '24px', marginBottom: '40px', background: 'var(--bg-secondary)' }}>
              <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '38px', marginBottom: '12px', fontFamily: 'var(--font-heading)', background: 'var(--grad-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Find the Perfect Home Tutor Near You
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                  Connect with qualified local home tutors. Filter by subject, class, fees, and proximity radius instantly.
                </p>
              </div>

              {/* Advanced Search Form */}
              <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">State/UT</label>
                  <div style={{ position: 'relative' }}>
                    <Select 
                      options={indianStates}
                      placeholder="Select State"
                      value={stateFilter ? { value: stateFilter, label: stateFilter } : null}
                      onChange={selected => {
                        setStateFilter(selected ? selected.label : '');
                        setCity('');
                      }}
                      classNamePrefix="react-select"
                      isClearable
                      styles={customStyles}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">City</label>
                  <div style={{ position: 'relative' }}>
                    <CreatableSelect 
                      options={availableCities.map(ct => ({ value: ct, label: ct }))}
                      placeholder="Select City"
                      value={city ? { value: city, label: city } : null}
                      onChange={selected => setCity(selected ? selected.label || selected.value : '')}
                      isDisabled={!stateFilter}
                      formatCreateLabel={(val) => `Search for "${val}"`}
                      classNamePrefix="react-select"
                      isClearable
                      styles={customStyles}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Subject</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)} className="form-select">
                    <option value="">All Subjects</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Class/Standard</label>
                  <select value={standard} onChange={e => setStandard(e.target.value)} className="form-select">
                    <option value="">All Classes</option>
                    {standards.map(std => (
                      <option key={std.id} value={std.className}>{std.className}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Max Monthly Fees (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <IndianRupee size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
                    <input 
                      type="number" 
                      placeholder="e.g. 5000" 
                      value={maxFees} 
                      onChange={e => setMaxFees(e.target.value)} 
                      className="form-input" 
                      style={{ paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                {/* Radius/Distance fields */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Radius (km)</span>
                    <span 
                      onClick={() => setUseGeo(!useGeo)} 
                      style={{ color: useGeo ? 'var(--success)' : 'var(--primary)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Compass size={11} /> {useGeo ? 'GPS Active' : 'Use GPS'}
                    </span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="number" 
                      placeholder="e.g. 5" 
                      value={radius} 
                      onChange={e => setRadius(e.target.value)} 
                      className="form-input" 
                      disabled={!latitude && !useGeo}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'stretch' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', gap: '8px' }} disabled={loading}>
                    <Search size={18} /> {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>

              {/* Extra GPS Coordinates overlay if manually added */}
              {(latitude || longitude) && (
                <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>Center Lat: <strong>{latitude?.toFixed(4)}</strong></span>
                  <span>Center Lng: <strong>{longitude?.toFixed(4)}</strong></span>
                  <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => { setLatitude(null); setLongitude(null); setUseGeo(false); }}>Reset GPS</span>
                </div>
              )}

              {/* 3-way Availability directory filter (Item 15) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px', padding: '16px 0 0 0', borderTop: '1px solid var(--border-color)', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Tutor Availability:</span>
                <select 
                  value={availabilityFilter} 
                  onChange={e => setAvailabilityFilter(e.target.value)} 
                  className="form-select" 
                  style={{ maxWidth: '240px', padding: '8px 12px', fontSize: '14px', borderRadius: '8px' }}
                >
                  <option value="ALL">Show All Tutors</option>
                  <option value="AVAILABLE">Show Only Available Tutors</option>
                  <option value="UNAVAILABLE">Show Not Available Tutors</option>
                </select>
              </div>
            </div>            {/* Results Section */}
            {(() => {
              const filteredTutors = tutors.filter(t => {
                if (availabilityFilter === 'AVAILABLE') return t.isAvailable === true
                if (availabilityFilter === 'UNAVAILABLE') return t.isAvailable === false
                return true
              })

              return (
                <>
                  <div className="responsive-flex-row" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Search Results ({filteredTutors.length})</h2>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Showing verified nearby tutors</span>
                  </div>

                  {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '60px 0' }}>
                      <div className="pulse-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--grad-hero)', animation: 'pulseGlow 1.5s infinite' }}></div>
                      <span style={{ color: 'var(--text-secondary)' }}>Retrieving nearby tutors...</span>
                    </div>
                  ) : filteredTutors.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '60px 0', textAlign: 'center', borderRadius: '16px' }}>
                      <Search size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                      <h3>No Tutors Found</h3>
                      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '8px auto 0' }}>
                        Try widening your filters, searching for a different city, or resetting the proximity radius.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                      {filteredTutors.map(tp => (
                        <div key={tp.id} className="glow-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '380px' }}>
                          <div style={{ padding: '24px' }}>
                            
                            {/* Card Header: Avatar & Base info */}
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                              {renderUserAvatar(tp.user.role || 'TUTOR', '64px', '22px')}
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{tp.user.name}</h3>
                                  {tp.isVerified && (
                                    <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '2px' }} title="Verified Tutor Profile">
                                      <Shield size={16} fill="var(--primary-glow)" />
                                    </span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                                  <span className="badge badge-success" style={{ fontSize: '9px', padding: '2px 6px' }}>{tp.teachingMode}</span>
                                  <span className={tp.isAvailable ? "badge badge-success" : "badge-secondary badge"} style={{ fontSize: '9px', padding: '2px 6px', textTransform: 'none' }}>
                                    {tp.isAvailable ? 'Available' : 'Unavailable'}
                                  </span>
                                  {/* Ratings aggregates */}
                                  <span style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--warning)' }}>
                                    <Star size={13} fill="currentColor" /> {tp.averageRating?.toFixed(1) || '0.0'} ({tp.reviewCount || 0})
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '12px', marginTop: '6px' }}>
                                  <MapPin size={13} />
                                  <span>{tp.state || ''}{tp.state && tp.city ? `, ` : ''}{tp.city || (tp.state ? '' : 'Location unspecified')}</span>
                                </div>
                              </div>
                            </div>

                            {/* Bio snippet */}
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '42px', marginBottom: '16px' }}>
                              {tp.about || 'This tutor has not filled out their introduction details yet.'}
                            </p>

                            {/* Stats Grid: Exp, Fees */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                              <div>
                                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Experience</span>
                                <span style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Award size={14} color="var(--primary)" /> {formatExperience(tp.experience)}
                                </span>
                              </div>
                              <div>
                                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fees per Child</span>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)' }}>
                                  {tp.fees ? `₹${tp.fees}` : 'Negotiable'}
                                </span>
                              </div>
                            </div>

                            {/* Subjects list */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                              {tp.subjects && tp.subjects.slice(0, 3).map(sub => (
                                <span key={sub.id} className="badge badge-primary" style={{ fontSize: '10px' }}>{sub.name}</span>
                              ))}
                              {tp.subjects && tp.subjects.length > 3 && (
                                <span className="badge badge-secondary" style={{ fontSize: '10px' }}>+{tp.subjects.length - 3} More</span>
                              )}
                            </div>

                            {/* Standards list */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {tp.standards && tp.standards.slice(0, 3).map(std => (
                                <span key={std.id} className="badge badge-secondary" style={{ fontSize: '10px' }}>{std.className}</span>
                              ))}
                            </div>

                          </div>

                          {/* Card Action footer */}
                          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {tp.qualification || 'No Degree Listed'}
                            </span>
                            <button onClick={() => handleViewTutor(tp)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px' }}>
                              View Profile <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}

        {/* VIEW: Tutor Detail View */}
        {currentView === 'detail' && selectedTutor && (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <button onClick={() => { setCurrentView('search'); setSelectedTutor(null); }} className="btn btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '14px' }}>
              &larr; Back to Listings
            </button>

            <div className="responsive-grid-2-1" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
              
              {/* Left Column: Profile Bio & Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Main Identity Box */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {renderUserAvatar('TUTOR', '100px', '36px')}
                    <div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <h1 style={{ fontSize: '30px' }}>{selectedTutor.user.name}</h1>
                        
                        {selectedTutor.isVerified && (
                          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                            <Shield size={14} fill="var(--primary-glow)" /> Verified Profile
                          </span>
                        )}
                        <span className="badge badge-success">{selectedTutor.teachingMode}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontWeight: 600, fontSize: '15px' }}>
                          <Star size={18} fill="currentColor" /> {selectedTutor.averageRating?.toFixed(1) || '0.0'} ({selectedTutor.reviewCount || 0} reviews)
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>|</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Experience: <strong>{formatExperience(selectedTutor.experience)}</strong></span>
                      </div>

                      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} /> {selectedTutor.address || 'Address unspecified'}, {selectedTutor.state ? `${selectedTutor.state}, ` : ''}{selectedTutor.city || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>About Me</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {selectedTutor.about || 'No detailed biography provided by the tutor.'}
                  </p>
                </div>

                {/* Qualifications & Subjects */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Education & Subjects</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Qualification</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={18} color="var(--primary)" />
                        <span style={{ fontSize: '16px', fontWeight: 600 }}>{selectedTutor.qualification || 'Not Specified'}</span>
                      </div>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Teaching Experience</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} color="var(--primary)" />
                        <span style={{ fontSize: '16px', fontWeight: 600 }}>{formatExperience(selectedTutor.experience)}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Subjects Offered</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {selectedTutor.subjects && selectedTutor.subjects.map(s => (
                        <span key={s.id} className="badge badge-primary">{s.name}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Target Classes/Standards</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {selectedTutor.standards && selectedTutor.standards.map(s => (
                        <span key={s.id} className="badge badge-secondary">{s.className}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Location Map Coordinates */}
                {(selectedTutor.latitude || selectedTutor.longitude) && (
                  <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Location Coordinates</h3>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '15px', color: 'var(--text-secondary)' }}>
                      <div>Latitude: <strong style={{ color: 'var(--text-primary)' }}>{selectedTutor.latitude}</strong></div>
                      <div>Longitude: <strong style={{ color: 'var(--text-primary)' }}>{selectedTutor.longitude}</strong></div>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedTutor.latitude},${selectedTutor.longitude}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        Open on Maps <Compass size={14} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Ratings & Feedback List */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Guardian Reviews</h3>
                  
                  {reviews.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {reviews.map(r => (
                        <div key={r.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {renderUserAvatar('GUARDIAN', '28px', '11px')}
                              <div>
                                <strong style={{ fontSize: '14px', display: 'block' }}>{r.guardian.name}</strong>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '2px', color: 'var(--warning)' }}>
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < r.rating ? 'currentColor' : 'none'} />
                              ))}
                            </div>
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{r.comments || 'No comments left.'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>No reviews yet. Be the first to leave a review!</p>
                  )}

                  {/* Submit Review Form (Only for Guardians) */}
                  {token && user && user.role === 'GUARDIAN' && (
                    <form onSubmit={handleSubmitReview} style={{ marginTop: '24px', background: 'rgba(0,0,0,0.1)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                      <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>Write a Review</h4>
                      
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <span className="form-label" style={{ marginBottom: 0 }}>Rating:</span>
                        <div style={{ display: 'flex', gap: '6px', color: 'var(--warning)', cursor: 'pointer' }}>
                          {[1, 2, 3, 4, 5].map(val => (
                            <Star 
                              key={val} 
                              size={22} 
                              fill={val <= newRating ? 'currentColor' : 'none'} 
                              onClick={() => setNewRating(val)}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Review Comments</label>
                        <textarea 
                          placeholder="Tell others about your experience learning from this tutor..." 
                          value={newComments} 
                          onChange={e => setNewComments(e.target.value)} 
                          className="form-textarea"
                          required
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                        Submit Feedback
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Right Column: Pricing & Contact Action / Availability */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Contact Card */}
                <div className="glow-card" style={{ padding: '32px', borderRadius: '20px', background: 'var(--bg-secondary)', textAlign: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Monthly Fees starting at</span>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--success)', margin: '8px 0 24px' }}>
                    {selectedTutor.fees ? `₹${selectedTutor.fees}` : 'Negotiable'}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Action WhatsApp */}
                    <a 
                      href={`https://wa.me/${selectedTutor.user.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(selectedTutor.user.name)},%20I%20saw%20your%20profile%20on%20HomeTutor%20and%20would%20like%20to%20discuss%20tuition.`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                      style={{ width: '100%', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', boxShadow: 'none' }}
                    >
                      <MessageCircle size={18} /> Chat on WhatsApp
                    </a>

                    {/* Action Phone call */}
                    <a href={`tel:${selectedTutor.user.phone}`} className="btn btn-secondary" style={{ width: '100%' }}>
                      <Phone size={16} /> Call: {selectedTutor.user.phone}
                    </a>

                    {/* Action Email */}
                    <a href={`mailto:${selectedTutor.user.email}?subject=Home Tuition Inquiry`} className="btn btn-secondary" style={{ width: '100%' }}>
                      <Mail size={16} /> Email Tutor
                    </a>
                  </div>
                </div>

                {/* Class Booking request */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckSquare size={18} color="var(--primary)" /> Request Free Trial
                  </h3>

                  {token && user && user.role !== 'GUARDIAN' ? (
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', textAlign: 'center' }}>
                      Only Guardians can request class trials.
                    </span>
                  ) : (
                    <form onSubmit={handleRequestBooking}>
                      <div className="form-group">
                        <label className="form-label">Select Date</label>
                        <input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]} 
                          value={newBookingDate} 
                          onChange={e => setNewBookingDate(e.target.value)} 
                          className="form-input" 
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                        {loading ? 'Booking...' : 'Book Demo Session'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Availability Slots */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} color="var(--primary)" /> Availability Hours
                  </h3>
                  
                  {selectedTutor.availabilities && selectedTutor.availabilities.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedTutor.availabilities.map((av, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <strong style={{ fontSize: '13px' }}>{av.day}</strong>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {av.startTime.substring(0, 5)} - {av.endTime.substring(0, 5)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
                      Availability times not specified. Please contact tutor directly.
                    </p>
                  )}
                </div>

                {/* Dispute / Report Button postponed for current release */}

              </div>

            </div>
          </div>
        )}

        {/* VIEW: Login Form */}
        {currentView === 'login' && (
          <Login 
            setCurrentView={setCurrentView} 
            onLoginSuccess={handleLoginSuccess} 
            setLoading={setLoading} 
            setErrorMsg={setErrorMsg} 
            clearMessages={clearMessages} 
          />
        )}

        {/* VIEW: Register Form */}
        {currentView === 'register' && (
          <Register 
            setCurrentView={setCurrentView} 
            onLoginSuccess={handleLoginSuccess} 
            setLoading={setLoading} 
            setErrorMsg={setErrorMsg}
            setSuccessMsg={setSuccessMsg}
            clearMessages={clearMessages} 
          />
        )}

        {/* VIEW: Guardian Profile Dashboard */}
        {currentView === 'guardian-dashboard' && user && (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <h1 style={{ marginBottom: '24px' }}>Guardian Profile Settings</h1>

            {!user.isEmailVerified && (
              <div className="glass-panel" style={{ background: 'rgba(234, 179, 8, 0.1)', borderColor: 'var(--warning)', padding: '16px', marginBottom: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={24} color="var(--warning)" />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: 'white', display: 'block' }}>Email Verification Required</strong>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Your email address is unverified.
                  </span>
                </div>
                <div>
                  <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => setShowVerificationModal(true)}>
                    Verify Now
                  </button>
                </div>
              </div>
            )}

            <div className="responsive-grid-1-2" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
              {/* Left Details sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  {renderUserAvatar('GUARDIAN', '100px', '40px')}
                  <h3 style={{ marginTop: '16px' }}>{user.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>{user.email}</p>
                  <div className="badge badge-primary" style={{ marginBottom: '16px' }}>GUARDIAN PROFILE</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'left', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <span>State/UT: <strong>{user.state || 'Unspecified'}</strong></span>
                    <span>City: <strong>{user.city || 'Unspecified'}</strong></span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px', width: '100%' }}>
                    {guardianDeactivationRequested ? (
                      <div style={{ color: 'var(--danger)', fontWeight: 'bold', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', fontSize: '12px' }}>
                        Deactivation requested to Admin
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        onClick={handleRequestDeactivationGuardian} 
                        className="btn btn-danger" 
                        style={{ width: '100%', fontSize: '12px', padding: '8px 12px' }}
                      >
                        Request Account Deactivation
                      </button>
                    )}
                  </div>
                </div>

                {/* Guardian Bookings list */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="var(--primary)" /> Class Bookings
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {guardianBookings.map(b => (
                      <div key={b.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <strong>{b.tutorProfile.user.name}</strong>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: 'bold', 
                            color: b.status === 'ACCEPTED' ? 'var(--success)' : b.status === 'REJECTED' ? 'var(--danger)' : 'var(--warning)' 
                          }}>
                            {b.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '11px' }}>
                          <span>Date: {formatDate(b.bookingDate)}</span>
                          <span>Phone: {b.tutorProfile.user.phone}</span>
                        </div>
                      </div>
                    ))}
                    {guardianBookings.length === 0 && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>No booking sessions requested yet.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Profile editor */}
              <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                <form onSubmit={handleSaveGuardianProfile}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      value={guardianProfile.name} 
                      onChange={e => setGuardianProfile({ ...guardianProfile, name: e.target.value })} 
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="text" 
                      value={guardianProfile.phone} 
                      onChange={e => setGuardianProfile({ ...guardianProfile, phone: e.target.value })} 
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State/UT</label>
                    <Select 
                      options={indianStates}
                      placeholder="Select State"
                      value={guardianProfile.state ? { value: guardianProfile.state, label: guardianProfile.state } : null}
                      onChange={selected => {
                        setGuardianProfile({ ...guardianProfile, state: selected ? selected.label : '' });
                        setGuardianProfile(prev => ({ ...prev, city: '' })); // reset city
                      }}
                      classNamePrefix="react-select"
                      isClearable
                      styles={customStyles}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">City</label>
                    <CreatableSelect 
                      options={guardianProfile.state 
                        ? City.getCitiesOfState('IN', indianStates.find(s => s.label === guardianProfile.state)?.value || '').map(c => ({ value: c.name, label: c.name })) 
                        : []}
                      placeholder="Select City (or type to add)"
                      value={guardianProfile.city ? { value: guardianProfile.city, label: guardianProfile.city } : null}
                      onChange={selected => setGuardianProfile({ ...guardianProfile, city: selected ? selected.value : '' })}
                      formatCreateLabel={(val) => `Add "${val}"`}
                      classNamePrefix="react-select"
                      isClearable
                      styles={customStyles}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Change Password (Leave blank to keep current)</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showProfilePassword ? "text" : "password"} 
                        placeholder="New password" 
                        value={guardianProfile.password} 
                        onChange={e => setGuardianProfile({ ...guardianProfile, password: e.target.value })} 
                        className="form-input" 
                        style={{ paddingRight: '40px' }}
                      />
                      <span 
                        onClick={() => triggerPasswordVisibility(setShowProfilePassword)} 
                        style={{ position: 'absolute', right: '12px', top: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        {showProfilePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '24px', padding: '14px' }} 
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save All Changes'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: Tutor Dashboard / Profile Editor */}
        {currentView === 'tutor-dashboard' && user && (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <h1 style={{ marginBottom: '24px' }}>Tutor Profile Setup</h1>

            {!user.isEmailVerified && (
              <div className="glass-panel" style={{ background: 'rgba(234, 179, 8, 0.1)', borderColor: 'var(--warning)', padding: '16px', marginBottom: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={24} color="var(--warning)" />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: 'white', display: 'block' }}>Email Verification Required</strong>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Your email address is unverified.
                  </span>
                </div>
                <div>
                  <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => setShowVerificationModal(true)}>
                    Verify Now
                  </button>
                </div>
              </div>
            )}

            {/* Profile verified check banner */}
            {verificationStatus && verificationStatus.status === 'APPROVED' && (
              <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)', padding: '16px', marginBottom: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={24} color="var(--success)" />
                <div>
                  <strong style={{ color: 'white', display: 'block' }}>Verified Profile Badge Active!</strong>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Your profile displays a verified badge, boosting discovery rankings.</span>
                </div>
              </div>
            )}
            {verificationStatus && verificationStatus.status === 'REJECTED' && (
              <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--danger)', padding: '16px', marginBottom: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={24} color="var(--danger)" />
                <div>
                  <strong style={{ color: 'white', display: 'block' }}>Verification Request Rejected</strong>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Reason: {verificationStatus.rejectionReason}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveTutorProfile}>
              <div className="responsive-grid-2-1" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
              
              {/* Left Column Form: Basic info, subjects, classes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Basic details */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Professional Information</h3>
                  
                    <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Highest Qualification</label>
                        <input 
                          type="text" 
                          placeholder="e.g. B.Tech in CSE" 
                          value={tutorProfile.qualification} 
                          onChange={e => setTutorProfile({ ...tutorProfile, qualification: e.target.value })} 
                          className="form-input" 
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Experience (Years)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 5" 
                          step="0.1" 
                          value={tutorProfile.experience} 
                          onChange={e => setTutorProfile({ ...tutorProfile, experience: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                    </div>

                    <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Monthly Fees per Child (₹)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 3500" 
                          value={tutorProfile.fees} 
                          onChange={e => setTutorProfile({ ...tutorProfile, fees: e.target.value })} 
                          className="form-input" 
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Teaching Mode</label>
                        <select 
                          value={tutorProfile.teachingMode} 
                          onChange={e => setTutorProfile({ ...tutorProfile, teachingMode: e.target.value })} 
                          className="form-select"
                        >
                          <option value="ONLINE">Online Mode</option>
                          <option value="OFFLINE">Offline Home Tuition</option>
                          <option value="BOTH">Both (Online and Offline)</option>
                        </select>
                      </div>
                    </div>

                    {/* Tutor Availability Status toggle switch (Item 7) */}
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label">Tutor Availability Status</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                          <input 
                            type="checkbox" 
                            checked={tutorProfile.isAvailable} 
                            onChange={e => setTutorProfile({ ...tutorProfile, isAvailable: e.target.checked })} 
                            style={{ opacity: 0, width: 0, height: 0 }}
                          />
                          <span style={{
                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: tutorProfile.isAvailable ? 'var(--success)' : 'var(--text-muted)',
                            transition: '.4s', borderRadius: '34px'
                          }}>
                            <span style={{
                              position: 'absolute', content: '""', height: '18px', width: '18px', left: tutorProfile.isAvailable ? '28px' : '4px', bottom: '4px',
                              backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                            }} />
                          </span>
                        </label>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: tutorProfile.isAvailable ? 'var(--success)' : 'var(--text-secondary)' }}>
                          {tutorProfile.isAvailable ? 'Available for Tuition' : 'Not Available (Inactive)'}
                        </span>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">About Me (Bio)</label>
                      <textarea 
                        placeholder="Write about your tutoring style..." 
                        value={tutorProfile.about} 
                        onChange={e => setTutorProfile({ ...tutorProfile, about: e.target.value })} 
                        className="form-textarea" 
                      />
                    </div>
                </div>

                {/* Booking Requests List */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={20} color="var(--primary)" /> Tuition Bookings ({tutorBookings.length})
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {tutorBookings.map(b => (
                      <div key={b.id} style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px' }}>{b.guardian.name}</strong>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block' }}>Date: {formatDate(b.bookingDate)}</span>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Contact: {b.guardian.phone} | {b.guardian.email}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          {b.status === 'PENDING' ? (
                            <>
                              <button onClick={() => handleUpdateBookingStatus(b.id, 'ACCEPTED')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', background: 'var(--success)', boxShadow: 'none' }}>
                                Accept
                              </button>
                              <button onClick={() => handleUpdateBookingStatus(b.id, 'REJECTED')} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px' }}>
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="badge badge-primary" style={{ 
                              background: b.status === 'ACCEPTED' ? 'var(--success-glow)' : 'rgba(239, 68, 68, 0.1)', 
                              color: b.status === 'ACCEPTED' ? 'var(--success)' : 'var(--danger)',
                              border: b.status === 'ACCEPTED' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                            }}>
                              {b.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {tutorBookings.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>No booking requests received yet.</p>
                    )}
                  </div>
                </div>

                {/* Subjects Selector */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Subjects You Teach</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                    {subjects.map(s => (
                      <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer', padding: '8px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }}>
                        <input 
                          type="checkbox" 
                          checked={tutorProfile.subjectIds.includes(s.id)} 
                          onChange={() => handleSubjectCheckbox(s.id)}
                          style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                        />
                        <span>{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Standards/Classes Selector */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Classes/Standards You Teach</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                    {standards.map(std => (
                      <label key={std.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer', padding: '8px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }}>
                        <input 
                          type="checkbox" 
                          checked={tutorProfile.standardIds.includes(std.id)} 
                          onChange={() => handleStandardCheckbox(std.id)}
                          style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                        />
                        <span>{std.className}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Location coordinate finder & Availability hours & Verification documents */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Account Details & Deactivation Request (Item 13) */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  {renderUserAvatar('TUTOR', '90px', '36px')}
                  <h3 style={{ fontSize: '18px', marginTop: '16px', marginBottom: '4px' }}>{user.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>{user.email}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>Phone: {user.phone}</p>
                  
                  {user.linkedinUrl && (
                    <div style={{ marginBottom: '20px', textAlign: 'left', width: '100%' }}>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>LinkedIn Profile</span>
                      <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                        {user.linkedinUrl}
                      </a>
                    </div>
                  )}

                  {deactivationRequested ? (
                    <div style={{ color: 'var(--danger)', fontWeight: 'bold', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', fontSize: '13px', width: '100%' }}>
                      Deactivation requested to Admin
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleRequestDeactivation} 
                      className="btn btn-danger" 
                      style={{ width: '100%', fontSize: '13px', padding: '10px 14px' }}
                    >
                      Request Account Deactivation
                    </button>
                  )}
                </div>

                {/* Tutor Verification submission */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={18} color="var(--primary)" /> Profile Verification
                  </h3>
                  
                  <div>
                    <div className="form-group">
                      <label className="form-label">ID Proof URL (Aadhar/Passport)</label>
                      <input 
                        type="text" 
                        placeholder="Google Drive URL" 
                        value={idProofUrl} 
                        onChange={e => setIdProofUrl(e.target.value)} 
                        className="form-input" 
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Degree Certificate URL</label>
                      <input 
                        type="text" 
                        placeholder="Google Drive URL" 
                        value={degreeProofUrl} 
                        onChange={e => setDegreeProofUrl(e.target.value)} 
                        className="form-input" 
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Background Check Certificate</label>
                      <input 
                        type="text" 
                        placeholder="Google Drive URL" 
                        value={backgroundCheckUrl} 
                        onChange={e => setBackgroundCheckUrl(e.target.value)} 
                        className="form-input" 
                        required
                      />
                    </div>

                    <button 
                      type="button" 
                      onClick={handleSaveVerificationDocs} 
                      className="btn btn-secondary" 
                      style={{ width: '100%', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                    >
                      Submit Documents
                    </button>
                  </div>
                </div>

                {/* Geolocation Coordinates setter */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Location Settings</h3>
                  
                  <div className="form-group">
                    <label className="form-label">State/UT</label>
                    <Select 
                      options={indianStates}
                      placeholder="Select State"
                      value={tutorProfile.state ? { value: tutorProfile.state, label: tutorProfile.state } : null}
                      onChange={selected => {
                        setTutorProfile({ ...tutorProfile, state: selected ? selected.label : '' });
                        setTutorProfile(prev => ({ ...prev, city: '' })); // reset city
                      }}
                      classNamePrefix="react-select"
                      isClearable
                      styles={customStyles}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">City</label>
                    <CreatableSelect 
                      options={tutorProfile.state 
                        ? City.getCitiesOfState('IN', indianStates.find(s => s.label === tutorProfile.state)?.value || '').map(c => ({ value: c.name, label: c.name })) 
                        : []}
                      placeholder="Select City (or type to add)"
                      value={tutorProfile.city ? { value: tutorProfile.city, label: tutorProfile.city } : null}
                      onChange={selected => setTutorProfile({ ...tutorProfile, city: selected ? selected.value : '' })}
                      formatCreateLabel={(val) => `Add "${val}"`}
                      classNamePrefix="react-select"
                      isClearable
                      styles={customStyles}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Address</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Flat 101, Boring Road" 
                      value={tutorProfile.address} 
                      onChange={e => setTutorProfile({ ...tutorProfile, address: e.target.value })} 
                      className="form-input" 
                    />
                  </div>

                  <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Latitude</label>
                      <input 
                        type="number" 
                        step="0.000001" 
                        placeholder="e.g. 25.5941" 
                        value={tutorProfile.latitude} 
                        onChange={e => setTutorProfile({ ...tutorProfile, latitude: e.target.value })} 
                        className="form-input" 
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Longitude</label>
                      <input 
                        type="number" 
                        step="0.000001" 
                        placeholder="e.g. 85.1376" 
                        value={tutorProfile.longitude} 
                        onChange={e => setTutorProfile({ ...tutorProfile, longitude: e.target.value })} 
                        className="form-input" 
                      />
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setTutorProfile({
                              ...tutorProfile,
                              latitude: pos.coords.latitude,
                              longitude: pos.coords.longitude
                            })
                            setSuccessMsg('Coordinates fetched from device location!')
                            setTimeout(() => setSuccessMsg(''), 3000)
                          },
                          (err) => {
                            setErrorMsg('Could not fetch location automatically. Please type coordinates manually.')
                            setTimeout(() => setErrorMsg(''), 3000)
                          }
                        )
                      }
                    }} 
                    className="btn btn-secondary" 
                    style={{ width: '100%', gap: '6px', fontSize: '13px' }}
                  >
                    <Compass size={14} /> Fetch Current GPS Location
                  </button>
                </div>

                {/* Availability Day Editor */}
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Availability Hours</h3>
                  
                  {/* Current slots list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {tutorProfile.availabilities.map((av, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{av.day}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{av.startTime} - {av.endTime}</span>
                        <button type="button" onClick={() => removeAvailabilitySlot(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {tutorProfile.availabilities.length === 0 && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>No availability slots added yet.</span>
                    )}
                  </div>

                  {/* Add Slot controls */}
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '14px', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label">Day</label>
                      <select value={newAvailDay} onChange={e => setNewAvailDay(e.target.value)} className="form-select" style={{ padding: '8px 12px' }}>
                        <option value="MONDAY">Monday</option>
                        <option value="TUESDAY">Tuesday</option>
                        <option value="WEDNESDAY">Wednesday</option>
                        <option value="THURSDAY">Thursday</option>
                        <option value="FRIDAY">Friday</option>
                        <option value="SATURDAY">Saturday</option>
                        <option value="SUNDAY">Sunday</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Start Time</label>
                        <input type="time" value={newAvailStart} onChange={e => setNewAvailStart(e.target.value)} className="form-input" style={{ padding: '8px 12px' }} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">End Time</label>
                        <input type="time" value={newAvailEnd} onChange={e => setNewAvailEnd(e.target.value)} className="form-input" style={{ padding: '8px 12px' }} />
                      </div>
                    </div>

                    <button type="button" onClick={addAvailabilitySlot} className="btn btn-secondary" style={{ width: '100%', fontSize: '13px', padding: '8px 12px', gap: '4px' }}>
                      <Plus size={14} /> Add Slot
                    </button>
                  </div>
                </div>

              </div>

            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ minWidth: '320px', padding: '16px 48px', fontSize: '16px', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)' }}
                disabled={loading}
              >
                {loading ? 'Saving Changes...' : 'Save All Profile Changes'}
              </button>
            </div>
          </form>
        </div>
        )}

        {/* VIEW: Admin Dashboard Panel */}
        {currentView === 'admin-dashboard' && user && user.role === 'ADMIN' && (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div className="responsive-flex-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <h1>Admin Dashboard Panel</h1>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Welcome to Platform Operations Control</span>
            </div>

            {/* Admin Tabs */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
              <button 
                onClick={() => setAdminTab('stats')} 
                className="btn" 
                style={{ 
                  background: adminTab === 'stats' ? 'var(--grad-hero)' : 'transparent',
                  border: adminTab === 'stats' ? 'none' : '1px solid var(--border-color)',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '8px'
                }}
              >
                <BarChart2 size={16} /> Statistics Overview
              </button>
              <button 
                onClick={() => { setAdminTab('verifications'); loadAdminVerifications(); }} 
                className="btn" 
                style={{ 
                  background: adminTab === 'verifications' ? 'var(--grad-hero)' : 'transparent',
                  border: adminTab === 'verifications' ? 'none' : '1px solid var(--border-color)',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '8px'
                }}
              >
                <Shield size={16} /> Tutor Verifications Queue
              </button>
              <button 
                onClick={() => { setAdminTab('guardian-verifications'); loadAdminVerifications(); }} 
                className="btn" 
                style={{ 
                  background: adminTab === 'guardian-verifications' ? 'var(--grad-hero)' : 'transparent',
                  border: adminTab === 'guardian-verifications' ? 'none' : '1px solid var(--border-color)',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '8px'
                }}
              >
                <Shield size={16} /> Guardian Verifications Queue
              </button>
              <button 
                onClick={() => { setAdminTab('reports'); loadAdminReports(); }} 
                className="btn" 
                style={{ 
                  background: adminTab === 'reports' ? 'var(--grad-hero)' : 'transparent',
                  border: adminTab === 'reports' ? 'none' : '1px solid var(--border-color)',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '8px'
                }}
              >
                <AlertTriangle size={16} /> Disputes & Reports
              </button>
              <button 
                onClick={() => { setAdminTab('users'); loadAdminUsers(); }} 
                className="btn" 
                style={{ 
                  background: adminTab === 'users' ? 'var(--grad-hero)' : 'transparent',
                  border: adminTab === 'users' ? 'none' : '1px solid var(--border-color)',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '8px'
                }}
              >
                <UserIcon size={16} /> User Management
              </button>
            </div>

            {/* TAB CONTENT: Stats Overview */}
            {adminTab === 'stats' && adminStats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                  <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
                    <UserIcon size={32} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Registered Users</span>
                    <strong style={{ fontSize: '32px', display: 'block', marginTop: '6px' }}>{adminStats.totalUsers}</strong>
                  </div>
                  <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
                    <BookOpen size={32} color="var(--secondary)" style={{ margin: '0 auto 8px' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Registered Tutors</span>
                    <strong style={{ fontSize: '32px', display: 'block', marginTop: '6px' }}>{adminStats.totalTutors}</strong>
                  </div>
                  <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
                    <CheckSquare size={32} color="var(--success)" style={{ margin: '0 auto 8px' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Demo Bookings</span>
                    <strong style={{ fontSize: '32px', display: 'block', marginTop: '6px' }}>{adminStats.totalBookings}</strong>
                  </div>
                  <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
                    <Shield size={32} color="var(--warning)" style={{ margin: '0 auto 8px' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pending Verifications</span>
                    <strong style={{ fontSize: '32px', display: 'block', marginTop: '6px' }}>{adminStats.pendingVerifications}</strong>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                  <h3 style={{ marginBottom: '16px' }}>System Operations Information</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                    This dashboard allows platform owners to manage tutor registrations, review submitted legal IDs, and verify qualifications. 
                    Tutors who submit documents will be queued in the Verifications tab. Approving will toggle their status to Verified, placing a Verified Badge on their profiles in the directory listing.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Tutor Verifications Queue */}
            {adminTab === 'verifications' && (
              <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <h3 style={{ margin: 0 }}>Tutor Approvals Queue ({adminVerifications.filter(v => v.tutorProfile != null).length})</h3>
                  <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '300px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Search tutor by name or email..." 
                      className="form-input" 
                      style={{ paddingLeft: '36px', height: '40px' }}
                      value={tutorVerSearch}
                      onChange={e => setTutorVerSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {adminVerifications.filter(v => v.tutorProfile != null)
                    .filter(v => {
                      if (!tutorVerSearch) return true;
                      const search = tutorVerSearch.toLowerCase();
                      const name = (v.tutorProfile.user.name || '').toLowerCase();
                      const email = (v.tutorProfile.user.email || '').toLowerCase();
                      return name.includes(search) || email.includes(search);
                    })
                    .map(ver => {
                    const isTutor = true;
                    const userName = ver.tutorProfile.user.name;
                    const userEmail = ver.tutorProfile.user.email;
                    const userRole = 'TUTOR';
                    const detailText = `Qualification: ${ver.tutorProfile.qualification}`;

                    return (
                      <div key={ver.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                          <div>
                            <strong style={{ fontSize: '16px', display: 'block' }}>{userName} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({userRole})</span></strong>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Email: {userEmail} | {detailText}</span>
                          </div>
                          <span className="badge badge-secondary" style={{ 
                            background: ver.status === 'APPROVED' ? 'var(--success-glow)' : ver.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'var(--primary-glow)',
                            color: ver.status === 'APPROVED' ? 'var(--success)' : ver.status === 'REJECTED' ? 'var(--danger)' : 'var(--primary)',
                            border: ver.status === 'APPROVED' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.1)'
                          }}>
                            {ver.status}
                          </span>
                        </div>

                        {/* Display Doc Links */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ID Proof</span>
                            <a href={ver.idProofUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FileText size={14} /> Open ID Document
                            </a>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Degree Proof</span>
                            <a href={ver.degreeProofUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FileText size={14} /> Open Degree Document
                            </a>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Background Check</span>
                            <a href={ver.backgroundCheckUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FileText size={14} /> Open BG Document
                            </a>
                          </div>
                        </div>

                        {/* Action buttons (only for PENDING status) */}
                        {ver.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => handleAdminApproveVerification(ver.id)} className="btn btn-primary" style={{ background: 'var(--success)', boxShadow: 'none', padding: '8px 16px', fontSize: '13px' }}>
                              <Check size={14} /> Approve Account
                            </button>
                            
                            {rejectingVerId !== ver.id ? (
                              <button onClick={() => { setRejectingVerId(ver.id); setRejectionReason(''); }} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                Reject Submission
                              </button>
                            ) : (
                              <form onSubmit={handleAdminRejectVerification} style={{ display: 'flex', gap: '8px', flex: 1 }}>
                                <input 
                                  type="text" 
                                  placeholder="Rejection reason..." 
                                  value={rejectionReason} 
                                  onChange={e => setRejectionReason(e.target.value)} 
                                  className="form-input" 
                                  style={{ padding: '8px 12px', fontSize: '13px' }}
                                  required
                                />
                                <button type="submit" className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                  Confirm Reject
                                </button>
                                <button type="button" onClick={() => setRejectingVerId(null)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                  Cancel
                                </button>
                              </form>
                            )}
                          </div>
                        )}

                        {/* Rejection comments display */}
                        {ver.status === 'REJECTED' && ver.rejectionReason && (
                          <div style={{ fontSize: '13px', color: 'var(--danger)', marginTop: '8px' }}>
                            Rejection Reason: <strong>{ver.rejectionReason}</strong>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {adminVerifications.filter(v => v.tutorProfile != null).length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>No tutor verification requests in queue.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Guardian Verifications Queue */}
            {adminTab === 'guardian-verifications' && (
              <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <h3 style={{ margin: 0 }}>Guardian Approvals Queue ({adminVerifications.filter(v => v.tutorProfile == null).length})</h3>
                  <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '300px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Search guardian by name or email..." 
                      className="form-input" 
                      style={{ paddingLeft: '36px', height: '40px' }}
                      value={guardianVerSearch}
                      onChange={e => setGuardianVerSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {adminVerifications.filter(v => v.tutorProfile == null)
                    .filter(v => {
                      if (!guardianVerSearch) return true;
                      const search = guardianVerSearch.toLowerCase();
                      const name = (v.user?.name || '').toLowerCase();
                      const email = (v.user?.email || '').toLowerCase();
                      return name.includes(search) || email.includes(search);
                    })
                    .map(ver => {
                    const userName = ver.user ? ver.user.name : 'Unknown';
                    const userEmail = ver.user ? ver.user.email : '';
                    const userRole = 'GUARDIAN';
                    const detailText = 'Guardian account activation request';

                    return (
                      <div key={ver.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                          <div>
                            <strong style={{ fontSize: '16px', display: 'block' }}>{userName} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({userRole})</span></strong>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Email: {userEmail} | {detailText}</span>
                          </div>
                          <span className="badge badge-secondary" style={{ 
                            background: ver.status === 'APPROVED' ? 'var(--success-glow)' : ver.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'var(--primary-glow)',
                            color: ver.status === 'APPROVED' ? 'var(--success)' : ver.status === 'REJECTED' ? 'var(--danger)' : 'var(--primary)',
                            border: ver.status === 'APPROVED' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.1)'
                          }}>
                            {ver.status}
                          </span>
                        </div>

                        {/* Action buttons (only for PENDING status) */}
                        {ver.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => handleAdminApproveVerification(ver.id)} className="btn btn-primary" style={{ background: 'var(--success)', boxShadow: 'none', padding: '8px 16px', fontSize: '13px' }}>
                              <Check size={14} /> Approve Account
                            </button>
                            
                            {rejectingVerId !== ver.id ? (
                              <button onClick={() => { setRejectingVerId(ver.id); setRejectionReason(''); }} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                Reject Submission
                              </button>
                            ) : (
                              <form onSubmit={handleAdminRejectVerification} style={{ display: 'flex', gap: '8px', flex: 1 }}>
                                <input 
                                  type="text" 
                                  placeholder="Rejection reason..." 
                                  value={rejectionReason} 
                                  onChange={e => setRejectionReason(e.target.value)} 
                                  className="form-input" 
                                  style={{ padding: '8px 12px', fontSize: '13px' }}
                                  required
                                />
                                <button type="submit" className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                  Confirm Reject
                                </button>
                                <button type="button" onClick={() => setRejectingVerId(null)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                  Cancel
                                </button>
                              </form>
                            )}
                          </div>
                        )}

                        {/* Rejection comments display */}
                        {ver.status === 'REJECTED' && ver.rejectionReason && (
                          <div style={{ fontSize: '13px', color: 'var(--danger)', marginTop: '8px' }}>
                            Rejection Reason: <strong>{ver.rejectionReason}</strong>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {adminVerifications.filter(v => v.tutorProfile == null).length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>No guardian verification requests in queue.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Disputes Queue */}
            {adminTab === 'reports' && (
              <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>Active User Dispute Reports ({adminReports.length})</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {adminReports.map(rep => (
                    <div key={rep.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 'bold' }}>DISPUTE #{rep.id}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status: {rep.status}</span>
                        </div>
                        {rep.tutorProfile ? (
                          <p style={{ fontSize: '14px', margin: '4px 0' }}>Reported Tutor: <strong>{rep.tutorProfile.user.name}</strong></p>
                        ) : (
                          <p style={{ fontSize: '14px', margin: '4px 0', color: 'var(--warning)', fontWeight: 600 }}>Deactivation Request</p>
                        )}
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Reason: "{rep.reason}"</p>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Reporter: {rep.reporter.name} ({rep.reporter.email})</span>
                      </div>

                      {rep.status === 'PENDING' ? (
                        <button onClick={() => handleAdminResolveReport(rep.id)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', background: 'var(--success)', boxShadow: 'none' }}>
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="badge badge-success" style={{ background: 'var(--success-glow)', color: 'var(--success)' }}>RESOLVED</span>
                      )}
                    </div>
                  ))}
                  
                  {adminReports.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>No dispute reports filed.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: User Management */}
            {adminTab === 'users' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease-out' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '20px' }}>User Accounts Registry ({adminUsers.length})</h3>
                  <button 
                    onClick={() => {
                      setEditingUser(null);
                      setNewUserForm({ name: '', email: '', phone: '', password: '', role: 'GUARDIAN', profileImage: '', approved: true });
                      setShowUserModal(true);
                    }} 
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16} /> Add New User
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Search users by name..." 
                    value={userSearchQuery} 
                    onChange={e => setUserSearchQuery(e.target.value)} 
                    className="form-input" 
                    style={{ maxWidth: '300px', padding: '8px 12px', fontSize: '13px' }}
                  />
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          <th style={{ padding: '12px 8px' }}>User Details</th>
                          <th style={{ padding: '12px 8px' }}>Contact</th>
                          <th style={{ padding: '12px 8px' }}>Role</th>
                          <th style={{ padding: '12px 8px' }}>Status</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers
                          .filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()))
                          .map(u => (
                          <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                            <td style={{ padding: '16px 8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {renderUserAvatar(u.role, '36px', '14px')}
                              <div>
                                <strong style={{ color: 'white', display: 'block' }}>{u.name}</strong>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {u.id}</span>
                              </div>
                            </td>
                            <td style={{ padding: '16px 8px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span>{u.email}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.phone}</span>
                              </div>
                            </td>
                            <td style={{ padding: '16px 8px' }}>
                              <span className="badge badge-secondary" style={{ 
                                background: u.role === 'ADMIN' ? 'var(--primary-glow)' : u.role === 'TUTOR' ? 'var(--success-glow)' : 'rgba(255,255,255,0.05)',
                                color: u.role === 'ADMIN' ? 'var(--primary)' : u.role === 'TUTOR' ? 'var(--success)' : 'white'
                              }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ padding: '16px 8px' }}>
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                color: u.approved ? 'var(--success)' : 'var(--danger)',
                                fontWeight: 600,
                                fontSize: '13px'
                              }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.approved ? 'var(--success)' : 'var(--danger)' }}></span>
                                {u.approved ? 'Approved' : 'Suspended'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => handleAdminToggleUserApproval(u.id, !u.approved)} 
                                  className="btn btn-secondary" 
                                  style={{ padding: '6px 12px', fontSize: '12px', borderColor: u.approved ? 'var(--danger)' : 'var(--success)', color: u.approved ? 'var(--danger)' : 'var(--success)' }}
                                >
                                  {u.approved ? 'Deactivate' : 'Approve'}
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingUser(u);
                                    setShowUserModal(true);
                                  }} 
                                  className="btn btn-secondary" 
                                  style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center' }}
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to permanently delete user ${u.name}?`)) {
                                      handleAdminDeleteUser(u.id);
                                    }
                                  }} 
                                  className="btn btn-danger" 
                                  style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center' }}
                                  disabled={u.id === user.id}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {showUserModal && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s' }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '32px', borderRadius: '20px', position: 'relative' }}>
                      <button 
                        onClick={() => setShowUserModal(false)} 
                        style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        <X size={20} />
                      </button>

                      <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
                        {editingUser ? 'Modify User Profile' : 'Add New User'}
                      </h3>

                      <form onSubmit={editingUser ? handleAdminUpdateUser : handleAdminCreateUser}>
                        <div className="form-group">
                          <label className="form-label">Full Name</label>
                          <input 
                            type="text" 
                            value={editingUser ? editingUser.name : newUserForm.name} 
                            onChange={e => {
                              if (editingUser) setEditingUser({ ...editingUser, name: e.target.value });
                              else setNewUserForm({ ...newUserForm, name: e.target.value });
                            }} 
                            className="form-input" 
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Email Address</label>
                          <input 
                            type="email" 
                            value={editingUser ? editingUser.email : newUserForm.email} 
                            onChange={e => {
                              if (editingUser) setEditingUser({ ...editingUser, email: e.target.value });
                              else setNewUserForm({ ...newUserForm, email: e.target.value });
                            }} 
                            className="form-input" 
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Phone Number</label>
                          <input 
                            type="text" 
                            value={editingUser ? editingUser.phone : newUserForm.phone} 
                            onChange={e => {
                              if (editingUser) setEditingUser({ ...editingUser, phone: e.target.value });
                              else setNewUserForm({ ...newUserForm, phone: e.target.value });
                            }} 
                            className="form-input" 
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Password {editingUser && '(Leave blank to keep unchanged)'}</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type={showAdminPassword ? "text" : "password"} 
                              value={editingUser ? (editingUser.password || '') : newUserForm.password} 
                              onChange={e => {
                                if (editingUser) setEditingUser({ ...editingUser, password: e.target.value });
                                else setNewUserForm({ ...newUserForm, password: e.target.value });
                              }} 
                              className="form-input" 
                              style={{ paddingRight: '40px' }}
                              placeholder={editingUser ? '••••••••' : 'Password'} 
                              required={!editingUser}
                            />
                            <span 
                              onClick={() => triggerPasswordVisibility(setShowAdminPassword)} 
                              style={{ position: 'absolute', right: '12px', top: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                            >
                              {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                          </div>
                        </div>



                        <div className="form-group">
                          <label className="form-label">Role</label>
                          <select 
                            value={editingUser ? editingUser.role : newUserForm.role} 
                            onChange={e => {
                              if (editingUser) setEditingUser({ ...editingUser, role: e.target.value });
                              else setNewUserForm({ ...newUserForm, role: e.target.value });
                            }} 
                            className="form-select"
                          >
                            <option value="GUARDIAN">GUARDIAN</option>
                            <option value="TUTOR">TUTOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </div>

                        {editingUser && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={editingUser.approved} 
                              onChange={e => setEditingUser({ ...editingUser, approved: e.target.checked })} 
                              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                            />
                            <span style={{ fontSize: '14px' }}>Approved & Active</span>
                          </label>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                            {editingUser ? 'Save Updates' : 'Add User Account'}
                          </button>
                          <button type="button" onClick={() => setShowUserModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Verification Modal */}
        {showVerificationModal && user && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '20px', position: 'relative' }}>
              <button 
                onClick={() => { setShowVerificationModal(false); setVerificationStep(1); setOtpCode(''); }}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              
              <h2 style={{ marginBottom: '8px' }}>Verify Contact</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Verify your email to secure your account.</p>
              
              {verificationStep === 1 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {!user.isEmailVerified && (
                    <button className="btn btn-secondary" onClick={() => { setVerificationType('email'); handleSendOtp('email'); }}>
                      <Mail size={16} style={{ marginRight: '8px' }} /> Send OTP to Email
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Enter OTP sent to your {verificationType}</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder="123456" 
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setVerificationStep(1)} disabled={loading}>
                    Back
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '40px 0', marginTop: '60px' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '18px' }}>HomeTutor Marketplace</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
            &copy; {new Date().getFullYear()} HomeTutor. Connecting learners with professional teachers locally.
          </p>
        </div>
      </footer>
    </div>
  )
}
