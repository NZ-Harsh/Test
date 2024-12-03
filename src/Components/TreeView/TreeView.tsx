
import Tree from 'rc-tree';
import { ReactSVG } from 'react-svg';
import { TreeNodeProps } from 'rc-tree';
import { useState, useEffect } from 'react';
import { autoExpandAndSelectChild, autoExpandDefaultNodesOfTreeLib, callApiForGetDevicePreview, getNodeDetailsBaseOnKey, getNodeDetailsBaseOnNodeName, getParentTreeInfoUseingDiv, GetPropertyValue, getSessionVariableFromStorage, processStringToCompare, updateSessionVariablesForSelectedNode } from '../../Common/Common';
import 'rc-tree/assets/index.css'
import { useDispatch, useSelector } from 'react-redux';
import { handleExpand } from '../../Common/NzTreeEvent';
import { updateTreeNodeBasedOnKey } from '../../Common/Common';
import { iCustomTreeViewProps } from '../../interface';
import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FEnums } from '../../Common/enums';
type Key = any;
const Treeview = (treeDataProps: iCustomTreeViewProps) => {
  console.log('treeDataProps :', treeDataProps);
  if (treeDataProps?.controlName == "dci_left_tree") {
      console.log('treeDataProps CustomTreeView', treeDataProps)
  }
  const controlName = treeDataProps.controlName ? treeDataProps.controlName : "";
  // const [searchParams] = useSearchParams();
  // const searchEntId = searchParams.get("id");
  const [treeData, setTreeData] = useState<any>([]);
  const [originalTreeData, setOriginalTreeData] = useState<any>([]);
  const [expandedNodes, setExpandedNode] = useState<any>([]);
  const [selectedNodeKeys, setSelectedNodeKeys] = useState<any>([]);
  const [checkNodeKeys, setcheckNodeKeys] = useState<any>([]);
  const [nodeCheckEntId, setNodeCheckEntId] = useState<any>([]);
  //Keyboard enter key for navigation
  const [onEnterActive, setOnEnterActive] = useState<any>();
  const [test, setTest] = useState<any>();
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<any>(null);
  const [focusedNode, setFocusedNode] = useState<boolean | null>(null);
  const [showLoader, setShowLoader] = useState<boolean>(false)
  const treeRef = useRef<any>(null);
  const dispatch = useDispatch();
  const featureId = treeDataProps.featureId
      ? treeDataProps.featureId
      : "";
  
  const selectNodeBasedOnName = async (nodeName: string) => {
      let NodeDetails: any = await getNodeDetailsBaseOnNodeName(treeData, nodeName)
      console.log('NodeDetails', NodeDetails)
  }
  const switcherIcon = ({ expanded, isLeaf, selected }: TreeNodeProps) => {
    if (isLeaf) {
      return null;
    }
    const svgColor = selected ? 'black' : 'var(--font-color)';
    return expanded ? (
      <ReactSVG
        src="./assets/Icons/Down_128x128.svg"
        beforeInjection={(svg) => {
          svg.setAttribute('fill', svgColor);
          svg.setAttribute('height', '16px');
          svg.setAttribute('width', '16px');
        }}
      />
    ) : (
      <ReactSVG
        src="./assets/Icons/Down_128x128.svg"
        beforeInjection={(svg) => {
          svg.setAttribute('fill', svgColor);
          svg.setAttribute('height', '16px');
          svg.setAttribute('width', '16px');
        }}
        style={{ transform: 'rotate(270deg)' }}
      />
    );
  };

  useEffect(() => {
      // Check if the length of treeData is greater than 0 and treeDataProps.dropAllow is truthy.
      if (treeData?.length > 0 && treeDataProps.dropAllow) {
          // If conditions are met, dispatch an action to update the state.
          dispatch({
              type: "DROP_ALLOW_TREE_OTHER_DETAILS",
              data: {
                  // Include specific details in the action data object.
                  expandedNodes: expandedNodes, // Expanded nodes in the tree.
                  hideKebabMenu: treeDataProps.hideKebabMenu, // A flag indicating whether to show kebab icon.
                  featureId: featureId, // Identifier for a specific feature.
                  treeData: treeData,// The tree data that triggered the action.
                  treeRef: treeRef
              }
          });
      }
  }, [treeData]);


  
 


  const resultSelectedKeys = useSelector((state:any) =>state.TreeDataReducer).result_tab_selected_key

  useEffect(() => {
      console.log('treeData 101011 :', treeDataProps?.treeData);
      if(controlName === "asset_management"){
        debugger
          setTreeData([...treeDataProps.treeData]);
        setSelectedNodeKeys(treeDataProps.selectedKeys)

      } else if (treeDataProps.instanceName === "nz-result-tab-tree" || treeDataProps.instanceName === "nz-related-tab-tree"){
        setTreeData(treeDataProps.treeData)
        if(treeDataProps.instanceName === "nz-result-tab-tree"){
            debugger
            if (treeDataProps.selectedNode){
                if(treeDataProps?.selectedNode?.nativeEvent){
                    setSelectedNodeKeys([treeDataProps?.selectedNode?.node?.key])
                    dispatch({type:'NODE_INFO',data:treeDataProps?.selectedNode})
                } else{
                    setSelectedNodeKeys([treeDataProps?.selectedNode?.key])
                    dispatch({type:'NODE_INFO',data:{node:treeDataProps?.selectedNode}})
    
                }
            } else {
                if (treeDataProps.treeData) {
                    debugger
                    // Apply autoExpand on first-time tree render
                    autoExpandDefaultNodesOfTreeLib(treeDataProps.treeData,).then(async ({ expandedKeys, selectedNode, isSelected }) => {
                setExpandedNode(expandedKeys)
                setSelectedNodeKeys([selectedNode.key])
                dispatch({type:'NODE_INFO',data:{node:selectedNode}})
            });
        
        }
            }

          
        } else {
            if( treeDataProps.instanceName === "nz-related-tab-tree"){
                if (treeDataProps.treeData) {
                    debugger
                    // Apply autoExpand on first-time tree render
                    autoExpandDefaultNodesOfTreeLib(treeDataProps.treeData,).then(async ({ expandedKeys, selectedNode, isSelected }) => {
                setExpandedNode(expandedKeys)
                setSelectedNodeKeys([selectedNode.key])
                dispatch({type:'NODE_INFO',data:{node:selectedNode}})
            });
        
        }
            }
        }
      


      }
      if (controlName === "setting_treeview") {
          setOriginalTreeData(JSON.parse(JSON.stringify(treeDataProps.treeData)));
                            
      } else if(controlName==="filter_form_site_treeview"){
        setTreeData([...treeDataProps.treeData])
        setSelectedNodeKeys(treeDataProps.selectedKeys)
      }
  }, [treeDataProps.treeData]);

  useEffect(() =>{
    console.log('selenodekeys',selectedNodeKeys)
  },[selectedNodeKeys])


  useEffect(() => {
      if (treeDataProps.expandedKeys?.length > 0) {
          setExpandedNode(treeDataProps.expandedKeys);
      }
      if (treeDataProps.checkStrictly && treeDataProps.checkedKeys) {
      }
      else if (treeDataProps.checkStrictly) {
      }
      else if (treeDataProps.checkedKeys) {
          setcheckNodeKeys(treeDataProps.checkedKeys);
      }
      if (treeDataProps.selectedNodeData) {
          setSelectedNodeInfo(treeDataProps.selectedNodeData);
      }
  }, [treeDataProps.expandedKeys, treeDataProps.checkedKeys, treeDataProps.selectedNodeData]);

//   useEffect(() => {
//       if (treeDataProps.selectedKeys && treeDataProps.selectedKeys?.length > 0) {
//           setSelectedNodeKeys(treeDataProps.selectedKeys);
//       }
//   }, [treeDataProps.selectedKeys])

  const switcher = (obj: any) => {
      if (obj.isLeaf) {
          return;
      }
      return (
          <FontAwesomeIcon
              icon={faCaretRight}
              className={
                  obj.expanded
                      ? `rc-cst-tree-node-expanded ${obj.class}`
                      : "rc-cst-tree-node"
              }
          />
      );
  };
  const handleKeyPress = (event: any) => {
      setTest("");
      if (event.key.length != 1) {
          setTest(event.key);
      } else {
          setTest("space");
      }
  };
  useEffect(() => {
      // Attach event listener to the document when the component mounts
      document.addEventListener("keydown", handleKeyPress, true);
      // Clean up by removing the event listener when the component unmounts
      if (test) {
          document.removeEventListener("keydown", handleKeyPress, false);
      }
      return () => {
          setTreeData([]);
          setExpandedNode([]);
          setSelectedNodeKeys([]);
          setSelectedNodeInfo(null);
      };
  }, []);
  useEffect(() => {
      if (focusedNode) {
          const handleKeyDown = (e: any) => {
              if (treeRef.current) {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                      // Move focus to the previous node
                      e.preventDefault();
                      // setFocusOnNode(e.key);
                  }
              }
          };
          document.addEventListener("keydown", handleKeyDown);
          return () => {
              document.removeEventListener("keydown", handleKeyDown);
          };
      }
  }, [focusedNode]);
 
  const handlecheck = async (checkKeys: any, info: any) => {
      console.log("test", test);
      //NK-Forensic tree node check Log should be added here
      if (info.checked === false) {
          if (treeDataProps.controlName == "filter_form_site_treeview" && info.node.treetype == "Site") {
              //Check your required Site before unchecking the site
              
              return;
          }
      }
      if (test == null || test == "" || test == "space") {
          if (info.checked) {
              if (info.node.treetype == "Device") {
                  let id = [...nodeCheckEntId, info.node.NodeEntID];
                  setNodeCheckEntId(id);
              } else {
                  let id = [info.node.NodeEntID];
                  setNodeCheckEntId(id);
              }
          } else {
              let array = nodeCheckEntId;
              for (var i = array.length - 1; i >= 0; i--) {
                  if (array[i] === info.node.NodeEntID) {
                      array.splice(i, 1);
                  }
              }
              setNodeCheckEntId(array);
          }
          if (controlName === "template_subscribe") {
              console.log('info', info)
              console.log("treeDataProps", treeDataProps);
              let userId: any;
              var user_var = getSessionVariableFromStorage(
                  "RequestedBy",
                  "LoginUserID"
              );
              if (user_var && user_var.length > 0) {
                  userId = user_var[0].SessionValue;
              }
              let userName: any;
              var user = getSessionVariableFromStorage(
                  "RequestedBy",
                  "LoginUserName"
              );
              if (user && user.length > 0) {
                  userName = user[0].SessionValue;
              }
              let payload = {
                  EntityName: "User",
                  EntID: userId,
                  Entity: userName,
                  AuthEntity: info.node.Name,
                  AuthEntID: info.node.NodeEntID,
                  authEntityName: info.node.EntityName,
                  Subscribe: info.checked ? 1 : 0
              }
                  
           
              await treeDataProps.handleReloadTreeview(treeDataProps.controlName)
          }
          if ((controlName === "import_treeview"
              || controlName === "export_treeview"
              || controlName === "import_config_treeview"
              || controlName === "import_cables_treeview"
              || controlName === "export_cables_treeview"
              || controlName === "export_device_treeview") && treeDataProps.checkStrictly) {
              let isExport: boolean = (controlName === "import_treeview"
                  || controlName === "import_config_treeview"
                  || controlName === "import_cables_treeview") ? false : true;
              let checkedKey: string[] = [...checkKeys.checked];
              let halfCheckedKey: string[] = [...checkKeys.halfChecked];
              let disableNeeded: boolean = false;
              let parentNodeKey: string | null = null;
              let pgClassKey: string | null = null;
              if (info.checked) {
                  if (info.node.children?.length > 0) {
                      // logic to set child nodes checked
                      info.node.children.forEach((item: any) => {
                          checkedKey.push(item.key);
                      });
                     
                      // logic to find whether disable node is needed or not
                      if (info.node.children?.length > 1) {
                          disableNeeded = treeDataProps.isUpdateOnly || isExport ? false : true;
                          parentNodeKey = info.node.key;
                          let pgClassRecord = info.node.children.filter((item: any) => { return item.Name.includes("_") });
                          pgClassKey = pgClassRecord?.length > 0 ? pgClassRecord[0].key : null;
                      }
                  }
                  else {
                      // function called to get parent node from parentEntID
                      let result = getNodeDetailsBaseOnKey(treeData, info.node.parentEntID);
                      if (result?.nodeData && result?.nodeData.node) {
                          if (result?.nodeData.node?.children?.length > 0) {
                              // logic to find out the pg class record, no of checked nodes and pg table records 
                              let pgclassRecord = result?.nodeData.node?.children.filter((item: any) => { return item.Name.includes("_") });
                              let checkedCount = result?.nodeData.node?.children.filter((item: any) => { return !item.Name.includes("_") && checkKeys.checked?.includes(item.key) });
                              let pgTableRecord = result?.nodeData.node?.children.filter((item: any) => { return !item.Name.includes("_") });
                              if (pgclassRecord?.length > 0 && info.node.key == pgclassRecord[0].key) {
                                  // logic to handle if checked node is pg class node
                                  if (checkedCount?.length > 0) {
                                      disableNeeded = treeDataProps.isUpdateOnly || isExport ? false : true;
                                      parentNodeKey = result.key;
                                      pgClassKey = pgclassRecord?.length > 0 ? pgclassRecord[0].key : null;
                                  }
                                  if ((checkedCount?.length > 0 && pgTableRecord?.length != checkedCount?.length) || (checkedCount?.length == 0 && pgTableRecord?.length > 0)) {
                                      // it will add the halfCheckedKey if all child nodes are not checked 
                                      halfCheckedKey.push(result.key);
                                      checkedKey = checkedKey.filter((element: string) => result.key !== element);
                                  }
                                  else {
                                      // it will remove the halfCheckedKey and add checked key if all child nodes are checked 
                                      checkedKey.push(result.key);
                                      halfCheckedKey = halfCheckedKey.filter((element: string) => result.key !== element);
                                  }
                                
                             
                                  // logic to handle if checked node is pg table node
                                  if (checkedCount?.length > 0) {
                                      disableNeeded = treeDataProps.isUpdateOnly || isExport ? false : true;
                                      parentNodeKey = result.key;
                                      pgClassKey = pgclassRecord?.length > 0 ? pgclassRecord[0].key : null;
                                  }
                                  if (!treeDataProps.isUpdateOnly) {
                                      checkedKey.push(pgclassRecord[0].key);
                                  }
                                  if (pgTableRecord?.length != checkedCount?.length) {
                                      halfCheckedKey.push(result.key);
                                  }
                                  else {
                                      checkedKey.push(result.key);
                                  }
                                 
                              }
                          }
                      }
                  }
              }
              else {
                  if (info.node.children?.length > 0) {
                      // logic to set child nodes unchecked
                      info.node.children.forEach((item: any) => {
                          if (checkedKey.includes(item.key)) {
                              checkedKey = checkedKey.filter((element: string) => item.key !== element);
                          }
                      });
                      disableNeeded = false;
                      parentNodeKey = info.node.key;
                      let pgClassRecord = info.node.children.filter((item: any) => { return item.Name.includes("_") });
                      pgClassKey = pgClassRecord?.length > 0 ? pgClassRecord[0].key : null;
                      checkedKey = checkedKey.filter((element: string) => info.node.key !== element);
                      halfCheckedKey = halfCheckedKey.filter((element: string) => info.node.key !== element);
                     
                  }
                  else {
                      // function called to get parent node from parentEntID
                      let result = getNodeDetailsBaseOnKey(treeData, info.node.parentEntID);
                      if (result?.nodeData && result?.nodeData.node) {
                          if (result?.nodeData.node?.children?.length > 0) {
                              // logic to find out the pg class record
                              let pgclassRecord = result?.nodeData.node?.children.filter((item: any) => { return item.Name.includes("_") });
                              if (pgclassRecord?.length > 0 && info.node.key == pgclassRecord[0].key) {
                                  // logic to handle pgclass node unchecked
                                  checkedKey = checkedKey.filter((element: string) => result?.key !== element);
                                  checkedKey = checkedKey.filter((element: string) => info.node.key !== element);
                                  let childChecked = result?.nodeData.node?.children.filter((item: any) => { return !item.Name.includes("_") && checkKeys.checked?.includes(item.key) });
                                  // remove from halfcheckedkey 
                                  if ((!treeDataProps.isUpdateOnly && !isExport) || childChecked?.length == 0) {
                                      halfCheckedKey = halfCheckedKey.filter((element: string) => result?.key !== element);
                                  }
                                 
                              }
                              else {
                                  // logic to handle pg table node unchecked
                                  let checkedCount = result?.nodeData.node?.children.filter((item: any) => { return !item.Name.includes("_") && checkKeys.checked?.includes(item.key) && item.key != info.node.key });
                                  let pgTableRecord = result?.nodeData.node?.children.filter((item: any) => { return !item.Name.includes("_") && item.key != info.node.key });
                                  if (checkedCount?.length > 0) {
                                      disableNeeded = isExport ? false : true;
                                      parentNodeKey = result.key;
                                      pgClassKey = pgclassRecord?.length > 0 ? pgclassRecord[0].key : null;
                                  }
                                  else {
                                      disableNeeded = false;
                                      parentNodeKey = result.key;
                                      pgClassKey = pgclassRecord?.length > 0 ? pgclassRecord[0].key : null;
                                  }
                                  checkedKey = checkedKey.filter((element: string) => info.node.key !== element);
                                  if (checkedCount?.length > 0) {
                                      halfCheckedKey.push(result.key);
                                      checkedKey = checkedKey.filter((element: string) => result?.key !== element);
                                  }
                                  let childChecked = result?.nodeData.node?.children.filter((item: any) => { return checkKeys.checked?.includes(item.key) });
                                  if (childChecked?.length == 0) {
                                      halfCheckedKey = halfCheckedKey.filter((element: string) => result?.key !== element);
                                  }
                                 
                              }
                          }
                      }
                  }
              }
              if (parentNodeKey && pgClassKey) {
                  treeData.map((item: any) => {
                      if (item.children?.length > 0) {
                          item.children.map((itemL1: any) => {
                              if (itemL1.key == parentNodeKey && itemL1.children?.length > 1) {
                                  itemL1.children.map((itemL2: any) => {
                                      if (itemL2.key == pgClassKey && !treeDataProps.isUpdateOnly) {
                                          itemL2.disabled = disableNeeded;
                                          return;
                                      }
                                  });
                                  return;
                              }
                          })
                      }
                  });
                  // treeData.map((item: any) => {
                  // if (item.key == parentNodeKey && item.children?.length > 1) {
                  // item.children.map((subItem: any) => {
                  // if (subItem.key == pgClassKey) {
                  // subItem.disabled = disableNeeded;
                  // return;
                  // }
                  // });
                  // return;
                  // }
                  // });
              }
              treeDataProps.handleNodeCheckedEvent(
                  Array.from(new Set(checkedKey)),
                  info,
                  selectedNodeKeys,
                  expandedNodes,
                  treeData,
                  Array.from(new Set(halfCheckedKey))
              );
          }
        
          else {
             
              if (!treeDataProps.checkStrictly) {
                  setcheckNodeKeys([...checkKeys]);
              }
              if (controlName === "import_treeview"
                  || controlName === "import_config_treeview"
                  || controlName === "auth_role_right_pane_treeview"
                  || controlName === "export_treeview"
                  || controlName === "export_cables_treeview"
                  || controlName === "export_device_treeview"
                  || controlName === "auth_role_left_treeview"
                  || controlName === "import_cables_treeview"
                  || controlName === "auth_treeview"
                  || controlName === "asset_management"
                  || controlName === "filter_form_site_treeview"
                  || controlName === "entity_mfg_eqtype_treeview"
                  || controlName === "nz_entity_tables_treeview"
                  || controlName === "ItemAuthByRole_secure_treeView"
                  || controlName === "feature_auth_by_role_treeview"
                  || controlName == "feature_auth_by_user_treeview"
                  || controlName == "feature_auth_by_team_treeview"
                  || controlName == "feature_auth_by_tenant_treeview"
                  || controlName === "ItemAuthByRole_SecureData"
                  || controlName === "ItemAuthByRole_Entitiy" ||
                  controlName === "auth_by_role_treeview"
              ) {
                  await updateSessionVariablesForSelectedNode(treeData, info, controlName, featureId, treeDataProps.embeddedSessionId);
                  treeDataProps.handleNodeCheckedEvent(
                      treeDataProps.checkStrictly ? checkKeys.checked : checkKeys,
                      info,
                      selectedNodeKeys,
                      expandedNodes,
                      treeData
                  );
              }
          }
      } else {
          setTest("");
      }
  };
  let expKeys: string[] = [];
  let selNode: any = null;
  let selKey: string | null = null;
  const autoExpandChildrensAndSelect = (node: any, isClear: boolean) => {
      if (isClear) {
          expKeys = [];
          selNode = null;
          selKey = null;
      }
      if (node.children && node.children.length > 1) {
          selNode = node.children[0];
          selKey = node.children[0].key;
          return;
      } else if (node.children.length === 1) {
          expKeys.push(node.children[0].key);
          selNode = node.children[0];
          selKey = node.children[0].key;
          autoExpandChildrensAndSelect(node.children[0], false);
      }
  };

  useEffect(() => {
    if(treeDataProps.instanceName === 'nz-result-tab-tree'){
        // setExpandedNode([...treeDataProps.expandedKeys]) 
        setTreeData(treeDataProps.treeData)
        console.log('expnaded keys result tab',treeDataProps.expandedKeys)
    }
  }, [treeDataProps.expandedKeys, treeDataProps.selectedkeys])

  const handleExpandLocal = async (exandeKeys: any, info: any) => {
      if (treeDataProps && treeDataProps.handleFlatData) {
          console.log('treeDataProps :', treeDataProps);
          let data = await handleExpand(treeDataProps, treeData, exandeKeys, info, )
          if (data) {
              let newTreeData = data.treeDataReturns;
              if (info.node && info.node.key) {
                  newTreeData = updateTreeNodeBasedOnKey(newTreeData, info.node.key,  true, true, true,);
              }
              setTreeData(newTreeData)
              setSelectedNodeKeys(data.selectedKeysReturn ? data.selectedKeysReturn : [])
              setExpandedNode(data.expandedNode)
              setcheckNodeKeys(checkNodeKeys)
              if (treeDataProps.handleNodeSelectEvent && data.selectedKeysReturn && data.expandedNode) {
                  treeDataProps.handleNodeSelectEvent(data.selectedKeysReturn, data.newSelectedNodeData, data.expandedNode, checkNodeKeys, newTreeData);
              }
          }
      }
else if(treeDataProps.instanceName === 'nz-result-tab-tree' || treeDataProps.instanceName === 'nz-related-tab-tree') {
   
    let data = await handleExpand(treeDataProps,treeData,exandeKeys,info)
        if(data){
            setExpandedNode(data.expandedNode)
            setSelectedNodeKeys(data.selectedKeysReturn ? data.selectedKeysReturn : [])
        dispatch({type:"NODE_INFO",data:data.newSelectedNodeData})
        dispatch({type:'RESULT_TAB_SELECTED_NODE',data:data.newSelectedNodeData})
       
        if(treeDataProps.instanceName === 'nz-result-tab-tree'){
            dispatch({ type: "RESULT_TAB_EXPANDED_KEY", data:data.expandedNode })
            dispatch({ type: "RESULT_TAB_SELECTED_KEY", data: data.selectedKeysReturn })
        }
        if (data.newSelectedNodeData.node.HasRelated === true) {
            if (treeDataProps.handleSelect) {
              await treeDataProps.handleSelect(data.newSelectedNodeData.node.EQID);
            }
          } else {
            if (treeDataProps.instanceName === "nz-result-tab-tree") {
              await treeDataProps.handleSelect('');
            }
        }
    }
   
}
      else {
          setShowLoader(true)
          if (controlName == "asset_management_test") {
              setExpandedNode(exandeKeys);
              return;
          }
          dispatch({
              type: "INFORMATION",
              data: null,
          });
         
          if (controlName === "resultTab-tree" || controlName === "relatedTab-tree") {
              let result = await getNodeDetailsBaseOnKey(treeData, info.node.key);
              let uniqueKeys = Array.from(new Set(exandeKeys));
              let resultData = await autoExpandAndSelectChild(
                  result?.nodeData?.node,
                  true,
                  treeDataProps.controlName,
                  treeDataProps.embeddedSessionId
              );
              console.log("resultData", resultData);
              if (resultData && resultData.nodeKeys?.length > 0) {
                  exandeKeys = [...exandeKeys, ...resultData.nodeKeys];
                  uniqueKeys = Array.from(new Set(exandeKeys));
              }
              if (resultData.selectedNode) {
                  let selectedKey: any[] = [resultData.selectedNode.key];
                  info.node = resultData.selectedNode;
                  setSelectedNodeKeys(selectedKey);
                  treeDataProps.handleNodeSelectEvent(selectedKey, info, exandeKeys, checkNodeKeys, treeData);
              }
          } else if (controlName === "ItemAuthByRole_Entitiy_treeView"
            || controlName === "auth_role_left_treeview"
            || controlName === "ItemAuthByRole_secure_treeView"
            || controlName === "resultTab-tree"
            || controlName === "relatedTab-tree"
            || controlName == "filter_form_site_treeview"
            || controlName === "auth_role_right_pane_treeview") {

            setExpandedNode([...exandeKeys]);
        }
          if (controlName === "asset_management") {
              dispatch({
                  type: "RIGHT_MOUSE_SELECTED_MENU_FOR_PROP_PANE",
                  value: null,
              });
          }
        
      
          setShowLoader(false)
      }
  };
  useEffect(() => {
      const activeElement = document.querySelector(".rc-tree-treenode-selected");
      if (activeElement) {
          // activeElement.scrollIntoView({ behavior: 'auto', block: 'center' });
          if (activeElement.getBoundingClientRect().bottom > window.innerHeight) {
              activeElement.scrollIntoView({ behavior: "auto", block: "center" });
          }
          if (activeElement.getBoundingClientRect().top < 0) {
              activeElement.scrollIntoView({ behavior: "auto", block: "center" });
          }
      }
      if (selectedNodeKeys?.length == 0) {
          if ((controlName !== "resultTab-tree"
              && controlName !== "relatedTab-tree")) {
              // treeDataProps.handleNodeSelectEvent([], null, [], checkNodeKeys, treeData);
          }
      } else {
          if (selectedNodeKeys?.length > 0) {
              let newtreeData: any = updateTreeNodeBasedOnKey(treeData, selectedNodeKeys[0], treeDataProps.hideKebabMenu ? true : false, treeDataProps.hideCopyIcon ? true : false, true,);
            //   setTreeData([...newtreeData]);
          }
      }
  }, [selectedNodeKeys]);
  const hendleSelectFormSiteAndToSite = async (selectedNode: any, add: boolean = false) => {
      console.log('selectedNode', selectedNode)
      if (controlName == "DCI_form_site") {
          let ParentObj: any = await getParentTreeInfoUseingDiv(selectedNode, true);
          console.log('ParentObj', ParentObj)
          ParentObj.push(selectedNode)
          dispatch({
              type: "DCI_FORM_SITE_SELECTED_NODE",
              data: ParentObj ? ParentObj : [selectedNode]
          });
      }
      if (controlName == "DCI_to_site") {
          let ParentObj: any = await getParentTreeInfoUseingDiv(selectedNode, true);
          ParentObj.push(selectedNode)
          dispatch({
              type: "DCI_TO_SITE_SELECTED_NODE",
              data: ParentObj ? ParentObj : [selectedNode]
          });
      }
  }

  const handleSelect = async (selectedKeys: any, info: any) => {
      if (controlName == "DCI_form_site" || controlName == "DCI_to_site") {
          hendleSelectFormSiteAndToSite(info.node)
      }
      if (info.event == "select" && info.selected == false) {
          return;
      }
      //NK-Forensic tree node select Log should be added here
      // if (controlName == "DCI_form_site" || controlName == "DCI_to_site") {
      //     dispatch({
      //         type: "DCI_DIRTY_FLAG",
      //         data: info.node
      //     });
      // }

  
      if (selectedNodeKeys?.length > 0) {
          let newtreeData: any = updateTreeNodeBasedOnKey(treeData, selectedNodeKeys[0], true, true, false);
          setTreeData(newtreeData);
      }
      if (info) {
        dispatch({type:"NODE_INFO",data:info})
        if(treeDataProps.instanceName === 'nz-result-tab-tree'){
            dispatch({type:'RESULT_TAB_SELECTED_KEY',data:info.node.key})
            if (info.node.HasRelated === true) {
                if (treeDataProps.handleSelect) {
                  await treeDataProps.handleSelect(info.node.EQID);
                  dispatch({type:'RESULT_TAB_SELECTED_NODE',data:info.node})
                }
              } else {
                if (treeDataProps.instanceName === "nz-result-tab-tree") {
                  await treeDataProps.handleSelect('');
                }
            }
        }
          let session_update_resp: any = null;
          if (!treeDataProps.isFloorTree) {
              session_update_resp = await updateSessionVariablesForSelectedNode(treeData, info, controlName, featureId, treeDataProps.embeddedSessionId);
          }
        
          setSelectedNodeInfo(info);
          setSelectedNodeKeys(selectedKeys);
          if (treeDataProps.handleNodeSelectEvent) {
              treeDataProps.handleNodeSelectEvent(selectedKeys, info, expandedNodes, checkNodeKeys, treeData);
          }
      }
  };
  
  var foundKey = "";
  const searchTreeviewData = (data: any, id: any) => {
      data.forEach((element: any) => {
          if (element.NodeEntID === id) {
              foundKey = element;
              return;
          } else {
              if (element.children) {
                  searchTreeviewData(element.children, id);
              }
          }
      });
      return foundKey;
  };
  // useEffect(() => {
  //     if ( treeData) {
  //         let foundNode: any = searchTreeviewData(treeData, searchEntId);
  //         if (foundNode) {
  //             setSelectedNodeKeys([foundNode.key]);
  //         }
  //     }
  // }, [ treeData]);
 
  const motion = {
      motionName: "node-motion",
      motionAppear: true,
      onAppearStart: () => ({ height: 0 }),
      onAppearActive: (node: any) => ({ height: node.scrollHeight }),
      onLeaveStart: (node: any) => ({ height: node.offsetHeight }),
      onLeaveActive: () => ({ height: 0 }),
  };


  useEffect(() => {
      if (treeDataProps.isReloadtree) {
      }
      console.log('treeDataProps treeview:', treeDataProps);
  }, [treeDataProps]);
  useEffect(() => {
      if (onEnterActive) {
          setSelectedNodeKeys(onEnterActive);
          let result = getNodeDetailsBaseOnKey(treeData, onEnterActive[0]);
          if (result?.nodeData?.node) {
              let nodeData = result.nodeData;
              setSelectedNodeInfo(nodeData);
          }
          setSelectedNodeKeys(onEnterActive);
      }
  }, [onEnterActive]);
  const [indexFocusDiv, setIndexFocusDiv] = useState<number>(0)
 
  // This function is an asynchronous event handler that is called when a click event occurs on a draggable element in tree node.
  const handleClick = async (event: any, info: any) => {
      let dragEventHandled = false;
      // let nodeClientY = event.clientY;
      // let udDown: boolean;
      if (featureId == FEnums.ManageAuditSessions && treeDataProps.draggable == true && info && info.treetype != "Floor" && info.treetype != "Location" && info.treetype != "Device") {
          return;
      }
      let nodeDiv: any = document.getElementById(info.NodeEntID ? info.NodeEntID : info.EQID ? info.EQID : info.ShapeID);

      if (nodeDiv && (treeDataProps.draggable || treeDataProps.internalDrag || treeDataProps.dropAllow)) {
          dispatch({
              type: "DROPED_NODE_INFO_FOR_AP",
              data: null
          });
      }
  }


 
  useEffect(() => {
      if (treeDataProps.internalDrag) {
          setTimeout(() => {
              let nodes = document.querySelectorAll('.rc-tree-treenode-draggable')
              for (let i = 0; i < nodes.length; i++) {
                  // if (!nodes[i].className.includes('rc-tree-treenode-selected')) {
                  nodes[i].setAttribute("draggable", "false")
                  // }
              }
              let selectedNodeDiv = document.querySelector('.rc-tree-treenode-selected')
              if (selectedNodeDiv) {
                  selectedNodeDiv.setAttribute("draggable", "true")
              }
          }, 100);
      }
  }, [treeDataProps.internalDrag, selectedNodeKeys])
  useEffect(() => {
      console.time("nktest_treedata_rendering")
      return () => {
          console.timeEnd("nktest_treedata_rendering")
      };
  }, [treeData]);
  useEffect(() => {
      if (treeData && selectedNodeInfo && selectedNodeInfo.node && treeDataProps.draggable) {
          const handleAutoNodeSelect = () => {
              const syntheticEvent = new MouseEvent('click', {
                  bubbles: true,      // Event will bubble up through the DOM
                  cancelable: true,   // Event can be canceled
                  view: window,       // The view in which the event occurred (typically the window)
                  // You can also pass other MouseEvent properties here if needed
              });
              handleClick(syntheticEvent as unknown as React.MouseEvent<HTMLElement>, selectedNodeInfo.node);
          }
          handleAutoNodeSelect();
      }
      console.log('treeData 101010:', treeData);
  }, [treeData])
  useEffect(() => {
      console.log('treeDataProps.originalTreeData :', treeDataProps, treeData && selectedNodeKeys && expandedNodes);
  }, [treeDataProps, treeData, selectedNodeKeys, expandedNodes])
  
  return (
    <div className="tree">
   
      { treeDataProps.treeData &&
        <Tree
          treeData={treeData}
          className={treeDataProps.controlName === "filter_form_site_treeview" ? "search-tree" : "custom-rc-tree"}
          switcherIcon={switcherIcon}
          // className='custom-rc-tree'
          onExpand={handleExpandLocal}
          onSelect={handleSelect}
          expandedKeys={expandedNodes}
          selectedKeys={selectedNodeKeys}
          showLine={true}
          showIcon={treeDataProps.showIcon}
          checkable={treeDataProps.checkable}
          // checkable={true}
          draggable
          onDragStart={treeDataProps?.handleDragStart}
          checkStrictly={true}
          checkedKeys={treeDataProps.checkedKeys}
          onCheck={handlecheck} 
          />
      }
     
    </div>
  );
};
export default Treeview;
