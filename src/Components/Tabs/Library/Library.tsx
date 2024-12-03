import { useState, useEffect, useMemo } from 'react'
import { FormControl, InputLabel, Select, OutlinedInput, MenuItem, Box, RadioGroup, FormControlLabel, Radio, SelectChangeEvent } from '@mui/material'
import TextField from '@mui/material/TextField'
import { getEqtype, getMfg, getProductno } from '../../../redux/action/libraryservice';
import { Search, transformToRcTreeData } from '../../../Common/Common';
import { TabContainer } from '../../TreeViewtabs/TabContainer';
import { useDispatch } from 'react-redux';
interface Manufacturer {
  mfgAcronym: string;
  manufacturer: string
}

interface EqType {
  eqtype: string,
}

const Library = (props:any) => {
  const [kwdSearchType, setKwdSearchType] = useState<string>('true');
  const [loading, setLoading] = useState<boolean>(false);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [eqTypes, setEqTypes] = useState<EqType[]>([]);
  const [selectedEqType, setSelectedEqType] = useState<string>('');
  const [selectedProductLine, setSelectedProductLine] = useState<string>('');
  const [productNumber, setProductNumber] = useState<string[]>([]);
  const [selectedProductNumber, setSelectedProductNumber] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [selectedDtManufacturers, setSelectedDtManufacturers] = useState<string[]>([]);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [showTreeComponent, setShowTreeComponent] = useState<boolean>(false);
  const [selectedManufacturerDetails, setSelectedManufacturerDetails] = useState<any>();

  const dispatch = useDispatch()
  const handleKwdSearchTypeChange = (event: any) => {
    setKwdSearchType(event.target.value);
  };

  const handleManufacturerChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value;
    setSelectedManufacturer(selectedValue);

    const manufacturerDetails = manufacturers.find(manufacturer => manufacturer.mfgAcronym === selectedValue);
    let selectedmanufacturerdetails = manufacturerDetails?.manufacturer
    setSelectedManufacturerDetails(selectedmanufacturerdetails);

    // Reset dependent states
    setSelectedEqType('');
    setSelectedProductLine('');
    setSelectedProductNumber('');
    setEqTypes([]);
    setProductNumber([]);
  }

  const handleEqTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedEqType(event.target.value);
    setSelectedProductLine('')
    setSelectedProductNumber('')
    setProductNumber([])

  }


  const handleproductnumber = (event: SelectChangeEvent<string>) => {
    setSelectedProductNumber(event.target.value)

  }

  const handlesearch = () => {
    setLoading(true)
    Search(searchParams, onSuccess, onError);
    setLoading(false)
  };
  const onSuccess = (resultData: any[]) => {
    setLoading(false)

    if (resultData && resultData.length > 0) {
      const treeHierarchy = transformToRcTreeData(resultData);
      console.log('treeHierarchy:', treeHierarchy);
      if (treeHierarchy.length > 0) {
        setShowTreeComponent(true);
        setTreeData(treeHierarchy);
        dispatch({ type: "RESULT_TREE_DATA", data: treeHierarchy })

      } else {
        setSnackbarMessage('No relevant tree data found');
        setSnackbarOpen(true);
        setShowTreeComponent(false);
        dispatch({ type: "RESULT_TREE_DATA", data: null })

      }
    } else {
      setSnackbarMessage('No results found');
      setSnackbarOpen(true);
      setShowTreeComponent(false);
    }
  };
  const searchParams = useMemo(() => ({
    keyword,
    kwdSearchType,
    selectedManufacturer,
    selectedEqType,
    selectedProductLine,
    selectedProductNumber,
    selectedDtManufacturers,
    selectedManufacturerDetails
  }), [kwdSearchType, selectedManufacturer, selectedEqType, selectedProductNumber, selectedDtManufacturers, keyword]);


  const onError = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };


  useEffect(() => {
    const fetchManufacturers = async () => {
      if(props.instanceName === "Library"){
      setLoading(true);
      try {
        await getMfg(0, "").then((resp: any) => {
          if (resp) {
            const manufacturersData = resp.data;
            setManufacturers(manufacturersData);
            if (manufacturersData.length === 1) {
              setSelectedManufacturer(manufacturersData[0].mfgAcronym);
            }
          }

        })
      }
      catch (error) {
        console.error('Error fetching manufacturers:', error);
      }
      setLoading(false);
    };
  }
    fetchManufacturers();
  }, [props.instanceName]);


  useEffect(() => {
    if (selectedManufacturer) {
      const fetchEqTypes = async () => {
        setLoading(true);
        try {
          await getEqtype(0, "", selectedManufacturer).then((resp) => {
            const eqTypesData = resp.data;
            setEqTypes(eqTypesData);

            // Automatically select if only one equipment type is available
            if (eqTypesData.length === 1) {
              setSelectedEqType(eqTypesData[0].eqType);
            }
          })

        } catch (error) {
          console.error('Error fetching equipment types:', error);
        }
        setLoading(false);
      };
      fetchEqTypes();
    }
  }, [selectedManufacturer]);

  useEffect(() => {
    if (selectedManufacturer && selectedEqType) {
      const fetchProductNumber = async () => {
        setLoading(true);
        try {
          await getProductno(0, "", selectedManufacturer, selectedEqType, "").then((resp) => {
            if (resp) {
              const productNumberData = resp.data;
              console.log("productNo", productNumberData);
              setProductNumber(productNumberData);

              // Automatically select if only one product number is available
              if (productNumberData.length === 1) {
                const firstProdNo = productNumberData[0].mfgProdNo;
                setSelectedProductNumber(firstProdNo);
              }
            }

          })
        } catch (error) {
          console.error("Error fetching product number:", error);
        }
        setLoading(false);
      };
      fetchProductNumber();
    }
  }, [selectedManufacturer, selectedEqType]);

  useEffect(() => {
    if (keyword) {
      const matchedManufacturers = manufacturers.filter((manufacturer) =>
        manufacturer.mfgAcronym.toLowerCase().includes(keyword.toLowerCase())
      );
      if (matchedManufacturers.length > 0) {
        console.log('Matched Manufacturers:', matchedManufacturers);
      } else {
        console.log('No matching manufacturers found');
      }
    }

  }, [keyword, manufacturers]);

  //if all selected then auto search as per selected 

  useEffect(() => {
    if (selectedManufacturer && selectedEqType && selectedProductNumber) {
      Search(searchParams, onSuccess, onError)
    }
  }, [selectedManufacturer, selectedEqType, selectedProductNumber, searchParams])


  return (
    <div className='Lib_container'>
      {!showTreeComponent && treeData.length == 0 ? (
        <Box
          component="form"
          className='form-box'
        >
            <div className='search-field-wrapper'>

            <div className='search-icon-textfield'>
                  <TextField
                    id="outlined-controlled"
                    label="Search"
                    className='nz-searchcombo search-lbl custom-text-field'
                    placeholder='By KeyWord'
                    value={keyword}
                    variant="outlined"
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && keyword.trim() !== '') {
                        // handlesearch();
                      }
                    }}
                  />
            

                <div className='search-icon' >
                  <img
                    src="../assets/Icons/Search_128x128.svg"
                    alt="Search"
                    // onClick={() => !loading && handlesearch()}
                    onClick={handlesearch}
                    className='search-icon'
                  />
                </div>
                </div>

      
            </div>
            <div className='radio'>

            <FormControl component="fieldset" className="form-control">
                  <RadioGroup
                    row
                    className="radio-group"
                    onChange={handleKwdSearchTypeChange}
                    value={kwdSearchType}
                  >
                    <FormControlLabel
                      className="form-control-label"
                      control={<Radio className="radio" id='radio' value="false" />}
                      label="Any Word"
                    />
                    <FormControlLabel
                      control={<Radio className="radio" id='radio' color="default" value="true" />}
                      label="All Words"
                    />
                  </RadioGroup>
                  
                </FormControl>
            </div>

          <div className="form-container">
           
          <FormControl variant='outlined' >
            <InputLabel className='select-label' shrink> Manufacturer {manufacturers.length > 0 ?`[${manufacturers.length}]`: null }  </InputLabel>
            <Select
              displayEmpty
              value={selectedManufacturer}
              className='nz-searchcombo'
              onChange={handleManufacturerChange}
              input={<OutlinedInput label={"Manufacturers[0000]"}
                className='select-input'
              />}
              MenuProps={{
                PaperProps: {
                  className: 'select-dropdown',

                },
              }}
              renderValue={(selected: string) => {
                if (!selected) {
                  return <h1 className='select-menu-item'>All</h1>
                }
                const selectedManufacturer = manufacturers.find(manufacturer => manufacturer.mfgAcronym === selected);
                return selectedManufacturer ? selectedManufacturer.manufacturer : '';
              }}
            >
              {manufacturers.length > 0 && (<MenuItem value="" className="select-menu-item" ><h1 className='select-menu-item'>All</h1></MenuItem>)}
              {manufacturers.length > 0 ? (
                manufacturers.map((manufacturer) => (
                  <MenuItem key={manufacturer.mfgAcronym} value={manufacturer.mfgAcronym}
                    className="select-menu-item"
                  >
                    {manufacturer.manufacturer}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled className="select-menu-item">No Manufacturers</MenuItem>
              )}

            </Select>

          </FormControl>


          <FormControl fullWidth variant="outlined" sx={{ mt: 2, height: 'auto' }}>
            <InputLabel className='select-label' shrink>
              Equipment Type {eqTypes.length > 0 ? `[${eqTypes.length}]` : null}

            </InputLabel>
            <Select
              displayEmpty
              value={selectedEqType}
              className='nz-searchcombo'
              onChange={handleEqTypeChange}
              input={
                <OutlinedInput
                  notched
                  label={`Equipment Types`}
                  className='select-input'
                />
              }
              renderValue={(selected) => {
                if (!selected) {
                  return <h1 className="select-menu-item">All</h1>;
                }
                return selected as string;
              }}
              MenuProps={{
                PaperProps: {
                  className: 'select-dropdown',

                },
              }}
            >

              {eqTypes.length > 0 && (
                <MenuItem value="">
                  <h1 className="select-menu-item">All</h1>
                </MenuItem>
              )}
              {eqTypes.length > 0 ? (
                eqTypes.map((eqtype: any) => (
                  <MenuItem
                    key={eqtype.eqType}
                    value={eqtype.eqType}
                    className="select-menu-item"
                  >
                    {eqtype.eqType}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled className="select-menu-item">
                  No Equipment Types Available
                </MenuItem>
              )}

            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={{ mt: 2, height: 'auto' }}>
            <InputLabel
              className='select-label'
              shrink
            >
              Product Number {productNumber.length > 0 ? `[${productNumber.length}]` : null}   
            </InputLabel>
            <Select
              displayEmpty
              value={selectedProductNumber}
              onChange={handleproductnumber}
              className='nz-searchcombo'
              input={<OutlinedInput notched label="Product Numbers"
                className='select-input'
              />}
              renderValue={(Pnumberselected) => {
                if (!Pnumberselected) {
                  return <h1 className='select-menu-item'>All</h1>
                }
                return Pnumberselected as string
              }}
              MenuProps={{
                PaperProps: {
                  className: 'select-dropdown-Pno',
                },
              }}
            >

              {productNumber.length > 0 && (

                <MenuItem value="">
                  <h1 className="select-menu-item">All</h1>
                </MenuItem>
              )}
              {productNumber.length > 0 ? (
                productNumber.map((pnumber: any, index) => (
                  <MenuItem key={pnumber.mfgProdNo} value={pnumber.mfgProdNo} className="select-menu-item">
                    {pnumber.mfgProdNo}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled className="select-menu-item">No Product number Available</MenuItem>
              )}

            </Select>
          </FormControl>
          </div>
        </Box>

      ) : (
        showTreeComponent && treeData.length > 0 ? (
          <>
            <TabContainer treeData={treeData} />
          </>
        )
          : ('')
      )}


    </div>
  )
}
export default Library