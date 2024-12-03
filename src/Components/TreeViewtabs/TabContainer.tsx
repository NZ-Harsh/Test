import { useEffect, useState, } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { ResultTab } from './ResultTab';
import { Search, transformToRcTreeData } from '../../Common/Common';
import { RelatedTab } from './RelatedTab';
import { useDispatch } from 'react-redux';
import { Backdrop, CircularProgress } from '@mui/material';


export const TabContainer = (props: any) => {
    const [tabValue, setTabValue] = useState(0);
    const [treedata, setTreedata] = useState();
    const [Eqid, setEqId] = useState<string | string>('');
    const [relatedtreedata, setRelatedTreeData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const dispatch = useDispatch()

    const onSuccess = (resultData: any[]) => {
        if (resultData && resultData.length > 0) {
            const treeHierarchy = transformToRcTreeData(resultData);
            console.log('treeHierarchy:', treeHierarchy);
            if (treeHierarchy?.length > 0) {
                setRelatedTreeData(treeHierarchy);
                dispatch({ type: "RELATED_TREE-DATA", data: treeHierarchy })
            }
        } else {
            setRelatedTreeData([]);
            dispatch({ type: "RELATED_TREE-DATA", data: null })

        }
    };

    const onError = (message: string) => {
        console.error('Error:', message);
    };

    const handleSelect = (Eqid: any) => {
        if (Eqid) {
            setEqId(Eqid)
        } else {
            setEqId('')
        }
    }

    useEffect(() => {
        if (props.treeData?.length > 0) {
            setTreedata(props.treeData);
        }
    }, [props.treeData]);

    const handleTabChange = (_event: any, newValue: number,) => {
        setTabValue(newValue);
        if (newValue === 1 && Eqid) {
            setIsLoading(true)

            Search({ Eqid }, onSuccess, onError);
        }
        setIsLoading(false)
    };

    return (
        <div>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Box>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="Result and Related Tabs"
                    className='lib-tabs'
                >
                    <Tab label="Result" />
                    {Eqid && <Tab label="Related" />}
                </Tabs>

                {tabValue === 0 && (
                    <Box>
                        {props.treeData?.length > 0 && <ResultTab treeData={treedata} handleSelect={handleSelect} />}
                    </Box>
                )}

                {tabValue === 1 && (
                    <Box>
                        {relatedtreedata.length > 0 && <RelatedTab treeData={relatedtreedata} handleSelect={handleSelect}
                            handleNodeCheckedEvent={(checksKeys: any, info: any, expandedNodes: any) => {
                                console.log('expandedNodes handelCheckBox:', expandedNodes);
                                // setExpandedkey([...expandedNodes]);
                                // treeViewCheck(info)
                            }}
                            handleNodeSelectEvent={(selectedKeys: any, info: any, expandedNodes: any) => {
                            }}
                        />}
                    </Box>
                )}
            </Box>
        </div>
    );
};
