import { getDevicemodelSvg, getFilteredDevices,  getPropertiesForEqidlist,  getRelatedForFilteredDevice } from "../redux/action/libraryservice";
import { TreeNode, ITreeNode, iSessionData, IShouldSkip, iAPIResponse } from "../interface";
import { TreeNodeType } from "../interface";
import {APP} from '../interface'
import { DropableControlElementEnums, FEnums, reuseDataForFeatures } from "./enums";
import { iTreeProps } from "../interface";
import { getTreeNodeTitle, getTreeNodeIcon } from "./NZTreeNodeUpdater";
import { floorDevices, getRefList } from "../redux/action/dcservice";
import { store } from "../redux/store";
import { v4 as uuidv4 } from 'uuid'
import { ReactSVG } from "react-svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck,faCircleXmark,faPersonRunning } from "@fortawesome/free-solid-svg-icons";
import Image from "rc-image";
import { updateSession } from "../redux/reducers/sessionService";
import { fetchFloorDevicesConfigurationHierarchy, floorDevicesConfiguration, mountedDeviceConfiguration } from "../redux/action/explorerService";
export const getStorageItem = (key: string) => {
    return window.sessionStorage.getItem(key);
}
export const setStorageItem = (key: string, session: any) => {
  window.sessionStorage.setItem(key, session);
}

export const checkIsSuccess = (resp: any) => {
    if (resp &&
        resp.status != 200) {
        return false;
    } else {
        return true;
    }
}

// Library common Functions

export const insertSvgContentIntoOffice = async (
  svgContent: string,
  insertType: string,
  shapeCounter: number
): Promise<void> => {
  try {
    let left = 50 + 20 * shapeCounter;
    let top = 50;

    if (left > 400) {
      const extraY = Math.floor(left / 400);
      left = 50 + 20 * (shapeCounter - 18);
      top = 50 + 20 * extraY;
    }
console.log('svg d&d',svgContent)
    const options = {
      coercionType: Office.CoercionType.XmlSvg,
      imageLeft: left,
      imageTop: top,
    };

    await Office?.context?.document?.setSelectedDataAsync(svgContent, {
      ...options,
      asyncContext: { insertType },
    });

    console.log(`SVG inserted via ${insertType} at position (left: ${left}, top: ${top})`);
  } catch (error) {
    console.error(`Error during ${insertType}:`, error);
  }
};


interface SearchParams {
  keyword?: string;
  kwdSearchType?: string;
  related?: boolean;
  Eqid?: string;
  selectedManufacturer?: string;
  setSnackbarMessage?: (message: string) => void;
  setSnackbarOpen?: (open: boolean) => void;
  selectedEqType?: string;
  selectedProductLine?: string;
  selectedProductNumber?: string;
  selectedDtManufacturers?: string[];
  selectedManufacturerDetails?:string[]
}

type OnSuccess = (resultData: any[]) => void;
type OnError = (message: string) => void;

/**
  @param searchParams - Parameters for the search function
  @param onSuccess - Callback function for successful API call
  @param onError - Callback function for error in API call
 */
export const Search = async (
  searchParams: SearchParams,
  onSuccess: OnSuccess,
  onError: OnError
): Promise<void> => {
  const {
    keyword,
    Eqid,
    selectedEqType,
    selectedProductNumber,
    selectedManufacturerDetails,
  } = searchParams;


  if(!Eqid){
  try {
    getFilteredDevices(keyword,true,0,'',0,selectedManufacturerDetails,selectedEqType,'','',selectedProductNumber,'').then((resp) =>{
        const searchData = resp.data.deviceJson    
        const parse = JSON.parse(searchData)
        console.log("treedata", parse)

        if (searchData.length > 0 ) {
          onSuccess(searchData);
          
        } else {
          console.log('No relevant data found');
          onError('No results found');
    
        }
    })
   


  } catch (error: any) {
    console.error('Related not shown:', error.message);
    onError('An error occurred while fetching data');
  }
} else if(Eqid){
  try {
    getRelatedForFilteredDevice(0,'',Eqid).then((resp) =>{
        const relatedData = resp.data.deviceJson
        if(relatedData.length >0){
          onSuccess(relatedData)
        }else{
          console.log("related treedata not found")
        onError("No results found for related treedata")  
        }
    })
   
    
  } catch (error) {
 
  }
  
}
};

/**
 * Transforms search results into a tree data structure.
 * @param result - The search results to transform.
 * @returns The transformed tree data.
 */



  
export const transformToRcTreeData = (data: any): TreeNode[] => {
  const treeData: TreeNode[] = [];
  
  let parseddata = JSON.parse(data);
  // Add the root node titled "Search Result"
  const rootNode: TreeNode = {
    title: "Search Result",
    key: "root",
    icon: (
      <img
        src="./assets/Icons/main_node.png"
        alt="Search Results Icon"
        style={{ width: 16, height: 16 }}
      />
    ),
    children: treeData
  };

  if (parseddata?.Manufacturer) {
    for (let manufacturer of parseddata.Manufacturer) {
      let manufacturerNode: TreeNode = {
        title: manufacturer.Name,
        key: `manufacturer-${manufacturer.Name}`,
        icon: (
          <img
            src="./assets/Icons/manufacturer.png"
            alt="manufacturer"
            style={{ width: 16, height: 16 }}
          />
        ),
        children: []
      };

      if (manufacturer.EQType) {
        for (let eqType of manufacturer.EQType) {
          let eqTypeNode: TreeNode = {
            title: eqType.Name,
            key: `eqType-${eqType.Name}`,
            icon: (
              <img
                src={`./assets/EqType/${eqType.Name}.png`}
                alt="EQTYPE"
                style={{ width: 16, height: 16 }}
              />
            ),
            children: []
          };

          if (eqType.ProductNumber) {
            for (let product of eqType.ProductNumber) {
              let productNode: TreeNode = {
                title: (
                  <span title={product.Description}>
                    <span>{product.Name}</span>
                  </span>
                ),
                key: `${product.EQID}`,
                EQID: product.EQID,
                Description: product.Description,
                HasNetworkport: product.HasNetworkPorts,
                HasPowerPorts: product.HasPowerPorts,
                HasRelated: product.HasRelated,
                icon: (
                  <img
                    src="./assets/Icons/product_no.gif"
                    style={{ width: 16, height: 16 }}
                    alt="Product Number"
                  />
                ),
                children: []
              };

              if (product.Views) {
                for (let view of product.Views) {
                  let viewNode: TreeNode = {
                    title: view.Name,
                    key: `${view.ShapeID}`,
                    isLeaf: true,
                    ShapeID: view.ShapeID,
                    ProductNumber: product.Name,
                    icon: view.Name.toLowerCase().includes('front') ? (
                      <img src="./assets/Icons/Front.png" alt="Front icon" />
                    ) : view.Name.toLowerCase().includes('rear') ? (
                      <img src="./assets/Icons/Rear.png" alt="Rear icon" /> 
                    ) : view.Name.toLowerCase().includes('top') ? (
                      <img src="./assets/Icons/TopView.png" alt="Top Icon" />
                    ) : null,
                  };
                  productNode.children?.push(viewNode);
                }
              }

              eqTypeNode.children?.push(productNode);
            }
          }

          manufacturerNode.children?.push(eqTypeNode);
        }
      }

      treeData.push(manufacturerNode);
    }
  } 

  return [rootNode];

};



// export const autoExpandDefaultNodesOfTree = async (treeData: TreeNodeType[]) => {
//   let expKeys: any[] = [];
//   let selKeys: any[] = [];
//   let selNodes: any
//   let isSelected = false;

//   const expandAuto = async (nodes: TreeNodeType[]) => {
//     for (let index = 0; index < nodes.length; index++) {
//       const element = nodes[index];
//       expKeys.push(element.key);

//       if (element.children && element.children.length === 1) {
//         isSelected = false
//         await expandAuto(element.children);
//       } else if (element.children && element.children.length > 1) {
//         expKeys.push(element.key);
//         selKeys.push(element.children[0].key);
//         selNodes = element.children[0];
//         isSelected = true;
//         break;
//       } else {
//         selKeys.push(element.key);
//         selNodes = element;
//         break;
//       }
//     }
//   };

//   await expandAuto(treeData);
//   return { expandedKeys: expKeys, selectedKeys: selKeys, selectedNode: selNodes, isSelected };
// };

export const getSessionVariableFromStorage = (VariableContext: string = "", VariableName: string = "") => {
  
  let session_var_string = getStorageItem("session_variables");

  if (session_var_string && session_var_string.length > 0) {
      let session_var = JSON.parse(session_var_string);
      if (session_var && session_var.length > 0) {
          return session_var.filter((ele: any) => { return ele.VariableContext == (VariableContext && VariableContext != "" ? VariableContext : ele.VariableContext) && ele.VariableName == (VariableName && VariableName != "" ? VariableName : ele.VariableName) });
      }
      else {
          return null;
      }
  }
  else {
      return null;
  }
};


type DataItem = {
  Name: string;
  Value: string;
  EntID?: string;
  Label: string;
  Description?: string;
};

type ExtractedValues = {
  refTeams: { Value: string; Label: string; EntID?: string }[];
  refTenants: { Value: string; Label: string; EntID?: string }[];
  filter: { Value: string; Label: string; EntID?: string }[];

};

export const getValuesByName = (data: DataItem[]): ExtractedValues => {
  const refTeams = [];
  const refTenants = [];
  const filter = [] 
  for (const item of data) {
    if (item.Name === "refTeam") {
      refTeams.push({
        Value: item.Value,
        Label: item.Label,
        EntID: item.EntID,
      });
    } else if (item.Name === "reftenants") {
      refTenants.push({
        Value: item.Value,
        Label: item.Label,
        EntID: item.EntID,
      });
    } else if(item.Name === "filter"){
      filter.push({
        Value:item.Value,
        Label: item.Label,
        EntID: item.EntID,
      })
    }
  }

  return {
    refTeams,
    refTenants,
    filter
  };
};


export const convertFlatDataToHierarchyData = async (flatJSON: any, currentNodeId: string | null = null, featureId: string | null = null, isReverse: boolean = false) => {
  let treeData: any = null;
  if (typeof flatJSON === "object") {
      for (let index = 0; index < Object.keys(flatJSON).length; index++) {
          let element: any = Object.values(flatJSON)[index];
          if (element && element.length > 0) {
              let convertedData = await buildRcTreeData(element, currentNodeId, featureId, isReverse);
              treeData = convertedData;
          }
      }
  }
  return treeData;
}
export const handleAPIResponse = (jsonData: any, keyName: string) => {
  console.log('jsonData :', jsonData);
  let extractedData: any = null;
  let parsedData: any = JSON.parse(jsonData);
  console.log('parsedData handleAPIResponse', parsedData)
  // Check if parsedData is an object
  if (typeof parsedData === "object" && parsedData !== null) {
    // Iterate over properties of parsedData
    Object.keys(parsedData).forEach((key: any) => {
      console.log('key handleAPIResponse', key)
      // Check if the property value is an array and has at least one element
      if (Array.isArray(parsedData[key]) && parsedData[key].length > 0) {
        let objectData: any = parsedData[key][0]; // Assuming only the first element is needed
        console.log('objectData handleAPIResponse', objectData)
        if (Array.isArray(objectData[keyName])) {
          extractedData = objectData[keyName];
          return extractedData;
        }
        else if (typeof objectData[keyName] == "object") {
          extractedData = objectData[keyName];
          return extractedData;
        }
        else if (typeof objectData[key] == "string") {
          extractedData = objectData[key];
          return extractedData;
        }
      }

    });
  }
  return extractedData;

}

function buildRcTreeData(data: any[], currentNodeId: string | null = null, featureId: string | null = null, isReverse: boolean = false): ITreeNode[] {
  const nodeMap: { [key: string]: ITreeNode } = {};

  const nodeTypePropertyMap: { [key: string]: string[] } = {
      'Site': ['SiteAddress1', 'SiteCity', 'SiteState', 'SiteCountry', 'SiteZip', 'SiteGPS', 'SiteSecured'],
      'Tenant': ['TenantAddress1', 'TenantCity', 'TenantState', 'TenantCountry', 'TenantZip', 'TenantGPS', 'TenantSecured']
      // Add more node types as needed
  };

  // Function to extract properties based on the node type
  const extractProperties = (item: any, nodeType: string): Partial<ITreeNode> => {
      const nodeProperties = nodeTypePropertyMap[nodeType] || [];
      const nodeData: Partial<ITreeNode> = {};

      // Dynamically assign properties from the item to the node based on the node type's properties
      nodeProperties.forEach(prop => {
          const propKey = prop.replace(nodeType, ''); // Remove node type prefix for cleaner property names
          nodeData[propKey] = item[prop];
      });

      return nodeData;
  };


  for (let index = 0; index < data.length; index++) {
      const item = data[index];
      if (item.ManufacturerName && item.EqtypeName && item.ManufacturerName.length > 0) {
          item.ManufacturerEntID = `${item.LocationEntID}##${item.ManufacturerName}`;
          item.ManufacturerParentID = item.LocationEntID;
          item.EqtypeEntID = `${item.LocationEntID}##${item.ManufacturerName}##${item.EqtypeName}`;
          item.EqtypeParentID = `${item.LocationEntID}##${item.ManufacturerName}`;
          item.DeviceParentID = `${item.LocationEntID}##${item.ManufacturerName}##${item.EqtypeName}`;
      }
    
      console.log('item.ManufacturerName :', item);
      const nodeTypes = ['Site', 'Tenant', 'Room', 'Floor', 'Location', 'Manufacturer', 'Eqtype', 'Device', 'DeviceView', 'DeviceSlot', 'DeviceNetworkPort', 'DevicePowerPort', 'Entity', 'PropertyGroup', 'Property', 'Root', 'Group', 'SubGroup'];
      for (let i = 0; i < nodeTypes.length; i++) {
          const nodeType = nodeTypes[i];
          const id = item[`${nodeType}EntID`];
          const parentId = item[`${nodeType}ParentID`] ? item[`${nodeType}ParentID`] : item[`${nodeType}ParentEntID`];

          if (id) {
              if (!nodeMap[id]) {
                  const nodeData = extractProperties(item, nodeType);
                  let showCheckbox = (item[`${nodeType}NodeType`] || '') == "Site" || (item[`${nodeType}NodeType`] || '') == "Room"
                      || (item[`${nodeType}NodeType`] || '') == "Floor" || (item[`${nodeType}NodeType`] || '') == "Location"
                      || ((item[`${nodeType}NodeType`] || '') == "Device" )
                      || (item[`${nodeType}NodeType`] || '') == "FrontView"
                      || (item[`${nodeType}NodeType`] || '') == "Rack"
                      || (item[`${nodeType}NodeType`] || '') == "RearView" ? false : true;

                  nodeMap[id] = {
                      title: item[`${nodeType}Name`] || '',
                      key: id,
                      NodeEntID: id,
                      NodeEntityname: item[`${nodeType}EntityName`] || '',
                      Name: item[`${nodeType}Name`] || '',
                      PGClassName: item[`${nodeType}PGClassName`] || '',
                      Description: item[`${nodeType}Description`] || '',
                      Type: item[`${nodeType}Type`] || '',
                      icon: null,
                      NodeType: item[`${nodeType}NodeType`] || '',
                      HasChildren: item[`${nodeType}HasChildren`] || 0,
                      IsNZ: item[`${nodeType}IsNZ`] || false,
                      Secured: item[`${nodeType}Secured`] || false,
                      NodeState: item[`${nodeType}NodeState`] || "Ready",
                      stepNo: nodeTypes.indexOf(nodeType) + 1,
                      parentEntID: parentId || null,
                      treetype: nodeType,
                      checkable: showCheckbox,
                      isLeaf: (item[`${nodeType}HasChildren`] || 0) >= 1 ? false : true,
                      MountedDeviceEntID: item[`${nodeType}MountedDeviceEntID`] || "",
                      MountedDeviceViewEntID: item[`${nodeType}MountedDeviceViewEntID`] || "",
                      MountedDeviceName: item[`${nodeType}MountedDeviceName`] || "",
                      MountedDeviceNodeType: item[`${nodeType}MountedDeviceNodeType`] || "",
                      MountedDeviceDescription: item[`${nodeType}MountedDeviceDescription`] || "",
                      MountedDeviceHasPowerPort: item[`${nodeType}MountedDeviceHasPowerPort`] || 0,
                      MountedDeviceHasNetworkPort: item[`${nodeType}MountedDeviceHasNetworkPort`] || 0,
                      MountedDeviceIntelDCMState: item[`${nodeType}MountedDeviceIntelDCMState`] || "",
                      MountedDeviceEntityName: item[`${nodeType}MountedDeviceEntityName`] || "",
                      EQID: item[`${nodeType}EQID`] || "",
                      HasNetworkPorts: item[`${nodeType}HasNetworkPorts`] || 0,
                      HasPowerPorts: item[`${nodeType}HasPowerPorts`] || 0,
                      IntelDCMState: item[`${nodeType}IntelDCMState`] || "",
                      Gender: item[`${nodeType}Gender`] || null,
                      IsPortFiber: item[`${nodeType}IsPortFiber`] || null,
                      PortStatus: item[`${nodeType}PortStatus`] || "Normal",
                      SlotsNeeded: item[`${nodeType}sNeeded`] || 0,
                      ShapeID: item[`${nodeType}ShapeID`] || null,
                      ViewShortName: item[`${nodeType}ShortName`] || null,
                      ParentName: item[`${nodeType}ParentName`] || null,
                      MaxInstances: item[`${nodeType}MaxInstances`] || 0,
                      IsPatchPort: item[`${nodeType}IsPatchPort`] || false,
                      DisplayOrder: 0,
                      MountPosition: item[`${nodeType}MountPosition`] || -1,
                      children: [],
                      ...nodeData
                  };
              }
          }
      };
  };
  // Establish parent-child relationships
  for (let index = 0; index < data.length; index++) {
      const item = data[index];
      const nodeTypes = ['Site', 'Tenant', 'Room', 'Floor', 'Location', 'Manufacturer', 'Eqtype', 'Device', 'DeviceView', 'DeviceSlot', 'DeviceNetworkPort', 'DevicePowerPort', 'Entity', 'PropertyGroup', 'Property', 'Root', 'Group', 'SubGroup'];
      for (let index = 0; index < nodeTypes.length; index++) {
          const nodeType = nodeTypes[index];
          const id = item[`${nodeType}EntID`];
          const parentId = item[`${nodeType}ParentID`] ? item[`${nodeType}ParentID`] : item[`${nodeType}ParentEntID`];

          if (parentId && nodeMap[parentId]) {
              if (id && nodeMap[id]) {
                  if (!nodeMap[parentId].children!.find(child => child.key === id)) {
                      nodeMap[parentId].children!.push(nodeMap[id]);
                  }
              }
          }
      };
  };

  let rootData: ITreeNode[] = [];
  // Extract root nodes (nodes with no parent)
  if (currentNodeId) {

      rootData = Object.values(nodeMap).filter(node => node.parentEntID === currentNodeId);
  }
  else {
      rootData = Object.values(nodeMap).filter(node => !node.parentEntID);
  }
  return rootData;
}


