import  { useEffect, useState } from 'react'
import Treeview from '../TreeView/TreeView'
import { useSelector } from 'react-redux'

export const ResultTab = (props:any) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('')

const resultExpandedKeys = useSelector((state:any) =>state.TreeDataReducer).result_tab_expanded_key
const resultSelectedKeys = useSelector((state:any) =>state.TreeDataReducer).result_tab_selected_key
const resultselectednode = useSelector((state:any) => state.TreeDataReducer).result_tab_selected_node

useEffect(()=>{
  if(resultExpandedKeys?.length > 0){
    setExpandedKeys([...resultExpandedKeys])
   console.log(resultExpandedKeys)
  } 
},[resultExpandedKeys])

useEffect(() =>{
if(resultSelectedKeys){
  setSelectedKeys(resultSelectedKeys)
  console.log('resultresultSelectedKeys selected key', resultSelectedKeys)
}
},[resultSelectedKeys])
console.log("redux selected",resultSelectedKeys)

useEffect(() =>{
  if(resultselectednode){
    setSelectedNode(resultselectednode)
 console.log("node",resultselectednode)
  }
},[resultselectednode])

  return (
    <div>
        <Treeview treeData={props.treeData} 
        handleSelect={props.handleSelect} 
        expandedKeys= {expandedKeys} 
        selectedkeys ={selectedKeys} 
        instanceName= "nz-result-tab-tree"
        selectedNode = {resultselectednode}
        handleNodeSelectEvent={(selectedKeys: any, info: any, expandedNodes: any) => {
        }}
        handleNodeCheckedEvent={(checksKeys: any, info: any, expandedNodes: any) => {
          console.log('expandedNodes handelCheckBox:', expandedNodes);
          // setExpandedkey([...expandedNodes]);
          // treeViewCheck(info)
      }}
         />
    </div>
  )
}
