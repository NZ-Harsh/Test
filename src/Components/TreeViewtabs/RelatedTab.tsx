import Treeview from '../TreeView/TreeView'
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export const RelatedTab = (props:any) => {

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const relatedExpandedKeys = useSelector((state:any) =>state.TreeDataReducer).related_tab_expanded_key

  useEffect(()=>{
    if(relatedExpandedKeys?.length > 0){
      setExpandedKeys([...relatedExpandedKeys])
    } 
  },[relatedExpandedKeys])


  return (

    <div>
        <Treeview treeData={props.treeData} instanceName='nz-related-tab-tree'
         expandedKeys={expandedKeys} selectedkeys={[]} handleSelect={props.handleSelect}
         selectedNode={''}
         handleNodeCheckedEvent={relatedExpandedKeys}
         handleNodeSelectEvent={(selectedKeys: any, info: any, expandedNodes: any) => {
        }}
         />

    </div>
  )
}
