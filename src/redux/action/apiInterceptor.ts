import { getStorageItem } from "../../Common/Common";

const myHeaders = new Headers({
  Accept: "application/json",
  "Content-Type": "application/json;charset=UTF-8",
  "ClientApplication": "NetZoom",
});
const getTodayTimeString = () => {
  const today = new Date();
    // Get the time components
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');
    const miliseconds = String(today.getMilliseconds()).padStart(3, '0');
    // Create a formatted date string
    const formattedDateString = `${hours}:${minutes}:${seconds}:${miliseconds}`;
  
    return formattedDateString;
  }

const fetchInterceptor = (url: string, body: any, method: any = null, headers: any = null) => {
    return new Promise<any>(async (resolve, reject) => {
      
      const startTime = performance.now();
      console.log('url', url)
      let apiUrlArray: any = url.split('/');
      let actionLog: any = [];
      let apiName = apiUrlArray?.length > 0 ? apiUrlArray[apiUrlArray.length - 1] : url;
      let timeStamp = getTodayTimeString();
      try {
      
      let newHeaders: any = new Headers(myHeaders);
      if (headers != null) {
        newHeaders = {
          ...myHeaders, ...headers,
          //  Authorization: `Basic ${encodedCredentials}` 
          //  Authorization: `Basic ${encodedCredentials}` 
        }
      }
      console.log('apiName :', apiName, timeStamp);
       
        const start = new Date().getTime();
        let options: any = {};
        let session_data = getStorageItem("sessionID");
        console.log('session_data fetch :', session_data);
        options.headers = newHeaders;
        options.cache = "no-cache";
        options.method = method ? method : "POST";

        if (headers == null && (session_data && !session_data.includes("null")) || (body && body.sessionId && !body.sessionId.includes("null"))) {
          body.sessionId = body.sessionId ? body.sessionId : session_data;
          console.log('body.sessionId :', body.sessionId, url);
        }
        if (!method && body) {
          options.body = JSON.stringify(body);
        }
        const response = await fetch(url, options);
        if (response.status === 200) {
          const result = await response.json();
          resolve(result);
        } else {
          reject(new Error(`Failed to fetch data with status ${response.status}`));
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  export const fetchInterceptorWithOutUpdateInfo = (url: any, body: any) => {
    const myHeaders = new Headers({
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
      "ClientApplication": "NetZoom",
    });

    return new Promise<any>((resolve, reject) => {
      const startTime = performance.now();
      let apiUrlArray: any = url.split('/');
      let apiName = apiUrlArray?.length > 0 ? apiUrlArray[apiUrlArray.length - 1] : url;
      try {
        const start = new Date().getTime();
        let options: any = {};
        options.headers = myHeaders;
        options.cache = "no-cache";
        options.method = "POST";
        body.sessionId = body.sessionId ? body.sessionId : getStorageItem("sessionID");
        options.body = JSON.stringify(body);
  
        fetch(url, options)
          .then((response) => {
            if (response.status === 200) {
              return response.json();
            } else {
              throw new Error('Failed to fetch data');
            }
          }).then((result: any) => {
            const executionTime = Math.abs(performance.now() - startTime);
            const end = new Date().getTime() - start;
            resolve(result);
          });
      } catch (error) {
        reject(error);
      }
    });
  };
export default fetchInterceptor;
  