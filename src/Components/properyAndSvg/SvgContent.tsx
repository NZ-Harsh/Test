import { useRef, useState, useEffect } from 'react';
import { insertSvgContentIntoOffice } from '../../Common/Common'

interface SvgContentProps {
  svgContent: any;
  DeviceName: any;
  instanceName:any
}

const SvgContent: React.FC<SvgContentProps> = (props:SvgContentProps) => {
  const [shapeCounter, setShapeCounter] = useState(0);
  const [screenSize, setScreenSize] = useState<string>('large');

  const svgRef = useRef<HTMLDivElement | null>(null);
  const [decodedsvg, setDecodedsvg]=useState<any>()
  // const decodedSvg = window.atob(props.svgContent);

  // const decodedSvg = window.atob(props.svgContent[0].SVG);

  const handleDragStart = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    await insertSvgContentIntoOffice(decodedsvg, 'drag', shapeCounter);
    setShapeCounter((prev) => prev + 1);
  };
  useEffect(() =>{
    if(props.instanceName == "Library"){
  const decodedSvg = window.atob(props.svgContent[0].SVG);
  setDecodedsvg(decodedSvg)
    } else if(props.instanceName === "DC_Inventory"){
  const decodedSvg = window.atob(props.svgContent);
  setDecodedsvg(decodedSvg)
    }
    console.log('svgcontent',props)
  },[props])
  const handleDoubleClick = async () => {
    await insertSvgContentIntoOffice(decodedsvg, 'double-click', shapeCounter);
    setShapeCounter((prev) => prev + 1);
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setScreenSize('small');
      } else if (width < 900) {
        setScreenSize('medium');
      } else {
        setScreenSize('large');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (

    <div className={`svg-card ${screenSize === 'small' ? 'svg-card-sm' : ''}`}>

      <div
        ref={svgRef}
        className={`svg-wrapper ${screenSize === 'medium' ? 'svg-wrapper-md' : ''} ${screenSize === 'small' ? 'svg-wrapper-sm' : ''
          }`}
        draggable
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          console.log('Dragging over the target');
        }}
        onDragStart={handleDragStart}
        onDoubleClick={handleDoubleClick}
        title="Drag and Drop Or Double-click To Insert"
        dangerouslySetInnerHTML={{ __html: decodedsvg }}
      >
      </div>

      <div className='pnumber-div'>
        <h1 className="product-number">{props.DeviceName}</h1>
      </div>
    </div>

  );
};

export default SvgContent;