export const getImagePath = (imageName: string, folderName: string) => {
  var imagePath = "";
  if (APP && APP.IMAGE_BASE_PATH && imageName) {
      imagePath = `${APP.IMAGE_BASE_PATH}${folderName == "" ? "" : `${folderName}/`}${imageName}`;
  } else {
      imagePath = `${APP.IMAGE_BASE_PATH}misc/Default_128x128.svg`;
  }
  return imagePath;
}

export const processStringToCompare = (strOne: string, strTwo: string) => {
  if (!strOne || !strTwo) {
    return false
  } else if (strOne.trim().toLowerCase() === strTwo.trim().toLowerCase()) {
    return true
  } else {
    return false
  }
}
let searchedNode: any = null;
let pathToNode: string[] = [];

export const searchKeywordInTree = async (
  keyword: string,
  treeData: any,
  isClear: boolean = false,
  searchHistory: string[] = [],
  currentPath: string[] = []
): Promise<{ searchedNode: any, path: string[] }> => {
  if (isClear) {
    searchedNode = null;
    pathToNode = [];
  }

  for (const item of treeData) {
    const newPath = [...currentPath, item.key]; // Assuming each item has a unique 'key' property

    if (item.Name && item.Name.toLowerCase().includes(keyword.toLowerCase()) && !searchHistory.includes(item.key)) {
      searchedNode = item;
      pathToNode = newPath;
      break;
    }

    if (item.children && item.children.length > 0 && !searchedNode) {
      const result = await searchKeywordInTree(keyword, item.children, false, searchHistory, newPath);
      if (result.searchedNode) {
        return result; // Found the node in the subtree
      }
    }
  }

  return { searchedNode, path: pathToNode };
};
export const updateNodeRuntime = async (element: any, feature: any, hideKebabMenu: boolean, hideCopyIcon: boolean, shwoTooltip: boolean, showIcon: boolean = false, controlName: string | null = null, selectedNodeExplorer: any = null) => {
  console.log('element updateNodeRuntime:', element.RecordCount, controlName);
  // <span className={"exp-tree-node-span-" + ((stepNo + 1) * 16)} title={element.Description} >
  let diagnostic_level = getStorageItem("diagnostic_level");
  let entityName = element.EntityName ? element.EntityName.toString().replace('__', '') : "Default";
  let tooltip = diagnostic_level == "0" ? element.Description : '';
  tooltip = tooltip.replaceAll(",", ', \n ')
  tooltip = tooltip.replaceAll("{", '{ \n ')
  tooltip = tooltip.replaceAll("}", ' \n } ')
  let nodeData = element;
  return nodeData
}
export const  updateTreeNodeBasedOnKey = (treeData: any, key: any,  hideKebabMenu: boolean, hideCopyIcon: boolean, shwoTooltip: boolean, showIcon: boolean = false,) => {
  if (treeData && treeData.length > 0) {

    treeData.map(async (item: any) => {
      if (item.key == key) {
        item = await updateNodeRuntime(item,  hideKebabMenu, hideCopyIcon, shwoTooltip, showIcon,)

        return treeData;
      } else {
        if (item.children)
          updateTreeNodeBasedOnKey(item.children, key, hideKebabMenu, hideCopyIcon, shwoTooltip, showIcon,);
      }
    });
  }

  return treeData;
}

const featureHierarchies: Record<string, string[]> = {
  "103": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "MountedDevice"],
  "153": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "MountedDevice"],
  "253": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "MountedDevice"],
  "156": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "MountedDevice"],
  "306": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "MountedDevice"],
  "309": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "MountedDevice"],
  "403": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "MountedDevice"],
  "106": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "FrontView/RearView", "Slot/RU/InOutPlug/Port", "MountedDevice"],
  "256": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "FrontView/RearView", "Slot/RU/InOutPlug/Port", "MountedDevice"],
  "259": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "MountedDevice"],
  "262": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "MountedDevice"],
  "353": ["Site", "Inventory", "Store", "Bin", "Mfg", "Eqtype", "Device", "FrontView/RearView"],
  "356": ["Site", "Inventory", "Store", "Bin", "Mfg", "Eqtype", "Device", "FrontView/RearView", "Slot/RU/InOutPlug/Port", "MountedDevice"],
  "603": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "MountedDevice"],
  "606": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "MountedDevice"],
  "609": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "MountedDevice"],
  "453": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "MountedDevice"],
  "456": ["Site", "Room", "Floor", "Location/Device", "Rack/Device", "MountedDevice"],
  "258": ["Site", "Room", "Floor", "Location/Device", "Device"],
}

export function getMessageFromArray(messages: any[]) {
  var message = '';
  if (messages && messages.length) {
    messages.map((element: any, index: number) => {
      if (index == 0 || index == 99999) {
        message = element.errString;
      }
      else {
        message += ("<br/>" + element.errString);
      }
    })
  }
  return message;
}

const getNodeTypeIndex = (hierarchy: string[], nodeType: string): number => {
  for (let i = 0; i < hierarchy.length; i++) {
      const types = hierarchy[i].split("/"); // Split combined types like 'Location/FloorDevice'
      if (types.includes(nodeType)) {
          return i;
      }
  }
  return -1; // Return -1 if not found
}
const findInChildrenNode = (nodeChildren: ITreeNode[], featureId: string) => {
  let foundNode: boolean = false;
  const traverseChildrens = (childNodes: ITreeNode[], nodeType: string) => {

      for (let i = 0; i < childNodes.length; i++) {
          const node = childNodes[i];
          if (featureId !== FEnums.PhysicalCompute && featureId !== FEnums.ModelBusinessService && featureId !== FEnums.ManageBusinessService && node && node.MountedDeviceNodeType && processStringToCompare(node.MountedDeviceNodeType, nodeType) && node.MountedDeviceHasPowerPort) {
              if (featureId === FEnums.Monitor) {
                  if (node.MountedDeviceIntelDCMState && processStringToCompare(node.MountedDeviceIntelDCMState, "Discovered")) {
                      foundNode = true;
                  }
              }
              else {
                  foundNode = true;
                  break;
              }
          }
          else if (featureId === FEnums.PhysicalCompute || featureId === FEnums.ModelBusinessService || featureId === FEnums.ManageBusinessService) {
              if (node.NodeEntityname &&
                  node.NodeType && processStringToCompare(node.NodeType, "Device") &&
                  (processStringToCompare(node.NodeEntityname, "__Rack") ||
                      processStringToCompare(node.NodeEntityname, "__Server") ||
                      processStringToCompare(node.NodeEntityname, "__BladeServer"))) {
                  foundNode = true;
                  break;
              }
              else if (node.MountedDeviceEntityName &&
                  node.MountedDeviceNodeType && processStringToCompare(node.MountedDeviceNodeType, "MountedDevice") &&
                  (processStringToCompare(node.MountedDeviceEntityName, "__Rack") ||
                      processStringToCompare(node.MountedDeviceEntityName, "__Server") ||
                      processStringToCompare(node.MountedDeviceEntityName, "__BladeServer"))) {
                  foundNode = true;
                  break;
              }
              else if (node && node.children?.length > 0) {
                  traverseChildrens(node.children, nodeType)
              }
          }
          else if (node && node.children?.length > 0) {
              traverseChildrens(node.children, nodeType)
          }
      }
  }
  traverseChildrens(nodeChildren, "MountedDevice");
  return foundNode;
}
const getNextNodeType = (featureId: string, nodeType: string): string | null => {
  const hierarchy = featureHierarchies[featureId];
  const currentIndex = getNodeTypeIndex(hierarchy, nodeType);
  if (currentIndex >= 0 && currentIndex < hierarchy.length - 1) {
      return hierarchy[currentIndex + 1];
  }
  return null;
}
export const findChildrenBasedOnKey = (
  tree: ITreeNode[],
  key: string,
  featureId: string
): any => {
  const hierarchy = featureHierarchies[featureId];
  if (!hierarchy) {
      return null;
  }
  const result = [...tree]; // Shallow copy of the tree
  let childrenNodes = null;
  // Helper function to find a node by its key and apply hierarchy conditions
  const findNode = (nodes: ITreeNode[]): void => {
      for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];

          // Check if we have found the node by key
          if (node.key === key && node.NodeType) {
              // Get the next expected node type based on the hierarchy for the featureId
              const nextNodeType = getNextNodeType(featureId, node.NodeType);
              if (node.children && node.children.length > 0) {
                  // Traverse children to skip skippable nodes and return relevant ones
                  let skippedNode: boolean = false;
                  let newParentNode: ITreeNode | null = null;
                  let addedNodeNames: string[] = [];
                  const traverseNodes = (childNodes: ITreeNode[]): ITreeNode[] => {
                      const filteredChildren: any[] = [];

                      for (const child of childNodes) {
                          // If this node should be skipped, we need to check its children

                          if (child.NodeType && shouldSkipNode(child.NodeType, featureId)) {
                              // Recursively traverse the children of the skipped node
                              skippedNode = true;
                              if (newParentNode === null) {
                                  newParentNode = node;
                              }

                              if ((child.NodeType.toLocaleLowerCase().includes("ru")
                                  || child.NodeType.toLocaleLowerCase().includes("slot"))
                                  && child.MountedDeviceEntID
                                  && child.MountedDeviceEntID.length > 0 && !addedNodeNames.includes(child.MountedDeviceName || "")) {

                                  if ((featureId === FEnums.AssetPowerCabling || featureId === FEnums.DevicePowerCabling) && !child.MountedDeviceHasPowerPort) {
                                      continue;
                                  }
                                  else if (featureId === FEnums.Discover && !child.MountedDeviceHasPowerPort) {
                                      continue;
                                  }
                                  else if (featureId === FEnums.Discover && !child.MountedDeviceHasPowerPort) {
                                      continue;
                                  }
                                  else if (featureId === FEnums.Monitor && (!child.MountedDeviceHasPowerPort || (child.MountedDeviceIntelDCMState && processStringToCompare(child.MountedDeviceIntelDCMState, "Discovered")))) {
                                      continue;
                                  }
                                  else if (featureId === FEnums.FloorLayout) {
                                      continue;
                                  }
                                  else if ((featureId === FEnums.PhysicalCompute || featureId === FEnums.ModelBusinessService || featureId === FEnums.ManageBusinessService) &&
                                      child.MountedDeviceEntityName &&
                                      child.MountedDeviceNodeType &&
                                      processStringToCompare(child.MountedDeviceNodeType, "MountedDevice") &&
                                      !processStringToCompare(child.MountedDeviceEntityName, "__Rack") &&
                                      !processStringToCompare(child.MountedDeviceEntityName, "__Server") &&
                                      !processStringToCompare(child.MountedDeviceEntityName, "__BladeServer")
                                  ) {
                                      continue;
                                  }
                                  else if ((featureId === FEnums.AssetNetworkCabling || featureId === FEnums.DeviceNetworkCabling) && !child.MountedDeviceHasNetworkPort) {
                                      continue;
                                  }
                                  if (child.MountedDeviceName) {
                                      addedNodeNames.push(child.MountedDeviceName);
                                  }
                                  let newNode: ITreeNode = {
                                      Name: child.MountedDeviceName || "",
                                      key: child.MountedDeviceEntID,
                                      NodeEntityname: child.MountedDeviceEntityName || "",
                                      stepNo: node.stepNo + 1,
                                      parentEntID: node.NodeEntID,
                                      NodeEntID: child.MountedDeviceEntID || "",
                                      NodeType: child.MountedDeviceNodeType,
                                      Description: child.MountedDeviceDescription || "",
                                      NodeState: null,
                                      checkable: false,
                                      HasPowerPorts: child.MountedDeviceHasPowerPort,
                                      HasNetworkPorts: child.MountedDeviceHasNetworkPort,
                                      IntelDCMState: child.MountedDeviceIntelDCMState,
                                      title: child.MountedDeviceName,
                                      icon: null,
                                      HasChildren: 0,
                                      isLeaf: true,
                                      treetype: "MountedDevice",
                                      type: "MountedDevice",
                                      children: []
                                  }
                                  filteredChildren.push(newNode);
                              }
                              else if (child.children) {
                                  const nestedChildren = traverseNodes(child.children);
                                  if (nestedChildren.length > 0) {
                                      filteredChildren.push(...nestedChildren);
                                  }
                              }
                          } else if (child.NodeType && nextNodeType && nextNodeType.split("/").includes(child.NodeType)) {
                              // If not skippable and matches nextNodeType, include it
                              let nodeTypesParsed = nextNodeType.split("/");
                              if ((featureId === FEnums.AssetPowerCabling
                                  || featureId === FEnums.DevicePowerCabling) && nodeTypesParsed.length > 1
                                  && processStringToCompare(nodeTypesParsed[1], "Device")
                                  && processStringToCompare(child.NodeType, "Device")) {
                                  if (!child.HasPowerPorts) {
                                      continue;
                                  }
                              }
                              else if ((featureId === FEnums.Discover || featureId === FEnums.Monitor)
                                  && (processStringToCompare(child.NodeType, "Rack")
                                      || processStringToCompare(child.NodeType, "Device"))) {
                                  if (!child.HasPowerPorts) {
                                      if (featureId === FEnums.Monitor && child.IntelDCMState && !processStringToCompare(child.IntelDCMState, "Discovered")) {
                                          if (child.children && child.children.length > 0) {
                                              let foundNode = findInChildrenNode(child.children, featureId);
                                              if (foundNode === false) {
                                                  continue;
                                              }
                                          }
                                      }
                                      else {
                                          if (child.children && child.children.length > 0) {
                                              let foundNode = findInChildrenNode(child.children, featureId);
                                              if (foundNode === false) {
                                                  continue;
                                              }
                                          }
                                      }
                                  }
                               
                              }
                             
                              else if ((featureId === FEnums.PhysicalCompute || featureId === FEnums.ModelBusinessService || featureId === FEnums.ManageBusinessService) &&
                                  child.NodeEntityname &&
                                  processStringToCompare(child.NodeType, "Device") &&
                                  !processStringToCompare(child.NodeEntityname, "__Rack") &&
                                  !processStringToCompare(child.NodeEntityname, "__Server") &&
                                  !processStringToCompare(child.NodeEntityname, "__BladeServer")
                              ) {
                                  continue;
                              }
                              let nodeData: ITreeNode = { ...child };
                              if (skippedNode) {
                                  nodeData.HasChildren = 0;
                                  nodeData.isLeaf = true;
                                  nodeData.parentEntID = newParentNode && newParentNode.NodeEntID;
                              }
                              else {
                                  if (featureId !== FEnums.AssetConfiguration && featureId !== FEnums.DeviceConfiguration) {
                                      let hasChildren = findInChildrenNode(nodeData.children, featureId);
                                      if (!hasChildren && nodeData.NodeType && (processStringToCompare(nodeData.NodeType, "Rack") || (processStringToCompare(nodeData.NodeType, "Location") && featureId === FEnums.Monitor) || processStringToCompare(nodeData.NodeType, "Device"))) {
                                          nodeData.HasChildren = 0;
                                          nodeData.isLeaf = true;
                                      }
                                  }
                              }
                              filteredChildren.push(nodeData);
                          }
                          else {
                              filteredChildren.push(child);
                          }
                      }

                      return filteredChildren;
                  };

                  // Apply the traversal and filtering logic
                  childrenNodes = traverseNodes(node.children);
              } else {
                  // No further nodes in hierarchy or no children, return the node as is
                  childrenNodes = node.children || [];
              }
          } else if (node.children) {
              // Recursively call for children
              findNode(node.children);
          }
      }
  };

  // Start searching from the root
  findNode(result);

  // Return the filtered children
  return childrenNodes;
}
const skippableNodeTypesByFeature: Record<string, string[]> = {
  "103": ["FrontView/RearView", "Slot/RU/InOutPlug/Port"], // Skip these for FeatureId 106
  "153": ["FrontView/RearView", "Slot/RU/InOutPlug/Port"], // Skip these for FeatureId 106
  "156": ["FrontView/RearView", "Slot/RU/InOutPlug/Port"], // Skip these for FeatureId 106
  "253": ["FrontView/RearView", "Slot/RU/InOutPlug/Port"], // Skip these for FeatureId 106
  "259": ["FrontView/RearView", "Slot/RU/InOutPlug/Port"], // Skip these for FeatureId 106
  "262": ["FrontView/RearView", "Slot/RU/InOutPlug/Port"], // Skip these for FeatureId 106
  "306": ["FrontView/RearView", "Slot/RU/InOutPlug/Port"], // Skip these for FeatureId 106
  "309": ["FrontView/RearView", "Slot/RU/InOutPlug/Port"], // Skip these for FeatureId 106
  "403": ["FrontView/RearView", "Slot/RU/InOutPlug/Port"], // Skip these for FeatureId 106
  "603": ["FrontView/RearView", "Slot/RU/InOutPlug/Port"], // Skip these for FeatureId 306
  "606": ["FrontView/RearView", "Slot/RU/InOutPlug/Port"], // Skip these for FeatureId 306
  "609": ["FrontView/RearView", "Slot/RU/InOutPlug/Port"], // Skip these for FeatureId 306
  "453": ["FrontView/RearView", "Slot/RU/InOutPlug/Port"], // Skip these for FeatureId 306
  "456": ["FrontView/RearView", "Slot/RU/InOutPlug/Port"], // Skip these for FeatureId 306
  "258": ["Rack", "FrontView/RearView", "Slot/RU/InOutPlug/Port", "MountedDevice"], // Skip these for FeatureId 306
  // Add other feature-specific skippable node types as needed
}

