import React from "react";
import Notice from "../../components/Notice/Notice";
import Slider from "../../components/Slider/Slider";
import Agent from "../../components/Agent/Agent";
import Commission from "../../components/Commission/Commission";
import WhyUs from "../../components/WhyUs/WhyUs";

const Home = () => {
  return (
    <div>
      <Notice />
      <Slider />
      <Agent />
      <Commission />
      <WhyUs />
    </div>
  );
};

export default Home;
