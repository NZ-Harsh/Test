import data from  '../../nze.json'
import useTheme from '../../Theme'
import { useEffect, useState } from 'react';
const LandingPage = () => {
    const [bgSizeClass, setBgSizeClass] = useState('bg-size-contain');
    const [fontSizeClass, setFontSizeClass] = useState('font-size-16'); 
  
    const Color = data.colortheme.split(',')[0] 

  
    const handleclick = () => {
      window.open(data.logourl, '_blank');
    };
  
    useTheme(data.colortheme);
  
    useEffect(() => {
      const updateStyles = () => {
        const width = window.innerWidth;
  
        if (width < 600) {
          setBgSizeClass('bg-size-100');
          setFontSizeClass('font-size-20');
        } else if (width < 900) {
          setBgSizeClass('bg-size-90');
          setFontSizeClass('font-size-30');
        } else {
          setBgSizeClass('bg-size-100');
          setFontSizeClass('font-size-35');
        }
      };
  
      updateStyles();
  
      window.addEventListener('resize', updateStyles);
  
      return () => {
        window.removeEventListener('resize', updateStyles);
      };
    }, []);

  return (
    <div
    className={`preload-container ${bgSizeClass}`}
    style={{
        backgroundColor: Color,
      }}
  >

    <div className="logo" onClick={handleclick} title={data.logotooltip}>
      <img src={data.logoicon} alt={data.logoalt} />
    </div>

    <div className="title">
      <div >
      <h1 className={fontSizeClass}>NetZoom Add-in for Office</h1>
      </div>
      <div>

      <h1 className={fontSizeClass}>Now you can create proffessional  quality  Visio Diagrams  and PowerPoint Presentation using use shapes, Stencils and Diagrmas from Your NetZoom</h1>
      </div>
    </div>
  </div>
        )
}

export default LandingPage