import apiUris from "../../Api/api-uris";
import fetchInterceptor,{fetchInterceptorWithOutUpdateInfo} from '../action/apiInterceptor';

export interface iCreateSessionPara {
    sessionId?: string|null;
    jsonSession?: string;
    isSystem?: boolean;
    Nz_isfromui?: boolean;
}
export const createSession = (payload: iCreateSessionPara | null) => {
    let headers = { "nz_sessionid": "", "nz_jsonsession": "", "nz_issystemsessionid": false, "Nz_isfromui": true };
    if (payload != null) {
        headers.nz_sessionid = payload.sessionId ? payload.sessionId : "";
        headers.nz_jsonsession = payload.jsonSession ? payload.jsonSession : "";
        headers.nz_issystemsessionid = payload.isSystem ? true : false;
        headers.Nz_isfromui = payload.Nz_isfromui ? true: true
    }

    return fetchInterceptor(apiUris.Session.CreateSession, null, null, headers);
}



export const updateSession = (jsonString: any, sessionId: string | null = null) => {
    return fetchInterceptorWithOutUpdateInfo(apiUris.Session.UpdateSession, {
        jsonSession: JSON.stringify(jsonString),
        sessionId: sessionId
    });
}


export const isSessionOpen = (sessionId: string | null = null) => {
    return fetchInterceptor(apiUris.Session.IsSessionOpen, { sessionId });
}
export const getOpenSessions = () => {
    return fetchInterceptor(apiUris.Session.GetOpenSession, {});
}

export function closeSession(embeddedSessionId: string | null = null, forceClose: boolean = false) {
    return fetchInterceptor(apiUris.Session.CloseSession, {
        sessionId: embeddedSessionId,
        forceClose: forceClose
    });
}





