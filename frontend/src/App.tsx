import React from "react";
import {Navigate, Route, HashRouter, Routes} from "react-router-dom";
import Login from "./pages/Login";
import HomeLayout from "./pages/HomeLayout";
import Ticket from "./pages/Ticket";
import Reports from "./pages/Reports";
import "./App.css";
import {useAuthState} from "./states/AuthState";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// import "./themes/themes.css";
// function App() {
//   const [greetMsg, setGreetMsg] = useState("");
//   const [name, setName] = useState("");
//   const [counter, setCounter] = useState(0);
//
//   // Function to call the greet command
//   async function greet() {
//     setGreetMsg(await invoke("greet", { name }));
//   }
//
//   // Function to increment the stop counter
//   async function incrementCounter() {
//     const routeId = 1; // Example route ID
//     const stopId = 1; // Example stop ID
//     const hour = new Date().getHours();
//     const minute = new Date().getMinutes();
//
//     // Increment the counter
//     await invoke("increment_stop_counter", {
//       routeId,
//       stopId,
//       hour,
//       minute,
//     });
//
//     // Fetch the updated counter
//     const updatedCounter = await invoke("get_stop_counter", {
//       routeId,
//       stopId,
//       hour,
//       minute,
//     });
//
//     setCounter(updatedCounter as number);
//   }
//
//   return (
//     <main className="container">
//       <h1>Welcome to Tauri + React</h1>
//
//       <div className="row">
//         <a href="https://vitejs.dev" target="_blank">
//           <img src="/vite.svg" className="logo vite" alt="Vite logo" />
//         </a>
//         <a href="https://tauri.app" target="_blank">
//           <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
//         </a>
//         <a href="https://reactjs.org" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <p>Click on the Tauri, Vite, and React logos to learn more.</p>
//
//       <form
//         className="row"
//         onSubmit={(e) => {
//           e.preventDefault();
//           greet();
//         }}
//       >
//         <input
//           id="greet-input"
//           onChange={(e) => setName(e.currentTarget.value)}
//           placeholder="Enter a name..."
//         />
//         <button type="submit">Greet</button>
//       </form>
//       <p>{greetMsg}</p>
//
//       <div className="counter-section">
//         <h2>Stop Counter</h2>
//         <button onClick={incrementCounter}>Increment Counter</button>
//         <p>Current Counter: {counter}</p>
//       </div>
//     </main>
//   );
// }

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isAuthenticated = useAuthState((state) => state.user !== null);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {

    return (
        <HashRouter>
            <Routes>
                <Route index element={<Login />} /> {/* Default route */}
                {/* Login Route */}
                <Route path="/login" element={<Login />} />

                {/* Home Route */}
                <Route path="/home" element={
                    <ProtectedRoute>
                        <HomeLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Ticket />} /> {/* Default route */}
                    <Route path="ticket" element={<Ticket />} />
                    <Route path="reports" element={<Reports />} />
                </Route>

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
            <ToastContainer />
        </HashRouter>
    );
};

export default App;