export const shouldSkipNode = (nodeType: string, featureId: string): boolean => {
  // Define the types that should be skipped for certain featureIds

  // Check if the current featureId has any skippable node types
  if (skippableNodeTypesByFeature[featureId]) {
      const skippableNodeTypes = skippableNodeTypesByFeature[featureId];
      // Check if the nodeType is part of any skippable hierarchy step
      for (const skipType of skippableNodeTypes) {
          if (skipType.split("/").includes(nodeType)) {

              return true;
          }
      }
  }

  return false; // Do not skip if the nodeType isn't defined for this featureId
}

export function deepClone(obj: any, seen = new WeakMap()): any {
  if (obj === null || typeof obj !== 'object') {
      return obj;
  }

  // Handle React elements: return them as-is
  if (obj.$$typeof && obj.$$typeof.toString() === 'Symbol(react.element)') {
      return obj;
  }

  // Detect circular references
  if (seen.has(obj)) {
      return seen.get(obj);
  }

  let clonedObj: any;

  if (Array.isArray(obj)) {
      clonedObj = [];
      seen.set(obj, clonedObj);  // Track the reference before recursion
      for (let index = 0; index < obj.length; index++) {
          const item = obj[index];
          clonedObj[index] = deepClone(item, seen);
      }
  } else if (obj instanceof HTMLElement) {
      clonedObj = obj.cloneNode(true);  // Clone HTML elements
  } else if (obj.constructor && obj.constructor.name === 'Object') {
      clonedObj = {};
      seen.set(obj, clonedObj);  // Track the reference before recursion
      for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
              clonedObj[key] = deepClone(obj[key], seen);
          }
      }
  } else {
      // If it's an unrecognized type, return it as-is (or throw an error, depending on your needs)
      return obj;
  }

  return clonedObj;
}

export const addSubNode = async (tree: any[], parentKey: string, newNode: any, treeDataPorps: iTreeProps, featureId: string, updateOriginalTree: boolean, stepNo: number) => {
  // const result = JSON.parse(JSON.stringify(tree)); // Create a shallow copy of the tree to avoid mutating the original tree
  const result = deepClone(tree); // Create a shallow copy of the tree to avoid mutating the original tree
  let isFound: boolean = false;
  const addNode = (nodes: any[]): void => {
      for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if (isFound) {
              return;
          }
          if (node.key === parentKey) {
              // Add the new node to the children of the current node
              isFound = true;
              node.children = newNode;
              // Array.prototype.push.apply((node.children || []), newNode);
              return;
              // node.children = [...(node.children || []), newNode];
          } else if (node.children) {
              // Recursively call addNode for the children
              addNode(node.children);
          }
      }
  };

  const updateNode = (nodes: ITreeNode[], nodeIndex: number = 0): void => {
      
    for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          node.stepNo = nodeIndex + 1;
          node.NaturalSortorder = i;
          node.title = getTreeNodeTitle(node,treeDataPorps, featureId);
          if (treeDataPorps) {
              node.icon = getTreeNodeIcon(node);
          }
          if (node.children) {
              // Recursively call addNode for the children
              updateNode(node.children, nodeIndex + 1);
          }
      }
  };
  if (updateOriginalTree === false) {

      await updateNode(newNode, stepNo);
  }
  // Perform the addition
  await addNode(result);

  // Return the updated tree
  return result;
}




export const excludeFeaturesFromFilterNodes: string[] = [
  // HomePageSubMenus.GoogleMap.toString(),
  FEnums.MySettings
]

export function extractProperty(data:any, property:any) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i][property] !== undefined) {
      result.push(data[i][property]);
    }
  }
  return result;
}

export const fnGetRefList = async (refName: string) => {
  console.log('refName fnGetRefList', refName)

  let filterData: any = []

  await getRefList(refName).then((resp: any) => {
    if (checkIsSuccess(resp) && resp.data && resp.data.jsonString?.length > 0) {
        let data = JSON.parse(resp.data.jsonString);
        if (data.length > 0) {
            filterData.push(...data)
        }
    }
})
return filterData
  // if (data) {
  //     const resultArray = await refName?.split(';');
  //     console.log('resultArray', resultArray)
  //     let filterData: any = []
  //     let notFoundInTable = []
  //     for (let index = 0; index < resultArray.length; index++) {
  //         const element = resultArray[index];
  //         let filterObj = data?.filter((item: any) => { return processStringToCompare(item.GroupName, "Reference List") && processStringToCompare(item.SubGroupName, element) })
  //         console.log('filterObj', filterObj)
  //         if (filterObj.length > 0) {
  //             let cleanArr = []
  //             for (let index = 0; index < filterObj.length; index++) {
  //                 const element = filterObj[index];
  //                 cleanArr.push({
  //                     Name: element.SubGroupName,
  //                     Value: element.Name,
  //                     Label: element.Label,
  //                     SortOrder: element.SortOrder,
  //                     Description: element.Description,
  //                     EntID: element.EntID,
  //                     RefValue: element.RefValue
  //                 })
  //             }
  //             filterData.push(...cleanArr)
  //         } else {
  //             notFoundInTable.push(element)
  //         }

  //     }
  //     if (filterData.length > 0) {
  //         filterData.sort((a: any, b: any) => a.SortOrder > b.SortOrder ? 1 : -1)
  //     }
  //     if (notFoundInTable.length > 0) {
  //         let stringNotFoundIntbl = notFoundInTable.join(';');
         
  //     }

  //     return filterData
  // }
}

export const getTableDataFromRedux = async (tableName: string, isDataSet: boolean, isFilterData?: boolean) => {
  const actionKey = 'MULTIPLE_TABLE_DATA';
  const selectedData = await selectDataUsingActionKey(actionKey);
  let filterData = null
  console.log('selectedData MULTIPLE_TABLE_DATA', selectedData)
  if (selectedData.length > 0) {
      for (let index = 0; index < selectedData.length; index++) {
          const element = selectedData[index];
          let key = Object.keys(element)
          if (key.includes(tableName)) {
              filterData = element
          }
      }

  }
  if (filterData && !isFilterData) {
      let valueData: any = Object.values(filterData)
      if (valueData.length > 0 && isDataSet) {
          let sessionData: any = handleAPIResponse(valueData[0].data, "Dataset");
          filterData = sessionData
      } else {
          filterData = handleAPIResponse(valueData[0].data, "Data");
      }
  }
  return filterData
}

export const selectDataUsingActionKey = (actionKey: string) => {
  const selector = actionKeyToSelector(actionKey);
  if (!selector) {
    throw new Error(`No selector found for action key: ${actionKey}`);
  } 

  const state = store.getState();
  return selector(state);
};

const actionKeyToSelector = (actionKey: string) => {
  const selectors: { [key: string]: (state: any) => any } = {
    'MULTIPLE_TABLE_DATA': (state: any) => state.commonDataReducer.multiple_table_data,
    // 'ACTION_TYPE_2': (state: any) => state.anotherSlice.anotherData,
    // Add more mappings as needed
  };

  return selectors[actionKey];
};
const makeUnicKey = (Id: any,) => {
  let key = ''
  // if (Id && !useUIDForKey) {
  //     key = Id
  // } else {
  key = `${Id}##${uuidv4()}`
  // }
  return key
}
let selectedId: any = null
let selectedNode: any = null
let expandedkey: any = []
export const ManagementMakeTreeData = async (resData: any, Feature: any, hideKebabMenu: any, instanceName: string | null = null, useUIDForKey: boolean = false, treeDataProps: iTreeProps | null = null, stepNo: number = 0) => {
  if (resData) {
      let treeData: any = [];
      let expadedKey: any = [];
      let keyIdSingleNode: string = ''
      let countSteoNo: number = 0
      let allkey: any = ''
      let checkedKeys: any = [];
      let nodesToexpand: any = [];
      selectedId = null
      selectedNode = null
      for (const key of Object.keys(resData)) {
          const data = resData[key];
          if (Array.isArray(data)) {
              let respData = await MakeTreeDataForExplorer(data, key, "", true, true, stepNo ? stepNo : 0, hideKebabMenu, Feature, instanceName, useUIDForKey, treeDataProps)
              console.log('respData ManagementMakeTreeData', respData)
              treeData = respData.treeData;
              expadedKey = respData.expandedkey;
              keyIdSingleNode = respData.keyIdSingleNodeId;
              countSteoNo = respData.countSteoNo;
              allkey = respData.allkey;
              checkedKeys = respData.checkedKeys;
              nodesToexpand = respData.nodesToexpand;
          }
          // use val
      }

      return { treeData, expadedKey, keyIdSingleNode, countSteoNo, allkey, checkedKeys, nodesToexpand };

  }

}
let keyIdSingleNodeId: any = '';
let parentLenth: any = 0
let countSteoNo: any = 0;
let oldsingleNodeId: any = ''
let EntityName: any = ''
let checkedKeys: any = [];
let nodesToexpand: any = [];
let allkey: any = []
export const MakeTreeDataForExplorer = async (ApiData: any, key: string, id: any, reSetVal: any, Status: any = true, stepNo: any = 0, hideKebabMenu: any, feature: any = null, controlName: any = null, useUIDForKey: boolean = false, treeDataProps: iTreeProps | null = null, parentNode: any = null) => {

  var treeData: any = [];
  if (id == "") {
      checkedKeys = [];
  }
  if (ApiData?.length) {

      for (let index = 0; index < ApiData.length; index++) {
          const element = ApiData[index];
          let entityName = element.EntityName ? element.EntityName.toString().replace('__', '') : "";
          if (element?.Type === "MountedDevice" && (feature == FEnums.AuditDataCenter.toString() || feature == FEnums.ManageAuditSessions.toString() || feature == FEnums.InventoryReconciliation.toString())) {

          }
          else {

              let keyName = await makeUnicKey(element.EntID,);
              if (element.Selected) {
                  checkedKeys.push(keyName);
              }
              let tData: any = await treeeObject(key, element, keyName, id, stepNo, hideKebabMenu, feature, index, controlName, treeDataProps, parentNode);

              countSteoNo = stepNo
              if (ApiData.length > 1) {
                  parentLenth = 1
              }
              if (reSetVal === true) {
                  parentLenth = 0
                  keyIdSingleNodeId = ''
                  expandedkey = [];
              }
              if (tData && key.toLowerCase() === "view" && controlName === "device_inventory_tree") {
                  tData.isLeaf = true;

              }
              if (ApiData.length === 1 && element?.HasChildren === 1 && parentLenth === 0) {
                  keyIdSingleNodeId = element.EntID
                  oldsingleNodeId = element.EntID
                  EntityName = element.EntityName
              }
              if (ApiData.length === 1 && Status && !element.NodeState) {
                  expandedkey.push(keyName)
                  nodesToexpand.push({ Name: element.Name, EntID: element.EntID, NodeType: entityName ? entityName : key })
                  // updateSRFLVariables(key, element.EntID, element.Name, feature, element, controlName);
              }
              if (ApiData.length > 1) {
                  Status = false
                  keyIdSingleNodeId = ''
              }
              allkey.push(keyName)
              for (const key of Object.keys(element)) {
                  const childData: any = element[key];
                  if (Array.isArray(childData)) {
                      let cData = await MakeTreeDataForExplorer(childData, key, element.EntID ? element.EntID : keyName, false, Status, tData.stepNo, hideKebabMenu, feature, controlName, useUIDForKey, treeDataProps, element);
                      tData.children.push(...cData.treeData);
                  }
              }

              treeData.push(tData);
          }
      }
  }
  if (oldsingleNodeId != '') {
      keyIdSingleNodeId = oldsingleNodeId
  }
  return { treeData, expandedkey, keyIdSingleNodeId, countSteoNo, EntityName, allkey, checkedKeys, nodesToexpand };

}

