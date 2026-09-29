// AdminDashboard.jsx - Fixed Structure
import { useState, useRef, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddUserModal from "../components/AddUserModal";
import AddProjectModal from "../components/AddProjectModal";
import "./AdminDashboard.css";

function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  // AI Voice Assistant States
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  const openAddUser = () => {
    setIsAddUserOpen(true);
  };

  const openAddProject = () => {
    setIsAddProjectOpen(true);
  };

  const closeAddUser = () => {
    setIsAddUserOpen(false);
  };

  const closeAddProject = () => {
    setIsAddProjectOpen(false);
  };

  // AI Voice Assistant Functions
  const startListening = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setTranscript("");
      speak("Listening for your command.");
    };

    recognitionRef.current.onresult = (event) => {
      const speechResult = event.results[0][0].transcript.toLowerCase();
      setTranscript(speechResult);
      processCommand(speechResult);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      speak("Sorry, I didn't catch that. Please try again.");
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      synthRef.current.speak(utterance);
    }
  };

  const processCommand = (command) => {
    setAiResponse(`You said: "${command}"`);

    // English Commands
    if (
      command.includes("add project") ||
      command.includes("add a new project") ||
      command.includes("create project") ||
      command.includes("new project") ||
      command.includes("add new project") ||
      command.includes("make a project") ||
      command.includes("project add") ||
      command.includes("start a project") ||
      command.includes("begin project") ||
      command.includes("initiate project")
    ) {
      openAddProject();
      speak("Opening add project modal.");
    } else if (command.includes("add user")) {
      openAddUser();
      speak("Opening add user modal.");
    } else if (command.includes("edit user")) {
      navigate("/admin/users");
      speak("Navigating to manage users to edit a user.");
    } else if (command.includes("search user")) {
      const searchQuery = command.replace("search user", "").trim();
      if (searchQuery) {
        navigate(`/admin/users?search=${searchQuery}`);
        speak(`Searching for users with "${searchQuery}".`);
      } else {
        speak("Please specify what to search for.");
      }
    } else if (command.includes("search project")) {
      const searchQuery = command.replace("search project", "").trim();
      if (searchQuery) {
        navigate(`/projects?search=${searchQuery}`);
        speak(`Searching for projects with "${searchQuery}".`);
      } else {
        speak("Please specify what to search for.");
      }
    } else if (command.includes("manage users")) {
      navigate("/admin/users");
      speak("Navigating to manage users.");
    } else if (
      command.includes("view projects") ||
      command.includes("open the projects") ||
      command.includes("projects open") ||
      command.includes("project page open")
    ) {
      navigate("/projects");
      speak("Opening projects page.");
    } else if (command.includes("view analytics")) {
      navigate("/admin/analytics");
      speak("Navigating to system analytics.");
    } else if (command.includes("assign managers")) {
      navigate("/admin/assign");
      speak("Navigating to assign managers.");
    } else if (command.includes("logout")) {
      logout();
      speak("Logging out.");
    } else if (command.includes("open") && command.includes("new tab")) {
      const page = command.replace("open", "").replace("in new tab", "").trim();
      if (page.includes("users")) {
        window.open("/admin/users", "_blank");
        speak("Opening manage users in a new tab.");
      } else if (page.includes("projects")) {
        window.open("/projects", "_blank");
        speak("Opening projects in a new tab.");
      } else {
        speak("Sorry, I can only open users or projects in a new tab.");
      }
    } else if (command.includes("open")) {
      const page = command
        .replace("open", "")
        .replace("the", "")
        .replace("page", "")
        .trim();
      if (page.includes("projects")) {
        navigate("/projects");
        speak("Opening projects page.");
      } else if (page.includes("users")) {
        navigate("/admin/users");
        speak("Opening manage users page.");
      } else if (page.includes("analytics")) {
        navigate("/admin/analytics");
        speak("Opening system analytics page.");
      } else if (page.includes("assign")) {
        navigate("/admin/assign");
        speak("Opening assign managers page.");
      } else {
        speak(
          "Sorry, I can only open projects, users, analytics, or assign managers page.",
        );
      }
    } else if (command.includes("stop") || command.includes("cancel")) {
      stopListening();
      speak("Stopping voice assistant.");
    }

    // Hindi Commands
    else if (
      command.includes("प्रोजेक्ट जोड़") ||
      command.includes("add project hindi") ||
      command.includes("एक नया प्रोजेक्ट बनाओ") ||
      command.includes("नया प्रोजेक्ट बनाओ") ||
      command.includes("प्रोजेक्ट जोड़ो") ||
      command.includes("एक प्रोजेक्ट बनाओ") ||
      command.includes("प्रोजेक्ट शुरू करो") ||
      command.includes("नया प्रोजेक्ट शुरू") ||
      command.includes("प्रोजेक्ट बनाओ")
    ) {
      openAddProject();
      speak("प्रोजेक्ट जोड़ का मोडल खोल रहा हूँ।");
    } else if (
      command.includes("यूजर जोड़") ||
      command.includes("add user hindi")
    ) {
      openAddUser();
      speak("यूजर जोड़ का मोडल खोल रहा हूँ।");
    } else if (
      command.includes("यूजर एडिट") ||
      command.includes("edit user hindi")
    ) {
      navigate("/admin/users");
      speak("यूजर एडिट करने के लिए मैनेज यूजर पेज खोल रहा हूँ।");
    } else if (
      command.includes("यूजर खोज") ||
      command.includes("search user hindi")
    ) {
      const searchQuery = command
        .replace("यूजर खोज", "")
        .replace("search user hindi", "")
        .trim();
      if (searchQuery) {
        navigate(`/admin/users?search=${searchQuery}`);
        speak(`"${searchQuery}" के साथ यूजर खोज रहा हूँ।`);
      } else {
        speak("कृपया खोजने के लिए नाम बताएं।");
      }
    } else if (
      command.includes("प्रोजेक्ट खोज") ||
      command.includes("search project hindi")
    ) {
      const searchQuery = command
        .replace("प्रोजेक्ट खोज", "")
        .replace("search project hindi", "")
        .trim();
      if (searchQuery) {
        navigate(`/projects?search=${searchQuery}`);
        speak(`"${searchQuery}" के साथ प्रोजेक्ट खोज रहा हूँ।`);
      } else {
        speak("कृपया खोजने के लिए नाम बताएं।");
      }
    } else if (
      command.includes("यूजर्स मैनेज") ||
      command.includes("manage users hindi")
    ) {
      navigate("/admin/users");
      speak("यूजर्स मैनेज करने के लिए पेज खोल रहा हूँ।");
    } else if (
      command.includes("प्रोजेक्ट्स देख") ||
      command.includes("view projects hindi") ||
      command.includes("प्रोजेक्ट्स खोल") ||
      command.includes("प्रोजेक्ट पेज खोल")
    ) {
      navigate("/projects");
      speak("प्रोजेक्ट्स पेज खोल रहा हूँ।");
    } else if (
      command.includes("एनालिटिक्स देख") ||
      command.includes("view analytics hindi")
    ) {
      navigate("/admin/analytics");
      speak("सिस्टम एनालिटिक्स पेज खोल रहा हूँ।");
    } else if (
      command.includes("मैनेजर्स असाइन") ||
      command.includes("assign managers hindi")
    ) {
      navigate("/admin/assign");
      speak("मैनेजर्स असाइन करने के लिए पेज खोल रहा हूँ।");
    } else if (command.includes("लॉगआउट") || command.includes("logout hindi")) {
      logout();
      speak("लॉगआउट कर रहा हूँ।");
    } else if (command.includes("नया टैब में खोल")) {
      const page = command.replace("नया टैब में खोल", "").trim();
      if (page.includes("यूजर्स")) {
        window.open("/admin/users", "_blank");
        speak("यूजर्स को नए टैब में खोल रहा हूँ।");
      } else if (page.includes("प्रोजेक्ट्स")) {
        window.open("/projects", "_blank");
        speak("प्रोजेक्ट्स को नए टैब में खोल रहा हूँ।");
      } else {
        speak("मैं सिर्फ यूजर्स या प्रोजेक्ट्स को नए टैब में खोल सकता हूँ।");
      }
    } else if (command.includes("खोल")) {
      const page = command.replace("खोल", "").trim();
      if (page.includes("प्रोजेक्ट्स")) {
        navigate("/projects");
        speak("प्रोजेक्ट्स पेज खोल रहा हूँ।");
      } else if (page.includes("यूजर्स")) {
        navigate("/admin/users");
        speak("यूजर्स पेज खोल रहा हूँ।");
      } else if (page.includes("एनालिटिक्स")) {
        navigate("/admin/analytics");
        speak("एनालिटिक्स पेज खोल रहा हूँ।");
      } else if (page.includes("असाइन")) {
        navigate("/admin/assign");
        speak("असाइन पेज खोल रहा हूँ।");
      } else {
        speak(
          "मैं सिर्फ प्रोजेक्ट्स, यूजर्स, एनालिटिक्स, या असाइन पेज खोल सकता हूँ।",
        );
      }
    } else if (command.includes("रोक") || command.includes("कैंसल")) {
      stopListening();
      speak("वॉइस असिस्टेंट रोक रहा हूँ।");
    } else {
      speak(
        "क्षमा करें, मैंने सकता नहीं। कृपया 'प्रोजेक्ट जोड़' या 'add project' जैसे कमांड्स आजमाएं।",
      );
    }
  };

  // AdminDashboard.jsx - Part 4
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        const { data } = await axios.get(
          "https://project-management-backend-alpha.vercel.app/api/projects/requests",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setRequests(data.filter((r) => r.status === "pending"));
      } catch (error) {
        console.error(error);
      }
    };

    fetchRequests();
  }, []);

  const handleRequestAction = async (id, status) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      await axios.put(
        `https://project-management-backend-alpha.vercel.app/api/projects/request/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <h3>Welcome {user?.name}</h3>
        {/* AI Voice Assistant */}
        <div className="ai-assistant">
          <button
            onClick={isListening ? stopListening : startListening}
            className="ai-btn"
          >
            <i
              className={`fas ${isListening ? "fa-microphone-slash" : "fa-microphone"}`}
            ></i>
          </button>

          {isListening && <div className="listening-indicator"></div>}

          {transcript && <div className="transcript-popup">{transcript}</div>}

          {aiResponse && <div className="response-popup">{aiResponse}</div>}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Admin Controls Card */}
        <div className="card">
          <h4>Admin Controls</h4>
          <ul>
            <li onClick={() => navigate("/admin/users")}>
              <i className="fas fa-users icon"></i>
              <span>Manage All Users</span>
            </li>
            <li onClick={() => navigate("/projects")}>
              <i className="fas fa-project-diagram icon"></i>
              <span>Projects</span>
            </li>
            <li onClick={() => navigate("/admin/analytics")}>
              <i className="fas fa-chart-line icon"></i>
              <span>View System Analytics</span>
            </li>
            <li onClick={() => navigate("/admin/assign")}>
              <i className="fas fa-user-tie icon"></i>
              <span>Assign Managers</span>
            </li>
            <li onClick={() => navigate("/admin/requests")}>
              <i className="fas fa-file-signature icon"></i>
              <span>Project Requests</span>
              {requests.length > 0 && (
                <span className="badge-count">{requests.length}</span>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;