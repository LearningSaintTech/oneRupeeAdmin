import React, { useState, useRef, useContext } from 'react';
import Verify from '../../../assets/images/Verify OTP.svg';
import Lock from '../../../assets/images/Lock .svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken, setFcmToken, setDeviceId } from '../../redux/GlobalSlice';
import { verifyOtpApi } from '../../apis/LoginApi';
import { saveFcmTokenApi } from '../../apis/NotificationApi';
import { SocketContext } from '../../socket/SocketContext';
import { requestForToken, getDeviceId } from '../../Services/firebase';
import {jwtDecode} from "jwt-decode";

const OtpForm = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const { connectSocket } = useContext(SocketContext); // Access connectSocket from context

  const mobileNumber = location.state?.mobileNumber;
  console.log(`📞 [OtpForm] Mobile Number from state: ${mobileNumber}, Timestamp: ${new Date().toISOString()}`);

  const handleChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Verify OTP + Save Token + Initiate WebSocket
  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    console.log(`✅ [OtpForm] Entered OTP: ${enteredOtp}, Timestamp: ${new Date().toISOString()}`);

    if (enteredOtp.length !== 4) {
      setError('Please enter a valid 4-digit OTP.');
      console.log(`⚠️ [OtpForm] Invalid OTP length, Timestamp: ${new Date().toISOString()}`);
      return;
    }

    try {
      setLoading(true);
      // Get FCM token and device ID before OTP verification
      let fcmToken = null;
      let deviceId = null;
      
      try {
        console.log(`🔔 [OtpForm] Requesting FCM token before OTP verification...`);
        fcmToken = await requestForToken();
        deviceId = getDeviceId();
        console.log(`📱 [OtpForm] DeviceId: ${deviceId}, FCM Token: ${fcmToken ? fcmToken.substring(0, 20) + '...' : 'null'}, Timestamp: ${new Date().toISOString()}`);
      } catch (err) {
        console.error(`❌ [OtpForm] Failed to get FCM token: ${err}, Timestamp: ${new Date().toISOString()}`);
      }

      console.log(`📡 [OtpForm] Calling verifyOtpApi with: { mobileNumber: ${mobileNumber}, otp: ${enteredOtp}, fcmToken: ${fcmToken ? 'provided' : 'null'}, deviceId: ${deviceId} }, Timestamp: ${new Date().toISOString()}`);
      const data = await verifyOtpApi(mobileNumber, enteredOtp, fcmToken, deviceId);
      console.log(`📩 [OtpForm] API Response:`, data, `Timestamp: ${new Date().toISOString()}`);

      if (data.success) {
        const token = data.data?.token || data.token;
        const decoded = jwtDecode(token);
console.log(decoded);
        const adminId = decoded.userId; // Assuming API returns adminId
        console.log(`🔑 [OtpForm] Extracted token: ${token}, adminId: ${adminId}, Timestamp: ${new Date().toISOString()}`);

        if (token && adminId) {
          dispatch(setToken(token));
          console.log("adminId",adminId)
          localStorage.setItem('authToken', token);
          localStorage.setItem('adminId', adminId); // Save adminId
          console.log(`💾 [OtpForm] Token and adminId saved in Redux + localStorage, Timestamp: ${new Date().toISOString()}`);

          // Initiate WebSocket connection
          console.log(`🔗 [OtpForm] Initiating WebSocket connection for adminId: ${adminId}, Timestamp: ${new Date().toISOString()}`);
          connectSocket(adminId);

          // Save FCM token and device ID to Redux store
          if (fcmToken && deviceId) {
            dispatch(setFcmToken(fcmToken));
            dispatch(setDeviceId(deviceId));
            console.log(`💾 [OtpForm] FCM Token and DeviceId saved to Redux store, Timestamp: ${new Date().toISOString()}`);
          }
        } else {
          console.warn(`⚠️ [OtpForm] Token or adminId not found in API response, Timestamp: ${new Date().toISOString()}`);
        }

        navigate('/dashboard');
        console.log(`➡️ [OtpForm] Navigating to /dashboard, Timestamp: ${new Date().toISOString()}`);
      } else {
        console.error(`❌ [OtpForm] OTP Verification failed: ${data.message}, Timestamp: ${new Date().toISOString()}`);
        setError(data.message || 'Invalid OTP, please try again.');
      }
    } catch (err) {
      console.error(`🔥 [OtpForm] Verify OTP Error: ${err}, Timestamp: ${new Date().toISOString()}`);
      setError('Something went wrong, please try again later.');
    } finally {
      setLoading(false);
      console.log(`🏁 [OtpForm] OTP verification process completed, Loading: ${loading}, Timestamp: ${new Date().toISOString()}`);
    }
  };

  return (
    <div className="relative w-full h-screen mx-auto overflow-hidden">
      <img src={Verify} alt="Login Background" className="w-full h-full object-cover" />

      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-[#FF8800]/[0.1] backdrop-blur-lg p-6 rounded-2xl shadow-2xl text-center text-black w-[350px] h-[580px] flex flex-col items-center">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center">
          <img src={Lock} alt="Lock Icon" className="w-12 h-12" />
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-bold mb-0" style={{ lineHeight: '52px', color: '#003E54E5' }}>
            OTP Verification
          </h2>
          <p className="text-xs opacity-80 mb-6 px-2">
            Enter the 4 digit OTP code sent to your number.
          </p>
        </div>

        <div className="flex-1 w-full flex items-center justify-center">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="w-[60px] h-[60px] text-center text-lg border border-[#F6B800] rounded-lg bg-gradient-to-r from-[#F6B800]/[0.5] to-[#FF8800]/[0.5] text-gray-800 outline-none focus:border-purple-500 transition-all duration-200"
                placeholder="0"
              />
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

        <div className="w-full mt-auto space-y-4">
          <button
            onClick={handleVerify}
            disabled={loading}
            className="bg-gradient-to-r from-[#F6B800] to-[#FF8800] text-white py-3 px-8 rounded-xl font-bold text-base w-full mb-1 hover:opacity-90 transition-colors duration-200"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button className="border border-[#F6B800] text-[#F6B800] py-3 px-8 rounded-xl text-sm w-full hover:bg-gray-100 transition-colors duration-200">
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpForm;