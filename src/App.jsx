import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Auth pages (no sidebar)
import Login from "./Admin/Components/Auth/Login";
import Otp from "./Admin/Components/Auth/Otp";
// import Register from "./Admin/Components/Auth/Register";

// Layout (with sidebar)
import Layout from "./Admin/Common/Layout";
import Dashboard from "./Admin/Components/Dashboard/Dashboard";
import User from "./Admin/Components/Users/User";
import Courses from "./Admin/Components/Courses/Courses";
import Promo from "./Admin/Components/Promo/promo";
import Notification from "./Admin/Components/Notifications/Notification";
import Revenue from './Admin/Components/Revenue/revenue';
import SubCourse from "./Admin/Components/Courses/SubCourse";
import Lesson from "./Admin/Components/Courses/Lesson"; // ✅ New import
// import helpCenter from './Admin/Components/Settings/Helpcenter';

// Settings pages
import Profile from "./Admin/Components/Settings/Profile";
import Review from "./Admin/Components/Settings/Review";
 import HelpCenter from "./Admin/Components/Settings/HelpCenter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes without sidebar */}
        <Route path="/" element={<Login />} />
        <Route path="otp" element={<Otp />} />
        {/* <Route path="register" element={<Register />} /> */}

        {/* Protected routes with sidebar */}
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<User />} />
          <Route path="courses" element={<Courses />} />
          <Route path="promo" element={<Promo />} />
          <Route path="notifications" element={<Notification />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="subcourse/:id" element={<SubCourse />} />
          <Route path="lesson" element={<Lesson />} /> {/* ✅ New route */}

          {/* Settings sub-pages */}
          <Route path="settings/profile" element={<Profile />} />
          <Route path="settings/reviews" element={<Review />} />
          <Route path="settings/helpcenter" element={<HelpCenter/>}/>
          {/* <Route path="settings/helpcenter" element={<HelpCenter />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