const treeeObject = async (key: any, element: any, keyName: any, parentEntID: any, stepNo: any = 0, hideKebabMenu: any, feature: any = null, index: any, controlName: string | null = null, treeDataProps: iTreeProps | null = null, parentNode: any = null) => {
  console.log('controlName treeeObject', controlName)
  // <span className={"exp-tree-node-span-" + ((stepNo + 1) * 16)} title={element.Description} >
  let diagnostic_level = getStorageItem("diagnostic_level");
  let entityName = element.EntityName ? element.EntityName.toString().replace('__', '') : "Default";
  let nodeInfo = await createJsonString(element, parentEntID, hideKebabMenu, key, index, feature, controlName ? controlName : undefined)
  let tooltip = diagnostic_level == "0" ? element.Description : nodeInfo;
  tooltip = tooltip.replaceAll(",", ', \n ')
  tooltip = tooltip.replaceAll("{", '{ \n ')
  tooltip = tooltip.replaceAll("}", ' \n } ')
  let status = element.EntityName && element.EntityName == "AuditSession" && element.NodeType == "AuditSessionNode" && element.AuditSessionStatus ? element.AuditSessionStatus : null;
  let viewIcon = element?.Name?.toLowerCase().includes("front") ? "Front" : element?.Name?.toLowerCase().includes("rear") ? "Rear" : null;

  let showCheckbox = element.NodeType == "Site" || element.NodeType == "Room"
      || element.NodeType == "Floor" || element.NodeType == "Location"
      || (element.NodeType == "Device" && (feature != FEnums.DeviceConfiguration && feature != FEnums.DevicePowerCabling && feature != FEnums.DeviceNetworkCabling))
      || element.NodeType == "FrontView"
      || element.NodeType == "Rack"
      || element.NodeType == "RearView" ? false : true;
  let iconToShowForSecure = element.IsNZ && element.Secured ? "NZSecureIcon" : element.IsNZ && !element.Secured ? "NZIcon" :
      !element.IsNZ && element.Secured ? "SecureIcon" : null;
  let data: any = {
      key: keyName,
      NodeEntityname: element.EntityName,
      NodeEntID: element.EntID,
      stepNo: stepNo + 1,
      parentEntID: parentEntID,
      NodeState: element.NodeState,
      Description: element.Description,
      checkable: ((controlName == "NetZoom_tree" || controlName == "ServiceNow_tree" || controlName == "WorkDay_tree" || controlName == "template_subscribe") && !element.HasChildren) ? true : showCheckbox,
      title: (
          (controlName == "auth_role_left_treeview" || controlName == "auth_by_role_treeview") && (element.GroupName != "" && element.Name != "Roles") ?
              <div className="d-flex justify-content-between align-items-center " style={{ paddingRight: 3 }}><span title={element.Name}>{element.Name}</span>{element.IsAuthorized ? (<FontAwesomeIcon
                  icon={faCircleCheck}
                  className="nz-icon-circleCheck"
                  title="Authorized"
              />) : (<FontAwesomeIcon
                  icon={faCircleXmark}
                  className="nz-icon-cross"
                  title="Not Authorized"
              />)}
              </div>
              :
              <span rel="tooltip" data-html="true" className={"nz-tree-node-title exp-tree-node-span-" + ((stepNo + 1) * 16)} id={element.EntID ? element.EntID : keyName} node-info={nodeInfo} >
                  <span className={element.EntID} node-info={nodeInfo}>
                      {(controlName == "export_treeview" || controlName == "import_treeview" || feature == FEnums.ImportCables.toString() || feature == FEnums.ExportCables.toString() || feature == FEnums.DeviceImport.toString() || feature == FEnums.InventoryImport.toString() || feature == FEnums.DeviceExport.toString() || feature == FEnums.InventoryExport.toString()) ?
                          (element.TableLabel ? (element.Type == "Table" ? `${element.TableLabel} (${element.Name})` : element.TableLabel) : element.Name)
                          : element.TableLabel ? `${element.TableLabel}` : (element.Name ? element.Name : "")}
                      {element.RecordCount >= 0 && (controlName == "export_treeview" || feature == FEnums.DeviceExport.toString() || feature == FEnums.InventoryExport.toString()) ? ` (${element.RecordCount})` : ""}
                      {element.HwEntityName ? ` (${element.HwEntityName})` : ""}
                  </span>
                  <div className='nz-tree-node-nz-icon-div' node-info={nodeInfo} title={iconToShowForSecure == "NZSecureIcon" || iconToShowForSecure == "SecureIcon" ? "Secured" : ""}>
                      {iconToShowForSecure && <ReactSVG className="nz-treeview-img-auth nz-tree-node-nz-icon  ng-red-check" beforeInjection={(svg: any) => { svg.setAttribute("title", iconToShowForSecure) }} src={getImagePath(`${iconToShowForSecure}_128x128.svg`, "Features")} fallback={() => { return <ReactSVG className="nz-treeview-img-auth" src={getImagePath("Default_128x128.svg", "misc")} /> }} />}</div>
                  {/* {element.ShowKebab == true || !hideKebabMenu && <RightMouseMenu container={element.HwEntityName ? "entity_mfg_eqtype_tree" : "explorer_tree"} />} */}
              </span>
      ),
      icon: (element.NodeState && (element.NodeState == "Preparing" || element.NodeState == "Processing") ? <FontAwesomeIcon title={`${element.NodeState}...`} className="nz-treeview-img-auth" icon={faPersonRunning} /> :
          status ? <ReactSVG className="nz-treeview-img-auth  ng-red-check" src={getImagePath(`${status}_128x128.svg`, "misc")} fallback={() => { return <ReactSVG className="nz-treeview-img-auth" src={getImagePath("Default_128x128.svg", "misc")} /> }} />
              : element.EntityName && !element.EntityName.toString().includes('__') && entityName ? <ReactSVG className="nz-treeview-img-auth  ng-red-check" src={getImagePath(`${entityName}_128x128.svg`, "Features")} fallback={() => { return <ReactSVG className="nz-treeview-img-auth" src={getImagePath("Default_128x128.svg", "misc")} /> }} />
                  : element.EntityName && element.EntityName.toString().includes('__') && entityName ? <Image className="nz-treeview-img-auth  ng-red-check" src={getImagePath(`${entityName}_128x128.png`, "entities_hw")} fallback={getImagePath("DefaultGrey_128x128.png", "misc")} />
                      : element.HwEntityName ? <Image className="nz-treeview-img-auth  ng-red-check" src={getImagePath(`${element.Name}.png`, "EqType")} fallback={getImagePath("DefaultGrey_128x128.png", "misc")} />
                          : key?.toLowerCase() == "eqtype" && element.Name ? <Image className="nz-treeview-img-auth  ng-red-check" src={getImagePath(`${element.Name}.png`, "EqType")} fallback={getImagePath("DefaultGrey_128x128.png", "misc")} />
                              : key?.toLowerCase() == "productnumber" || key?.toLowerCase() == "manufacturer" ? <Image className="nz-treeview-img-auth  ng-red-check" src={getImagePath(`${key}.png`, "misc")} fallback={getImagePath("DefaultGrey_128x128.png", "misc")} />
                                  : key?.toLowerCase() == "views" && viewIcon ? <Image className="nz-treeview-img-auth  ng-red-check" src={getImagePath(`${viewIcon}.png`, "misc")} fallback={getImagePath("DefaultGrey_128x128.png", "misc")} />
                                      : <Image className="nz-treeview-img-auth  ng-red-check" src={getImagePath('sites.png', 'misc')} fallback={getImagePath("DefaultGrey_128x128.png", "misc")} />),
      children: [],
      treetype: key,
      Name: element.Name?.trim(),
      type: element.type,
      HasChildren: element.HasChildren ? element.HasChildren : 0,
      uuid: uuidv4(),
      IsNZ: element?.IsNZ,
      Secured: element?.Secured,
      RecordCount: element.RecordCount ? element.RecordCount : -1
      // className: "ng-red-check"
      // className: "ng-green-check"
      // className: "ng-remove-highlights-check"
  };
  if (parentNode && parentNode.EQID) {
      data.ParentEQID = parentNode.EQID;
  }
  if (element.GroupName) {
      data.GroupName = element.GroupName
  }
  if (element.IsAuthorized) {
      data.IsAuthorized = element.IsAuthorized
  }
  if (element.GroupName) {
      data.GroupName = element.GroupName
  }
  if (element.IsPatchPort) {
      data.IsPatchPort = element.IsPatchPort
  }
  if (element.DCIFromSiteNode) {
      data.DCIFromSiteNode = element.DCIFromSiteNode
  }
  if (element.DCIToSiteNode) {
      data.DCIToSiteNode = element.DCIToSiteNode
  }
  if (element.NodeType == "Port" || element.NodeType == "RU" || element.NodeType == "Slot") {
      if (element.PortStatus == "Connected") {
          data.className = "ng-green-check";
      }
      else if (element.PortStatus == "Blocked") {
          data.className = "ng-grey-check";
      }
      else if (element.PortStatus == "Reserved") {
          data.className = "ng-light-blue-check";
      }
      else if (element.PortStatus == "BAD") {
          data.className = "ng-orange-check";
      }
  }
  if (element.NodeState == "Discoverable" || element.NodeState == "Preparing") {
      data.className = "ng-yellow-check";
  }
  else if (element.NodeState == "Discovered") {
      data.className = "ng-blue-check";
  }
  else if (element.NodeState == "Monitored") {
      data.className = "ng-green-check";
  }
  else if (element.NodeState == "Critical Alert") {
      data.className = "ng-red-check";
  }
  else if (element.NodeState == "Queued") {
      data.className = "ng-grey-check";
  }

  if ((controlName == "import_treeview" || controlName == "export_treeview"
      || controlName === "import_config_treeview"
      || controlName === "import_cables_treeview"
      || controlName === "export_cables_treeview"
      || controlName === "export_device_treeview") && element.NodeType == "EntityVsTable") {
      data.checkable = false;
  }
  if ((controlName == "auth_role_left_treeview" || controlName == "RoleByUser_for_userAuth" || controlName == "auth_by_role_treeview") && !element.GroupName) {
      data.checkable = false;
  }
  if (element.IsNZ && element.Selected && controlName == "nz_entity_tables_treeview") {
      data.disableCheckbox = true;
  }
  else if (element.NodeType == "Tables" && controlName == "nz_entity_tables_treeview") {
      data.checkable = false;
  }
  if (element.NodeType) {
      data.NodeType = element.NodeType
  }
  if (element.ViewShortName) {
      data.ViewShortName = element.ViewShortName
  }
  if (element.SlotsNeeded) {
      data.SlotsNeeded = element.SlotsNeeded
  }
  // else if ((feature == FEnums.Settings.toString() || feature == FEnums.MySettings.toString()) && controlName != "dci_left_tree") {
  //     data.NodeType = key;
  // }
  if (element.PortStatus) {
      data.PortStatus = element.PortStatus
  } else {
      data.PortStatus = null
  }
  if (element.EntityPgClass) {
      data.EntityPgClass = element.EntityPgClass
  }
  if (element.TableLabel) {
      data.TableLabel = element.TableLabel
  }
  if (element.HasRelated) {
      data.HasRelated = element.HasRelated
  }
  if (element.SubGroupEntID) {
      data.SubGroupEntID = element.SubGroupEntID;
  }
  if (element.DeviceID) {
      data.DeviceID = element.DeviceID
  }
  if (element.EQID) {
      data.EQID = element.EQID
  }
  if (element.ShapeID) {
      data.ShapeID = element.ShapeID
  }
  if (element.isDisabled) {

      data.disabled = true;
      data.checkStrictly = true;
  }
  if (element.HwEntityName) {
      data.HwEntityName = element.HwEntityName;
  }
  if (element.MountedDeviceID != null) {
      data.MountedDeviceID = element.MountedDeviceID
  }
  if (element.HasChildren >= 1 || element.HwEntityName) {
      data.isLeaf = false
  }
  if (element.HasChildren) {
      data.HasChildren = element.HasChildren
  }
  if (element.MaxInstances) {
      data.MaxInstances = element.MaxInstances
  }
  if (element.DisplayControl) {
      data.DisplayControl = element.DisplayControl
  }
  if (element.ParentName) {
      data.ParentName = element.ParentName
  }
  if (element.HasPowerPorts) {
      data.HasPowerPorts = element.HasPowerPorts
  }
  if (element.HasNetworkPorts) {
      data.HasNetworkPorts = element.HasNetworkPorts
  }
  if (element.Type) {
      data.Type = element.Type
  }
  if (element.PGClassName) {
      data.PGClassName = element.PGClassName;
  }
  // NK changes for Sort order
  if (!hideKebabMenu) {
      data.NaturalSortorder = index;
      data.DisplayOrder = 0;
      data.MountPosition = -1;
      if (element.MountPosition != undefined) {
          data.MountPosition = element.MountPosition;
      }
      if (element.PGClassName) {
          data.PGClassName = element.PGClassName;
      }
  }

  Object.keys(element)?.forEach((item: string) => {
      if (!data[item] && (typeof element[item] == "string" || element[item] == null)) {
          data[item] = element[item];
        
      }
  });
  return data
}
export const getImidiateParentTreeInfoUseingDiv = (info: any) => {

    if (info.parentEntID) {
      let nodeDiv: any = document.getElementById(info.parentEntID)
      if (nodeDiv) {
        let nodeInfo = nodeDiv?.getAttribute("node-info")
        if (nodeInfo) {
          nodeInfo = JSON.parse(nodeInfo)
          return nodeInfo;
        }
        else {
          return null;
        }
      }
      else {
        return null;
      }
    }
    return null;
  }

const createJsonString = (element: any, parentEntID?: string, hideKebabMenu: any = null, treeType: string = "", index: any = 0, feature: string = "", controlName: string = "") => {
  let jsonObject: any = {
      NodeEntityname: element.NodeEntityname ? element.NodeEntityname : element.EntityName,
      NodeEntID: element.NodeEntID ? element.NodeEntID : element.EntID,
      Description: element.Description,
      Name: element.Name,
      type: element.type,
      parentEntID: parentEntID,
      NodeState: element.NodeState,
      treetype: treeType,
      IsNZ: element?.IsNZ,
      Secured: element?.Secured
  }

  if (element.ViewShortName) {
      jsonObject.ViewShortName = element.ViewShortName
  }
  if (element.NodeType) {
      jsonObject.NodeType = element.NodeType
  }
  if (element.IsPatchPort) {
      jsonObject.IsPatchPort = element.IsPatchPort
  }
  // else if ((feature == FEnums.Settings.toString() || feature == FEnums.MySettings.toString()) && controlName != "dci_left_tree") {
  //     jsonObject.NodeType = treeType;
  // }
  if (element.PortStatus) {
      jsonObject.PortStatus = element.PortStatus
  } else {
      jsonObject.PortStatus = null
  }
  if (element.HasRelated) {
      jsonObject.HasRelated = element.HasRelated
  }
  if (element.SubGroupEntID) {
      jsonObject.SubGroupEntID = element.SubGroupEntID;
  }
  if (element.DeviceID) {
      jsonObject.DeviceID = element.DeviceID
  }
  if (element.EQID) {
      jsonObject.EQID = element.EQID
  }
  if (element.ShapeID) {
      jsonObject.ShapeID = element.ShapeID
  }
  if (element.isDisabled) {
      jsonObject.disabled = true;
      jsonObject.checkStrictly = true;
  }
  if (element.HwEntityName) {
      jsonObject.HwEntityName = element.HwEntityName;
  }
  if (element.MountedDeviceID != null) {
      jsonObject.MountedDeviceID = element.MountedDeviceID
  }
  if (element.HasChildren >= 1 || element.HwEntityName) {
      jsonObject.isLeaf = false
  }
  if (element.HasChildren) {
      jsonObject.HasChildren = element.HasChildren
  } else {
      jsonObject.HasChildren = 0
  }
  if (element.HasPowerPorts) {
      jsonObject.HasPowerPorts = element.HasPowerPorts
  } else {
      jsonObject.HasPowerPorts = 0
  }
  if (element.HasNetworkPorts) {
      jsonObject.HasNetworkPorts = element.HasNetworkPorts
  } else {
      jsonObject.HasNetworkPorts = 0
  }
  if (element.MaxInstances) {
      jsonObject.MaxInstances = element.MaxInstances
  }
  if (element.DisplayControl) {
      jsonObject.DisplayControl = element.DisplayControl
  }
  if (element.ParentName) {
      jsonObject.ParentName = element.ParentName
  }
  if (element.Type) {
      jsonObject.Type = element.Type
  }
  if (element.SlotsNeeded) {
      jsonObject.SlotsNeeded = element.SlotsNeeded
  }
  if (!hideKebabMenu) {
      jsonObject.NaturalSortorder = index;
      jsonObject.DisplayOrder = 0;
      jsonObject.MountPosition = -1;
      if (element.MountPosition != undefined) {
          jsonObject.MountPosition = element.MountPosition;
      }
      if (element.PGClassName) {
          jsonObject.PGClassName = element.PGClassName;
      }
  }
  Object.keys(element)?.forEach((item: string) => {
      if (!jsonObject[item] && (typeof element[item] == "string" || element[item] == null)) {
          jsonObject[item] = element[item];

      }
  });
  let sessionData = getSessionVariableFromStorage("Location", "SiteName");
  if (sessionData?.length > 0) {
      jsonObject.SiteName = sessionData[0].SessionValue;
  }
  sessionData = getSessionVariableFromStorage("Location", "RoomName");
  if (sessionData?.length > 0) {
      jsonObject.RoomName = sessionData[0].SessionValue;
  }
  sessionData = getSessionVariableFromStorage("Location", "FloorName");
  if (sessionData?.length > 0) {
      jsonObject.FloorName = sessionData[0].SessionValue;
  }
  sessionData = getSessionVariableFromStorage("Location", "LocationName");
  if (sessionData?.length > 0) {
      jsonObject.LocationName = sessionData[0].SessionValue;
  }
  sessionData = getSessionVariableFromStorage("Node", "SelectedNodeEntity");
  if (sessionData?.length > 0) {
      jsonObject.SelectedNodeEntity = sessionData[0].SessionValue;
  }

  sessionData = getSessionVariableFromStorage("Node", "SelectedNodeID");
  if (sessionData?.length > 0) {
      jsonObject.SelectedNodeID = sessionData[0].SessionValue;
  }
  return JSON.stringify(jsonObject);

}
export const updateFeatureLabelFromSession = (featureData: any) => {
    const extractPlaceholder = (input: string): string | null => {
      const match = input.match(/\{([^}]+)\}/);
      return match ? match[1] : null;
    };
    const replacePlaceholder = (input: string, replacement: string): string => {
      return input.replace(/\{[^}]+\}/, replacement);
    };
    for (let index = 0; index < featureData.length; index++) {
      const element = featureData[index];
      if (element && element.Label && element.Label.includes("{")) {
        let extractedData = extractPlaceholder(element.Label);
        let sessionData = getSessionVariableFromStorage("", extractedData?.replace("#", ""));
        if (sessionData && sessionData.length > 0) {
          let sessionValue = sessionData[0].SessionValue;
          element.Label = replacePlaceholder(element.Label, sessionValue);
        }
  
      }
  
    }
    return featureData;
  }
  export const RightMouseMenuRange = {
    MIN: 10000
}   
export async function updateVisibleTreeData(originalTreeData: ITreeNode[], treeData: ITreeNode[], parentNodeKeys: string[], treeDataPorps: iTreeProps, featureId: string, foundFromCache: boolean = false) {
  let visibleNodes: any[] = [];
  let filteredTreeData = originalTreeData;


  // Function to find and update treeData with missing nodes from originalTreeData
  const updateTreeDataFromOriginal = (originalData: ITreeNode[], newData: ITreeNode[], parentKeys: string[]): ITreeNode[] => {
      const updatedData: ITreeNode[] = [];

      for (let i = 0; i < originalData.length; i++) {
          const originalNode = originalData[i];
          // Check if the current node exists in newData
          let existingNode = newData.find((node: ITreeNode) => node.key === originalNode.key);

          // If the node is expanded (part of parentNodeKeys) and it doesn't exist, add it from originalTreeData
          if (parentKeys.includes(originalNode.key)) {
              if (!existingNode) {
                  // Add the missing node from originalTreeData
                  existingNode = { ...originalNode, children: [] }; // Initialize without children
              }

              // Recursively update its children if it has any
              if (originalNode.children && originalNode.children.length > 0) {
                  existingNode.children = updateTreeDataFromOriginal(originalNode.children, existingNode.children || [], parentKeys);
              }
          }

          // Push the updated or original node to the updatedData array
          updatedData.push(existingNode || { ...originalNode, children: [] });
      }

      return updatedData;
  };

  // Update the current treeData with originalTreeData, only adding missing nodes
  const updatedTreeData = updateTreeDataFromOriginal(filteredTreeData, treeData, parentNodeKeys);
  const findVisibleNodes = (data: ITreeNode[], parentNode: ITreeNode | null, nodeIndex: number = 0): void => {
      for (let index = 0; index < data.length; index++) {
          let element = data[index];
          element.stepNo = nodeIndex + 1;
          element.NaturalSortorder = index;
          element.title = getTreeNodeTitle(element,treeDataPorps, featureId);
          element.checkable = isShowCheckbox(element, featureId);
          if (!treeDataPorps.hideicon) {
              element.icon = getTreeNodeIcon(element);
          }

          // Check if the current node is present in treeData
          const newNode = { ...element, children: [] };

          if (parentNode) {
              parentNode.children.push(newNode);
          } else {
              visibleNodes.push(newNode);
          }

          // Recursively process children
          if (element.children && element.children.length > 0) {
              findVisibleNodes(element.children, newNode, nodeIndex + 1);
          }
      }
  };

  // let filteredTree = updateTreeNodesBasedOnFeatureId(updatedTreeData, featureId);
  // console.log('filteredTree :', filteredTree);

  // Start processing visible nodes based on updated treeData
  findVisibleNodes(updatedTreeData, null);
  return { visibleTree: visibleNodes };
}
export const isShowCheckbox = (treeNode: ITreeNode, featureId: string) => {
  let showCheckbox = treeNode.NodeType == "Site" || treeNode.NodeType == "Room"
      || treeNode.NodeType == "Floor" || treeNode.NodeType == "Location"
      || (treeNode.NodeType == "Device" && (featureId != FEnums.DeviceConfiguration && featureId != FEnums.DevicePowerCabling && featureId != FEnums.DeviceNetworkCabling))
      || treeNode.NodeType == "FrontView"
      || treeNode.NodeType == "Rack"
      || treeNode.NodeType == "RearView" ? false : true;

  return showCheckbox;
}
let nodeData: any = null
let key: any = "";
let node: any = null;

export const getNodeDetailsBaseOnKey = (treeData: any, key: any, clear?: boolean) => {
  if (clear) {
    nodeData = null
  }
  treeData.forEach((item: any) => {
    if (item.key == key) {
      nodeData = { node: item };
      return { key, node };
    } else {
      if (item.children)
        getNodeDetailsBaseOnKey(item.children, key)
    }
  });

  return { key, nodeData };
}
let parentNodeData: any = null

export const getNodeDetailsBaseOnEntID = (treeData: any, entId: any) => {

  treeData?.forEach((item: any) => {
    if (item.NodeEntID == entId || item.key == entId) {
      parentNodeData = { node: item };
      return { entId, node };
    } else {
      if (item.children)
        getNodeDetailsBaseOnEntID(item.children, entId)
    }
  });

  return { entId, parentNodeData };
}
let parentNodes: any = [];

export const getParentNodesFromTreeData = (treeData: any, node: any, clear: boolean = false) => {

  if (clear) {
    parentNodes = [];
  }
  if (node.parentEntID) {
    let nodeData = getNodeDetailsBaseOnEntID(treeData, node.parentEntID);
    if (nodeData && nodeData.parentNodeData && nodeData.parentNodeData.node) {
      parentNodes.push(nodeData.parentNodeData.node)
      getParentNodesFromTreeData(treeData, nodeData.parentNodeData.node)
    }
    else {
      return parentNodes
    }
  }
  return parentNodes
}


