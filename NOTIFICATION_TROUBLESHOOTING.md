# 🔔 Notification Troubleshooting Guide

## 🚨 **Issue: Notifications Not Showing When Using Other Applications**

If notifications are working in the browser console but not appearing as popups when you're using other applications, follow these steps:

## 🔧 **Step-by-Step Solutions**

### 1. **Check Browser Notification Settings**

#### Chrome/Edge:
1. Go to `chrome://settings/content/notifications`
2. Find your website (`localhost:5173` or your domain)
3. Ensure it's set to **"Allow"**
4. Check "Quiet notifications" is **OFF**

#### Firefox:
1. Go to `about:preferences#privacy`
2. Scroll to "Permissions" section
3. Click "Settings" next to "Notifications"
4. Ensure your site is **"Allow"**

### 2. **Check Windows Notification Settings**

1. **Windows Settings** → **System** → **Notifications & actions**
2. Ensure **"Get notifications from apps and other senders"** is **ON**
3. Scroll down to **"Get notifications from these senders"**
4. Find your browser (Chrome, Firefox, Edge) and ensure it's **ON**
5. Click on your browser and ensure **"Show notification banners"** is **ON**

### 3. **Check Focus Assist (Windows)**

1. **Windows Settings** → **System** → **Focus assist**
2. Ensure it's set to **"Off"** or **"Priority only"**
3. If using **"Priority only"**, add your browser to the priority list

### 4. **Check Do Not Disturb Mode**

1. **Windows Settings** → **System** → **Notifications & actions**
2. Ensure **"Do not disturb"** is **OFF**
3. Check if **"Quiet hours"** is enabled and disable it

### 5. **Browser-Specific Settings**

#### Chrome:
1. Open Chrome
2. Go to `chrome://settings/content/notifications`
3. Click **"Add"** if your site isn't listed
4. Add: `http://localhost:5173` or your domain
5. Set to **"Allow"**

#### Edge:
1. Open Edge
2. Go to `edge://settings/content/notifications`
3. Follow same steps as Chrome

#### Firefox:
1. Open Firefox
2. Go to `about:preferences#privacy`
3. Scroll to "Permissions" → "Notifications" → "Settings"
4. Add your site and set to **"Allow"**

### 6. **Test Notification Permissions**

Use the **NotificationTest** component in your admin panel:

1. Click **"⚙️ Check Settings"** to see current status
2. Click **"🧪 Run All Tests"** to test all functionality
3. Click **"🔔 Test Notification"** to test display

### 7. **Force Notification Permission**

If permissions are still not working:

```javascript
// Run this in browser console
Notification.requestPermission().then(permission => {
  console.log('Permission:', permission);
  if (permission === 'granted') {
    new Notification('Test', {
      body: 'This should show as a popup',
      requireInteraction: true
    });
  }
});
```

### 8. **Check Service Worker Status**

1. Open **Developer Tools** (F12)
2. Go to **Application** tab
3. Click **Service Workers** in the left sidebar
4. Ensure your service worker is **active**
5. Check for any errors

### 9. **Browser Console Commands**

Run these in your browser console to debug:

```javascript
// Check notification support
console.log('Notifications supported:', 'Notification' in window);

// Check permission
console.log('Permission:', Notification.permission);

// Check service worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
});

// Test notification
if (Notification.permission === 'granted') {
  new Notification('Debug Test', {
    body: 'Testing notification display',
    requireInteraction: true,
    tag: 'debug-test'
  });
}
```

## 🎯 **Common Issues & Solutions**

### Issue: "Notifications are blocked"
**Solution**: Follow steps 1-3 above to enable notifications

### Issue: "Service worker not registered"
**Solution**: Refresh the page and check the Application tab in DevTools

### Issue: "Permission denied"
**Solution**: Clear browser data and re-request permission

### Issue: "Notifications work in console but not as popups"
**Solution**: Check Windows notification settings (steps 2-4)

## 🔍 **Advanced Debugging**

### Check Notification Queue:
```javascript
// Check if notifications are being queued
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    reg.getNotifications().then(notifications => {
      console.log('Queued notifications:', notifications);
    });
  }
});
```

### Test Different Focus States:
```javascript
// Test when page is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    new Notification('Page Hidden Test', {
      body: 'Testing when page is hidden',
      requireInteraction: true
    });
  }
});
```

## 📞 **Still Not Working?**

If notifications still don't show as popups:

1. **Try a different browser** (Chrome, Firefox, Edge)
2. **Check Windows Event Viewer** for notification errors
3. **Disable antivirus/firewall** temporarily for testing
4. **Use incognito/private mode** to test
5. **Check if notifications work on other websites**

## ✅ **Success Indicators**

You'll know it's working when:
- ✅ Notifications appear as popups in the bottom-right corner
- ✅ You hear notification sounds
- ✅ Notifications show even when using other applications
- ✅ Notifications persist until you click them

---

**Need more help?** Check the browser console for detailed error messages and share them for further assistance.
