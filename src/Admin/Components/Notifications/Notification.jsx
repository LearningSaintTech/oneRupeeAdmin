import React, { useState, useEffect, useContext } from 'react';
import { FaSearch, FaBell, FaTimes, FaUpload, FaCheck } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectProfile, selectToken } from '../../redux/GlobalSlice';
import profileImg from '../../../assets/images/Profile Picture (1).svg';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SocketContext } from '../../socket/SocketContext';
import { getNotificationsApi, uploadInternshipLetterApi, markNotificationReadApi, getUnreadNotificationCountApi, sendGlobalNotificationApi } from '../../apis/NotificationApi';
import { ToastContainer, toast } from 'react-toastify'; // Added toast imports
import 'react-toastify/dist/ReactToastify.css'; // Added toast CSS

const Notification = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [filteredReminders, setFilteredReminders] = useState([]);
  const [dbNotifications, setDbNotifications] = useState([]);
  const [internshipRequests, setInternshipRequests] = useState([]);
  const [uploadedLetters, setUploadedLetters] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNewNotificationBanner, setShowNewNotificationBanner] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [selectedInternshipLetterId, setSelectedInternshipLetterId] = useState(null);
  const [globalTitle, setGlobalTitle] = useState('');
  const [globalBody, setGlobalBody] = useState('');
  const [globalData, setGlobalData] = useState('');

  const profile = useSelector(selectProfile);
  const token = useSelector(selectToken);
  const { socket } = useContext(SocketContext);

  // Initial debug logs
  console.log(`🛠️ [Notification] Component initialized, Timestamp: ${new Date().toISOString()}`);
  console.log(`👤 [Notification] Profile:`, profile, `Timestamp: ${new Date().toISOString()}`);
  console.log(`🔑 [Notification] Token:`, token, `Timestamp: ${new Date().toISOString()}`);
  console.log(`🔌 [Notification] Socket instance:`, socket ? `Connected (ID: ${socket.id})` : 'Not available', `Timestamp: ${new Date().toISOString()}`);

  // Fetch stored notifications from backend
  useEffect(() => {
    console.log(`📥 [Notification] Entering fetch notifications useEffect, Token: ${token}, Timestamp: ${new Date().toISOString()}`);
    const fetchData = async () => {
      try {
        console.log(`📡 [Notification] Calling getNotificationsApi, Timestamp: ${new Date().toISOString()}`);
        const res = await getNotificationsApi(token);
        console.log(`📩 [Notification] API Response:`, res, `Timestamp: ${new Date().toISOString()}`);
        if (res.success && res.data?.notifications) {
          console.log(`✅ [Notification] Notifications fetched:`, res.data.notifications, `Timestamp: ${new Date().toISOString()}`);
          setDbNotifications(res.data.notifications);
          console.log(`💾 [Notification] Updated dbNotifications:`, res.data.notifications, `Timestamp: ${new Date().toISOString()}`);
        } else {
          console.log(`⚠️ [Notification] No notifications or API unsuccessful:`, res, `Timestamp: ${new Date().toISOString()}`);
          setDbNotifications([]);
        }
      } catch (err) {
        console.error(`❌ [Notification] Error fetching notifications:`, err.message, `Timestamp: ${new Date().toISOString()}`);
        setDbNotifications([]);
        toast.error('Failed to fetch notifications. Please try again later.');
      }
    };
    if (token) {
      console.log(`✅ [Notification] Token exists, fetching data, Timestamp: ${new Date().toISOString()}`);
      fetchData();
    } else {
      console.log(`⚠️ [Notification] No token, skipping fetch, Timestamp: ${new Date().toISOString()}`);
    }
  }, [token]);

  // Set up Socket.IO event listeners
  useEffect(() => {
    console.log(`🔌 [Notification] Entering Socket.IO useEffect, Socket: ${socket ? 'Available' : 'Not available'}, Timestamp: ${new Date().toISOString()}`);
    if (socket) {
      console.log(`🛠️ [Notification] Setting up Socket.IO listeners, Socket ID: ${socket.id}, Connected: ${socket.connected}, Timestamp: ${new Date().toISOString()}`);
      console.log(`🔌 [Notification] Socket transport: ${socket.io?.engine?.transport?.name || 'unknown'}, URL: ${socket.io?.uri || 'unknown'}`);
      console.log(`🔌 [Notification] Socket readyState: ${socket.io?.readyState || 'unknown'}`);
      
      if (socket.connected) {
        console.log(`✅ [Notification] Socket is already connected, ready to receive events`);
      } else {
        console.log(`⚠️ [Notification] Socket is not connected yet, events may be missed`);
      }

      socket.on('payment_completed', (data) => {
        console.log(`📬 [Notification] Received payment:`, data, `Timestamp: ${new Date().toISOString()}`);
        console.log(`📬 [Notification] Socket ID: ${socket.id}, Connected: ${socket.connected}`);
        console.log(`📬 [Notification] Event data type:`, typeof data);
        console.log(`📬 [Notification] Event data keys:`, Object.keys(data || {}));
        
        try {
          setInternshipRequests((prev) => {
            console.log(`📬 [Notification] Current internshipRequests:`, prev);
            const existingRequest = prev.find(req => req.internshipLetterId === data.internshipLetterId);
            if (existingRequest) {
              console.log(`⚠️ [Notification] Duplicate request ignored:`, data.internshipLetterId);
              return prev;
            }
            
            const newRequests = [...prev, data];
            console.log(`💾 [Notification] Updated internshipRequests:`, newRequests, `Timestamp: ${new Date().toISOString()}`);
            
            if (Notification.permission === 'granted') {
              new Notification('New Internship Letter Request', {
                body: `${data.userName} requested internship letter for ${data.courseName}`,
                icon: '/favicon.ico'
              });
            }
            
            setTimeout(() => {
              const element = document.getElementById(`internship-request-${data.internshipLetterId}`);
              if (element) {
                element.classList.add('animate-pulse', 'bg-yellow-100');
                setTimeout(() => {
                  element.classList.remove('animate-pulse', 'bg-yellow-100');
                }, 3000);
              }
            }, 100);
            
            setLastNotification(data);
            setShowNewNotificationBanner(true);
            setTimeout(() => {
              setShowNewNotificationBanner(false);
            }, 5000);
            
            return newRequests;
          });
        } catch (err) {
          console.error(`❌ [Notification] Error processing payment_completed:`, err.message, `Timestamp: ${new Date().toISOString()}`);
        }
      });

      socket.on('upload_internship_letter', (data) => {
        console.log(`📬 [Notification] Received upload_internship_letter:`, data, `Timestamp: ${new Date().toISOString()}`);
        try {
          setUploadedLetters((prev) => {
            const newLetters = [...prev, data];
            console.log(`💾 [Notification] Updated uploadedLetters:`, newLetters, `Timestamp: ${new Date().toISOString()}`);
            return newLetters;
          });
        } catch (err) {
          console.error(`❌ [Notification] Error processing upload_internship_letter:`, err.message, `Timestamp: ${new Date().toISOString()}`);
        }
      });

      socket.on('test_event', (data) => {
        console.log(`🧪 [Notification] Received test_event:`, data, `Timestamp: ${new Date().toISOString()}`);
        toast.info(`✅ WebSocket test successful! Received: ${data.message}`);
      });

      socket.on('connect', () => {
        console.log(`✅ [Notification] Socket connected, ID: ${socket.id}, Timestamp: ${new Date().toISOString()}`);
      });

      socket.on('error', (error) => {
        console.error(`❌ [Notification] Socket error:`, error, `Timestamp: ${new Date().toISOString()}`);
      });

      socket.on('disconnect', (reason) => {
        console.log(`❌ [Notification] Socket disconnected, Reason: ${reason}, Timestamp: ${new Date().toISOString()}`);
      });

      return () => {
        console.log(`🧹 [Notification] Cleaning up Socket.IO listeners, Timestamp: ${new Date().toISOString()}`);
        socket.off('payment_completed');
        socket.off('upload_internship_letter');
        socket.off('test_event');
        socket.off('connect');
        socket.off('error');
        socket.off('disconnect');
        console.log(`🧹 [Notification] Removed Socket.IO listeners, Timestamp: ${new Date().toISOString()}`);
      };
    } else {
      console.log(`⚠️ [Notification] No socket instance, skipping listeners, Timestamp: ${new Date().toISOString()}`);
    }
  }, [socket]);

  // Monitor socket connection changes
  useEffect(() => {
    if (socket) {
      const handleConnect = () => {
        console.log(`🔌 [Notification] Socket connected in monitor useEffect, ID: ${socket.id}`);
      };
      
      const handleDisconnect = (reason) => {
        console.log(`🔌 [Notification] Socket disconnected in monitor useEffect, Reason: ${reason}`);
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, [socket]);

  // Clock
  useEffect(() => {
    console.log(`⏰ [Notification] Setting up clock interval, Timestamp: ${new Date().toISOString()}`);
    const timer = setInterval(() => {
      const newTime = new Date();
      setCurrentDateTime(newTime);
      console.log(`⏰ [Notification] Updated currentDateTime: ${newTime.toISOString()}, Timestamp: ${new Date().toISOString()}`);
    }, 1000);
    return () => {
      console.log(`🧹 [Notification] Clearing clock interval, Timestamp: ${new Date().toISOString()}`);
      clearInterval(timer);
    };
  }, []);

  // Filter reminders by date
  useEffect(() => {
    console.log(`📅 [Notification] Filtering reminders, Selected Date: ${selectedDate}, Timestamp: ${new Date().toISOString()}`);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
      console.log(`📅 [Notification] Formatted date: ${formattedDate}, Timestamp: ${new Date().toISOString()}`);
      const filtered = liveClassReminders.filter((r) => r.date === formattedDate);
      setFilteredReminders(filtered);
      console.log(`💾 [Notification] Updated filteredReminders:`, filtered, `Timestamp: ${new Date().toISOString()}`);
    } else {
      console.log(`📅 [Notification] No date selected, using all reminders, Timestamp: ${new Date().toISOString()}`);
      setFilteredReminders(liveClassReminders);
      console.log(`💾 [Notification] Updated filteredReminders:`, liveClassReminders, `Timestamp: ${new Date().toISOString()}`);
    }
  }, [selectedDate]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!token) return;
      try {
        const res = await getUnreadNotificationCountApi(token);
        if (res.success) {
          setUnreadCount(res.data.count || 0);
        }
      } catch (err) {
        console.error("❌ Failed to fetch unread count:", err.message);
      }
    };

    fetchUnreadCount();
  }, [token, dbNotifications]);

  // Demo reminders
  const liveClassReminders = [
    { id: 1, courseName: 'Data Science', date: '03/15/2025', time: '2:00 PM' },
    { id: 2, courseName: 'Applied Mathematics', date: '03/15/2025', time: '2:00 PM' },
    { id: 3, courseName: 'Applied Statistics', date: '03/15/2025', time: '2:00 PM' },
  ];
  console.log(`📅 [Notification] Initialized liveClassReminders:`, liveClassReminders, `Timestamp: ${new Date().toISOString()}`);

  // Handle upload click with notification and internship letter IDs
  const handleUploadClick = (notificationId, internshipLetterId) => {
    console.log(`🖱️ [Notification] Upload button clicked, Notification ID: ${notificationId}, InternshipLetterId: ${internshipLetterId}, Timestamp: ${new Date().toISOString()}`);
    setSelectedNotificationId(notificationId);
    setSelectedInternshipLetterId(internshipLetterId);
    setIsModalOpen(true);
    console.log(`💾 [Notification] Updated isModalOpen: true, selectedNotificationId: ${notificationId}, selectedInternshipLetterId: ${internshipLetterId}, Timestamp: ${new Date().toISOString()}`);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log(`📂 [Notification] Selected file:`, file, `Timestamp: ${new Date().toISOString()}`);
    setSelectedFile(file);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile || !selectedInternshipLetterId || !token) {
      console.error(`⚠️ [Notification] Missing required data for upload - File: ${selectedFile}, InternshipLetterId: ${selectedInternshipLetterId}, Token: ${token}, Timestamp: ${new Date().toISOString()}`);
      toast.error('Please select a file and ensure an internship letter is selected.');
      return;
    }

    try {
      console.log(`📤 [Notification] Calling uploadInternshipLetterApi, InternshipLetterId: ${selectedInternshipLetterId}, File: ${selectedFile.name}, Timestamp: ${new Date().toISOString()}`);
      const res = await uploadInternshipLetterApi({
        internshipLetterId: selectedInternshipLetterId,
        file: selectedFile,
        authToken: token,
      });
      console.log(`📩 [Notification] Upload API Response:`, res, `Timestamp: ${new Date().toISOString()}`);

      if (res.success) {
        console.log(`✅ [Notification] File uploaded successfully, Response:`, res, `Timestamp: ${new Date().toISOString()}`);
        setUploadedLetters((prev) => [...prev, {
          internshipLetterId: selectedInternshipLetterId,
          fileName: selectedFile.name,
          fileUrl: res.data,
          courseName: dbNotifications.find(n => n._id === selectedNotificationId)?.data?.courseId || 'Unknown',
          userName: 'Unknown',
          uploadedAt: new Date().toISOString(),
        }]);
        
        toast.success(`✅ File uploaded successfully!\nLink: ${res.data}`);
        console.log(`💾 [Notification] Updated uploadedLetters:`, uploadedLetters, `Timestamp: ${new Date().toISOString()}`);

        if (selectedNotificationId) {
          console.log(`📌 [Notification] Marking notification as read, NotificationId: ${selectedNotificationId}, Timestamp: ${new Date().toISOString()}`);
          const readRes = await markNotificationReadApi({
            notificationId: selectedNotificationId,
            authToken: token,
          });
          console.log(`📩 [Notification] Mark read API Response:`, readRes, `Timestamp: ${new Date().toISOString()}`);

          if (readRes.success) {
            console.log(`✅ [Notification] Notification marked as read, NotificationId: ${selectedNotificationId}, Timestamp: ${new Date().toISOString()}`);
            setDbNotifications((prev) =>
              prev.map((n) =>
                n._id === selectedNotificationId ? { ...n, isRead: true } : n
              )
            );
            console.log(`💾 [Notification] Updated dbNotifications with read status:`, dbNotifications, `Timestamp: ${new Date().toISOString()}`);
          } else {
            console.error(`❌ [Notification] Failed to mark notification as read, Response:`, readRes, `Timestamp: ${new Date().toISOString()}`);
            toast.error('Failed to mark notification as read.');
          }
        }

        setIsModalOpen(false);
        setSelectedFile(null);
        setSelectedNotificationId(null);
        setSelectedInternshipLetterId(null);
        console.log(`💾 [Notification] Reset modal state, isModalOpen: false, selectedFile: null, selectedNotificationId: null, selectedInternshipLetterId: null, Timestamp: ${new Date().toISOString()}`);
      } else {
        console.error(`❌ [Notification] Upload failed, Response:`, res, `Timestamp: ${new Date().toISOString()}`);
        toast.error('Failed to upload file. Please try again.');
      }
    } catch (err) {
      console.error(`❌ [Notification] Error uploading file:`, err.message, `Timestamp: ${new Date().toISOString()}`);
      toast.error('Error uploading file. Please try again.');
    }
  };

  // Handle marking notification as read
  const handleMarkAsRead = async (notificationId) => {
    console.log(`📌 [Notification] Marking notification as read, NotificationId: ${notificationId}, Timestamp: ${new Date().toISOString()}`);
    try {
      const res = await markNotificationReadApi({ notificationId, authToken: token });
      console.log(`📩 [Notification] Mark read API Response:`, res, `Timestamp: ${new Date().toISOString()}`);
      if (res.success) {
        console.log(`✅ [Notification] Notification marked as read, NotificationId: ${notificationId}, Timestamp: ${new Date().toISOString()}`);
        setDbNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        console.log(`💾 [Notification] Updated dbNotifications with read status:`, dbNotifications, `Timestamp: ${new Date().toISOString()}`);
      } else {
        console.error(`❌ [Notification] Failed to mark notification as read, Response:`, res, `Timestamp: ${new Date().toISOString()}`);
        toast.error('Failed to mark notification as read. Please try again.');
      }
    } catch (err) {
      console.error(`❌ [Notification] Error marking notification as read:`, err.message, `Timestamp: ${new Date().toISOString()}`);
      toast.error('Error marking notification as read. Please try again.');
    }
  };

  // Handle remove notification
  const handleRemoveNotification = (notificationId) => {
    console.log(`🗑️ [Notification] Removing notification, NotificationId: ${notificationId}, Timestamp: ${new Date().toISOString()}`);
    setDbNotifications((prev) => {
      const updatedNotifications = prev.filter((n) => n._id !== notificationId);
      console.log(`💾 [Notification] Updated dbNotifications after removal:`, updatedNotifications, `Timestamp: ${new Date().toISOString()}`);
      return updatedNotifications;
    });
  };

  // Handle remove internship request
  const handleRemoveInternshipRequest = (internshipLetterId) => {
    console.log(`🗑️ [Notification] Removing internship request, InternshipLetterId: ${internshipLetterId}, Timestamp: ${new Date().toISOString()}`);
    setInternshipRequests((prev) => {
      const updatedRequests = prev.filter((req) => req.internshipLetterId !== internshipLetterId);
      console.log(`💾 [Notification] Updated internshipRequests after removal:`, updatedRequests, `Timestamp: ${new Date().toISOString()}`);
      return updatedRequests;
    });
  };

  // Handle remove uploaded letter
  const handleRemoveUploadedLetter = (internshipLetterId) => {
    console.log(`🗑️ [Notification] Removing uploaded letter, InternshipLetterId: ${internshipLetterId}, Timestamp: ${new Date().toISOString()}`);
    setUploadedLetters((prev) => {
      const updatedLetters = prev.filter((letter) => letter.internshipLetterId !== internshipLetterId);
      console.log(`💾 [Notification] Updated uploadedLetters after removal:`, updatedLetters, `Timestamp: ${new Date().toISOString()}`);
      return updatedLetters;
    });
  };

  // Handle close modal
  const handleCloseModal = () => {
    console.log(`🖱️ [Notification] Close modal clicked, Timestamp: ${new Date().toISOString()}`);
    setIsModalOpen(false);
    setSelectedFile(null);
    setSelectedNotificationId(null);
    setSelectedInternshipLetterId(null);
    console.log(`💾 [Notification] Updated isModalOpen: false, selectedFile: null, selectedNotificationId: null, selectedInternshipLetterId: null, Timestamp: ${new Date().toISOString()}`);
  };

  // Handle send global notification
  const handleSendGlobalNotification = async () => {
    if (!globalTitle || !globalBody) {
      toast.error('Please provide both title and body for the notification.');
      return;
    }
    try {
      const payload = {
        title: globalTitle,
        body: globalBody,
        data: globalData ? { customData: { message: globalData } } : {},
        authToken: token,
      };

      console.log(`📬 [Notification] Sending global notification, Payload:`, payload, `Timestamp: ${new Date().toISOString()}`);
      const res = await sendGlobalNotificationApi(payload);
      console.log(`✅ [Notification] Global notification sent:`, res, `Timestamp: ${new Date().toISOString()}`);

      toast.success(res.message || 'Global notification sent successfully!');
      setGlobalTitle('');
      setGlobalBody('');
      setGlobalData('');
    } catch (err) {
      console.error(`❌ [Notification] Error sending global notification:`, err.message, `Timestamp: ${new Date().toISOString()}`);
      toast.error('Failed to send global notification. Please try again.');
    }
  };

  console.log(`📺 [Notification] Rendering component, State:`, {
    isModalOpen,
    selectedDate,
    filteredReminders: filteredReminders.length,
    dbNotifications: dbNotifications.length,
    internshipRequests: internshipRequests.length,
    uploadedLetters: uploadedLetters.length,
    selectedFile: selectedFile?.name,
    selectedNotificationId,
    selectedInternshipLetterId,
    globalTitle,
    globalBody,
    globalData,
  }, `Timestamp: ${new Date().toISOString()}`);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1);
        }
        .notification-box {
          border-left: 4px solid #f97316; /* Orange border */
          background-color: #f9fafb; /* Light gray background */
          border-radius: 8px;
          padding: 1rem;
        }
      `}</style>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Notification</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            {currentDateTime.toLocaleString('en-US', {
              weekday: 'short',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
              timeZone: 'Asia/Kolkata',
            })}
          </span>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => console.log(`🔎 [Notification] Search input: ${e.target.value}, Timestamp: ${new Date().toISOString()}`)}
            />
          </div>
          <div className="relative">
            <FaBell
              className="text-gray-600 text-xl cursor-pointer"
              onClick={() => {
                console.log(`🔔 [Notification] Bell icon clicked, Timestamp: ${new Date().toISOString()}`);
                toast.info('🔔 Notifications panel clicked');
              }}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <img
            src={profile?.profileImageUrl || profileImg}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
            onClick={() => {
              console.log(`👤 [Notification] Profile clicked, Timestamp: ${new Date().toISOString()}`);
              toast.info('👤 Profile clicked');
            }}
          />
        </div>
      </div>

      {/* 🔔 New Notification Banner */}
      {showNewNotificationBanner && lastNotification && (
        <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 rounded-lg animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🔔</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  New Internship Letter Request Received!
                </p>
                <p className="text-sm text-green-700">
                  {lastNotification.userName} requested internship letter for {lastNotification.courseName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNewNotificationBanner(false)}
              className="text-green-500 hover:text-green-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 📩 Stored Notifications from Backend */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Send Global Notification</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Notification Title"
            value={globalTitle}
            onChange={(e) => setGlobalTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <textarea
            placeholder="Notification Body"
            value={globalBody}
            onChange={(e) => setGlobalBody(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows="4"
          />
          <input
            type="text"
            placeholder="Additional Data (optional)"
            value={globalData}
            onChange={(e) => setGlobalData(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleSendGlobalNotification}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded hover:from-orange-600 hover:to-yellow-600 transition flex items-center gap-2"
            disabled={!globalTitle || !globalBody}
          >
            <FaBell className="text-white" />
            Send Global Notification
          </button>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Received Notifications</h2>
        {dbNotifications.length === 0 ? (
          <p className="text-gray-500 mt-4">No notifications found</p>
        ) : (
          <div className="space-y-4 mt-4">
            {dbNotifications.map((n, idx) => (
              <div
                key={idx}
                className="notification-box relative"
              >
                <button
                  className="absolute top-4 left-4 bg-blue-400 hover:bg-blue-500 w-6 h-6 rounded flex items-center justify-center transition"
                  onClick={() => handleRemoveNotification(n._id)}
                >
                  <FaTimes className="text-white text-xs" />
                </button>
                <div className="ml-12">
                  <p className="text-orange-500 font-bold text-lg mb-2">{n.title || 'No Title'}</p>
                  <p className="text-gray-700 text-sm mb-2">{n.body || 'No Body'}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'No Date'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUploadClick(n._id, n.data.internshipLetterId)}
                      className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition flex items-center gap-2"
                    >
                      Upload
                    </button>
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n._id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition flex items-center gap-2"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📤 Internship Requests */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Internship Letter Requests 
          {internshipRequests.length > 0 && (
            <span className="ml-2 bg-orange-500 text-white px-2 py-1 rounded-full text-sm">
              {internshipRequests.length}
            </span>
          )}
        </h2>
        {internshipRequests.length === 0 ? (
          <p className="text-gray-500">No internship letter requests</p>
        ) : (
          <div className="space-y-4">
            {internshipRequests.map((request, idx) => (
              <div
                key={idx}
                id={`internship-request-${request.internshipLetterId}`}
                className="bg-gray-50 rounded-lg p-6 relative border-l-4 border-orange-500 transition-all duration-300"
              >
                <button
                  className="absolute top-4 left-4 bg-blue-400 hover:bg-blue-500 w-6 h-6 rounded flex items-center justify-center transition"
                  onClick={() => handleRemoveInternshipRequest(request.internshipLetterId)}
                >
                  <FaTimes className="text-white text-xs" />
                </button>
                <div className="ml-12">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-orange-500 font-bold text-lg">Internship Letter Request</p>
                    <span className="text-xs text-gray-500">
                      {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Course:</strong> {request.courseName || 'Unknown'}
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Student:</strong> {request.userName || 'Unknown'}
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-sm font-medium">{request.status || 'Pending'}</span>
                      <FaCheck className="text-green-600 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 text-sm font-medium">
                        Payment: {request.paymentStatus ? '✅ Completed' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUploadClick(request._id, request.internshipLetterId)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition flex items-center gap-2"
                  >
                    Upload
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📤 Uploaded Internship Letters */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Uploaded Internship Letters</h2>
        {uploadedLetters.length === 0 ? (
          <p className="text-gray-500">No uploaded internship letters</p>
        ) : (
          <div className="space-y-4">
            {uploadedLetters.map((letter, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-6 relative border-l-4 border-orange-500"
              >
                <button
                  className="absolute top-4 left-4 bg-blue-400 hover:bg-blue-500 w-6 h-6 rounded flex items-center justify-center transition"
                  onClick={() => handleRemoveUploadedLetter(letter.internshipLetterId)}
                >
                  <FaTimes className="text-white text-xs" />
                </button>
                <div className="ml-12">
                  <p className="text-orange-500 font-bold text-lg mb-2">Uploaded Internship Letter</p>
                  <p className="text-gray-700 text-sm mb-2">Course - {letter.courseName || 'Unknown'}</p>
                  <p className="text-gray-700 text-sm mb-2">Name - {letter.userName || 'Unknown'}</p>
                  <p className="text-gray-700 text-sm mb-2">File - {letter.fileName || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Uploaded on - {letter.uploadedAt ? new Date(letter.uploadedAt).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📤 Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-96 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 text-xl hover:text-gray-700"
            >
              ✕
            </button>
            <div className="text-center">
              <div className="mb-6">
                <div className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                  <input
                    type="file"
                    id="uploadFile"
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="uploadFile"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <FaUpload className="text-gray-400 text-3xl mb-2" />
                    <p className="text-gray-600 font-medium">CHOOSE FILE</p>
                  </label>
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">Selected: {selectedFile.name}</p>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  The Image dimension should be 456 × 216 px for images, or upload a PDF
                </p>
              </div>
              <button
                onClick={handleFileUpload}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-yellow-600 transition"
                disabled={!selectedFile}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;