export const updateSessionVariablesForSelectedNode = async (treeData: any, info: any, instanceName: string, featureId: string, embeddedSessionId: string | null = null) => {
  let inputJsonData: iSessionData[] = [];
  let updatedSessssion: any = null;
  let storageData: string | null = getStorageItem("session_variables");
  if (storageData) {
      let sessionVar: iSessionData[] = JSON.parse(storageData);
      if (info.checked) {
          let filterData = sessionVar?.filter((item: iSessionData) => {
              return item.VariableContext == "Node" && item.VariableName == "LastCheckedNodeID"
          });
          if (filterData?.length > 0) {
              filterData[0].SessionValue = info.node.NodeEntID;
          }
          Array.prototype.push.apply(inputJsonData, filterData);
      }
      else {
        
              if (info && info.node && processStringToCompare(info.node.NodeType, "Site")) {
                  inputJsonData.push({ VariableContext: "Location", VariableName: "SiteID", SessionValue: info.node.NodeEntID });
                  inputJsonData.push({ VariableContext: "Location", VariableName: "SiteName", SessionValue: info.node.Name });
              }
              else if(info && info.node && processStringToCompare(info.node.NodeType, "Tenant")) {
                  inputJsonData.push({ VariableContext: "Filter", VariableName: "TenantID", SessionValue: info.node.NodeEntID });
                  inputJsonData.push({ VariableContext: "Filter", VariableName: "TenantName", SessionValue: info.node.Name });
              }
          
          if (instanceName == "asset_management" && featureId != FEnums.InventoryManagement
              && featureId != FEnums.InventoryConfiguration && featureId != FEnums.VirtualCompute) {
              let filterData = sessionVar?.filter((item: any) => {
                  return item.VariableContext == "Location" || item.VariableContext == "FloorDevice"
              });
              if (filterData?.length > 0) {
                  filterData.map((item: iSessionData) => {
                      if (info.node.NodeType && item.VariableName.toLowerCase().includes(`${info.node.NodeType.toLowerCase()}id`)) {
                          item.SessionValue = info.node.NodeEntID;
                      }
                      else if (info.node.NodeType && item.VariableName.toLowerCase().includes(`${info.node.NodeType.toLowerCase()}name`)) {
                          item.SessionValue = info.node.Name;
                      }
                      else {
                          if (item.VariableName.includes('Site')) {
                          }
                          else {
                              item.SessionValue = ''
                          }
                      }
                  });
              }

              let parentData = await getParentNodesFromTreeData(treeData, info.node, true);
              if (parentData?.length > 0) {
                  parentData.forEach((item: any) => {
                      filterData.map((subItem: iSessionData) => {
                          if (item.NodeType && subItem.VariableName.toLowerCase().includes(`${item.NodeType.toLowerCase()}id`)) {
                              subItem.SessionValue = item.NodeEntID;
                          }
                          else if (item.NodeType && subItem.VariableName.toLowerCase().includes(`${item.NodeType.toLowerCase()}name`)) {
                              subItem.SessionValue = item.Name;
                          }
                      });
                  })
              }
              Array.prototype.push.apply(inputJsonData, filterData);
          }
          else if (instanceName == "asset_management" && (featureId == FEnums.InventoryManagement || featureId == FEnums.InventoryConfiguration)) {
              let filterData = sessionVar?.filter((item: any) => {
                  return item.VariableContext == "Inventory"
              });
              if (filterData?.length > 0) {
                  filterData.map((item: iSessionData) => {
                      if (info.node.NodeType && item.VariableName.toLowerCase().includes(`${info.node.NodeType.toLowerCase()}id`)) {
                          item.SessionValue = info.node.NodeEntID;
                      }
                      else if (info.node.NodeType && item.VariableName.toLowerCase().includes(`${info.node.NodeType.toLowerCase()}name`)) {
                          item.SessionValue = info.node.Name;
                      }
                      else {
                          item.SessionValue = ''
                      }
                  });
              }
              let parentData = await getParentNodesFromTreeData(treeData, info.node, true);
              console.log('parentData :', parentData);
              if (parentData?.length > 0) {
                  parentData.forEach((item: any) => {
                      filterData.map((subItem: iSessionData) => {
                          if (item.NodeType && subItem.VariableName.toLowerCase().includes(`${item.NodeType.toLowerCase()}id`)) {
                              subItem.SessionValue = item.NodeEntID;
                          }
                          else if (item.NodeType && subItem.VariableName.toLowerCase().includes(`${item.NodeType.toLowerCase()}name`)) {
                              subItem.SessionValue = item.Name;
                          }
                      });
                  })
              }
              Array.prototype.push.apply(inputJsonData, filterData);
          }
          else if (instanceName == "audit_explorer_tree") {
              Array.prototype.push.apply(inputJsonData, [{
                  VariableContext: "Filter",
                  VariableName: "AuditSessionID",
                  SessionValue: info.node.NodeEntID ? info.node.NodeEntID : ""
              }, {
                  VariableContext: "Filter",
                  VariableName: "AuditSessionName",
                  SessionValue: info.node.Name ? info.node.Name : ""
              }
              ]);
          }
          else if (instanceName == "model_business_service_treeview" || instanceName == "manage_business_service_treeview") {
              Array.prototype.push.apply(inputJsonData, [{
                  VariableContext: "BusinessServiceNode",
                  VariableName: "AuditSessionID",
                  SessionValue: info.node.NodeEntID ? info.node.NodeEntID : ""
              }, {
                  VariableContext: "BusinessServiceNode",
                  VariableName: "AuditSessionName",
                  SessionValue: info.node.Name ? info.node.Name : ""
              }
              ]);
          }
          else if (instanceName == "asset_management" && featureId === FEnums.VirtualCompute) {
              let filterData = sessionVar?.filter((item: any) => {
                  return item.VariableContext == "VirtualComputeNode"
              });
              if (filterData?.length > 0) {
                  filterData.map((item: iSessionData) => {
                      if (info.node.NodeType && item.VariableName.toLowerCase().includes(`${info.node.NodeType.toLowerCase()}id`)) {
                          item.SessionValue = info.node.NodeEntID;
                      }
                      else if (info.node.NodeType && item.VariableName.toLowerCase().includes(`${info.node.NodeType.toLowerCase()}name`)) {
                          item.SessionValue = info.node.Name;
                      }
                      else {
                          item.SessionValue = ''
                      }
                  });
              }
          }
          else if (instanceName == "asset_management" && featureId === FEnums.CloudCompute) {
              let filterData = sessionVar?.filter((item: any) => {
                  return item.VariableContext == "CloudComputeNode"
              });
              if (filterData?.length > 0) {
                  filterData.map((item: iSessionData) => {
                      if (info.node.NodeType && item.VariableName.toLowerCase().includes(`${info.node.NodeType.toLowerCase()}id`)) {
                          item.SessionValue = info.node.NodeEntID;
                      }
                      else if (info.node.NodeType && item.VariableName.toLowerCase().includes(`${info.node.NodeType.toLowerCase()}name`)) {
                          item.SessionValue = info.node.Name;
                      }
                      else {
                          item.SessionValue = ''
                      }
                  });
              }
          }
          if (instanceName == "asset_management") {
              let filterNodeData = sessionVar?.filter((item: any) => {
                  return item.VariableContext == "Node"
              });
              if (filterNodeData?.length > 0) {
                  filterNodeData.map((item: iSessionData) => {
                      if (item.VariableName.toLowerCase() == "selectednodeid") {
                          item.SessionValue = info.node.NodeEntID;
                      }
                      else if (item.VariableName.toLowerCase() == "selectednodename") {
                          item.SessionValue = info.node.Name;
                      }
                      else if (item.VariableName.toLowerCase() == "selectednodeentity") {
                          item.SessionValue = info.node.NodeEntityname;
                      }
                      else {
                          item.SessionValue = ''
                      }
                  });
              }

              Array.prototype.push.apply(inputJsonData, filterNodeData);

          }
      }
      if (inputJsonData && inputJsonData.length > 0) {

          await updateSession(inputJsonData, embeddedSessionId).then(async (resp: any) => {
              if (checkIsSuccess(resp)) {
                  if (resp.data.jsonSessionOutput) {
                      let parsedData = handleAPIResponse(resp.data.jsonSessionOutput, "Dataset");

                      await setStorageItem("session_variables", JSON.stringify(parsedData));
                      updatedSessssion = parsedData;
                  }
              }
          });
      }

      return updatedSessssion;
  }
}
export function updateNodeWithTitleAndIcon(treeData: ITreeNode[], treeDataProps: iTreeProps, featureId: string): ITreeNode[] {

    const updateNodes = (data: ITreeNode[], nodeIndex: number = 0): void => {
        data.forEach((node: ITreeNode, index: number) => {
            // Update the title and icon
            // node.stepNo = nodeIndex + 1;
            node.NaturalSortorder = index;
            node.title = getTreeNodeTitle(node, treeDataProps, featureId);
            node.checkable = isShowCheckbox(node, featureId);
            if (!treeDataProps.hideicon) {
                node.icon = getTreeNodeIcon(node);
            }

            // Recursively update the children
            if (node.children && node.children.length > 0) {
                updateNodes(node.children, nodeIndex + 1);
            }
        });
    };

    // Call the update function on the root nodes
    updateNodes(treeData);

    // Return the updated tree data
    return treeData;
}
export const updateTreeNodesBasedOnFeatureId = async (treeData: ITreeNode[], featureId: string): Promise<ITreeNode[]> => {
    let treeNodes: ITreeNode[] = [];
    // Recursive function to traverse tree nodes and bind children
    let addedNodeNames: string[] = [];
    const traversTreeNodes = async (nodes: ITreeNode[], parentNode: ITreeNode | null): Promise<void> => {
        for (let index = 0; index < nodes.length; index++) {
            const element = nodes[index];

            // Check if this node should be skipped based on the featureId
            const shouldSkipNode: IShouldSkip = await shouldSkipNodeForFeature(element, featureId);
            // Clone the current node with empty children initially
            const newNode: ITreeNode = { ...element, children: [] };
            // Check if the node is already added to the parentNode.children array

            if (shouldSkipNode.shouldSkip) {
                // Skip the node and manage the MountedDevice condition
                if (isMountedDevice(element)) {
                    const mountedDeviceNode = await createMountedDeviceNode(element, parentNode);
                    if (parentNode && parentNode.children && mountedDeviceNode.NodeEntID) {
                        console.log('parentNode :', parentNode, mountedDeviceNode, element);
                        const shouldSkipMountedNode: IShouldSkip = await shouldSkipNodeForFeature(mountedDeviceNode, featureId);
                        if (!addedNodeNames.includes(mountedDeviceNode.NodeEntID) && !shouldSkipMountedNode.shouldSkip) {
                            addedNodeNames.push(mountedDeviceNode.NodeEntID);
                            parentNode.children.push(mountedDeviceNode);
                        }
                    }
                } else {
                    // Continue traversing children of the skipped node
                    if (element.children && element.children.length > 0 && shouldSkipNode.isCheckedInChildren === false) {
                        console.log('parentNode :', parentNode, element.children);
                        await traversTreeNodes(element.children, parentNode);
                    }
                }
            } else {
                // Handle the case where children need to be updated based on found children
                if (shouldSkipNode.isCheckedInChildren) {
                    newNode.HasChildren = shouldSkipNode.foundInChildren ? 1 : 0;
                    newNode.isLeaf = !shouldSkipNode.foundInChildren;
                }

                // If the node is not skipped, attach it to the parent or root
                if (parentNode && newNode.NodeEntID) {
                    if (!parentNode.children) {
                        parentNode.children = []; // Ensure children array exists
                    }
                    console.log('parentNode :', parentNode, newNode);
                    if (!addedNodeNames.includes(newNode.NodeEntID)) {
                        addedNodeNames.push(newNode.NodeEntID);
                        parentNode.children.push(newNode);
                    }
                } else {
                    treeNodes.push(newNode);
                }

                // Continue traversing children
                if (element.children && element.children.length > 0) {
                    await traversTreeNodes(element.children, newNode);
                }
            }
        }
    };

    // Function to check if the node is a mounted device
    const isMountedDevice = (node: ITreeNode): boolean => {
        return !!(node.MountedDeviceEntID && node.NodeType &&
            (processStringToCompare(node.NodeType, "RU") ||
                processStringToCompare(node.NodeType, "slot") ||
                processStringToCompare(node.NodeType, "port") ||
                processStringToCompare(node.NodeType, "inoutplug")));
    };

    // Function to create a MountedDevice node
    const createMountedDeviceNode = async (node: ITreeNode, parentNode: ITreeNode | null): Promise<ITreeNode> => {
        return {
            Name: node.MountedDeviceName || "",
            key: node.MountedDeviceEntID || "",
            NodeEntityname: node.MountedDeviceEntityName || "",
            stepNo: parentNode ? (parentNode.stepNo + 1) : 0,
            parentEntID: parentNode ? parentNode.NodeEntID : "",
            NodeEntID: node.MountedDeviceEntID || "",
            NodeType: node.MountedDeviceNodeType,
            Description: node.MountedDeviceDescription || "",
            NodeState: null,
            checkable: false,
            HasPowerPorts: node.MountedDeviceHasPowerPort,
            HasNetworkPorts: node.MountedDeviceHasNetworkPort,
            IntelDCMState: node.MountedDeviceIntelDCMState,
            title: node.MountedDeviceName,
            icon: null,
            HasChildren: 0,
            isLeaf: true,
            treetype: "MountedDevice",
            type: "MountedDevice",
            children: []
        };
    };

    // Start processing the tree from the root
    await traversTreeNodes(treeData, null);
    return treeNodes; // Return the new tree structure
};

export const shouldSkipNodeForFeature = (child: ITreeNode, featureId: string): IShouldSkip => {
    if (child.NodeType && shouldSkipNode(child.NodeType, featureId)) {

        return { shouldSkip: true, foundInChildren: false, isCheckedInChildren: false };
    }
    switch (featureId) {
       
        case FEnums.AssetManagement:
            return skipNodeForManagement(child);
    default:
            return { shouldSkip: false, foundInChildren: false, isCheckedInChildren: false }; // No skipping for unhandled featureIds
    }
};

const skipNodeForManagement = (child: ITreeNode): IShouldSkip => {
    const hasMountedDevice = (node: ITreeNode): boolean => {
        // Base case: if the current node has power ports
        if (node.MountedDeviceEntID) return true;

        // Recursive case: check children if they exist
        if (node.children && node.children.length > 0) {
            return node.children.some((childNode) => hasMountedDevice(childNode));
        }
        return false;
    };
    if (child.NodeType && (processStringToCompare(child.NodeType, "Device") || processStringToCompare(child.NodeType, "Rack"))) {

        let foundInChildren: boolean = false;
        if (child.children && child.children.length > 0) {
            foundInChildren = child.children.some((childNode) => hasMountedDevice(childNode));
        }
        else {
            foundInChildren = hasMountedDevice(child);
        }

        // Do not skip if power ports are found in children or the node is a Rack
        if (foundInChildren || processStringToCompare(child.NodeType, "Rack")) {
            return { shouldSkip: false, foundInChildren, isCheckedInChildren: true };
        }
        return { shouldSkip: false, foundInChildren: foundInChildren, isCheckedInChildren: true }; // Skip if no power ports are found
    } else {
        return { shouldSkip: false, foundInChildren: false, isCheckedInChildren: false }; // Do not skip if conditions are not met
    }
};

let ParentObj: any = []
export const getParentTreeInfoUseingDiv = (info: any, clear: boolean = false) => {
  if (clear) {
    ParentObj = [];
  }
  if (info?.parentEntID) {
    let nodeDiv: any = document.getElementById(info.parentEntID)
    let nodeInfo = nodeDiv?.getAttribute("node-info")
    if (nodeInfo) {
      nodeInfo = JSON.parse(nodeInfo)
    }
    ParentObj.push(nodeInfo)
    getParentTreeInfoUseingDiv(nodeInfo)
  }
  return ParentObj
}

export const getKeyFromEntId = (treeData: any, entId: any, isClear: any = false) => {
    if (isClear) {
      key = "";
      node = null;
    }
    if (entId == null && key == "") {
      key = treeData[0].key;
      node = { node: treeData[0] };
  
    }
    else {
      treeData.forEach((item: any) => {
        if (item.NodeEntID == entId || item.Name == entId) {
          key = item.key;
          node = { node: item };
          return { key, node };
        }
        if (item.children && node == null) {
          getKeyFromEntId(item.children, entId)
        }
      });
    }
    return { key, node };
  }


  let expKeys: string[] = [];
