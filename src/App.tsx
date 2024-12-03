import  { useState, useEffect, Suspense, lazy } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { createSession,isSessionOpen } from './redux/reducers/sessionService'
import { setStorageItem } from './Common/Common';
import Main from './Pages/Main/Main';
import LandingPage from './Pages/LandingPage/LandingPage';
function App() {
  const [showMainPage, setShowMainPage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMainPage(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showMainPage) {
      setLoading(true);
      const preload = import('./Pages/Main/Main').then(() => {
        setLoading(false);
      });
    }
  }, [showMainPage]);

  useEffect(() => {
    const session = sessionStorage.getItem("sessionID");
    if (session) {
        isSessionOpen(session).then((resp: any) => {
            if (resp && resp.data && resp.data.isOpen) {
                return;
            }
            createsession();
        }).catch((error) => {
            console.error("Error checking session:", error);
        });
    } else {
        createsession();
    }
}, [sessionId]);


  const createsession = async (oldSessionId:any = null) => {
    try {
  var payload = oldSessionId == null ? {} : { sessionId: oldSessionId };

  createSession(payload).then((resp:any) =>{
  if (resp){
    const data = resp.data;
    const newSessionID = data.newSessionID;

    const sessionVariable = JSON.parse(data.jsonSessionOutput);
    const sessionValue = sessionVariable.SessionVariables[0].SessionValues
    const sessiondata = JSON.stringify(sessionValue)

    setSessionId(newSessionID)
    if (newSessionID) {
      setStorageItem('sessionID', newSessionID);
      setStorageItem('session_variables',sessiondata)
      console.log("Session ID stored in sessionStorage:", newSessionID);
    }
  }
})

    } catch (error) {
      console.error("Error creating session:", error);
    }
  }

  

  return (
    <div className="App">
      {loading && (
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}

      <Suspense >
        {showMainPage ? <Main/> : <LandingPage />}
      </Suspense>
    </div>
  );
}

export default App;
