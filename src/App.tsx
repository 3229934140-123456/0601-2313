import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Calendar from "@/pages/Calendar";
import Login from "@/pages/Login";
import Booking from "@/pages/Booking";
import Entry from "@/pages/Entry";
import Reschedule from "@/pages/Reschedule";
import Courses from "@/pages/Courses";
import Feedback from "@/pages/Feedback";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Toast from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";

const pageTitles: Record<string, string> = {
  "/calendar": "场地日历",
  "/member": "会员识别",
  "/booking": "预约下单",
  "/verify": "入场核验",
  "/entry": "入场核验",
  "/reschedule": "临时改签",
  "/course": "课程报名",
  "/notice": "公告与反馈",
};

function AnimatedRoutes() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "智慧体育场馆";

  return (
    <>
      <Header title={title} />
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full w-full"
          >
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/calendar" replace />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/member" element={<Login />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/verify" element={<Entry />} />
              <Route path="/entry" element={<Entry />} />
              <Route path="/reschedule" element={<Reschedule />} />
              <Route path="/course" element={<Courses />} />
              <Route path="/notice" element={<Feedback />} />
              <Route
                path="*"
                element={
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl mb-6">🏟️</div>
                      <p className="text-2xl font-bold text-slate-700 mb-2">页面即将上线</p>
                      <p className="text-slate-400 mb-6">请从左侧导航栏选择功能模块</p>
                    </div>
                  </div>
                }
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 grain-bg">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AnimatedRoutes />
        </div>
        <Toast />
        <Modal />
      </div>
    </Router>
  );
}