let selKeys: string[] = [];
let selNodes: any[] = [];
let updatedTree: any = null;
let keysToExpand: string[] = [];

  export const expandAllNodesOfTree = async (treeData: any, isClear: boolean, featureId: string | undefined, treeDataProps: iTreeProps) => {
    if (isClear) {
      expKeys = [];
      selKeys = [];
      selNodes = [];
      updatedTree = treeData;
    }
    for (let index = 0; index < treeData.length; index++) {
      const element = treeData[index];
      expKeys.push(element.key);
      selKeys = [element.key];
      selNodes = [element];
      if ((featureId == FEnums.PhysicalCompute || featureId == FEnums.Discover
        || featureId == FEnums.Monitor || treeDataProps.instanceName == "DCI_to_site"
        || ((featureId == FEnums.AuditDataCenter || featureId == FEnums.ManageAuditSessions || featureId == FEnums.InventoryReconciliation) && treeDataProps.instanceName == "asset_management")
        || treeDataProps.instanceName == "DCI_form_site") && element.NodeType && element.NodeType.toLowerCase() == "floor" && element.HasChildren) {
        await MakeExpInventoryMgtFloorDevices(element.NodeEntID, updatedTree, featureId, "", keysToExpand, element.stepNo, element.NodeEntityname, element.parentEntID,
          treeDataProps.hideKebabMenu, treeDataProps.instanceName, false, null, undefined, treeDataProps).then((resp: any) => {
            if (resp && resp.newTreeData) {
              updatedTree = resp.newTreeData;
            }
            else {
              updatedTree = resp.newTreeData;
            }
          });
      }
      else if ((featureId == FEnums.InventoryManagement
        || featureId == FEnums.InventoryConfiguration) && element.NodeType && element.NodeType.toLowerCase() == "store" && element.HasChildren) {
        await MakeExpInventoryMgtFloorDevices(element.NodeEntID, updatedTree, featureId, "", keysToExpand, element.stepNo, element.NodeEntityname, element.parentEntID,
          treeDataProps.hideKebabMenu, treeDataProps.instanceName, false, null, undefined, treeDataProps).then((resp: any) => {
            if (resp && resp.newTreeData) {
              updatedTree = resp.newTreeData;
            }
            else {
              updatedTree = resp.newTreeData;
            }
          });
      }
      if (element.children && element.children.length > 0) {
        await expandAllNodesOfTree(element.children, false, featureId, treeDataProps);
      }
    }
    return { expKeys, selKeys, selNodes, updatedTree }
  }

  export const MakeExpInventoryMgtFloorDevices = async (floorID: any, treeData: any, feature: any, keyword: any, expadedKeyold: any, stepNo: any = 0, apitype: any = 0, parentEntID: any, hideKebabMenu: any, controlName: any = "", isRefresh: any = false, embeddedSessionId: string | null = null, useUIDForKey: boolean = false, treeDataProps: iTreeProps | null = null) => {
    let payload: any = {
        floorID: floorID,
        isSearch: false,
        keyword: keyword,
        isRefresh: isRefresh,
        sessionId: embeddedSessionId,
        configurationType: 0
    }
    console.log('isRefresh', isRefresh)

    let newTreeData: any = null;
    let expandedkey: any = []
    let error: any = {}

    if (feature === FEnums.InventoryManagement) {
        payload.exploreType = 1
        await floorDevices(payload).then(async (resp: any) => {
            if (checkIsSuccess(resp)) {
                if (resp.data) {
                    let node: any = []
                    var DataRes = resp.data;
                    if (DataRes.hierarchyJson) {
                        DataRes = JSON.parse(DataRes.hierarchyJson)
                    }

                    if (Object.values(DataRes)[0] != null) {

                        let res = await makeFloorDataToTreeView(DataRes, expadedKeyold, floorID, treeData, parentEntID, stepNo, hideKebabMenu, feature, null, isRefresh, useUIDForKey, treeDataProps)
                        if (res) {
                            newTreeData = res.TreeData
                            expandedkey.push(...res.expandedkey)
                        }

                    }

                }
            } else {
                var message = getMessageFromArray(resp.errData);
                error = {
                    type: "ERROR",
                    message: message,
                };

            }
        });
    } else if (feature === FEnums.InventoryConfiguration || (controlName === "device_inventory_tree"
        && (feature == FEnums.DeviceManagement || feature == FEnums.DeviceConfiguration))) {
        console.log('payload.exploreType floorDevicesConfiguration called:');
        payload.exploreType = 1
        await floorDevicesConfiguration(payload).then(async (resp: any) => {
            if (checkIsSuccess(resp)) {
                if (resp.data) {
                    let node: any = []
                    var DataRes = resp.data;
                    if (DataRes.hierarchyJson) {
                        DataRes = JSON.parse(DataRes.hierarchyJson)
                    }
                    if (Object.values(DataRes)[0] != null) {
                        console.log('DataRes floorDevicesConfiguration:', DataRes);
                        let res = await makeFloorDataToTreeView(DataRes, expadedKeyold, floorID, treeData, parentEntID, stepNo, hideKebabMenu, feature, controlName, isRefresh, useUIDForKey, treeDataProps)
                        if (res) {
                            newTreeData = res.TreeData
                            console.log('expandedkey floorDevicesConfiguration:', expandedkey, res.TreeData);
                            expandedkey.push(...res.expandedkey)
                        }

                    }

                } else {

                }
            } else {
                var message = getMessageFromArray(resp.errData);
                error = {
                    type: "ERROR",
                    message: message,
                };

            }
        });
    } else if (feature == FEnums.AssetConfiguration || controlName == "DCI_form_site" || controlName == "DCI_to_site") {
        payload.configurationType = controlName == "DCI_form_site" || controlName == "DCI_to_site" ? 1 : 0

        payload.exploreType = 2
        await floorDevicesConfiguration(payload).then(async (resp: any) => {
            if (checkIsSuccess(resp)) {
                if (resp.data) {
                    let node: any = []
                    var DataRes = resp.data;
                    if (DataRes.hierarchyJson) {
                        DataRes = JSON.parse(DataRes.hierarchyJson)
                    }
                    if (Object.values(DataRes)[0] != null) {
                        let res = await makeFloorDataToTreeView(DataRes, expadedKeyold, floorID, treeData, parentEntID, stepNo, hideKebabMenu, feature, null, isRefresh, useUIDForKey, treeDataProps)
                        if (res) {
                            newTreeData = res.TreeData
                            expandedkey.push(...res.expandedkey)
                        }

                    }


                } else {
                    //No data found
                  

                }
            } else {
                var message = getMessageFromArray(resp.errData);
                error = {
                    type: "ERROR",
                    message: message,
                };

            }
        });

    } else if (feature == FEnums.AssetManagement || feature == FEnums.ManageAuditSessions || feature == FEnums.AuditDataCenter || feature == FEnums.InventoryReconciliation || feature == FEnums.AssetPowerCabling || feature == FEnums.AssetNetworkCabling || feature == FEnums.Monitor || feature == FEnums.Discover) {
        console.log('feature', feature, FEnums.AssetNetworkCabling)
        payload.configurationType = (feature == FEnums.AssetNetworkCabling || controlName == "DCI_form_site" || controlName == "DCI_to_site") ? 1 : feature == FEnums.AssetPowerCabling ? 2 : 0
        payload.exploreType = 2

        await floorDevices(payload).then(async (resp: any) => {
            if (checkIsSuccess(resp)) {
                if (resp.data) {
                    let node: any = []
                    var DataRes = resp.data;
                    if (DataRes.hierarchyJson) {
                        DataRes = JSON.parse(DataRes.hierarchyJson)
                    }
                    if (Object.values(DataRes)[0] != null) {
                        let res = await makeFloorDataToTreeView(DataRes, expadedKeyold, floorID, treeData, parentEntID, stepNo, hideKebabMenu, feature, null, isRefresh, useUIDForKey, treeDataProps)
                        if (res) {
                            newTreeData = res.TreeData
                            expandedkey.push(...res.expandedkey)
                        }

                    }


                }
            }
        });
    } 
 

    return { newTreeData, error, expandedkey }
}

export const makeFloorDataToTreeView = async (DataRes: any, expadedKeyold: any, floorID: any, treeData: any, parentEntID: any, stepNo: any = 0, hideKebabMenu: any, feature: any = null, controlName: any = null, isRefresh: boolean = false, useUIDForKey: boolean = false, treeDataProps: iTreeProps | null = null) => {
    console.log('isRefresh makeFloorDataToTreeView', isRefresh)
    let MainchildData;
    let expadedKey
    let TreeData;
    let expandedkey: any = []
    let keyIdSingleNodeId;
    let EntityName: any;
    let dataArray = []

    for (const key of Object.keys(DataRes)) {
        const data: any = DataRes[key];

        let status = 0
        if (data && data.length) {

            Object.values(data[0]).forEach((ele) => {
                if (Array.isArray(ele)) {
                    // dataArray
                    status = status + 1
                }
            })
        }

        if (data?.length && data[0]?.EntID === floorID) {
            stepNo = stepNo - 1
        }
        if (data?.length && Array.isArray(data) && data[0]?.EntID == floorID) {
            let respData = await MakeTreeDataForExplorer(data, key, parentEntID, true, status === 1 ? true : false, stepNo, hideKebabMenu, feature, controlName, useUIDForKey)

            MainchildData = respData.treeData
            expadedKey = respData.expandedkey
            keyIdSingleNodeId = respData.keyIdSingleNodeId
            EntityName = respData.EntityName
        } else {
            let respData = await MakeTreeDataForExplorer(data, key, parentEntID, true, status === 1 ? true : false, stepNo, hideKebabMenu, feature, controlName, useUIDForKey)

            MainchildData = respData.treeData
            expadedKey = respData.expandedkey
            keyIdSingleNodeId = respData.keyIdSingleNodeId
            EntityName = respData.EntityName
        }

    }

    const returnData = isRefresh ? appendDeviceIsRefresh(treeData, MainchildData, floorID) : appendDevice(treeData, MainchildData, floorID)
    if (returnData.length) {
        TreeData = returnData
        expandedkey.push(...expadedKeyold, ...expadedKey)
    }
    return { TreeData, expandedkey, keyIdSingleNodeId, EntityName, MainchildData }
}


const appendDeviceIsRefresh = (treeData: any, node: any, floorID: any) => {

    treeData.map((item: any, index: any) => {
        if (item && item.NodeEntID === node.length > 0 && node[0].NodeEntID) {
            treeData[index] = node[0]
        } else if (item.treetype === "floor_device" && item && item.NodeEntID === floorID) {
            item.children = node
        } else if (item.NodeType === "Store" && item && item.NodeEntID === floorID) {
            item.children = node[0].children
        } else if (item.treetype === "device" && item && item.NodeEntID === floorID) {
            item.children = node
        } else if (item.treetype === "Slot" && item && item.MountedDeviceID === floorID) {
            item.children = node[0].children
        } else {
            if (item.children) {
                appendDeviceIsRefresh(item.children, node, floorID)
            }
        }
    });
    return treeData

}

const appendDevice = (treeData: any, node: any, floorID: any) => {
    treeData.map((item: any) => {

        // if ((item.treetype === "Floor" && item && item.NodeEntID === floorID) || (item.treetype === "Instance" && item && item.NodeEntID === floorID) || (item.treetype === "Host" || item.treetype === "Project" && item && item.NodeEntID === floorID)) {

        if (item && item.NodeEntID === floorID) {
            item.children = node && node[0]?.children
        } else if (item.treetype === "floor_device" && item && item.NodeEntID === floorID) {
            item.children = node
        } else if (item.treetype === "device" && item && item.NodeEntID === floorID) {
            item.children = node
        } else if (item.treetype === "Slot" && item && item.MountedDeviceID === floorID) {
            item.children = node[0].children
        } else if (item && item.EntID === floorID) {
            item.children = node
        }
        else if (item && item.key === floorID) {
            item.children = node[0].children;
        } else {
            if (item.children) {
                appendDevice(item.children, node, floorID)
            }
        }
    });
    return treeData

}
export const getLocationAndNodeData = () => {
    let session_var_string = getStorageItem("session_variables");
    if (session_var_string && session_var_string.length > 0) {
        let session_var = JSON.parse(session_var_string);

        if (session_var && session_var.length > 0) {
            return session_var.filter((ele: any) => {


                // Check VariableContext for 'Location' or 'Node'
                const contextMatches = (ele.VariableContext === 'Location' || ele.VariableContext === 'Node') && ele.VariableName.includes("ID");
                // Return only if all conditions are met
                return contextMatches;
            });
        } else {
            return null;
        }
    } else {
        return null;
    }
};
export async function getSelectionFromHierarchy(trees: ITreeNode[], featureId: string, treeDataProps: iTreeProps, selectedExplorerNode: any) {
    const expandKeys: string[] = [];
    let selectedNodeKey = '';
    let selectedNode: any = null;

    let locationData = await getLocationAndNodeData();
    let originalTreeData: ITreeNode[] = deepClone(trees);
    if ((featureId === FEnums.ManageAuditSessions || featureId === FEnums.AuditDataCenter || featureId === FEnums.InventoryReconciliation) && selectedExplorerNode && selectedExplorerNode.node && processStringToCompare(selectedExplorerNode.node.NodeType, "AuditSessionNode")) {
        let siteName: string | null = null;
        let roomName: string | null = null;
        let floorName: string | null = null;
        let locationName: string | null = null;
        let deviceName: string | null = null;
        let selectedNodeName: string | null = null;
        Object.keys(selectedExplorerNode.node).forEach((item: string) => {
            if (item.toLowerCase() == DropableControlElementEnums.SiteName.toLowerCase() && selectedExplorerNode.node[item]) {
                siteName = selectedExplorerNode.node[item];
            }
            else if (item.toLowerCase() == DropableControlElementEnums.RoomName.toLowerCase() && selectedExplorerNode.node[item]) {
                roomName = selectedExplorerNode.node[item];
            }
            else if (item.toLowerCase() == DropableControlElementEnums.FloorName.toLowerCase() && selectedExplorerNode.node[item]) {
                floorName = selectedExplorerNode.node[item];
            }
            else if (item.toLowerCase() == DropableControlElementEnums.LocationName.toLowerCase() && selectedExplorerNode.node[item]) {
                locationName = selectedExplorerNode.node[item];
            }
            else if (item.toLowerCase() == DropableControlElementEnums.DeviceName.toLowerCase() && selectedExplorerNode.node[item]) {
                deviceName = selectedExplorerNode.node[item];
            }
        });
        const traverseForAudit = async (currentNode: any, isCalledForSession: boolean) => {
            if ((currentNode.children && currentNode.children.length > 0) || isCalledForSession) {
                expandKeys.push(currentNode.key);
                if (siteName && (roomName || floorName || locationName || deviceName)) {
                    // Logic for when IsRefreshed is true (use locationData)
                    if (processStringToCompare(currentNode.Name, siteName) || (roomName && processStringToCompare(currentNode.Name, roomName)) || (floorName && processStringToCompare(currentNode.Name, floorName)) || (locationName && processStringToCompare(currentNode.Name, locationName))) {
                        // Expand the node hierarchy based on the IDs from locationData
                        if (currentNode.children?.length > 0) {
                            let filteredNodes = await removeChildrenNodes(currentNode.children, null, featureId, treeDataProps, originalTreeData);

                            for (let index = 0; index < filteredNodes.length; index++) {
                                const childNode = filteredNodes[index];
                                if (childNode.Name === deviceName) {
                                    // If the current node is the selected node based on SelectedNodeID
                                    selectedNodeKey = childNode.key;
                                    selectedNode = { node: childNode, event: "select" };
                                } else if (
                                    childNode.Name === roomName ||
                                    childNode.Name === floorName ||
                                    childNode.Name === locationName
                                ) {
                                    await traverseForAudit(childNode, true);
                                } else if (!deviceName && currentNode && processStringToCompare(currentNode.NodeType, "Location")) {
                                    selectedNodeKey = currentNode.key
                                    selectedNode = { node: currentNode, event: "select" };
                                }
                            }
                            if (!selectedNodeKey) {
                                selectedNodeKey = filteredNodes[0].key;
                                selectedNode = { node: filteredNodes[0], event: "select" };
                            }

                        }
                        else {
                            if (processStringToCompare(currentNode.NodeType, "floor") || processStringToCompare(currentNode.NodeType, "store")) {
                                let exploreType = 2;

                                const resp: iAPIResponse = await fetchFloorDevicesConfigurationHierarchy({ floorID: currentNode.NodeEntID, exploreType });
                                if (resp && resp.data && resp.data.hierarchyJson) {
                                    let apiData = JSON.parse(resp.data.hierarchyJson);
                                    let formattedData = await convertFlatDataToHierarchyData(apiData, currentNode.NodeEntID);
                                    if (formattedData && formattedData.length > 0) {
                                        originalTreeData = await addSubNode(originalTreeData, currentNode.key, formattedData, treeDataProps, featureId, true, currentNode.stepNo);
                                        let clonnedData = deepClone(formattedData)
                                        clonnedData = await removeChildrenNodes(clonnedData, null, featureId, treeDataProps, originalTreeData);
                                        currentNode.children = clonnedData;
                                        for (let index = 0; index < currentNode.children.length; index++) {
                                            const childNode = currentNode.children[index];
                                            if (
                                                childNode.Name === roomName ||
                                                childNode.Name === floorName ||
                                                childNode.Name === locationName
                                            ) {
                                                await traverseForAudit(childNode, true);
                                            } else if (childNode.Name === deviceName) {
                                                selectedNodeKey = childNode.key;
                                                selectedNode = { node: childNode, event: "select" };
                                            }
                                        }
                                    }
                                }

                            } else if (currentNode.Name === deviceName) {
                                // If the current node is the selected node based on SelectedNodeID
                                selectedNodeKey = currentNode.key;
                                selectedNode = { node: currentNode, event: "select" };
                            } else {
                                selectedNodeKey = currentNode.key;
                                selectedNode = { node: currentNode, event: "select" };
                            }
                        }
                    } else if (currentNode.Name === deviceName) {
                        // If the current node is the selected node based on SelectedNodeID
                        selectedNodeKey = currentNode.key;
                        selectedNode = { node: currentNode, event: "select" };
                    } else {
                        selectedNodeKey = currentNode.key;
                        selectedNode = { node: currentNode, event: "select" };
                    }
                }
                else {
                    if (currentNode.children.length === 1) {
                        await traverseForAudit(currentNode.children[0], false);
                    } else {
                        selectedNodeKey = currentNode.children[0].key;
                        selectedNode = { node: currentNode.children[0], event: "select" };
                    }
                }
            }
        }

        // Process each root node in the array
        if (trees?.length === 1) {
            for (const treeNode of trees) {
                await traverseForAudit(treeNode, false);
                if (!deviceName) {
                    expandKeys.pop();
                }
            }

            // await trees.forEach(async (treeNode: any) => await traverse(treeNode, false));
        }
    }
    else {
        // Extract IDs from location data (only if isRefreshed is true)
        const siteID = await locationData?.find((item: any) => item.VariableName === 'SiteID')?.SessionValue || null;
        const roomID = await locationData?.find((item: any) => item.VariableName === 'RoomID')?.SessionValue || null;
        const floorID = await locationData?.find((item: any) => item.VariableName === 'FloorID')?.SessionValue || null;

        const locationID = await locationData?.find((item: any) => item.VariableName === 'LocationID')?.SessionValue || null;
        const selectedNodeID = await locationData?.find((item: any) => item.VariableName === 'SelectedNodeID')?.SessionValue || null;
        const traverse = async (currentNode: any, isCalledForSession: boolean) => {
            if ((currentNode.children && currentNode.children.length > 0) || isCalledForSession) {
                expandKeys.push(currentNode.key);
                if (reuseDataForFeatures.includes(featureId) && siteID && (roomID || floorID || locationID || selectedNodeID)) {
                    // Logic for when IsRefreshed is true (use locationData)
                    if (currentNode.key === siteID || currentNode.key === roomID || currentNode.key === floorID || currentNode.key === locationID) {
                        // Expand the node hierarchy based on the IDs from locationData
                        if (currentNode.children?.length > 0) {

                            for (let index = 0; index < currentNode.children.length; index++) {
                                const childNode = currentNode.children[index];
                                if (childNode.key === selectedNodeID) {
                                    // If the current node is the selected node based on SelectedNodeID
                                    selectedNodeKey = childNode.key;
                                    selectedNode = { node: childNode, event: "select" };
                                } else if (
                                    childNode.key === roomID ||
                                    childNode.key === floorID ||
                                    childNode.key === locationID
                                ) {

                                    await traverse(childNode, true);
                                }
                            }
                            if (!selectedNodeKey) {
                                selectedNodeKey = currentNode.children[0].key;
                                selectedNode = { node: currentNode.children[0], event: "select" };
                            }

                        }
                        else {

                            if (processStringToCompare(currentNode.NodeType, "floor") || processStringToCompare(currentNode.NodeType, "store")) {
                                let exploreType = 2;
                                if (featureId === FEnums.AssetConfiguration) {
                                    exploreType = 2;
                                } else if (featureId === FEnums.DeviceConfiguration) {
                                    exploreType = 3;
                                }
                                else if (featureId === FEnums.InventoryManagement || featureId === FEnums.InventoryConfiguration) {
                                    exploreType = 1;
                                }
                                const resp: iAPIResponse = await fetchFloorDevicesConfigurationHierarchy({ floorID: currentNode.NodeEntID, exploreType });
                                if (resp && resp.data && resp.data.hierarchyJson) {
                                    let apiData = JSON.parse(resp.data.hierarchyJson);
                                    let formattedData = await convertFlatDataToHierarchyData(apiData, currentNode.NodeEntID);
                                    if (formattedData && formattedData.length > 0) {
                                        originalTreeData = await addSubNode(originalTreeData, currentNode.key, formattedData, treeDataProps, featureId, true, currentNode.stepNo);
                                        let clonnedData = deepClone(formattedData)
                                        currentNode.children = clonnedData;
                                        clonnedData = await removeChildrenNodes([currentNode], null, featureId, treeDataProps, originalTreeData);
                                        for (let index = 0; index < currentNode.children.length; index++) {
                                            const childNode = currentNode.children[index];
                                            if (
                                                childNode.key === roomID ||
                                                childNode.key === floorID ||
                                                childNode.key === locationID
                                            ) {
                                                await traverse(childNode, true);
                                            } else if (childNode.key === selectedNodeID) {
                                                selectedNodeKey = childNode.key;
                                                selectedNode = { node: childNode, event: "select" };
                                            }
                                        }
                                    }
                                }

                            } else if (currentNode.key === selectedNodeID) {
                                // If the current node is the selected node based on SelectedNodeID
                                selectedNodeKey = currentNode.key;
                                selectedNode = { node: currentNode, event: "select" };
                            } else {
                                selectedNodeKey = currentNode.key;
                                selectedNode = { node: currentNode, event: "select" };
                            }
                        }
                    } else if (currentNode.key === selectedNodeID) {
                        // If the current node is the selected node based on SelectedNodeID
                        selectedNodeKey = currentNode.key;
                        selectedNode = { node: currentNode, event: "select" };
                    } else {
                        selectedNodeKey = currentNode.key;
                        selectedNode = { node: currentNode, event: "select" };
                    }
                }
                else {
                    if (currentNode.children.length === 1) {
                        await traverse(currentNode.children[0], false);
                    } else {
                        selectedNodeKey = currentNode.children[0].key;
                        selectedNode = { node: currentNode.children[0], event: "select" };
                    }
                }
            }
        }

        // Process each root node in the array
        if (trees?.length === 1) {
            for (const treeNode of trees) {
                await traverse(treeNode, false);
            }
            // await trees.forEach(async (treeNode: any) => await traverse(treeNode, false));
        }
    }
    return {
        expandKeys,
        selectedNodeKey,
        selectedNode: selectedNode,
        originalTreeData
    };
}

