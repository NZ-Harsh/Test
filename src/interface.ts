
export interface TreeNode {
    title: any;
    key: string;
    children?: TreeNode[];
    isLeaf?: boolean;
    EQID?:string,
    Description?:string,
    HasNetworkport?:boolean,
    HasPowerPorts?:boolean
    HasRelated?:boolean
    ShapeID?:number
    icon?:any,
    ProductNumber?:any
  
  }

  export interface TreeNodeType {
    title: string;
    key: string;
    children?: TreeNodeType[];
    isLeaf?: boolean;
    EQID?:string,
    Description?:string,
    HasNetworkport?:boolean,
    HasPowerPorts?:boolean
    HasRelated?:boolean
    ShapeID?:number
    icon?:any,
  }

  export interface TreeNodeType {
    title: string;
    key: string;
    children?: TreeNodeType[];
    isLeaf?: boolean;
    EQID?:string,
    Description?:string,
    HasNetworkport?:boolean,
    HasPowerPorts?:boolean
    HasRelated?:boolean
    ShapeID?:number
    icon?:any,
  }

  export interface PropertyItem {
    pName: string;
    pValue: string | number;
    pType: string | number;
    newValue: string;
  }

  export interface ITreeNode {
    key: string;
    NodeEntityname: string | null;
    NodeEntID: string | null;
    stepNo: number;
    parentEntID: string | null;
    NodeState: string | null;
    Description: string | null;
    checkable?: boolean;
    title: any;
    icon: any;
    children: ITreeNode[];
    treetype: any;
    Name: string | null;
    Type?: string | null;
    HasChildren: number | null;
    IsNZ?: boolean;
    Secured?: boolean;
    ParentEQID?: string | number;
    GroupName?: string;
    IsAuthorized?: boolean;
    IsPatchPort?: boolean;
    DCIFromSiteNode?: boolean;
    DCIToSiteNode?: boolean;
    className?: string;
    PortStatus?: string | null;
    NodeType?: string;
    ViewShortName?: string;
    SlotsNeeded?: number;
    EntityPgClass?: string;
    TableLabel?: string;
    HasRelated?: boolean;
    SubGroupEntID?: string | number;
    DeviceID?: string | number;
    EQID?: string | number;
    ShapeID?: string | number;
    disabled?: boolean;
    checkStrictly?: boolean;
    MountedDeviceEntID?: string;
    MountedDeviceViewEntID?: string;
    MountedDeviceName?: string;
    MountedDeviceDescription?: string;
    MountedDeviceHasPowerPort?: number;
    MountedDeviceHasNetworkPort?: number;
    MountedDeviceIntelDCMState?: string;
    MountedDeviceEntityName?: string;
    MountedDeviceNodeType?: string;
    isLeaf?: boolean;
    MaxInstances?: number;
    DisplayControl?: any;
    ParentName?: string;
    HasPowerPorts?: number;
    HasNetworkPorts?: number;
    PGClassName?: string;
    NaturalSortorder?: number;
    DisplayOrder?: number;
    MountPosition?: number;
    IntelDCMState?: string;
  newNode?:any
    [key: string]: any; // to allow dynamic properties
}

export interface iTreeProps {
  hideKebabMenu?: boolean;
  hideCheckBox?: boolean;
  hideicon?: boolean;
  hideCopyIcon?: boolean;
  reuseFromCache?: boolean;
  instanceName?: string;
  isAllowDrag?: boolean;
  isAllowDrop?: boolean;
  checkStrictly?: boolean;
  internalDrag?: boolean;
  indexNumber: number;
  multiRootNode?: boolean;
  showPropertyPaneOnly?: boolean;
  defaultExpandAll?: boolean;
  isNewSessionRequired?: boolean;
  useUIDForKey?: boolean;
  openAllNodes?: boolean;
  apiDataForTree?: any;
  handleFlatData?: boolean;
  hideFloorPane?: boolean;
}

export const APP = {
  TAGLINE: "Visual Data Center Infrastructure Management and Analytics",
  IMAGE_BASE_PATH:"/assets/",
  TEMPLATE_BASE_PATH:"/Templates/"
  // IMAGE_BASE_PATH:"https://storage.googleapis.com/n20-2023/n20-img-public/Templates/iCons/"
}

