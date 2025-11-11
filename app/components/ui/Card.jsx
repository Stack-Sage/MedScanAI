import React from 'react';
import styled from 'styled-components';

const Card = () => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="card-info">
          <p className="title">Magic Card</p>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
   --background: linear-gradient(to left, #0e7490 0%, #18181b 100%);
   width: 190px;
   height: 254px;
   padding: 5px;
   border-radius: 1rem;
   overflow: visible;
   background: #18181b;
   background: var(--background);
   position: relative;
   z-index: 1;
  }

  .card::after {
   position: absolute;
   content: "";
   top: 30px;
   left: 0;
   right: 0;
   z-index: -1;
   height: 100%;
   width: 100%;
   transform: scale(0.8);
   filter: blur(25px);
   background: #0e7490;
   background: var(--background);
   transition: opacity .5s;
  }

  .card-info {
   --color: #18181b;
   background: var(--color);
   color: #22d3ee;
   display: flex;
   justify-content: center;
   align-items: center;
   width: 100%;
   height: 100%;
   overflow: visible;
   border-radius: .7rem;
  }

  .card .title {
   font-weight: bold;
   letter-spacing: .1em;
   color: #22d3ee;
  }

  /*Hover*/
  .card:hover::after {
   opacity: 0;
  }

  .card:hover .card-info {
   color: #0e7490;
   transition: color 1s;
  }`;

export default Card;