export const removeChildrenNodes = async (treeData: ITreeNode[], keyToFind: string | null, featureId: string, treeProps: iTreeProps, originalData: ITreeNode[]) => {

    const updateNode = async (nodes: any[]) => {
        for (let i = 0; i < nodes.length; i++) {
            const node: ITreeNode = nodes[i];
            if (keyToFind && node.key === keyToFind) {
                let foundNodes = await findChildrenBasedOnKey(originalData, node.key, featureId);
                if (!foundNodes || !foundNodes.length) {
                    node.HasChildren = node.NodeType && (processStringToCompare(node.NodeType, "Floor") || processStringToCompare(node.NodeType, "Store")) ? node.HasChildren : 0;
                    node.isLeaf = node.HasChildren != null && node.NodeType && (processStringToCompare(node.NodeType, "Floor") || processStringToCompare(node.NodeType, "Store")) && node.HasChildren > 0 ? false : true;
                    node.children = [];
                }
                else {
                    foundNodes = await updateNodeWithTitleAndIcon(foundNodes, treeProps, featureId);
                    node.children = foundNodes;
                }
            }
            else {
                let foundNodes = await findChildrenBasedOnKey(originalData, node.key, featureId);
                if (!foundNodes || !foundNodes.length) {
                    node.HasChildren = node.NodeType && (processStringToCompare(node.NodeType, "Floor") || processStringToCompare(node.NodeType, "Store")) ? node.HasChildren : 0;
                    node.isLeaf = node.HasChildren != null && node.NodeType && (processStringToCompare(node.NodeType, "Floor") || processStringToCompare(node.NodeType, "Store")) && node.HasChildren > 0 ? false : true;
                    node.children = [];
                }
                else {
                    foundNodes = await updateNodeWithTitleAndIcon(foundNodes, treeProps, featureId);
                    node.children = foundNodes;
                }
            }

            if (node.children) {
                // Recursively call addNode for the children
                await updateNode(node.children);
            }
        }
    };

    await updateNode(treeData);
    return treeData;
}

export const expanedSigleNode = async (treedata: any, id: any, expadedKey: any, Feature: any, stepNo: any = 0, EntityName: any = '', embeddedSessionId: string | null = null, instanceName: string = "", useUIDForKey: boolean = false) => {
    let updateTreedata: any;
    let addExpanedkey: any;
    const { data, errorObj } = await MakeFloorDevices(Feature, id, expadedKey, treedata, stepNo, EntityName, embeddedSessionId, instanceName, useUIDForKey)
    if (data?.length == 0) {
        updateTreedata = treedata
        addExpanedkey = expadedKey
    } else {
        updateTreedata = data.TreeData
        addExpanedkey = data.expandedkey
    }
    return { updateTreedata, addExpanedkey, errorObj }
    // let addExpanedkey = [...expadedKey, ...data.expandedkey]
    // return { updateTreedata, addExpanedkey }

}
const MakeFloorDevices = async (FeatureID: any, floorID: any, expadedKeyold: any, treeData: any, stepNo: any = 0, EntityName: any = '', embeddedSessionId: string | null = null, instnaceName: string = "", useUIDForKey: boolean = false) => {
    let payload: any = {
        floorID: floorID,
        isSearch: false,
        keyword: "",
        sessionId: embeddedSessionId,
        configurationType: 0
    }
    let data: any = [];
    let errorObj: any = null;
    if (instnaceName == "asset_management" && (FeatureID == FEnums.AssetManagement || FeatureID == FEnums.ManageAuditSessions || FeatureID == FEnums.AuditDataCenter || FeatureID == FEnums.InventoryReconciliation || FeatureID == FEnums.Discover || FeatureID == FEnums.Monitor || FeatureID == FEnums.AssetNetworkCabling || FeatureID == FEnums.AssetPowerCabling || FeatureID == FEnums.DeviceNetworkCabling || FeatureID == FEnums.DevicePowerCabling)) {
        payload.exploreType = 2
        payload.configurationType = FeatureID == FEnums.AssetNetworkCabling ? 1 : FeatureID == FEnums.AssetPowerCabling ? 2 : 0
        await floorDevices(payload).then(async (resp: any) => {
            if (
                checkIsSuccess(resp)
            ) {
                if (resp.data) {
                    let node: any = []
                    var DataRes = resp.data;
                    if (DataRes.hierarchyJson) {
                        DataRes = await JSON.parse(DataRes.hierarchyJson)
                    }


                    if (DataRes.length) {
                        return await makeFloorDataToTreeView(DataRes, expadedKeyold, floorID, treeData, "", stepNo, null, FeatureID, instnaceName, false, useUIDForKey)
                        // if (res) {
                        //     newTreeData = res.TreeData
                        //     expandedkey.push(...res.expandedkey)
                        // }
                        // return await makeTreeDataForFloorAPIMgt(DataRes, floorID, stepNo)
                        // return data

                    }
                }

            }
            else {
                var message = getMessageFromArray(resp.errData);
                errorObj = {
                    type: "ERROR",
                    message: message,
                };
            }
        });
    } else if (instnaceName == "asset_management" && FeatureID === FEnums.InventoryManagement) {
        payload.exploreType = 1
        await floorDevices(payload).then(async (resp: any) => {
            if (
                checkIsSuccess(resp)
            ) {
                if (resp) {
                    let node: any = []
                    var DataRes = resp.data;
                    if (DataRes.hierarchyJson) {
                        DataRes = JSON.parse(DataRes.hierarchyJson)
                    }

                    if (DataRes) {
                        data = await makeFloorDataToTreeView(DataRes, expadedKeyold, floorID, treeData, "", stepNo, null, FeatureID, instnaceName, false, useUIDForKey)
                        // if (res) {
                        //     newTreeData = res.TreeData
                        //     expandedkey.push(...res.expandedkey)
                        // }
                        // return await makeTreeDataForFloorAPIMgt(DataRes, floorID, stepNo)
                        // return data


                    }

                }
            }
            else {
                var message = getMessageFromArray(resp.errData);
                errorObj = {
                    type: "ERROR",
                    message: message,
                };
            }
        });
    } 
    else if (instnaceName == "asset_management" && FeatureID === FEnums.PhysicalCompute) {
       
        }

    return { data, errorObj }
}
interface FilterResults {
    visibleTree: any | null;
}


export function getVisibleNodesBasedOnExpandedKeys(treeData: any[], expandedKeys: string[], treeDataPorps: iTreeProps, featureId: string): FilterResults {

    let visibleNodes: any[] = [];

    if (expandedKeys.length === 0) {
        // Return root nodes with children removed
        visibleNodes = treeData.map(node => ({ ...node, children: [] }));
        return { visibleTree: visibleNodes };
    }

    const findVisibleNodes = (data: ITreeNode[], parentNode: any, nodeIndex: number = 0): void => {
        for (let index = 0; index < data.length; index++) {
            let element = data[index];
            element.stepNo = nodeIndex + 1;
            element.NaturalSortorder = index;
            element.title = getTreeNodeTitle(element, treeDataPorps, featureId);
            element.checkable = isShowCheckbox(element, featureId);
            if (treeDataPorps.hideicon === false) {
                element.icon = getTreeNodeIcon(element);
            }
            // Check if the current element is expanded
            if (expandedKeys.includes(element.key)) {
                const newNode = { ...element, children: [] };

                if (parentNode) {
                    parentNode.children.push(newNode);
                } else {
                    visibleNodes.push(newNode);
                }

                // Recursively process children of the expanded node
                if (element.children && element.children.length > 0) {
                    findVisibleNodes(element.children, newNode, nodeIndex + 1);
                }
            } else {
                // Check if this node should be included due to expanded children
                const filteredChildren = element.children ? [] : null;

                if (filteredChildren) {
                    const filteredNode = { ...element, children: filteredChildren };
                    if (parentNode) {
                        parentNode.children.push(filteredNode);
                    } else {
                        visibleNodes.push(filteredNode);
                    }
                }
            }
        }
    };
    findVisibleNodes(treeData, null);

    return { visibleTree: visibleNodes };
}