export interface iCustomTreeViewProps {
  handleNodeSelectEvent: (selectedKeys: string[], info: any, expandedKeys: string[], checkedKeys: string[], treeData: any) => void;
  handleNodeCheckedEvent: (checkedKeys: string[], info: any, selectedKeys: string[], expandedKeys: string[], treeData: any, halfCheckedKeys?: string[]) => void;
  handleDragStart?:any
  updateReloadState?: () => void;
  isReloadtree?: boolean;
  class?: string;
  controlName?: string;
  hideKebabMenu?: boolean;
  multiple?: boolean;
  isRightClickEnabled?: boolean;
  selectedKeys?: string[];
  localSession?: any;
  searchProps?:any
  embeddedSessionId?: any;
  showIcon?: boolean;
  draggable?: boolean;
  dropAllow?: boolean;
  checkable?: boolean;
  treeDataProps?: any;
  internalDrag?: boolean;
  indexNumber?: number;
  isUpdateOnly?: boolean;
  checkStrictly?: boolean;
  treeData?: any;
  halfCheckedKeys?: string[];
  expandedKeys: string[];
  selectedNodeData?: any[];
  checkedKeys?: string[];
  keyword?: string;
  useUIDForKey?: boolean;
  allowEditIcon?: boolean;
  allowAddIcon?: boolean;
  allowDeleteIcon?: boolean;
  handleReloadTreeview?: any;
  openAllNodes?: boolean;
  originalTreeData?: any;
  featureId?: string;
  defaultExpandAll?: boolean;
  splitterWidth?: number;
  updateOriginalTreeDataset?: (updatedTreeData: any, expandedKeys: string[], selectedKeys: string[], userTreeData: any) => void;
  handelEditIconOnTree?: any;
  handelAddIconOnTree?: any;
  handelDeleteIconOnTree?: any;
  hideCopyIcon?: boolean;
  handleCheckDragAndDrop?: (dragInfo: any, dropInfo: any, controlName: string) => void;
  handleFlatData?: boolean;
  isFloorTree?: boolean; // for floor device tree for floor pane
  selectedNodeExplorer?: any;
  selectedNode?:any
  instanceName?:any
  handleSelect?:any
  selectedkeys?:any
  updatedTreedata?:any
  handlesearch?:any
  hideCheckBox?:any
  showtree?:any
}

export interface iSessionData {
  VariableContext: string;
  VariableName: string;
  SessionValue: string | null;
}



export interface iAPIResponse {
  status: number;
  data: any;
  errData: iErrorData[]
}
export interface iErrorData {
  errCode: number;
  errString: string;
  isErr: boolean;
  timeStamp: string;
  apiName?: string;
  id?: number;
}



export interface iFormControlProps {
  value?: string | number[] | any;
  instanceName?: string;
  isForm?: boolean;
  node?: any;
  label: string;
  tooltip?: string;
  valueChange: (value: any, label: string, isDefault?: boolean) => void;
  requiredErrorMessage?: string;
  isRequired?: boolean | string;
  refTable?: string;
  refTableData?: any;
  isDefault?: boolean;
  api?: any;
  isObjectVal?: boolean;
  type?: string;
  data?: any;
  disabled?: boolean;
  placeholder?: string;
  optionsData?: any;
  groupName?: string;
  subGroupName?: string;
  nameDesc?: string;
  multiline?: boolean;
  displayLabel?: string;
  relativePath?: string;
  maxImage?: number;
  mask?: string;
  isCheckRequired?: boolean;
  isNew?: boolean;
  preventDefaultValue?: boolean;
  isCalenderControl?: boolean;
  menuIsOpen?: boolean;
  focusedControl?: string;
  stopEditing?: any;
  excludeRefValue?: string[];
}




export interface iFeatureExplorerContainerProps {
  treeProps?: iTreeProps | undefined;
  searchProps?: iSearchKeywordProps | undefined;
  paneName?: string;
  parentClassName?: string;
  showHeader?: boolean;
  showSaveButton?: boolean;
  headerText?: string;
  selectedNode?:any;
  featureId?: string;
  noOfTreesInPage?: number;
  selectedNodeInfo?: any;
  selectedNodeExplorer?: any;
  treeDataExplorer?: any;
  handleReloadTreeview?: any;
  handleReloadData?: any;
  checkedNodes?: any;
  checkedNodesMainTree?: any;
  selectedNodeMainTree?: any;
  treeDataArray?: iTreeDataObject[];
  selectedUserForAuth?: any;
  usersListForAuth?: any;
  handleNodeCheckedEvent?: any;
  handleNodeSelectedEvent?: any;
  handleSecondaryExplorerNodeSelectEvent?: any;
  allowEditIcon?: boolean;
  allowAddIcon?: boolean;
  allowDeleteIcon?: boolean;
  handelEditIconOnTree?: any;
  handelAddIconOnTree?: any;
  handelDeleteIconOnTree?: any;
  selectionObjForDCI?: any;
  allowShowPane?: boolean;
  allowHidePane?: boolean;
  handleCloseOpenPane?: any;
  apiDataForTree?: any;
  makeCheckNode?: any;
  handleCheckDragAndDrop?: any;
  hidePaneTitles?: string[];
  treeData?:any
  instanceName?:any
  originalTreeData?:any
  handlesearch?:any
  embeddedSessionId?: string | null;
  propertyPaneProps?:any

}
export interface iSearchKeywordProps {
  hideFilter?: boolean;
  hideKwdControl?: boolean;
  findNodeLabel?: boolean;
  hideSelectAll?: boolean;
  hideUpdateOnly?: boolean;
  hideExcludeRecID?: boolean;
}

export interface iTreeDataObject {
  instanceName: string;
  selectedNodeInfo?: any;
  checkedNodes?: any;
  checkedNodeKeys?: string[];
  localSessionData?: any;
  embeddedSessionId?: string | null;
}

export interface iPropertyPaneProps {
  isShow: boolean | false;
  isShowPreview?: boolean | false;
  isShowLayout?: boolean | false;
}

export interface IShouldSkip {
  shouldSkip: boolean;
  foundInChildren: boolean;
  isCheckedInChildren: boolean;
}