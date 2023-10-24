import React from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

const MugScene = dynamic(() => import('src/components/3d/MugCanvas'), { ssr: false });

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  svgDataURL: string;
}
type OverlayContainerProps = {
  isOpen: boolean;
};

const OverlayContainer = styled.div<OverlayContainerProps>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.isOpen ? 'block' : 'none'};
  z-index: 1000;
`;

const Overlay: React.FC<OverlayProps> = ({ isOpen, onClose, svgDataURL }) => {
  return (
    <OverlayContainer isOpen={isOpen} onClick={onClose}>
      <MugScene svgDataURL={svgDataURL}/>
    </OverlayContainer>
  );
};

export default Overlay;