export const getAutoExpandNodeKeys = async (treeData: any, isClear: boolean) => {
    if (isClear) {
      keysToExpand = [];
    }
    if (treeData?.length > 0) {
  
      await treeData.forEach(async (item: any) => {
        if (item.children?.length == 1) {
          if (item.children[0].children?.length > 0) {
            keysToExpand.push(item.children[0].key)
          }
          await getAutoExpandNodeKeys(item.children, false);
        }
        else {
          return keysToExpand;
        }
      });
    }
    return keysToExpand;
  }

  export const getTodayTimeString = () => {
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
  export const autoExpandDefaultNodesOfTreeLib = async (treeData: TreeNodeType[]) => {
    let expKeys: any[] = [];
    let selKeys: any[] = [];
    let selNodes: any
    let isSelected = false;
  
    const expandAuto = async (nodes: TreeNodeType[]) => {
      for (let index = 0; index < nodes.length; index++) {
        const element = nodes[index];
        expKeys.push(element.key);
  
        if (element.children && element.children.length === 1) {
          isSelected = false
          await expandAuto(element.children);
        } else if (element.children && element.children.length > 1) {
          expKeys.push(element.key);
          selKeys.push(element.children[0].key);
          selNodes = element.children[0];
          isSelected = true;
          break;
        } else {
          selKeys.push(element.key);
          selNodes = element;
          break;
        }
      }
    };
  
    await expandAuto(treeData);
    return { expandedKeys: expKeys, selectedKeys: selKeys, selectedNode: selNodes, isSelected };
  };

  export const GetPropertyValue = async (eqId: string) => {
    try {
      await getPropertiesForEqidlist([eqId]).then((resp) => {

        const librarypropertywithskeloton = resp.data.deviceJson
        let parse = JSON.parse(librarypropertywithskeloton)
        let property = parse.find((item: any) => item.TableName === "Hardware")
        let parseProperty = JSON.parse(property.Properties)
        console.log("property", parseProperty)

        return parseProperty
      })
    } catch (error) {
      console.error('API Error:', error);
    } finally {
    }
  }
  export const callApiForGetDevicePreview = async (shapeId: string) => {
    try {
      await getDevicemodelSvg(shapeId).then((resp) => {

        const parsesvg = JSON.parse(resp.data.devicePreviewJson)
        return parsesvg
      })
    } catch (error) {
      console.error('Error fetching device preview:', error);
    }
  };


  export const autoExpandDefaultNodesOfTree = async (treeData: any, isClear: boolean) => {
    if (isClear) {
      expKeys = [];
      selKeys = [];
      selNodes = [];
      updatedTree = treeData;
    }
    for (let index = 0; index < treeData.length; index++) {
      const element = treeData[index];
      expKeys.push(element.key);
      selKeys = [element.key];
      selNodes = [element];
  
      if (element.children && element.children.length == 1) {
        await autoExpandDefaultNodesOfTree(element.children, false);
      }
      else if (element.children && element.children.length > 1) {
        selKeys = [element.children[0].key];
        selNodes = element.children[0];
        break;
      }
    }
    return { expKeys, selKeys, selNodes, updatedTree }
  }  


  let exandeKeys: any = []
let selectKey: any = null
let selectedNodeInfo: any = null
  export const getExpandedNodeKeysBasedOnId = async (treeData: any, id: string, clear: boolean) => {
    if (clear) {
      exandeKeys = []
      selectKey = null
      selectedNodeInfo = null
    }
    let result = await getKeyFromEntId(treeData, id, true);
    if (result && result.key) {
      selectKey = [result.key];
      selectedNodeInfo = result.node.node;
      let parentNodes = await getParentNodesFromTreeData(treeData, result.node.node, true);
  
      if (parentNodes?.length > 0) {
        parentNodes.forEach((element: any) => {
          exandeKeys.push(element.key);
        });
      }
    }
    return { selectKey, exandeKeys, selectedNodeInfo }
  }

  export const getSelectedKeyFromEntId = (treeData: any, entId: any, expandedKeys: any, clearKey = false) => {
    if (clearKey) {
      key = "";
      node = null;
    }
    if (key == "") {
      let data = treeData.filter((item: any) => { return expandedKeys?.includes(item.key) });
      if (data?.length > 0) {
        data.forEach((item: any) => {
  
          if (item.NodeEntID == entId || (!expandedKeys?.includes(item.key) && entId == "" && key == "")) {
            key = item.key;
            node = { node: item };
            return { key, node };
          }
          if (item.children) {
            getSelectedKeyFromEntId(item.children, entId, expandedKeys);
          }
        });
      }
      else if (treeData?.length == 1 && entId == "" && key == "") {
        treeData.forEach((item: any) => {
  
          if (item.children?.length != 1 && entId == "" && key == "") {
            key = item.key;
            node = { node: item };
            return { key, node };
          }
          if (item.children) {
            getSelectedKeyFromEntId(item.children, entId, expandedKeys);
          }
        });
      }
      else {
        let selectedNode: any = null;
        if (treeData?.length > 1) {
          selectedNode = treeData.filter((item: any) => {
            return item.NodeEntID == entId
          });
          selectedNode = selectedNode?.length > 0 ? selectedNode[0] : treeData[0];
        }
        else {
          selectedNode = treeData[0];
        }
        if (selectedNode) {
          key = selectedNode.key;
          node = { node: selectedNode };
        }
        return { key, node };
      }
    }
    return { key, node };
  }

  let keysToExpandNode: string[] = [];
let nodeToSelect: any = null;
export const getNodesToExpandAndSelect = async (treeData: any, isClear: boolean) => {
  if (isClear) {
    keysToExpandNode = [];
    nodeToSelect = null;
  }
  if (treeData?.length > 0) {

    await treeData.forEach(async (item: any) => {
      if (item.children?.length > 0) {
        keysToExpandNode.push(item.key);
      }
      if (item.children?.length > 1) {
        nodeToSelect = item.children[0];
      }
      else if (item.children?.length == 1) {
        // if (item.children[0].children?.length > 0) {
        //   keysToExpand.push(item.children[0].key)
        // }
        keysToExpandNode.push(item.key);
        await getNodesToExpandAndSelect(item.children, false);
      }
      else {
        // if (!keysToExpandNode?.length) {
        nodeToSelect = item;
        // }
        return { keysToExpandNode, nodeToSelect };
      }
    });
  }
  return { keysToExpandNode, nodeToSelect };
}

let nodeKeys: any = [];
export const autoExpandAndSelectChild = async (node: any, clear = false, controlName: any = "", embeddedSessionId: string | null = null) => {
    if (clear) {
        nodeKeys = [];
        selectedNode = null;
    }
    if (node.children && node.children.length === 1) {
        nodeKeys.push(node.children[0].key);
        selectedNode = node.children[0];
        // await updateSRFLVariablesForAuto(node.treetype, node.NodeEntID, node.Name, node, controlName, embeddedSessionId).then((resp: any) => {
        // });
        // await setSelectedNodeVariable(node.children[0], controlName, embeddedSessionId);
        await autoExpandAndSelectChild(node.children[0], false, controlName, embeddedSessionId);
    }
    else if ((!node.children || node.children.length == 0) && node.isLeaf == false) {
        nodeKeys = nodeKeys.filter((item: any) => { return item != node.key });
        // await setSelectedNodeVariable(node, controlName, embeddedSessionId);
        selectedNode = node.children[0];
    }
    else if (node.children?.length > 1) {

        if (node.children?.length == 1)
            nodeKeys.push(node.children[0].key);
        // await updateSRFLVariablesForAuto(node.treetype, node.NodeEntID, node.Name, node, controlName, embeddedSessionId).then((resp: any) => {
        // });
        // await setSelectedNodeVariable(node.children[0], controlName, embeddedSessionId);
        selectedNode = node.children[0];
    }
    return { nodeKeys, selectedNode };
}

let nameNodeData: any = null
export const getNodeDetailsBaseOnNodeName = (treeData: any, name: any) => {

  treeData.forEach((item: any) => {
    if (item.Name == name) {
      nameNodeData = { node: item };
      return { name, node };
    } else {
      if (item.children)
        getNodeDetailsBaseOnNodeName(item.children, name)
    }
  });

  return { name, nameNodeData };
}

export const handleNodeExpand = async (treeData: any, exandeKeys: any, info: any, controlName: any, feature: any, keyword: any, hideKebabMenu: any, embeddedSessionId: string | null = null, useUIDForKey: boolean = false) => {


    let newTreeData;
    let error: any = {}
    let selectedNode: any;

    // if (info.node.children.length === 1 || info.node.children.length === 0) {
    // }
    // let key = await autoExpandChild(info && info.node)
    // if (key?.length > 0) {
    //     exandeKeys = [...exandeKeys, ...key];
    // }
  

    if ((controlName === "asset_management" && (feature == FEnums.InventoryManagement || feature == FEnums.ManageAuditSessions || feature == FEnums.AuditDataCenter || feature == FEnums.InventoryReconciliation || feature == FEnums.InventoryConfiguration || feature == FEnums.AssetConfiguration || feature == FEnums.AssetNetworkCabling || feature == FEnums.AssetPowerCabling || feature == FEnums.DeviceManagement || feature == FEnums.DeviceConfiguration || feature == FEnums.AssetManagement || feature == FEnums.DevicePowerCabling || feature == FEnums.DeviceNetworkCabling || feature == FEnums.Monitor || feature == FEnums.Discover || feature == FEnums.PhysicalCompute))
        || controlName === "device_inventory_tree" || controlName == "DCI_form_site" || controlName == "DCI_to_site") {

        // NK code for bug number 7
        if (info.node.children?.length > 0) {

            let nodeData = await autoExpandChildNodes(info && info.node, true, controlName, embeddedSessionId)
            if (nodeData && nodeData?.lastExpandedNode && nodeData?.lastExpandedNode.isLeaf == false) {
                console.log('nodeData?.lastExpandedNode', nodeData?.lastExpandedNode)
                if (nodeData?.lastExpandedNode.treetype === "Floor" || nodeData?.lastExpandedNode.treetype === "Room") {
                    if (nodeData?.lastExpandedNode.treetype === "Floor") {
                        await MakeExpInventoryMgtFloorDevices(nodeData?.lastExpandedNode.NodeEntID, treeData, feature, keyword, exandeKeys, nodeData?.lastExpandedNode.stepNo, nodeData?.lastExpandedNode.NodeEntityname, nodeData?.lastExpandedNode.parentEntID, hideKebabMenu, controlName, false, embeddedSessionId, useUIDForKey).then((resp: any) => {
                            if (resp && resp.newTreeData) {
                                newTreeData = resp.newTreeData;
                                exandeKeys = resp.expandedkey;
                                error = resp.error;
                            }
                        });
                    } else {
                        if (nodeData?.lastExpandedNode.children.length === 1) {
                            let data = nodeData?.lastExpandedNode.children[0]
                            if (data) {

                                await MakeExpInventoryMgtFloorDevices(data.NodeEntID, treeData, feature, keyword, exandeKeys, data.stepNo, nodeData?.lastExpandedNode.NodeEntityname, nodeData?.lastExpandedNode.parentEntID, hideKebabMenu, controlName, false, embeddedSessionId, useUIDForKey).then((resp: any) => {
                                    if (resp && resp.newTreeData) {
                                        newTreeData = resp.newTreeData;
                                        exandeKeys = resp.expandedkey;
                                        error = resp.error;

                                    }
                                });
                            }
                        }

                    }
                } else if (nodeData?.lastExpandedNode.treetype === "View" && feature == FEnums.InventoryConfiguration) {
                    await makeCallForInvMgtHier(nodeData?.lastExpandedNode.NodeEntID, treeData, feature, nodeData?.lastExpandedNode.key, keyword, nodeData?.lastExpandedNode.stepNo, nodeData?.lastExpandedNode.parentEntID, hideKebabMenu, false, embeddedSessionId, useUIDForKey).then((resp: any) => {
                        if (resp && resp.newTreeData) {
                            exandeKeys = [...exandeKeys, ...resp.expandedKeys]
                            newTreeData = resp.newTreeData;
                            error = resp.error;
                        }
                    });
                }
                else if (nodeData?.lastExpandedNode.treetype === "Slot") {
                    await makeCallForInvMgtHier(nodeData?.lastExpandedNode.MountedDeviceID, treeData, feature, nodeData?.lastExpandedNode.key, keyword, nodeData?.lastExpandedNode.stepNo, nodeData?.lastExpandedNode.parentEntID, hideKebabMenu, false, embeddedSessionId, useUIDForKey).then((resp: any) => {
                        if (resp && resp.newTreeData) {
                            exandeKeys = [...exandeKeys, ...resp.expandedKeys]
                            newTreeData = resp.newTreeData;
                            error = resp.error;
                        }
                    });
                }
            }
            // if (key?.length > 0) {
            //     exandeKeys = [...exandeKeys, ...key];
            // }


        }
        else {


            if (info.node.treetype === "Floor" || info.node.treetype === "Room") {
                if (info.node.treetype === "Floor") {
                    await MakeExpInventoryMgtFloorDevices(info.node.NodeEntID, treeData, feature, keyword, exandeKeys, info.node.stepNo, info.node.NodeEntityname, info.node.parentEntID, hideKebabMenu, controlName, false, embeddedSessionId, useUIDForKey).then((resp: any) => {
                        if (resp && resp.newTreeData) {
                            newTreeData = resp.newTreeData;
                            exandeKeys = resp.expandedkey;
                            error = resp.error;
                        }
                    });
                } else {
                    if (info.node.children.length === 1) {
                        let data = info.node.children[0]
                        if (data) {

                            await MakeExpInventoryMgtFloorDevices(data.NodeEntID, treeData, feature, keyword, exandeKeys, data.stepNo, info.node.NodeEntityname, info.node.parentEntID, hideKebabMenu, controlName, false, embeddedSessionId, useUIDForKey).then((resp: any) => {
                                if (resp && resp.newTreeData) {
                                    newTreeData = resp.newTreeData;
                                    exandeKeys = resp.expandedkey;
                                    error = resp.error;

                                }
                            });
                        }
                    }

                }
            }
            else if (info.node.treetype === "View" && feature == FEnums.InventoryConfiguration) {
                await makeCallForInvMgtHier(info.node.NodeEntID, treeData, feature, info.node.key, keyword, info.node.stepNo, info.node.parentEntID, hideKebabMenu, false, embeddedSessionId, useUIDForKey).then((resp: any) => {
                    if (resp && resp.newTreeData) {
                        exandeKeys = [...exandeKeys, ...resp.expandedKeys]
                        newTreeData = resp.newTreeData;
                        error = resp.error;
                    }
                });
            }
            else if (info.node.treetype === "Slot") {
                await makeCallForInvMgtHier(info.node.MountedDeviceID, treeData, feature, info.node.key, keyword, info.node.stepNo, info.node.parentEntID, hideKebabMenu, false, embeddedSessionId, useUIDForKey).then((resp: any) => {
                    if (resp && resp.newTreeData) {
                        exandeKeys = [...exandeKeys, ...resp.expandedKeys]
                        newTreeData = resp.newTreeData;
                        error = resp.error;
                    }
                });
            }
        }
    } else if (controlName === "asset_management" && (feature == FEnums.VirtualCompute || feature == FEnums.CloudCompute)) {

        if (info.node.treetype === "Instance") {
            await MakeExpInventoryMgtFloorDevices(info.node.NodeEntID, treeData, feature, keyword, exandeKeys, 0, info.node.NodeEntityname, info.node.parentEntID, hideKebabMenu, controlName, false, embeddedSessionId, useUIDForKey).then((resp: any) => {
                if (resp && resp.newTreeData) {
                    newTreeData = resp.newTreeData;
                    exandeKeys = resp.expandedkey;
                    error = resp.error;
                }
            });
        } 
    }
  
    if (newTreeData) {
        return { newTreeData, exandeKeys, selectedNode, error }
    }
    else {

        return { exandeKeys, error, selectedNode }
    }

}

export const makeCallForInvMgtHier = async (deviceID: any, treeData: any, feature: any, key: any, keyword: any, stepNo: any = 0, parentEntID: any, hideKebabMenu: any, IsRefresh: any = false, embeddedSessionId: string | null = null, useUIDForKey: boolean = false) => {

    let payload: any = {
        deviceID: deviceID,
        isSearch: false,
        keyword: keyword,
        IsRefresh: IsRefresh,
        sessionId: embeddedSessionId
    }
    let newTreeData;
    let expandedKeys: any = [];
    let error: any = {}
    if (feature === FEnums.InventoryConfiguration) {
        payload.exploreType = 1
        await mountedDeviceConfiguration(payload).then(async (resp: any) => {
            if (checkIsSuccess(resp)) {
                if (resp.data) {
                    var DataRes = resp.data;
                    if (DataRes.deviceJson) {
                        DataRes = JSON.parse(DataRes.deviceJson)
                    }
                    if (Object.values(DataRes)[0] != null) {
                        let res = await makeTreeDataForHierApiConfig(DataRes, deviceID, treeData, parentEntID, stepNo, hideKebabMenu, IsRefresh, useUIDForKey, feature)
                        if (res) {
                            newTreeData = res.TreeData
                            expandedKeys = res.expadedKey;
                        }


                    }

                } else {
                    //No data found
                    
                }
            } else {
                var message = getMessageFromArray(resp.errData);
                error = {
                    type: "ERROR",
                    message: message,
                };
            }
        })
    } else if (feature == FEnums.AssetConfiguration) {
        payload.exploreType = 2
        await mountedDeviceConfiguration(payload).then(async (resp: any) => {
            if (checkIsSuccess(resp)) {
                if (resp.data) {
                    var DataRes = resp.data;
                    if (DataRes.deviceJson) {
                        DataRes = JSON.parse(DataRes.deviceJson)
                    }

                    if (Object.values(DataRes)[0] != null) {

                        let res = await makeTreeDataForHierApiConfig(DataRes, deviceID, treeData, parentEntID, stepNo, hideKebabMenu, IsRefresh, useUIDForKey, feature)
                        if (res) {
                            newTreeData = res.TreeData
                            expandedKeys = res.expadedKey;
                        }
                        // let deviceNode = await makeTreeDataForHierApiConfig(DataRes, deviceID, stepNo)
                        // if (deviceNode.length) {
                        //     const returnData = appendDevice(treeData, deviceNode, key)
                        //     if (returnData.length) {
                        //         newTreeData = returnData;
                        //     }
                        // }


                    }


                } else {
                    //No data found
                   
                }
            } else {
                var message = getMessageFromArray(resp.errData);
                error = {
                    type: "ERROR",
                    message: message,
                };
            }
        })
    } else if (feature == FEnums.DeviceConfiguration || feature == FEnums.DeviceNetworkCabling || feature == FEnums.DevicePowerCabling) {
        payload.exploreType = 3
        await mountedDeviceConfiguration(payload).then(async (resp: any) => {
            if (checkIsSuccess(resp)) {
                if (resp.data) {
                    var DataRes = resp.data;
                    if (DataRes.deviceJson) {
                        DataRes = JSON.parse(DataRes.deviceJson)
                    }

                    let deviceNode: any = []
                    console.log('Object.values(DataRes', Object.values(DataRes))
                    console.log('DataRes', DataRes)
                    if (Object.values(DataRes)[0] != null) {
                        let res = await makeTreeDataForHierApiConfig(DataRes, deviceID, treeData, parentEntID, stepNo, hideKebabMenu, IsRefresh, useUIDForKey, feature)
                        if (res) {
                            newTreeData = res.TreeData
                            expandedKeys = res.expadedKey;
                        }
                        // let deviceNode = await makeTreeDataForHierApiConfig(DataRes, deviceID, stepNo)
                        // if (deviceNode.length) {
                        //     const returnData = appendDevice(treeData, deviceNode, key)
                        //     if (returnData.length) {
                        //         newTreeData = returnData;
                        //     }
                        // }


                    }

                } else {
                    //No data found
                    
                }
            } else {
                var message = getMessageFromArray(resp.errData);
                error = {
                    type: "ERROR",
                    message: message,
                };
            }
        })
    }
    console.log('newTreeData', newTreeData)
    return { newTreeData, error, expandedKeys }
}

export const makeTreeDataForHierApiConfig = async (DataRes: any, floorID: any, treeData: any = null, parentEntID: any = null, stepNo: any = 0, hideKebabMenu: any = null, isRefresh: boolean = false, useUIDForKey: boolean = false, featureId: string | null = null) => {
    let MainchildData;
    let TreeData;
    let expadedKey;
    for (const key of Object.keys(DataRes)) {
        const data: any = DataRes[key];
        let status = 0
        data && data.length > 0 && Object.values(data[0])?.forEach((ele) => {
            if (Array.isArray(ele)) {
                status = status + 1
            }
        })
        if (Array.isArray(data)) {
            let respData = await MakeTreeDataForExplorer(data, key, parentEntID, true, status === 1 ? true : false, stepNo, hideKebabMenu, featureId, "", useUIDForKey)

            MainchildData = respData.treeData
            expadedKey = respData.expandedkey
        }

    }
    const returnData = isRefresh ? appendDeviceIsRefresh(treeData, MainchildData, floorID) : appendDevice(treeData, MainchildData, floorID)
    if (returnData.length) {
        TreeData = returnData
    }
    return { TreeData, expadedKey }

}


let expandedKeys: any = [];
let lastExpandedNode: any = null;
export const autoExpandChildNodes = (node: any, clear = false, controlName: any = "", embeddedSessionId: string | null = null) => {
    if (clear) {
        expandedKeys = [];
        lastExpandedNode = null;
    }
    if (node.children && node.children.length === 1) {
        expandedKeys.push(node.children[0].key);
        lastExpandedNode = node.children[0];
        // updateSRFLVariablesForAuto(node.treetype, node.NodeEntID, node.Name, node, controlName, embeddedSessionId).then((resp: any) => {
        // });
        // autoExpandChildNodes(node.children[0], false, controlName, embeddedSessionId);
    }
    else if ((!node.children || node.children.length == 0) && node.isLeaf == false) {
        expandedKeys = expandedKeys.filter((item: any) => { return item != node.key });
        // setSelectedNodeVariable(node, controlName, embeddedSessionId);
    }
    else if (node.children?.length > 1) {
        if (node.children?.length == 1)
            expandedKeys.push(node.children[0].key);
        // updateSRFLVariablesForAuto(node.treetype, node.NodeEntID, node.Name, node, controlName, embeddedSessionId).then((resp: any) => {
        // });
        // setSelectedNodeVariable(node.children[0], controlName, embeddedSessionId);
        lastExpandedNode = node.children[0];
    }
    return { expandedKeys, lastExpandedNode };
}


// library module api svg and property
// const callApiForGetDevicePreview = async (shapeId: string) => {
//     try {
//       await getDevicemodelSvg(shapeId).then((resp) => {

//         const parsesvg = JSON.parse(resp.data.devicePreviewJson)
//         setSvgContent(parsesvg);
//         setPropertyData([])

//         console.log('Device Preview Response:', resp.data);
//       })
//     } catch (error) {
//       console.error('Error fetching device preview:', error);
//     }
//   };

//   const GetPropertyValue = useCallback(async (eqId: string) => {
//     setIsLoading(true);
//     try {
//       await getPropertiesForEqidlist([eqId]).then((resp) => {

//         const librarypropertywithskeloton = resp.data.deviceJson
//         let parse = JSON.parse(librarypropertywithskeloton)
//         let property = parse.find((item: any) => item.TableName === "Hardware")
//         let parseProperty = JSON.parse(property.Properties)
//         console.log("property", parseProperty)

//         setPropertyData(parseProperty);
//       })
//     } catch (error) {
//       console.error('API Error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [])