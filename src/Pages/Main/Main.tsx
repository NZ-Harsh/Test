import { useEffect, useState } from 'react';
import useTheme from '../../Theme';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import data from '../../nze.json';
import ReplyIcon from '@mui/icons-material/Reply';
import { getSessionVariableFromStorage } from '../../Common/Common';
import {iPropertyPaneProps, iSearchKeywordProps, iTreeProps } from '../../interface';
import { FEnums } from '../../Common/enums';
import DcInexplorer from '../../Components/Tabs/DcInexplorer/DcInexplorer';
import { resetTreeData } from '../../redux/reducers/TreedataReducer';
import { useDispatch } from 'react-redux';
interface SessionItem {
  SessionValue: string; // or the appropriate type for SessionValue
}
const Main = (props:any) => {
  useTheme(data.colortheme);
  const [activeTabs, setActiveTabs] = useState<number>(0);
  const [previousTabs, setPreviousTabs] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [transition, setTransition] = useState<boolean>(false);
const [searchProps, setSearchProps] = useState<iSearchKeywordProps>();
const [treeDataProps, setTreeDataProps] = useState<iTreeProps>();
const [propertyProps, setPropertyProps] = useState<iPropertyPaneProps>();
const [noOfTreesToShow, setNoOfTreesToShow] = useState<number>(1);
const [featureId, setFeatureId] = useState<any>();
const dispatch = useDispatch();

useEffect(() => {
  // Reset tree data when the component mounts
  dispatch(resetTreeData());

  // Optional cleanup for unmounting
  return () => {
      dispatch(resetTreeData());
  };
}, [dispatch]);

useEffect(() => {
  // Initialize props for the default tab (DataCenter)
  const defaultFeatureId = FEnums.PhysicalCompute; // Adjust this based on your default tab's feature
  const isShowCheckbox = ![
    FEnums.InventoryConfiguration,
    FEnums.InventoryManagement,
    FEnums.Monitor,
    FEnums.Discover,
    FEnums.PhysicalCompute,
    FEnums.VirtualCompute,
    FEnums.CloudCompute,
  ].includes(defaultFeatureId);

  const isOpenAllNodes = [
    FEnums.PhysicalCompute,
    FEnums.Discover,
    FEnums.Monitor,
    FEnums.InventoryManagement,
    FEnums.VirtualCompute,
    FEnums.CloudCompute,
  ].includes(defaultFeatureId);

  const treeData: iTreeProps = {
    instanceName: "asset_management",
    hideKebabMenu: false,
    hideCheckBox: isShowCheckbox,
    hideicon: false,
    isAllowDrag: false,
    hideCopyIcon: false,
    isAllowDrop: [FEnums.DeviceConfiguration, FEnums.DeviceManagement, FEnums.InventoryManagement, FEnums.InventoryConfiguration].includes(defaultFeatureId),
    internalDrag: [FEnums.DeviceConfiguration, FEnums.DeviceManagement].includes(defaultFeatureId),
    indexNumber: 0,
    openAllNodes: isOpenAllNodes,
    handleFlatData: true,
  };

  setTreeDataProps(treeData);
  setSearchProps({
    hideFilter: false,
    hideKwdControl: false,
    findNodeLabel: false,
  });
  setPropertyProps({
    isShow: true,
  });
}, []); // Runs only on the first render

useEffect(() => {
  if (activeTabs === 0 || activeTabs === 1) {
    const isShowCheckbox = ![
      FEnums.InventoryConfiguration,
      FEnums.InventoryManagement,
      FEnums.Monitor,
      FEnums.Discover,
      FEnums.PhysicalCompute,
      FEnums.VirtualCompute,
      FEnums.CloudCompute,
    ].includes(featureId);

    const isOpenAllNodes = [
      FEnums.PhysicalCompute,
      FEnums.Discover,
      FEnums.Monitor,
      FEnums.InventoryManagement,
      FEnums.VirtualCompute,
      FEnums.CloudCompute,
    ].includes(featureId);

    const treeData: iTreeProps = {
      instanceName: "asset_management",
      hideKebabMenu: false,
      hideCheckBox: isShowCheckbox,
      hideicon: false,
      isAllowDrag: false,
      hideCopyIcon: false,
      isAllowDrop: [FEnums.DeviceConfiguration, FEnums.DeviceManagement, FEnums.InventoryManagement, FEnums.InventoryConfiguration].includes(featureId),
      internalDrag: [FEnums.DeviceConfiguration, FEnums.DeviceManagement].includes(featureId),
      indexNumber: 0,
      openAllNodes: isOpenAllNodes,
      handleFlatData: true,
    };

    setTreeDataProps(treeData);
    setSearchProps({
      hideFilter: false,
      hideKwdControl: false,
      findNodeLabel: false,
    });
    setPropertyProps({
      isShow: true,
    });
  }
}, [activeTabs, featureId]);

  const handleChange = (_event: any, newValue: number) => {
    setLoading(true);
    setPreviousTabs(activeTabs);
    setTransition(true);
    if(newValue === 0){
      
    }
    setTimeout(() => {
      setActiveTabs(newValue);
      setTransition(false);
      setLoading(false);
    }, 300);  
  };

  // Handle ReplyIcon click to go back to the previous tab
  const handleBackToPreviousTab = () => {
    setActiveTabs(previousTabs);
  };
  // const sessionvariable:any = getStorageItem("session_variables")
  const sessionvariable: SessionItem[] = getSessionVariableFromStorage("Location", "SiteName")
  console.log("sitename", sessionvariable)
  const sessionValues = sessionvariable.map(item => item.SessionValue);

  


  return (
    <div className="main-page">
      {/* Backdrop with CircularProgress for loading */}
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <div className="button-container">
        <div className="back-icon" onClick={handleBackToPreviousTab} title="Back">
          <ReplyIcon />
        </div>
        <h5 className="sign-out-button" title="Sign Out">Sign-Out</h5>
        <h5 className="site-name" title="LANShark Tower">[{sessionValues}]</h5>
      </div>

      <div className="tab-container">
        <div className='tab'>
        <Tabs
        aria-label="basic tabs example"
        className="custom-tabs"
        value={activeTabs}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"         
      >
        <Tab label="DataCenter"/>
        <Tab label="Inventory"/>
        <Tab label="Library"/>
      </Tabs>
          {/* <IconButton className='scroll-btn'> <ChevronRightIcon /></IconButton> */}
        </div>

        

        <div
          className='tabs-content'>
          {activeTabs === 0 && <DcInexplorer instanceName = 'asset_management'
          treeProps={treeDataProps}
          featureId='106'
          searchProps={searchProps}
          propertyPaneProps={propertyProps}
           paneName="Explorer" noOfTreesInPage={2}
          // handleNodeCheckedEvent={(checkedkey:any)=>{}}
          />}
          {activeTabs === 1 && <DcInexplorer instanceName = 'asset_management' 
          treeProps={treeDataProps} searchProps={searchProps}
          propertyPaneProps={propertyProps} paneName="Explorer" featureId='356' noOfTreesInPage={2}
          />}
          {activeTabs === 2 && <DcInexplorer instanceName = 'Library' />}
        </div>
      </div>
    </div>
  );
};

export default Main;
